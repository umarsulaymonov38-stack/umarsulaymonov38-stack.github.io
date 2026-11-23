-- =====================================================================================
-- Yurt School: Samarqand Yuksalish maktabidagi imkoniyatlar — BITTA YANGILANISHDA
--  1) Ota-onaga BARCHA baholar (fan, guruh, repetitor) — kim, qachon qo'ygan; bosh sahifada «Bugungi baholar»
--  2) Ota-ona profili: «Reyting va o'rinlar» — sinf, maktab va har bir guruh/fan bo'yicha o'rin
--  4) Guruh/fan baholarini asosiy sinfdagi farzandga AVTOMATIK bog'lash (ism o'xshashligi), har kuni 06:30
--  5) Haftalik «Ota-onaga yaxshilik» so'rovnomasi eslatmasi: juma va yakshanba 18:00 (bildirishnoma)
--  6) «Baho qo'yilmaganlar»: admin, sinf rahbari va o'qituvchi uchun; har kuni 15:00 eslatma
--  8) Guruh o'qituvchisi: ota-ona telefoni va bitta tugma bilan qo'ng'iroq; o'qituvchi o'z dars kunlarini belgilaydi
--  9) To'lov: naqd/karta, summa, yillik to'lov, kvitansiya, kunlik/oylik hisobot va uni yopish
-- 10) Buxgalter profili va kunlik xarajatlar
-- 11) Kuzatuvchi admin (hamma narsani ko'radi, o'zgartira olmaydi) va 2-darajali admin
-- 12) «Davomat to'liq emas» (admin panelida) — bazada qo'shimcha narsa talab qilmaydi
--
-- Yurt School Supabase loyihasi (yurt-school) → SQL Editor → shu faylni to'liq nusxalab → Run.
-- Yurt qoidalari (kunlik 51 ball, sportsiz/faolliksiz, juma kungi so'rovnoma, baho o'zgartirish sababi) o'zgarmaydi.
-- Qayta ishga tushirish xavfsiz.
-- =====================================================================================


-- ################################ 00-beh ################################
-- Repetitor topshiriq ustuni va kunlik foiz funksiyasi (reyting uchun; Yurt repetitor jadvali o'zgarmaydi)
alter table public.rep_daily add column if not exists task smallint;
create or replace function public.yk_rep_pct(p_att numeric, p_task numeric) returns numeric
language sql immutable as $$ select avg(v) from unnest(array[p_att * 100.0, p_task * 20.0]) v $$;
alter table public.daily_scores add column if not exists beh_band smallint;

-- ################################ 39 ################################
-- Yangilanish 39: 2-darajali admin (kuzatuvchi).
-- U o'qituvchi akkaunti (telefon + parol bilan kiradi), o'ziga biriktirilgan sinflarda oddiy o'qituvchi kabi ishlaydi,
-- qo'shimcha ravishda butun platformani KO'RADI (kuzatadi), lekin o'zgartira olmaydi:
-- o'zgartirish huquqlari (baho, to'lov, sozlama, parollar) faqat bosh adminda qoladi.
-- Bosh admin «O'qituvchilar» bo'limida o'qituvchiga «2-darajali admin» belgisini qo'yadi.
-- Supabase → SQL Editor ga to'liq nusxalab, "Run" bosing. Qayta ishga tushirish xavfsiz.

alter table public.profiles add column if not exists admin2 boolean not null default false;

create or replace function public.yk_admin2() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select p.admin2 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'), false)
$$;
grant execute on function public.yk_admin2() to authenticated;

-- Bosh admin belgilaydi
create or replace function public.set_admin2(p_id uuid, p_on boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if public.yk_role() is distinct from 'admin' then raise exception 'Faqat bosh admin' using errcode = '42501'; end if;
  update public.profiles set admin2 = coalesce(p_on, false) where id = p_id and role = 'teacher';
  if not found then raise exception 'O''qituvchi topilmadi'; end if;
end $$;
revoke all on function public.set_admin2(uuid, boolean) from public, anon;
grant execute on function public.set_admin2(uuid, boolean) to authenticated;

-- O'qituvchi o'z profilidagi admin2 belgisini o'zi o'zgartira olmasin
create or replace function public.yk_admin2_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.admin2 is distinct from old.admin2 and public.yk_role() is distinct from 'admin' and current_user not in ('postgres', 'supabase_admin', 'service_role') then
    new.admin2 := old.admin2;
  end if;
  return new;
end $$;
drop trigger if exists yk_admin2_guard on public.profiles;
create trigger yk_admin2_guard before update on public.profiles for each row execute function public.yk_admin2_guard();

-- Faqat O'QISH huquqi: barcha jadvallarga (maxfiylari bundan mustasno) 2-darajali admin uchun "select" qoidasi
do $$
declare t text;
begin
  for t in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
            where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
              and c.relname not in ('student_private', 'class_codes', 'tk_config', 'push_secret', 'push_subs', 'staff_devices',
                                    'parent_code_fail', 'parent_pw_set', 'sms_config', 'sms_settings', 'sms_secret', 'parent_checkin') loop
    execute format('drop policy if exists admin2_read on public.%I', t);
    execute format('create policy admin2_read on public.%I for select to authenticated using (public.yk_admin2())', t);
  end loop;
end $$;

-- O'qituvchilar reytingi: 2-darajali admin ham barcha o'qituvchilarni ko'radi
create or replace function public.teacher_rating(p_from date, p_to date)
returns table (user_id uuid, full_name text, phone text, classes text, class_days int, on_time int, late int, missed int, score int)
language sql stable security definer set search_path = public as $$
with nowt as (select (now() at time zone 'Asia/Tashkent') t),
cut as (  -- bugungi kun faqat 21:00 dan keyin hisoblanadi
  select case when (select t from nowt)::time >= time '21:00' then (select t from nowt)::date
              else (select t from nowt)::date - 1 end as last_day
),
cls as (
  select c.id, c.name, (c.kind is distinct from 'rep' and coalesce(c.grp, '') = '') as is_main from public.classes c
),
st as (select s.id, s.class_id from public.students s where coalesce(btrim(s.full_name), '') <> ''),
sd as (  -- maktab ish kunlari: asosiy sinflarning birortasida baho bor kunlar
  select distinct ds.day from public.daily_scores ds
    join public.students s on s.id = ds.student_id join cls c on c.id = s.class_id and c.is_main
   where ds.day between p_from and least(p_to, (select last_day from cut))
),
cday as (
  select c.id as class_id, sd.day from cls c join sd on c.is_main
  union
  select s.class_id, ds.day from public.daily_scores ds join public.students s on s.id = ds.student_id
    join cls c on c.id = s.class_id and not c.is_main
   where ds.day between p_from and least(p_to, (select last_day from cut))
  union
  select s.class_id, r.day from public.rep_daily r join public.students s on s.id = r.student_id
   where r.day between p_from and least(p_to, (select last_day from cut))
),
rws as (
  select student_id, day, done_at from public.daily_scores where day between p_from and p_to
  union all
  select student_id, day, done_at from public.rep_daily where day between p_from and p_to
),
cstat as (
  select cd.class_id, cd.day, count(st.id) as n,
         count(r.student_id) filter (where r.done_at is not null) as done,
         count(r.student_id) filter (where r.done_at <= ((cd.day + time '21:00') at time zone 'Asia/Tashkent')) as ok
    from cday cd join st on st.class_id = cd.class_id
    left join rws r on r.student_id = st.id and r.day = cd.day
   group by cd.class_id, cd.day
),
tc as (
  select t.user_id, t.class_id from public.teacher_classes t
   where public.yk_role() = 'admin' or public.yk_admin2() or t.user_id = auth.uid()
)
select p.id, p.full_name, p.phone,
       (select string_agg(c.name, ', ' order by c.name) from tc t2 join public.classes c on c.id = t2.class_id where t2.user_id = p.id),
       count(cs.class_id)::int,
       (count(cs.class_id) filter (where cs.ok = cs.n))::int,
       (count(cs.class_id) filter (where cs.done = cs.n and cs.ok < cs.n))::int,
       (count(cs.class_id) filter (where cs.done < cs.n))::int,
       greatest(0, 100 - 2 * (count(cs.class_id) filter (where cs.done = cs.n and cs.ok < cs.n))
                       - 5 * (count(cs.class_id) filter (where cs.done < cs.n)))::int
  from public.profiles p
  join (select distinct user_id from tc) u on u.user_id = p.id
  left join tc on tc.user_id = p.id
  left join cstat cs on cs.class_id = tc.class_id
 group by p.id, p.full_name, p.phone
 order by 9 desc, 6 desc, 2
$$;

-- Ota-onalar ulanishi: 2-darajali admin ham ko'radi, lekin parollarni (kodlarni) — yo'q
drop function if exists public.parent_links();
create function public.parent_links()
returns table (student_id text, class_id bigint, slot int, full_name text, phone text,
               akk boolean, kirgan boolean, last_seen timestamptz, push boolean, pw_class text, opens int, gen boolean, code text)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if public.yk_role() is distinct from 'admin' and not public.yk_admin2() then raise exception 'Faqat admin ko''radi' using errcode = '42501'; end if;
  return query
  with s as (
    select st.id, st.class_id, st.slot, st.full_name, sp.claimed_by, sp.code,
           case when length(d.v) = 9 then d.v end as ph
      from public.students st
      left join public.student_private sp on sp.student_id = st.id
      cross join lateral (select right(regexp_replace(coalesce(sp.parent_phone, ''), '\D', '', 'g'), 9) as v) d
     where btrim(coalesce(st.full_name, '')) <> ''
  ), u as (
    select s.*, coalesce(a1.id, a2.id) as uid, coalesce(a1.created_at, a2.created_at) as ac,
           coalesce(a1.last_sign_in_at, a2.last_sign_in_at) as ls
      from s
      left join auth.users a1 on a1.id = s.claimed_by
      left join auth.users a2 on a1.id is null and s.ph is not null and a2.email = 'p' || s.ph || '@ota.yuksalish.app'
  ), g as (
    select u.*,
           u.uid is not null and (
             exists (select 1 from public.parent_pw_log pl2 where pl2.phone = u.ph)
             or exists (select 1 from public.profiles pr where pr.id = u.uid and coalesce(to_jsonb(pr) ->> 'full_name', '') like 'Ota-ona:%')
             or (select count(*) from auth.users b where b.email like 'p%@ota.yuksalish.app'
                   and b.created_at between u.ac - interval '2 minutes' and u.ac + interval '2 minutes') >= 3) as gn,
           (select max(se.updated_at) from auth.sessions se where se.user_id = u.uid and se.updated_at > u.ac + interval '5 minutes') as su
      from u
  )
  select u.id::text, u.class_id::bigint, u.slot::int, u.full_name::text, u.ph,
         u.uid is not null,
         -- Kirgan: ilovani ochgan, yoki akkaunt ochilgandan keyin parol bilan kirgan, yoki o'zi ro'yxatdan o'tgan
         u.uid is not null and (ps.user_id is not null or u.ls > u.ac + interval '5 minutes' or u.su is not null or not u.gn),
         case when u.uid is not null then greatest(
           ps.seen_at,
           case when u.ls > u.ac + interval '5 minutes' or not u.gn then u.ls end,
           u.su) end,
         u.uid is not null and exists (select 1 from public.push_subs p where p.user_id = u.uid),
         pl.class_name::text,
         coalesce(ps.opens, 0)::int,
         u.gn,
         case when public.yk_role() = 'admin' then upper(btrim(u.code)) end::text  -- parol (kod) faqat bosh adminga
    from g u
    left join public.parent_seen ps on ps.user_id = u.uid
    left join public.parent_pw_log pl on pl.phone = u.ph
   order by u.class_id, u.slot;
end $$;
revoke all on function public.parent_links() from public, anon;
grant execute on function public.parent_links() to authenticated;

-- Ota-onalar savolnomasi natijasi
create or replace function public.checkin_stats(p_days int default 14)
returns table (day date, javob int, talk int, kun int, qiziqish int, orzu int)
language plpgsql stable security definer set search_path = public as $$
begin
  if public.yk_role() is distinct from 'admin' and not public.yk_admin2() then raise exception 'Faqat admin' using errcode = '42501'; end if;
  return query
  select c.day, count(*)::int,
         round(100.0 * count(*) filter (where c.q_talk) / count(*))::int,
         round(100.0 * count(*) filter (where c.q_day) / count(*))::int,
         round(100.0 * count(*) filter (where c.q_interest) / count(*))::int,
         round(100.0 * count(*) filter (where c.q_dream) / count(*))::int
    from public.parent_checkin c
   where c.day > (now() at time zone 'Asia/Tashkent')::date - greatest(p_days, 1)
   group by c.day order by c.day desc;
end $$;

notify pgrst, 'reload schema';

-- ################################ 57 ################################
-- ============ 2. Buxgalter ============
alter table public.profiles add column if not exists bux boolean not null default false;

create or replace function public.yk_bux() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select p.bux from public.profiles p where p.id = auth.uid() and p.role = 'teacher'), false)
$$;
grant execute on function public.yk_bux() to authenticated;

create or replace function public.set_bux(p_id uuid, p_on boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if public.yk_role() is distinct from 'admin' then raise exception 'Faqat bosh admin' using errcode = '42501'; end if;
  update public.profiles set bux = coalesce(p_on, false) where id = p_id and role = 'teacher';
  if not found then raise exception 'O''qituvchi topilmadi'; end if;
end $$;
revoke all on function public.set_bux(uuid, boolean) from public, anon;
grant execute on function public.set_bux(uuid, boolean) to authenticated;

-- O'qituvchi o'z belgisini o'zi o'zgartira olmasin
create or replace function public.yk_bux_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.bux is distinct from old.bux and public.yk_role() is distinct from 'admin' and current_user not in ('postgres', 'supabase_admin', 'service_role') then
    new.bux := old.bux;
  end if;
  return new;
end $$;
drop trigger if exists yk_bux_guard on public.profiles;
create trigger yk_bux_guard before update on public.profiles for each row execute function public.yk_bux_guard();

-- Huquqlar: to'lovlar — o'qish va yozish; o'quvchilar va sinflar — faqat o'qish (parollar/kodlar ko'rinmaydi)
grant select, insert, update on public.payments to authenticated;
drop policy if exists bux_all on public.payments;
create policy bux_all on public.payments for all to authenticated using (public.yk_bux()) with check (public.yk_bux());
drop policy if exists bux_read on public.students;
create policy bux_read on public.students for select to authenticated using (public.yk_bux());
drop policy if exists bux_read on public.classes;
create policy bux_read on public.classes for select to authenticated using (public.yk_bux());

-- Ota-ona telefoni (kod/parolsiz) — buxgalter va admin uchun
create or replace function public.bux_phones() returns table (student_id text, parent_phone text)
language sql stable security definer set search_path = public as $$
  select sp.student_id::text, sp.parent_phone from public.student_private sp
   where public.yk_bux() or public.yk_role() = 'admin'
$$;
revoke all on function public.bux_phones() from public, anon;
grant execute on function public.bux_phones() to authenticated;

notify pgrst, 'reload schema';

select full_name as "O'qituvchilar", case when bux then '💰 buxgalter' else '' end as belgi
  from public.profiles where role = 'teacher' and bux;

-- ################################ 58 ################################
-- Yangilanish 58: Yillik (10 oylik) to'lov.
--  Admin yoki buxgalter o'quvchiga «Yillik to'lov» belgisini qo'yadi — o'quv yilining 10 oyi (sentyabr–iyun)
--  birdaniga «to'langan» bo'ladi (to'langan sana — bugun). Ota-ona profilida «to'lov qiling» eslatmasi va
--  to'lov SMS'i chiqmaydi. Belgi olib tashlansa — shu yillik to'lov bilan belgilangan oylar bekor qilinadi.
-- Supabase → SQL Editor ga to'liq nusxalab, "Run" bosing (loyiha: yurt-school). Qayta ishga tushirish xavfsiz.

alter table public.payments add column if not exists yearly boolean not null default false;

create or replace function public.set_yearly(p_sid text, p_on boolean) returns int
language plpgsql security definer set search_path = public as $$
declare t date := (now() at time zone 'Asia/Tashkent')::date;
        sy int := case when extract(month from t) >= 9 then extract(year from t)::int else extract(year from t)::int - 1 end;
        sid public.students.id%type; n int;
begin
  if not (public.yk_role() = 'admin' or coalesce(public.yk_bux(), false)) then
    raise exception 'Faqat admin yoki buxgalter' using errcode = '42501';
  end if;
  select id into sid from public.students where id::text = p_sid;
  if sid is null then raise exception 'O''quvchi topilmadi'; end if;
  if p_on then
    insert into public.payments (student_id, month, paid, paid_on, yearly)
    select sid, make_date(case when m >= 9 then sy else sy + 1 end, m, 1), true, t, true
      from unnest(array[9, 10, 11, 12, 1, 2, 3, 4, 5, 6]) m
    on conflict (student_id, month) do update
      -- oldin alohida to'langan oy o'zgarmaydi (belgi olib tashlansa ham to'langanligicha qoladi)
      set yearly = public.payments.yearly or not public.payments.paid, paid = true,
          paid_on = case when public.payments.paid then public.payments.paid_on else excluded.paid_on end;
  else
    update public.payments set paid = false, paid_on = null, yearly = false
     where student_id = sid and yearly and month between make_date(sy, 9, 1) and make_date(sy + 1, 6, 1);
  end if;
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.set_yearly(text, boolean) from public, anon;
grant execute on function public.set_yearly(text, boolean) to authenticated;

notify pgrst, 'reload schema';

-- ################################ 59 ################################
-- Yangilanish 59: To'lov kvitansiyasi.
--  - To'lov belgilanganda: to'lov usuli (naqd / karta), summa (ixtiyoriy) va QABUL QILGAN xodim
--    (buxgalter yoki admin — kim belgilagan bo'lsa, uning ism-familiyasi) avtomatik yoziladi.
--  - Har bir to'lovga kvitansiya raqami beriladi; kvitansiya PDF'da «To'lov amalga oshirildi» ko'k shtampi bilan chiqadi.
--  - Yillik (10 oylik) to'lovda ham usul va summa saqlanadi.
-- Supabase → SQL Editor ga to'liq nusxalab, "Run" bosing (loyiha: yurt-school). Avval 57 va 58 ishga tushgan bo'lsin.
-- Qayta ishga tushirish xavfsiz.

alter table public.payments add column if not exists method text;
alter table public.payments drop constraint if exists payments_method_chk;
alter table public.payments add constraint payments_method_chk check (method in ('naqd', 'karta'));
alter table public.payments add column if not exists amount numeric(14, 0);
alter table public.payments add column if not exists received_by uuid;
alter table public.payments add column if not exists received_name text;
alter table public.payments add column if not exists received_at timestamptz;
alter table public.payments add column if not exists rec_no bigint generated by default as identity;

-- Kim qabul qilgani — bazaning o'zi yozadi (soxtalashtirib bo'lmaydi)
create or replace function public.yk_pay_recv() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.paid and (tg_op = 'INSERT' or not coalesce(old.paid, false)) then
    new.received_by := auth.uid();
    new.received_name := (select p.full_name from public.profiles p where p.id = auth.uid());
    new.received_at := now();
  elsif not new.paid then
    new.method := null; new.amount := null; new.received_by := null; new.received_name := null; new.received_at := null;
  end if;
  return new;
end $$;
drop trigger if exists yk_pay_recv on public.payments;
create trigger yk_pay_recv before insert or update on public.payments for each row execute function public.yk_pay_recv();

-- Yillik to'lov: usul va summa bilan
drop function if exists public.set_yearly(text, boolean);
create or replace function public.set_yearly(p_sid text, p_on boolean, p_method text default null, p_amount numeric default null) returns int
language plpgsql security definer set search_path = public as $$
declare t date := (now() at time zone 'Asia/Tashkent')::date;
        sy int := case when extract(month from t) >= 9 then extract(year from t)::int else extract(year from t)::int - 1 end;
        sid public.students.id%type; n int;
begin
  if not (public.yk_role() = 'admin' or coalesce(public.yk_bux(), false)) then
    raise exception 'Faqat admin yoki buxgalter' using errcode = '42501';
  end if;
  if p_on and p_method is not null and p_method not in ('naqd', 'karta') then raise exception 'To''lov usuli: naqd yoki karta'; end if;
  select id into sid from public.students where id::text = p_sid;
  if sid is null then raise exception 'O''quvchi topilmadi'; end if;
  if p_on then
    insert into public.payments (student_id, month, paid, paid_on, yearly, method, amount)
    select sid, make_date(case when m >= 9 then sy else sy + 1 end, m, 1), true, t, true, p_method, p_amount
      from unnest(array[9, 10, 11, 12, 1, 2, 3, 4, 5, 6]) m
    on conflict (student_id, month) do update
      -- oldin alohida to'langan oy o'zgarmaydi (belgi olib tashlansa ham to'langanligicha qoladi)
      set yearly = public.payments.yearly or not public.payments.paid,
          method = case when public.payments.paid then public.payments.method else excluded.method end,
          amount = case when public.payments.paid then public.payments.amount else excluded.amount end,
          paid_on = case when public.payments.paid then public.payments.paid_on else excluded.paid_on end,
          paid = true;
  else
    update public.payments set paid = false, paid_on = null, yearly = false
     where student_id = sid and yearly and month between make_date(sy, 9, 1) and make_date(sy + 1, 6, 1);
  end if;
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.set_yearly(text, boolean, text, numeric) from public, anon;
grant execute on function public.set_yearly(text, boolean, text, numeric) to authenticated;

notify pgrst, 'reload schema';

-- ################################ 60 ################################
-- Yangilanish 60: To'lovlar bo'yicha KUNLIK va OYLIK hisobot (buxgalter va admin).
--  - Hisobot bazada aniq hisoblanadi: har bir to'lov (o'quvchi, sinf, oy, summa, naqd/karta, qabul qilgan xodim, vaqt);
--    yillik (10 oylik) to'lov BIR MARTA hisoblanadi.
--  - «Hisobotni yopish»: jami summalar (naqd, karta, umumiy) muhrlanadi; yopilgan kun/oy to'lovlarini buxgalter
--    o'zgartira olmaydi (faqat bosh admin hisobotni qayta ochishi mumkin).
-- Supabase → SQL Editor ga to'liq nusxalab, "Run" bosing (loyiha: yurt-school). Avval 57–59 ishga tushgan bo'lsin.
-- Qayta ishga tushirish xavfsiz.

create or replace function public.yk_pay_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select public.yk_role() = 'admin' or coalesce(public.yk_bux(), false) or coalesce(public.yk_admin2(), false)
$$;
grant execute on function public.yk_pay_staff() to authenticated;

-- Hisobot qatorlari (davr bo'yicha, to'langan sana asosida)
create or replace function public.pay_report(p_from date, p_to date)
returns table (student_id text, full_name text, class_id bigint, class_name text, month date, yearly boolean,
               amount numeric, method text, received_name text, paid_on date, received_at timestamptz, rec_no bigint)
language sql stable security definer set search_path = public as $$
  with p as (
    select * from public.payments where paid and paid_on between p_from and p_to and public.yk_pay_staff()),
  r as (
    select * from p where not yearly
    union all
    select distinct on (student_id, paid_on) * from p where yearly order by student_id, paid_on, month)
  select r.student_id::text, s.full_name, c.id, c.name, r.month, r.yearly, r.amount, r.method, r.received_name,
         r.paid_on, r.received_at, r.rec_no
    from r join public.students s on s.id = r.student_id left join public.classes c on c.id = s.class_id
   order by r.paid_on, c.grade nulls last, c.name, s.full_name, r.month
$$;
revoke all on function public.pay_report(date, date) from public, anon;
grant execute on function public.pay_report(date, date) to authenticated;

-- Yopilgan hisobotlar
create table if not exists public.pay_reports (
  id bigint generated by default as identity primary key,
  kind text not null check (kind in ('kun', 'oy')),
  period date not null,
  d_from date not null,
  d_to date not null,
  cnt int not null,
  cash numeric(16, 0) not null,
  card numeric(16, 0) not null,
  total numeric(16, 0) not null,
  no_amount int not null,
  rows jsonb not null,
  closed_by uuid default auth.uid(),
  closed_name text,
  closed_at timestamptz not null default now(),
  unique (kind, period)
);
alter table public.pay_reports enable row level security;
revoke all on public.pay_reports from anon, authenticated;
grant select on public.pay_reports to authenticated;
drop policy if exists pay_reports_read on public.pay_reports;
create policy pay_reports_read on public.pay_reports for select to authenticated using (public.yk_pay_staff());

create or replace function public.close_pay_report(p_kind text, p_period date) returns public.pay_reports
language plpgsql security definer set search_path = public as $$
declare a date; b date; res public.pay_reports;
begin
  if not (public.yk_role() = 'admin' or coalesce(public.yk_bux(), false)) then
    raise exception 'Faqat buxgalter yoki admin' using errcode = '42501';
  end if;
  if p_kind = 'kun' then a := p_period; b := p_period;
  elsif p_kind = 'oy' then a := date_trunc('month', p_period)::date; b := (date_trunc('month', p_period) + interval '1 month - 1 day')::date;
  else raise exception 'Hisobot turi: kun yoki oy'; end if;
  if b > (now() at time zone 'Asia/Tashkent')::date then raise exception 'Davr hali tugamagan'; end if;
  insert into public.pay_reports (kind, period, d_from, d_to, cnt, cash, card, total, no_amount, rows, closed_name)
  select p_kind, a, a, b, count(*)::int,
         coalesce(sum(amount) filter (where method = 'naqd'), 0),
         coalesce(sum(amount) filter (where method = 'karta'), 0),
         coalesce(sum(amount), 0),
         (count(*) filter (where amount is null))::int,
         coalesce(jsonb_agg(to_jsonb(x) order by x.paid_on, x.class_name, x.full_name), '[]'::jsonb),
         (select full_name from public.profiles where id = auth.uid())
    from public.pay_report(a, b) x
  on conflict (kind, period) do nothing
  returning * into res;
  if res.id is null then raise exception 'Bu hisobot allaqachon yopilgan'; end if;
  return res;
end $$;
revoke all on function public.close_pay_report(text, date) from public, anon;
grant execute on function public.close_pay_report(text, date) to authenticated;

create or replace function public.reopen_pay_report(p_id bigint) returns void
language plpgsql security definer set search_path = public as $$
begin
  if public.yk_role() is distinct from 'admin' then raise exception 'Faqat bosh admin qayta ocha oladi' using errcode = '42501'; end if;
  delete from public.pay_reports where id = p_id;
end $$;
revoke all on function public.reopen_pay_report(bigint) from public, anon;
grant execute on function public.reopen_pay_report(bigint) to authenticated;

-- Yopilgan kun/oy to'lovlarini o'zgartirib bo'lmaydi (bosh admin bundan mustasno — u avval hisobotni qayta ochadi)
create or replace function public.yk_pay_lock() returns trigger
language plpgsql security definer set search_path = public as $$
declare d1 date; d2 date;
begin
  if current_user in ('postgres', 'supabase_admin', 'service_role') then return coalesce(new, old); end if;
  if tg_op in ('UPDATE', 'DELETE') and old.paid then d1 := old.paid_on; end if;
  if tg_op in ('INSERT', 'UPDATE') and new.paid then d2 := new.paid_on; end if;
  if tg_op = 'UPDATE' and old.paid = new.paid and old.paid_on is not distinct from new.paid_on
     and old.amount is not distinct from new.amount and old.method is not distinct from new.method then
    return new;  -- to'lovga taalluqli maydonlar o'zgarmagan
  end if;
  if exists (select 1 from public.pay_reports r where (d1 between r.d_from and r.d_to) or (d2 between r.d_from and r.d_to)) then
    raise exception 'Bu kunning hisoboti yopilgan — to''lovni o''zgartirib bo''lmaydi' using errcode = 'P0001';
  end if;
  return coalesce(new, old);
end $$;
drop trigger if exists yk_pay_lock on public.payments;
create trigger yk_pay_lock before insert or update or delete on public.payments for each row execute function public.yk_pay_lock();

notify pgrst, 'reload schema';

-- ################################ 67 ################################
-- Yangilanish 67: Buxgalter — Kunlik xarajatlar (maktab xodimlari va boshqa xarajatlar).
--   Har bir xarajat: sana, turi (xodimlarga, oziq-ovqat, kommunal, xo'jalik, transport, boshqa), kimga/izoh,
--   summa, naqd yoki karta, kim kiritgani. Buxgalter va bosh admin kiritadi; 2-darajali admin faqat ko'radi.
-- Supabase → SQL Editor ga to'liq nusxalab, "Run" bosing (loyiha: yurt-school). Avval 57 va 60 ishga tushgan bo'lsin.
-- Qayta ishga tushirish xavfsiz.

create table if not exists public.expenses (
  id bigint generated by default as identity primary key,
  day date not null default (now() at time zone 'Asia/Tashkent')::date,
  category text not null,
  recipient text,
  amount numeric(14, 0) not null check (amount > 0),
  method text not null default 'naqd' check (method in ('naqd', 'karta')),
  note text,
  created_by uuid default auth.uid(),
  created_name text,
  created_at timestamptz not null default now()
);
create index if not exists expenses_day_idx on public.expenses (day);
alter table public.expenses enable row level security;
grant select, insert, update, delete on public.expenses to authenticated;
grant usage, select on sequence public.expenses_id_seq to authenticated;

drop policy if exists exp_read on public.expenses;
create policy exp_read on public.expenses for select to authenticated using (public.yk_pay_staff());
drop policy if exists exp_write on public.expenses;
create policy exp_write on public.expenses for insert to authenticated
  with check (public.yk_role() = 'admin' or coalesce(public.yk_bux(), false));
drop policy if exists exp_edit on public.expenses;
create policy exp_edit on public.expenses for update to authenticated
  using (public.yk_role() = 'admin' or (coalesce(public.yk_bux(), false) and created_by = auth.uid()))
  with check (public.yk_role() = 'admin' or (coalesce(public.yk_bux(), false) and created_by = auth.uid()));
drop policy if exists exp_del on public.expenses;
create policy exp_del on public.expenses for delete to authenticated
  using (public.yk_role() = 'admin' or (coalesce(public.yk_bux(), false) and created_by = auth.uid()));

-- Kim kiritgani — bazaning o'zi yozadi
create or replace function public.yk_exp_who() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := auth.uid();
    new.created_name := (select p.full_name from public.profiles p where p.id = auth.uid());
    new.created_at := now();
  else
    new.created_by := old.created_by; new.created_name := old.created_name; new.created_at := old.created_at;
  end if;
  new.category := btrim(new.category);
  return new;
end $$;
drop trigger if exists yk_exp_who on public.expenses;
create trigger yk_exp_who before insert or update on public.expenses for each row execute function public.yk_exp_who();

notify pgrst, 'reload schema';

-- ################################ 63 ################################
-- Yangilanish 63: Admin uchun «Baho qo'yilmaganlar» — tanlangan davrda (kun/hafta) har bir sinf/guruh bo'yicha
-- qaysi kuni qaysi o'quvchilarga baho to'liq qo'yilmagan va mas'ul o'qituvchi kim.
--   Asosiy sinflar (1–10): maktab ish kunlari (dushanba–juma, birorta sinfda baho bor kunlar) — har bir kun tekshiriladi;
--   guruhlar (3-, 4-, 6-guruh) va repetitor guruhlari: dars bo'lgan kunlar (o'qituvchi kamida bitta baho qo'ygan kunlar).
--   «To'liq» — o'qituvchilar reytingidagi kabi: davomat va barcha mezonlar qo'yilgan (kelmagan bo'lsa — faqat davomat).
-- Supabase → SQL Editor ga to'liq nusxalab, "Run" bosing (loyiha: yurt-school). Qayta ishga tushirish xavfsiz.

create or replace function public.grade_gaps(p_from date, p_to date)
returns table (class_id bigint, class_name text, day date, n int, done int, missing text[], teachers text)
language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
begin
  if not (public.yk_role() = 'admin' or coalesce(public.yk_admin2(), false)) then
    raise exception 'Faqat admin' using errcode = '42501';
  end if;
  p_to := least(p_to, (now() at time zone 'Asia/Tashkent')::date);
  return query
  with cls as (
    select c.id, c.name, c.kind = 'rep' as rep, (c.kind is distinct from 'rep' and coalesce(c.grp, '') = '') as is_main
      from public.classes c),
  st as (select s.id, s.class_id, s.full_name, s.slot from public.students s where coalesce(btrim(s.full_name), '') <> ''),
  sd as (  -- maktab ish kunlari
    select distinct ds.day from public.daily_scores ds
      join public.students s on s.id = ds.student_id join cls c on c.id = s.class_id and c.is_main
     where ds.day between p_from and p_to and extract(isodow from ds.day) <= 5),
  cday as (
    select c.id as cid, sd.day from cls c join sd on c.is_main
    union
    select s.class_id, ds.day from public.daily_scores ds join public.students s on s.id = ds.student_id
      join cls c on c.id = s.class_id and not c.is_main and not c.rep
     where ds.day between p_from and p_to
    union
    select s.class_id, r.day from public.rep_daily r join public.students s on s.id = r.student_id
     where r.day between p_from and p_to),
  rws as (
    select student_id, day, done_at from public.daily_scores where day between p_from and p_to
    union all
    select student_id, day, done_at from public.rep_daily where day between p_from and p_to),
  g as (
    select cd.cid, cd.day, count(st.id)::int as n,
           (count(st.id) filter (where r.done_at is not null))::int as done,
           array_agg(st.full_name order by st.slot) filter (where r.done_at is null) as missing
      from cday cd join st on st.class_id = cd.cid
      left join rws r on r.student_id = st.id and r.day = cd.day
     group by cd.cid, cd.day)
  select g.cid, c.name, g.day, g.n, g.done, coalesce(g.missing, '{}'),
         (select string_agg(p.full_name || case when t.role = 'rahbar' then ' (sinf rahbari)' else '' end, ', '
                            order by t.role = 'rahbar' desc, p.full_name)
            from public.teacher_classes t join public.profiles p on p.id = t.user_id
           where t.class_id = g.cid and (not c.is_main or t.role = 'rahbar'))
    from g join cls c on c.id = g.cid
   order by g.day desc, (g.n - g.done) desc, c.name;
end $$;
revoke all on function public.grade_gaps(date, date) from public, anon;
grant execute on function public.grade_gaps(date, date) to authenticated;

notify pgrst, 'reload schema';

-- ################################ 64 ################################
-- Yangilanish 64: «Baho qo'yilmaganlar» — o'qituvchilar bo'yicha, har kunlik, jonli.
--  1) Dars jadvali: har bir o'qituvchi biriktirishiga (o'qituvchi + sinf/guruh) dars kunlari (Du–Sh) belgilanadi.
--  2) teacher_gaps(kun): o'qituvchi → sinf/guruh → baho qo'yilmagan o'quvchilar:
--       sinf rahbari (asosiy sinf) — har ish kuni (Du–Ju): kunlik vazifalar to'liqmi;
--       guruh / repetitor o'qituvchisi — jadvaldagi dars kunlari (jadval kiritilmagan bo'lsa — baho qo'ygan kunlari):
--         davomat va baholar to'liqmi;
--       fan o'qituvchisi (asosiy sinfda) — jadvaldagi dars kunlari: davomat va baho qo'yilganmi (fan baholari).
--  3) yangilanish-63 dagi xato tuzatildi («structure of query does not match function result type»).
-- Supabase → SQL Editor ga to'liq nusxalab, "Run" bosing (loyiha: yurt-school). Qayta ishga tushirish xavfsiz.

alter table public.teacher_classes add column if not exists days smallint[];

-- 63 dagi funksiya: turlar aniq ko'rsatildi
create or replace function public.grade_gaps(p_from date, p_to date)
returns table (class_id bigint, class_name text, day date, n int, done int, missing text[], teachers text)
language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
begin
  if not (public.yk_role() = 'admin' or coalesce(public.yk_admin2(), false)) then
    raise exception 'Faqat admin' using errcode = '42501';
  end if;
  p_to := least(p_to, (now() at time zone 'Asia/Tashkent')::date);
  return query
  with cls as (
    select c.id::bigint as id, c.name::text as name, c.kind = 'rep' as rep,
           (c.kind is distinct from 'rep' and coalesce(c.grp, '') = '') as is_main
      from public.classes c),
  st as (select s.id, s.class_id::bigint as class_id, s.full_name::text as full_name, s.slot
           from public.students s where coalesce(btrim(s.full_name), '') <> ''),
  sd as (
    select distinct ds.day from public.daily_scores ds
      join public.students s on s.id = ds.student_id join cls c on c.id = s.class_id and c.is_main
     where ds.day between p_from and p_to and extract(isodow from ds.day) <= 5),
  cday as (
    select c.id as cid, sd.day from cls c join sd on c.is_main
    union
    select s.class_id::bigint, ds.day from public.daily_scores ds join public.students s on s.id = ds.student_id
      join cls c on c.id = s.class_id and not c.is_main and not c.rep
     where ds.day between p_from and p_to
    union
    select s.class_id::bigint, r.day from public.rep_daily r join public.students s on s.id = r.student_id
     where r.day between p_from and p_to),
  rws as (
    select student_id, day, done_at from public.daily_scores where day between p_from and p_to
    union all
    select student_id, day, done_at from public.rep_daily where day between p_from and p_to),
  g as (
    select cd.cid, cd.day, count(st.id)::int as n,
           (count(st.id) filter (where r.done_at is not null))::int as done,
           array_agg(st.full_name order by st.slot) filter (where r.done_at is null) as missing
      from cday cd join st on st.class_id = cd.cid
      left join rws r on r.student_id = st.id and r.day = cd.day
     group by cd.cid, cd.day)
  select g.cid, c.name, g.day, g.n, g.done, coalesce(g.missing, '{}'::text[]),
         (select string_agg(p.full_name::text || case when t.role = 'rahbar' then ' (sinf rahbari)' else '' end, ', '
                            order by t.role = 'rahbar' desc, p.full_name)
            from public.teacher_classes t join public.profiles p on p.id = t.user_id
           where t.class_id = g.cid and (not c.is_main or t.role = 'rahbar'))::text
    from g join cls c on c.id = g.cid
   order by g.day desc, (g.n - g.done) desc, c.name;
end $$;

-- O'qituvchilar bo'yicha: bir kun uchun
create or replace function public.teacher_gaps(p_day date)
returns table (user_id uuid, teacher text, phone text, class_id bigint, class_name text, role text, subject text,
               sched boolean, n int, done int, missing text[])
language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
declare dw int := extract(isodow from p_day)::int;
begin
  if not (public.yk_role() = 'admin' or coalesce(public.yk_admin2(), false)) then
    raise exception 'Faqat admin' using errcode = '42501';
  end if;
  if p_day > (now() at time zone 'Asia/Tashkent')::date then return; end if;
  return query
  with tc as (
    select t.user_id, t.class_id::bigint as cid, coalesce(t.role, 'fan')::text as role, t.subject::text as subject, t.days,
           c.name::text as cname, c.kind = 'rep' as rep, (c.kind is distinct from 'rep' and coalesce(c.grp, '') = '') as is_main
      from public.teacher_classes t join public.classes c on c.id = t.class_id),
  st as (select s.id, s.class_id::bigint as class_id, s.full_name::text as full_name, s.slot
           from public.students s where coalesce(btrim(s.full_name), '') <> ''),
  has_rows as (  -- guruhda shu kuni biror baho bormi (jadval kiritilmagan guruhlar uchun)
    select distinct s.class_id::bigint as cid from public.daily_scores d join public.students s on s.id = d.student_id where d.day = p_day
    union
    select distinct s.class_id::bigint from public.rep_daily r join public.students s on s.id = r.student_id where r.day = p_day),
  act as (  -- shu kuni dars/vazifa bo'lgan biriktirishlar
    select tc.* from tc
     where (tc.is_main and tc.role = 'rahbar' and dw <= 5)
        or (tc.is_main and tc.role <> 'rahbar' and tc.days is not null and dw = any(tc.days))
        or (not tc.is_main and tc.days is not null and dw = any(tc.days))
        or (not tc.is_main and tc.days is null and tc.cid in (select cid from has_rows))),
  chk as (
    select a.user_id, a.cid, st.full_name, st.slot,
           case when a.is_main and a.role <> 'rahbar' then
                  exists (select 1 from public.subject_scores ss where ss.student_id = st.id and ss.day = p_day and ss.teacher_id = a.user_id
                                and ss.att is not null and (ss.att = 0 or ss.grade is not null))
                when a.rep then exists (select 1 from public.rep_daily r where r.student_id = st.id and r.day = p_day and r.done_at is not null)
                else exists (select 1 from public.daily_scores d where d.student_id = st.id and d.day = p_day and d.done_at is not null) end as ok
      from act a join st on st.class_id = a.cid)
  select a.user_id, p.full_name::text, p.phone::text, a.cid, a.cname, a.role, a.subject, a.days is not null,
         (select count(*) from chk where chk.user_id = a.user_id and chk.cid = a.cid)::int,
         (select count(*) from chk where chk.user_id = a.user_id and chk.cid = a.cid and chk.ok)::int,
         coalesce((select array_agg(chk.full_name order by chk.slot) from chk where chk.user_id = a.user_id and chk.cid = a.cid and not chk.ok), '{}'::text[])
    from act a join public.profiles p on p.id = a.user_id
   order by p.full_name, a.cname;
end $$;
revoke all on function public.teacher_gaps(date) from public, anon;
grant execute on function public.teacher_gaps(date) to authenticated;

notify pgrst, 'reload schema';

-- ################################ 77 ################################
-- Yangilanish 77: «Baholanmaganlar» takomillashtirildi + har kuni soat 15:00 da eslatma.
--   1) class_gaps(sinf, kun): SINF RAHBARIGA — qaysi fan/guruh ustozi qaysi o'quvchisini baholamagan
--      (asosiy sinfdagi fan o'qituvchilari, guruhlar — Matematika, Ingliz tili, Arab/Koreys tili, repetitor — va kunlik vazifalar).
--   2) my_gaps(kun): har bir o'qituvchiga — o'zi bugun baholamagan o'quvchilar.
--   3) Har kuni (dushanba–shanba) soat 15:00 da baholamagan o'qituvchi va sinf rahbarlariga telefon eslatmasi
--      (o'qituvchi platformada «Eslatmalarni yoqish» tugmasini bosgan bo'lishi kerak).
--   Dars bo'lgan kun — O'qituvchilar bo'limidagi «Dars kunlari» bo'yicha (sinf rahbari — har ish kuni).
-- Supabase → SQL Editor ga to'liq nusxalab, "Run" bosing (loyiha: yurt-school). Avval 64, 69 va 75 ishga tushgan bo'lsin.
-- Qayta ishga tushirish xavfsiz.

-- Ichki: barcha o'qituvchilar bo'yicha bir kun
create or replace function public.yk_gaps_all(p_day date)
returns table (user_id uuid, teacher text, phone text, class_id bigint, class_name text, role text, subject text,
               sched boolean, n int, done int, missing text[], missing_ids text[])
language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
declare dw int := extract(isodow from p_day)::int;
begin
  return query
  with tc as (
    select t.user_id, t.class_id::bigint as cid, coalesce(t.role, 'fan')::text as role, t.subject::text as subject, t.days,
           c.name::text as cname, c.kind = 'rep' as rep, (c.kind is distinct from 'rep' and coalesce(c.grp, '') = '') as is_main
      from public.teacher_classes t join public.classes c on c.id = t.class_id),
  st as (select s.id, s.class_id::bigint as class_id, s.full_name::text as full_name, s.slot
           from public.students s where coalesce(btrim(s.full_name), '') <> ''),
  has_rows as (  -- guruhda shu kuni biror baho bormi (jadval kiritilmagan guruhlar uchun)
    select distinct s.class_id::bigint as cid from public.daily_scores d join public.students s on s.id = d.student_id where d.day = p_day
    union
    select distinct s.class_id::bigint from public.rep_daily r join public.students s on s.id = r.student_id where r.day = p_day),
  act as (  -- shu kuni dars/vazifa bo'lgan biriktirishlar
    select tc.* from tc
     where (tc.is_main and tc.role = 'rahbar' and dw <= 5)
        or (tc.is_main and tc.role <> 'rahbar' and tc.days is not null and dw = any(tc.days))
        or (not tc.is_main and tc.days is not null and dw = any(tc.days))
        or (not tc.is_main and tc.days is null and tc.cid in (select cid from has_rows))),
  chk as (
    select a.user_id, a.cid, st.id::text as sid, st.full_name, st.slot,
           case when a.is_main and a.role <> 'rahbar' then
                  exists (select 1 from public.subject_scores ss where ss.student_id = st.id and ss.day = p_day and ss.teacher_id = a.user_id
                                and ss.att is not null and (ss.att = 0 or ss.grade is not null))
                when a.rep then exists (select 1 from public.rep_daily r where r.student_id = st.id and r.day = p_day and r.done_at is not null)
                else exists (select 1 from public.daily_scores d where d.student_id = st.id and d.day = p_day and d.done_at is not null) end as ok
      from act a join st on st.class_id = a.cid)
  select a.user_id, p.full_name::text, p.phone::text, a.cid, a.cname, a.role, a.subject, a.days is not null,
         (select count(*) from chk where chk.user_id = a.user_id and chk.cid = a.cid)::int,
         (select count(*) from chk where chk.user_id = a.user_id and chk.cid = a.cid and chk.ok)::int,
         coalesce((select array_agg(chk.full_name order by chk.slot) from chk where chk.user_id = a.user_id and chk.cid = a.cid and not chk.ok), '{}'::text[]),
         coalesce((select array_agg(chk.sid order by chk.slot) from chk where chk.user_id = a.user_id and chk.cid = a.cid and not chk.ok), '{}'::text[])
    from act a join public.profiles p on p.id = a.user_id
   order by p.full_name, a.cname;
end $$;
revoke all on function public.yk_gaps_all(date) from public, anon, authenticated;

-- O'qituvchi: o'zi bugun baholamaganlar
create or replace function public.my_gaps(p_day date)
returns table (class_id bigint, class_name text, role text, subject text, n int, done int, missing text[])
language sql stable security definer set search_path = public as $$
  select g.class_id, g.class_name, g.role, g.subject, g.n, g.done, g.missing
    from public.yk_gaps_all(p_day) g
   where g.user_id = auth.uid() and g.n > g.done and p_day <= (now() at time zone 'Asia/Tashkent')::date
$$;
revoke all on function public.my_gaps(date) from public, anon;
grant execute on function public.my_gaps(date) to authenticated;

-- Sinf rahbari / admin: sinfdagi o'quvchilar — qaysi ustoz baholamagan
create or replace function public.class_gaps(p_class bigint, p_day date)
returns table (teacher text, subject text, kind text, group_name text, student text, slot int)
language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
begin
  if not (public.yk_role() = 'admin' or coalesce(public.yk_admin2(), false)
          or exists (select 1 from public.teacher_classes t where t.user_id = auth.uid() and t.class_id = p_class)) then
    raise exception 'Bu sinfga ruxsatingiz yo''q' using errcode = '42501';
  end if;
  return query
  with g as (select * from public.yk_gaps_all(p_day)),
  ms as (
    select s.id::text as id, s.full_name::text as nm, s.slot, public.yk_norm3(s.full_name) as nk,
           public.yk_norm3(public.yk_first2(s.full_name)) as nk2,
           coalesce(c.grade, nullif(substring(c.name from '^\s*(\d+)'), '')::int) as cg
      from public.students s join public.classes c on c.id = s.class_id
     where s.class_id = p_class and coalesce(btrim(s.full_name), '') <> ''),
  lk as (  -- asosiy sinf o'quvchisi ↔ guruhdagi yozuvi
    select ms.id as kid, gs.id::text as gid
      from ms join public.students gs on (public.yk_norm3(gs.full_name) = ms.nk or public.yk_norm3(public.yk_first2(gs.full_name)) = ms.nk2)
      join public.classes gc on gc.id = gs.class_id
     where gs.id::text <> ms.id and (gc.kind = 'rep' or coalesce(gc.grp, '') <> '' or coalesce(gc.subject, '') ~* '^(arab|koreys)')
       and (gc.grade is null or ms.cg is null or gc.grade = ms.cg or gc.name ~ ('(^|[^0-9])' || ms.cg || '([^0-9]|$)'))
    union
    select sl.kid, sl.gid from public.student_links sl join ms on ms.id = sl.kid)
  -- 1. shu sinfning o'zi (sinf rahbari — kunlik vazifalar, fan o'qituvchilari — fan baholari)
  select g.teacher, case when g.role = 'rahbar' then 'Kunlik vazifalar' else coalesce(nullif(g.subject, ''), 'Fan') end,
         case when g.role = 'rahbar' then 'rahbar' else 'fan' end, null::text, x.nm, x.slot
    from g cross join lateral unnest(g.missing_ids) as m(id) join ms x on x.id = m.id
   where g.class_id = p_class
  union all
  -- 2. guruh va repetitor darslari (o'quvchi shu sinfdan)
  select g.teacher, coalesce(nullif(g.subject, ''), g.class_name), 'guruh', g.class_name, x.nm, x.slot
    from g cross join lateral unnest(g.missing_ids) as m(id) join lk on lk.gid = m.id join ms x on x.id = lk.kid
   where g.class_id <> p_class
  order by 3, 2, 1, 6;
end $$;
revoke all on function public.class_gaps(bigint, date) from public, anon;
grant execute on function public.class_gaps(bigint, date) to authenticated;

-- Eslatma (bildirishnoma) turi
alter table public.push_queue drop constraint if exists push_queue_kind_check;
alter table public.push_queue add constraint push_queue_kind_check
  check (kind in ('keldi', 'ketdi', 'kelmadi', 'test', 'yomon', 'yaxshi', 'savol', 'javob', 'eslatma'));

-- Har kuni 15:00: baholamagan o'qituvchilarga eslatma
create or replace function public.yk_teacher_reminders() returns int
language plpgsql security definer set search_path = public as $$
declare t date := (now() at time zone 'Asia/Tashkent')::date; n int;
begin
  if extract(isodow from t) = 7 then return 0; end if;
  insert into public.push_queue (user_id, kind, student_id, title, body, day)
  select x.user_id, 'eslatma', x.user_id::text, '📝 Baho qo''yilmagan o''quvchilar',
         'Bugun baholanmagan: ' || string_agg(x.class_name || ' — ' || (x.n - x.done) || ' ta', ', ' order by x.class_name)
           || '. Iltimos, bugunoq baholang.', t
    from public.yk_gaps_all(t) x
   where x.n > x.done and exists (select 1 from public.push_subs s where s.user_id = x.user_id)
   group by x.user_id
  on conflict do nothing;
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.yk_teacher_reminders() from public, anon, authenticated;

-- Jadval: har kuni 15:00 (Toshkent) = 10:00 UTC, dushanba–shanba
do $$ begin
  perform cron.unschedule('yk-baho-eslatma');
exception when others then null;
end $$;
do $$ begin
  perform cron.schedule('yk-baho-eslatma', '0 10 * * 1-6', 'select public.yk_teacher_reminders()');
exception when others then raise notice 'pg_cron topilmadi — eslatma jadvali qo''yilmadi: %', sqlerrm;
end $$;

notify pgrst, 'reload schema';

select jobname as "Jadval", schedule as "vaqt (UTC)" from cron.job where jobname = 'yk-baho-eslatma';

-- ################################ 69 ################################
-- Yangilanish 69: Ota-ona va sinf rahbariga BARCHA baholar — qaysi fandan, kim, qachon qo'ygan:
--   1) fan o'qituvchilari (asosiy sinfdagi fan baholari);
--   2) guruhlar — 3-guruh (Matematika), 4-guruh (Ingliz tili), 6-guruh (Arab/Koreys tili): davomat, uyga vazifa, faollik, tartib;
--   3) repetitor guruhlari: davomat va topshiriq bahosi.
--   Guruhlarda o'quvchi alohida yozilgan — u asosiy sinfdagi farzand bilan ISM-FAMILIYASI bo'yicha (va sinf darajasi mos kelsa) bog'lanadi.
-- Supabase → SQL Editor ga to'liq nusxalab, "Run" bosing (loyiha: yurt-school). Qayta ishga tushirish xavfsiz.

create index if not exists students_norm_idx on public.students (public.yk_norm3(full_name));

-- Asosiy sinfdagi o'quvchilar (kids) uchun barcha baholar — ichki yordamchi
create or replace function public.yk_grades_of(p_kids text[], p_from date, p_to date)
returns table (student_id text, day date, subject text, teacher text, src text, class_name text,
               att int, excused boolean, hw int, activity int, grade int, behavior int, beh_band int, ss_id bigint, at timestamptz)
language sql stable security definer set search_path = public as $$
  with k as (
    select s.id, s.full_name, public.yk_norm3(s.full_name) as nk, c.grade as cg, c.name as cn
      from public.students s join public.classes c on c.id = s.class_id
     where s.id::text = any(p_kids)),
  links as (  -- guruh va repetitor yozuvlari: ism-familiya bir xil, sinf darajasi mos (yoki ko'rsatilmagan)
    select k.id as kid, g.id as gid, gc.id as gcid, gc.name::text as gname, gc.kind is not distinct from 'rep' as rep,
           coalesce(nullif(gc.subject, ''), gc.name)::text as subj
      from k join public.students g on public.yk_norm3(g.full_name) = k.nk and g.id <> k.id
      join public.classes gc on gc.id = g.class_id
     where (gc.kind = 'rep' or coalesce(gc.grp, '') <> '' or coalesce(gc.subject, '') ~* '^(arab|koreys)')
       and (gc.grade is null or k.cg is null or gc.grade = k.cg)),
  tch as (
    select t.class_id, string_agg(p.full_name::text, ', ' order by p.full_name) as names
      from public.teacher_classes t join public.profiles p on p.id = t.user_id group by t.class_id)
  -- 1. fan baholari
  select ss.student_id::text, ss.day, coalesce(nullif(ss.subject, ''), p.full_name, 'Fan')::text, p.full_name::text, 'fan', null::text,
         ss.att, ss.excused, ss.hw, ss.activity, ss.grade, null::int, null::int, ss.id, ss.updated_at
    from public.subject_scores ss join k on k.id = ss.student_id
    left join public.profiles p on p.id = ss.teacher_id
   where ss.day between p_from and p_to
  union all
  -- 2. guruh baholari (3-, 4-, 6-guruh)
  select l.kid::text, d.day, l.subj, tch.names, 'guruh', l.gname,
         d.att, d.excused, d.hw, d.activity, null::int, d.behavior, d.beh_band::int, null::bigint, d.updated_at
    from links l join public.daily_scores d on d.student_id = l.gid
    left join tch on tch.class_id = l.gcid
   where not l.rep and d.day between p_from and p_to
  union all
  -- 3. repetitor
  select l.kid::text, r.day, l.subj, tch.names, 'rep', l.gname,
         r.att::int, null::boolean, null::int, null::int, (to_jsonb(r) ->> 'task')::int, null::int, null::int, null::bigint, (to_jsonb(r) ->> 'updated_at')::timestamptz
    from links l join public.rep_daily r on r.student_id = l.gid
    left join tch on tch.class_id = l.gcid
   where l.rep and r.day between p_from and p_to
$$;
revoke all on function public.yk_grades_of(text[], date, date) from public, anon, authenticated;

-- Ota-ona: o'z farzandlari
create or replace function public.parent_grades(p_from date, p_to date)
returns table (student_id text, day date, subject text, teacher text, src text, class_name text,
               att int, excused boolean, hw int, activity int, grade int, behavior int, beh_band int, ss_id bigint, at timestamptz)
language sql stable security definer set search_path = public as $$
  select * from public.yk_grades_of(array(select k.id::text from public.my_kids() k), p_from, p_to)
   order by 2 desc, 15 desc nulls last
$$;
revoke all on function public.parent_grades(date, date) from public, anon;
grant execute on function public.parent_grades(date, date) to authenticated;

-- Sinf rahbari / admin: sinfdagi barcha o'quvchilar
create or replace function public.class_grades(p_class bigint, p_from date, p_to date)
returns table (student_id text, day date, subject text, teacher text, src text, class_name text,
               att int, excused boolean, hw int, activity int, grade int, behavior int, beh_band int, ss_id bigint, at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not (public.yk_role() = 'admin' or coalesce(public.yk_admin2(), false)
          or exists (select 1 from public.teacher_classes t where t.user_id = auth.uid() and t.class_id = p_class)) then
    raise exception 'Bu sinfga ruxsatingiz yo''q' using errcode = '42501';
  end if;
  return query select * from public.yk_grades_of(array(select s.id::text from public.students s where s.class_id = p_class), p_from, p_to);
end $$;
revoke all on function public.class_grades(bigint, date, date) from public, anon;
grant execute on function public.class_grades(bigint, date, date) to authenticated;

notify pgrst, 'reload schema';

-- ################################ 74 ################################
-- Yangilanish 74: Ota-onaga fan/guruh baholari — bog'lash kuchaytirildi.
--   1) Guruh nomidagi sinflar oralig'i hisobga olinadi: «5-6-sinf Arab tili» 6-sinf o'quvchisiga ham, «(8-9-10)» — 9/10-sinfga ham.
--   2) Ism solishtirish: to'liq ism YOKI faqat familiya + ism (otasining ismi yozilgan/yozilmaganidan qat'i nazar).
--   3) Oxirida tekshiruv: guruhlardagi qaysi o'quvchilar asosiy sinf bilan bog'lanmayapti (ota-onasi baholarni ko'rmaydi) —
--      ularning ismini guruhda asosiy sinfdagidek yozing.
-- Supabase → SQL Editor ga to'liq nusxalab, "Run" bosing (loyiha: yurt-school). Avval 69 ishga tushgan bo'lsin.
-- Qayta ishga tushirish xavfsiz.

create or replace function public.yk_grades_of(p_kids text[], p_from date, p_to date)
returns table (student_id text, day date, subject text, teacher text, src text, class_name text,
               att int, excused boolean, hw int, activity int, grade int, behavior int, beh_band int, ss_id bigint, at timestamptz)
language sql stable security definer set search_path = public as $$
  with k as (
    select s.id, s.full_name, public.yk_norm3(s.full_name) as nk, public.yk_norm3(public.yk_first2(s.full_name)) as nk2,
           coalesce(c.grade, nullif(substring(c.name from '^\s*(\d+)'), '')::int) as cg, c.name as cn
      from public.students s join public.classes c on c.id = s.class_id
     where s.id::text = any(p_kids)),
  links as (  -- guruh va repetitor yozuvlari: ism-familiya bir xil, sinf darajasi mos (yoki ko'rsatilmagan)
    select k.id as kid, g.id as gid, gc.id as gcid, gc.name::text as gname, gc.kind is not distinct from 'rep' as rep,
           coalesce(nullif(gc.subject, ''), gc.name)::text as subj
      from k join public.students g
        on g.id <> k.id and coalesce(btrim(g.full_name), '') <> ''
       and (public.yk_norm3(g.full_name) = k.nk or public.yk_norm3(public.yk_first2(g.full_name)) = k.nk2)
      join public.classes gc on gc.id = g.class_id
     where (gc.kind = 'rep' or coalesce(gc.grp, '') <> '' or coalesce(gc.subject, '') ~* '^(arab|koreys)')
       -- sinf darajasi: ko'rsatilmagan, teng yoki guruh nomida bor (masalan «5-6-sinf», «(8-9-10)»)
       and (gc.grade is null or k.cg is null or gc.grade = k.cg or gc.name ~ ('(^|[^0-9])' || k.cg || '([^0-9]|$)'))),
  tch as (
    select t.class_id, string_agg(p.full_name::text, ', ' order by p.full_name) as names
      from public.teacher_classes t join public.profiles p on p.id = t.user_id group by t.class_id)
  -- 1. fan baholari
  select ss.student_id::text, ss.day, coalesce(nullif(ss.subject, ''), p.full_name, 'Fan')::text, p.full_name::text, 'fan', null::text,
         ss.att, ss.excused, ss.hw, ss.activity, ss.grade, null::int, null::int, ss.id, ss.updated_at
    from public.subject_scores ss join k on k.id = ss.student_id
    left join public.profiles p on p.id = ss.teacher_id
   where ss.day between p_from and p_to
  union all
  -- 2. guruh baholari (3-, 4-, 6-guruh)
  select l.kid::text, d.day, l.subj, tch.names, 'guruh', l.gname,
         d.att, d.excused, d.hw, d.activity, null::int, d.behavior, d.beh_band::int, null::bigint, d.updated_at
    from links l join public.daily_scores d on d.student_id = l.gid
    left join tch on tch.class_id = l.gcid
   where not l.rep and d.day between p_from and p_to
  union all
  -- 3. repetitor
  select l.kid::text, r.day, l.subj, tch.names, 'rep', l.gname,
         r.att::int, null::boolean, null::int, null::int, (to_jsonb(r) ->> 'task')::int, null::int, null::int, null::bigint, (to_jsonb(r) ->> 'updated_at')::timestamptz
    from links l join public.rep_daily r on r.student_id = l.gid
    left join tch on tch.class_id = l.gcid
   where l.rep and r.day between p_from and p_to
$$;

notify pgrst, 'reload schema';

-- Tekshiruv: guruh/repetitordagi o'quvchilar — asosiy sinfda mos o'quvchi topilmadi (ota-onasi shu guruh baholarini ko'rmaydi)
select gc.name as "guruh", g.full_name as "guruhdagi ism", 'asosiy sinfda topilmadi — ismni asosiy sinfdagidek yozing' as "holat"
  from public.students g join public.classes gc on gc.id = g.class_id
 where coalesce(btrim(g.full_name), '') <> ''
   and (gc.kind = 'rep' or coalesce(gc.grp, '') <> '' or coalesce(gc.subject, '') ~* '^(arab|koreys)')
   and not exists (
     select 1 from public.students s join public.classes c on c.id = s.class_id
      where c.kind is distinct from 'rep' and coalesce(c.grp, '') = '' and coalesce(c.subject, '') !~* '^(arab|koreys)'
        and (public.yk_norm3(s.full_name) = public.yk_norm3(g.full_name)
             or public.yk_norm3(public.yk_first2(s.full_name)) = public.yk_norm3(public.yk_first2(g.full_name))))
 order by 1, 2;

-- ################################ 75 ################################
-- Yangilanish 75: Guruh/repetitordagi o'quvchilarni asosiy sinfdagi farzand bilan AVTOMATIK bog'lash (ism o'xshashligi bo'yicha).
--   Ism yozilishidagi farqlar (x/h, o'/ö, ʻ/', qisqartma, otasining ismi, «-10 sinf» kabi qo'shimchalar, ism tartibi)
--   hisobga olinadi; guruh nomidagi sinflar (masalan «5-6-sinf», «(8-9-10)», «9-10») bo'yicha nomzodlar tanlanadi.
--   Faqat ISHONCHLI va YAGONA moslik bog'lanadi (ismlar o'zgartirilmaydi — bog'lanish alohida jadvalda).
--   Natija jadvali: «bog'landi» / «shubhali — tekshiring» / «topilmadi».
-- Supabase → SQL Editor ga to'liq nusxalab, "Run" bosing (loyiha: yurt-school). Avval 69 va 74 ishga tushgan bo'lsin.
-- Qayta ishga tushirish xavfsiz (yangi qo'shilgan o'quvchilar uchun ham ishlatsa bo'ladi).

create extension if not exists pg_trgm with schema extensions;

create table if not exists public.student_links (
  gid text primary key,            -- guruh/repetitordagi o'quvchi
  kid text not null,               -- asosiy sinfdagi o'quvchi
  score numeric,
  auto boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.student_links enable row level security;
revoke all on public.student_links from anon, authenticated;

create or replace function public.yk_grades_of(p_kids text[], p_from date, p_to date)
returns table (student_id text, day date, subject text, teacher text, src text, class_name text,
               att int, excused boolean, hw int, activity int, grade int, behavior int, beh_band int, ss_id bigint, at timestamptz)
language sql stable security definer set search_path = public as $$
  with k as (
    select s.id, s.full_name, public.yk_norm3(s.full_name) as nk, public.yk_norm3(public.yk_first2(s.full_name)) as nk2,
           coalesce(c.grade, nullif(substring(c.name from '^\s*(\d+)'), '')::int) as cg, c.name as cn
      from public.students s join public.classes c on c.id = s.class_id
     where s.id::text = any(p_kids)),
  links as (  -- guruh va repetitor yozuvlari: ism-familiya bir xil, sinf darajasi mos (yoki ko'rsatilmagan)
    select k.id as kid, g.id as gid, gc.id as gcid, gc.name::text as gname, gc.kind is not distinct from 'rep' as rep,
           coalesce(nullif(gc.subject, ''), gc.name)::text as subj
      from k join public.students g
        on g.id <> k.id and coalesce(btrim(g.full_name), '') <> ''
       and (public.yk_norm3(g.full_name) = k.nk or public.yk_norm3(public.yk_first2(g.full_name)) = k.nk2)
      join public.classes gc on gc.id = g.class_id
     where (gc.kind = 'rep' or coalesce(gc.grp, '') <> '' or coalesce(gc.subject, '') ~* '^(arab|koreys)')
       -- sinf darajasi: ko'rsatilmagan, teng yoki guruh nomida bor (masalan «5-6-sinf», «(8-9-10)»)
       and (gc.grade is null or k.cg is null or gc.grade = k.cg or gc.name ~ ('(^|[^0-9])' || k.cg || '([^0-9]|$)'))
    union  -- avtomatik / qo'lda bog'langanlar (student_links)
    select k.id, g.id, gc.id, gc.name::text, gc.kind is not distinct from 'rep', coalesce(nullif(gc.subject, ''), gc.name)::text
      from k join public.student_links sl on sl.kid = k.id::text
      join public.students g on g.id::text = sl.gid join public.classes gc on gc.id = g.class_id),
  tch as (
    select t.class_id, string_agg(p.full_name::text, ', ' order by p.full_name) as names
      from public.teacher_classes t join public.profiles p on p.id = t.user_id group by t.class_id)
  -- 1. fan baholari
  select ss.student_id::text, ss.day, coalesce(nullif(ss.subject, ''), p.full_name, 'Fan')::text, p.full_name::text, 'fan', null::text,
         ss.att, ss.excused, ss.hw, ss.activity, ss.grade, null::int, null::int, ss.id, ss.updated_at
    from public.subject_scores ss join k on k.id = ss.student_id
    left join public.profiles p on p.id = ss.teacher_id
   where ss.day between p_from and p_to
  union all
  -- 2. guruh baholari (3-, 4-, 6-guruh)
  select l.kid::text, d.day, l.subj, tch.names, 'guruh', l.gname,
         d.att, d.excused, d.hw, d.activity, null::int, d.behavior, d.beh_band::int, null::bigint, d.updated_at
    from links l join public.daily_scores d on d.student_id = l.gid
    left join tch on tch.class_id = l.gcid
   where not l.rep and d.day between p_from and p_to
  union all
  -- 3. repetitor
  select l.kid::text, r.day, l.subj, tch.names, 'rep', l.gname,
         r.att::int, null::boolean, null::int, null::int, (to_jsonb(r) ->> 'task')::int, null::int, null::int, null::bigint, (to_jsonb(r) ->> 'updated_at')::timestamptz
    from links l join public.rep_daily r on r.student_id = l.gid
    left join tch on tch.class_id = l.gcid
   where l.rep and r.day between p_from and p_to
$$;

-- Avtomatik bog'lash: p_min — eng kam o'xshashlik (0..1), p_gap — ikkinchi nomzoddan farq
create or replace function public.yk_link_groups(p_min numeric default 0.6, p_gap numeric default 0.1)
returns table (guruh text, guruhdagi_ism text, mos_oquvchi text, sinf text, oxshashlik numeric, holat text)
language plpgsql security definer set search_path = public, extensions as $$
#variable_conflict use_column
begin
  if coalesce(public.yk_role(), '') <> 'admin' and current_user not in ('postgres', 'supabase_admin') then
    raise exception 'Faqat admin' using errcode = '42501';
  end if;
  return query
  with mainst as (
    select s.id::text as sid, s.full_name::text as nm, c.name::text as cn,
           coalesce(c.grade, nullif(substring(c.name from '^\s*(\d+)'), '')::int) as cg,
           translate(public.yk_norm3(s.full_name), 'q', 'k') as n1, translate(public.yk_norm3(public.yk_first2(s.full_name)), 'q', 'k') as n2
      from public.students s join public.classes c on c.id = s.class_id
     where c.kind is distinct from 'rep' and coalesce(c.grp, '') = '' and coalesce(c.subject, '') !~* '^(arab|koreys)'
       and coalesce(btrim(s.full_name), '') <> ''),
  grp as (
    select g.id::text as gid, g.full_name::text as nm, gc.name::text as gn,
           -- guruh nomidagi sinf raqamlari (IELTS 7.0, A1/B1 kabilar hisobga olinmaydi)
           (select array_agg(distinct m[1]::int) from regexp_matches(
              regexp_replace(regexp_replace(gc.name, '\d+\.\d+', '', 'g'), '[A-Za-z]\d+', '', 'g'), '(\d{1,2})', 'g') m
             where m[1]::int between 1 and 11) || case when gc.grade is not null then array[gc.grade] else '{}'::int[] end as gs,
           translate(public.yk_norm3(regexp_replace(g.full_name, '[-\s]*\d+\s*-?\s*sinf\w*', '', 'gi')), 'q', 'k') as n1,
           translate(public.yk_norm3(public.yk_first2(regexp_replace(g.full_name, '[-\s]*\d+\s*-?\s*sinf\w*', '', 'gi'))), 'q', 'k') as n2
      from public.students g join public.classes gc on gc.id = g.class_id
     where coalesce(btrim(g.full_name), '') <> ''
       and (gc.kind = 'rep' or coalesce(gc.grp, '') <> '' or coalesce(gc.subject, '') ~* '^(arab|koreys)')
       and not exists (select 1 from public.student_links sl where sl.gid = g.id::text)
       and not exists (select 1 from public.students s join public.classes c on c.id = s.class_id
                        where c.kind is distinct from 'rep' and coalesce(c.grp, '') = '' and coalesce(c.subject, '') !~* '^(arab|koreys)'
                          and (public.yk_norm3(s.full_name) = public.yk_norm3(g.full_name)
                               or public.yk_norm3(public.yk_first2(s.full_name)) = public.yk_norm3(public.yk_first2(g.full_name))))),
  cand as (
    select g.gid, g.nm as gnm, g.gn, m.sid, m.nm as mnm, m.cn,
           greatest(similarity(g.n1, m.n1), similarity(g.n2, m.n2),
                    case when position(' ' in g.n1) = 0 then word_similarity(g.n1, m.n1) * 0.9 else 0 end)::numeric as sc
      from grp g join mainst m
        on (g.gs is null or cardinality(g.gs) = 0 or m.cg is null or m.cg = any(g.gs))
       and (g.n1 % m.n1 or g.n2 % m.n2 or (position(' ' in g.n1) = 0 and g.n1 <% m.n1))),
  rk as (
    select c.*, row_number() over (partition by c.gid order by c.sc desc) as r,
           lead(c.sc) over (partition by c.gid order by c.sc desc) as sc2
      from cand c),
  best as (select * from rk where r = 1),
  dcs as (
    select b.*, (b.sc >= p_min and (b.sc2 is null or b.sc2 <= b.sc - p_gap)) as ok from best b),
  ins as (
    insert into public.student_links (gid, kid, score)
    select d.gid, d.sid, round(d.sc, 2) from dcs d where d.ok
    on conflict (gid) do nothing
    returning gid)
  select d.gn, d.gnm, d.mnm, d.cn, round(d.sc, 2),
         case when d.ok then '✅ bog''landi' else '⚠️ shubhali — tekshiring' end
    from dcs d
  union all
  select g.gn, g.nm, null, null, null, '❌ topilmadi — ismni asosiy sinfdagidek yozing'
    from grp g where not exists (select 1 from best b where b.gid = g.gid)
  order by 6, 1, 2;
end $$;
revoke all on function public.yk_link_groups(numeric, numeric) from public, anon;
grant execute on function public.yk_link_groups(numeric, numeric) to authenticated;

-- Qo'lda tasdiqlash («shubhali» yoki «topilmadi» holatlar uchun):
--   select public.yk_link_one('10-sinf Matematika Alfa', 'Ahmadjon', 'Ahmadov Ahmadjon');
--   (guruh nomi, guruhdagi ism, asosiy sinfdagi to'liq ism — natija jadvalidagidek)
create or replace function public.yk_link_one(p_group text, p_gname text, p_main text) returns text
language plpgsql security definer set search_path = public as $$
declare g text; m text; n int;
begin
  if coalesce(public.yk_role(), '') <> 'admin' and current_user not in ('postgres', 'supabase_admin') then
    raise exception 'Faqat admin' using errcode = '42501';
  end if;
  select s.id::text into g from public.students s join public.classes c on c.id = s.class_id
   where btrim(c.name) = btrim(p_group) and btrim(s.full_name) = btrim(p_gname) limit 1;
  if g is null then return '❌ guruhda bunday o''quvchi topilmadi'; end if;
  select count(*), min(s.id::text) into n, m from public.students s join public.classes c on c.id = s.class_id
   where c.kind is distinct from 'rep' and coalesce(c.grp, '') = '' and coalesce(c.subject, '') !~* '^(arab|koreys)'
     and btrim(s.full_name) = btrim(p_main);
  if n = 0 then return '❌ asosiy sinfda bunday o''quvchi topilmadi'; end if;
  if n > 1 then return '⚠️ asosiy sinflarda bu ism ' || n || ' ta — aniqlab bo''lmaydi'; end if;
  insert into public.student_links (gid, kid, score, auto) values (g, m, null, false)
  on conflict (gid) do update set kid = excluded.kid, auto = false, created_at = now();
  return '✅ bog''landi: ' || p_gname || ' → ' || p_main;
end $$;
revoke all on function public.yk_link_one(text, text, text) from public, anon;
grant execute on function public.yk_link_one(text, text, text) to authenticated;

notify pgrst, 'reload schema';

-- Bog'lash va natija: ✅ — bog'landi, ⚠️ — o'xshash, lekin ishonchsiz (bog'lanmadi), ❌ — nomzod topilmadi
select * from public.yk_link_groups(0.6, 0.1);

-- ################################ 82 ################################
-- Yangilanish 82: Guruh/repetitor baholari ota-onaga yetib bormayotgan o'quvchilarni topish va tuzatish.
--   Guruhlarda (Matematika, Ingliz tili, Arab/Koreys tili, repetitor) o'quvchi alohida yozilgan; baho ota-onaga
--   faqat u asosiy sinfdagi farzand bilan bog'langanda boradi.
--   1) Avtomatik tuzatish:
--      * ism aynan bir xil, lekin guruhning sinf raqami mos kelmagani uchun bog'lanmay qolganlar —
--        maktabda shu ismli o'quvchi YAGONA bo'lsa, bog'lanadi;
--      * ism biroz boshqacha yozilganlar — o'xshashlik bo'yicha (yangilanish-75 dagi kabi).
--   2) Har kuni 06:30 da shu tuzatish o'zi ishlaydi (yangi qo'shilgan o'quvchilar ham bog'lanadi).
--   3) Oxirida — hali ham muammoli o'quvchilar ro'yxati (oxirgi 30 kunda baho olganlar).
-- Supabase → SQL Editor ga to'liq nusxalab, "Run" bosing (loyiha: yurt-school). Avval 75 ishga tushgan bo'lsin.
-- Qayta ishga tushirish xavfsiz.

-- Guruhdagi har bir o'quvchi qaysi asosiy sinf farzandlariga bog'langan (ota-ona sahifasidagi qoida bilan aynan bir xil)
create or replace function public.yk_link_map()
returns table (gid text, kid text)
language sql stable security definer set search_path = public as $$
  with k as (
    select s.id, public.yk_norm3(s.full_name) as nk, public.yk_norm3(public.yk_first2(s.full_name)) as nk2,
           coalesce(c.grade, nullif(substring(c.name from '^\s*(\d+)'), '')::int) as cg
      from public.students s join public.classes c on c.id = s.class_id
     where c.kind is distinct from 'rep' and coalesce(c.grp, '') = '' and coalesce(c.subject, '') !~* '^(arab|koreys)'
       and coalesce(btrim(s.full_name), '') <> ''),
  g as (
    select g.id, gc.name as gn, gc.grade as gg, public.yk_norm3(g.full_name) as ng, public.yk_norm3(public.yk_first2(g.full_name)) as ng2
      from public.students g join public.classes gc on gc.id = g.class_id
     where coalesce(btrim(g.full_name), '') <> ''
       and (gc.kind = 'rep' or coalesce(gc.grp, '') <> '' or coalesce(gc.subject, '') ~* '^(arab|koreys)'))
  select g.id::text, k.id::text
    from g join k on (g.ng = k.nk or g.ng2 = k.nk2)
     and (g.gg is null or k.cg is null or g.gg = k.cg or g.gn ~ ('(^|[^0-9])' || k.cg || '([^0-9]|$)'))
  union
  select sl.gid, sl.kid from public.student_links sl
$$;
revoke all on function public.yk_link_map() from public, anon, authenticated;

-- Avtomatik tuzatish
create or replace function public.yk_link_fix() returns int
language plpgsql security definer set search_path = public, extensions as $$
declare n int := 0; m int := 0;
begin
  -- 1) ism aynan bir xil, maktabda yagona — sinf raqamidan qat'i nazar bog'lanadi
  with lm as (select distinct gid from public.yk_link_map()),
  mainst as (
    select s.id::text as sid, public.yk_norm3(s.full_name) as nk, public.yk_norm3(public.yk_first2(s.full_name)) as nk2
      from public.students s join public.classes c on c.id = s.class_id
     where c.kind is distinct from 'rep' and coalesce(c.grp, '') = '' and coalesce(c.subject, '') !~* '^(arab|koreys)'
       and coalesce(btrim(s.full_name), '') <> ''),
  un as (
    select g.id::text as gid, public.yk_norm3(g.full_name) as ng, public.yk_norm3(public.yk_first2(g.full_name)) as ng2
      from public.students g join public.classes gc on gc.id = g.class_id
     where coalesce(btrim(g.full_name), '') <> ''
       and (gc.kind = 'rep' or coalesce(gc.grp, '') <> '' or coalesce(gc.subject, '') ~* '^(arab|koreys)')
       and g.id::text not in (select gid from lm)),
  c as (
    select u.gid, min(m.sid) as sid, count(distinct m.sid) as cnt
      from un u join mainst m on (u.ng = m.nk or u.ng2 = m.nk2) group by u.gid)
  insert into public.student_links (gid, kid, score)
  select c.gid, c.sid, 1 from c where c.cnt = 1
  on conflict (gid) do nothing;
  get diagnostics n = row_count;
  -- 2) ism biroz boshqacha yozilganlar — o'xshashlik bo'yicha (faqat ishonchli va yagona moslik)
  select count(*) into m from public.yk_link_groups(0.6, 0.1) r where r.holat like '✅%';
  return n + m;
end $$;
revoke all on function public.yk_link_fix() from public, anon, authenticated;

-- Hali ham muammoli o'quvchilar (oxirgi 30 kunda guruhda baho olgan)
create or replace function public.yk_link_diag(p_days int default 30)
returns table (guruh text, guruhdagi_ism text, baho_kunlari int, boglangan text, holat text)
language sql stable security definer set search_path = public as $$
  with gr as (
    select g.id, g.full_name::text as nm, gc.name::text as gn,
           (select count(distinct d.day) from public.daily_scores d
             where d.student_id = g.id and d.day > (now() at time zone 'Asia/Tashkent')::date - p_days)
         + (select count(distinct r.day) from public.rep_daily r
             where r.student_id = g.id and r.day > (now() at time zone 'Asia/Tashkent')::date - p_days) as nd
      from public.students g join public.classes gc on gc.id = g.class_id
     where coalesce(btrim(g.full_name), '') <> ''
       and (gc.kind = 'rep' or coalesce(gc.grp, '') <> '' or coalesce(gc.subject, '') ~* '^(arab|koreys)')),
  lm as (
    select l.gid, string_agg(s.full_name || ' (' || c.name || ')', '; ' order by s.full_name) as kids, count(*) as cnt
      from public.yk_link_map() l join public.students s on s.id::text = l.kid join public.classes c on c.id = s.class_id
     group by l.gid)
  select gr.gn, gr.nm, gr.nd::int, lm.kids,
         case when lm.cnt is null then '❌ bog''lanmagan — baholari ota-onaga BORMAYDI'
              else '⚠️ ' || lm.cnt || ' ta farzandga ketyapti — bittasi noto''g''ri' end
    from gr left join lm on lm.gid = gr.id::text
   where gr.nd > 0 and (lm.cnt is null or lm.cnt > 1)
   order by 5, 1, 2
$$;
revoke all on function public.yk_link_diag(int) from public, anon, authenticated;

-- Har kuni 06:30 (Toshkent) = 01:30 UTC, dushanba–shanba
do $$ begin perform cron.unschedule('yk-baho-boglash'); exception when others then null; end $$;
do $$ begin
  perform cron.schedule('yk-baho-boglash', '30 1 * * 1-6', 'select public.yk_link_fix()');
exception when others then raise notice 'pg_cron topilmadi — jadval qo''yilmadi: %', sqlerrm;
end $$;

-- Hozir bir marta tuzatish
select public.yk_link_fix() as "hozir bog'landi";

notify pgrst, 'reload schema';

-- Qolgan muammolar (bo'sh chiqsa — hammasi joyida)
select * from public.yk_link_diag(30);

-- ################################ 79 ################################
-- Yangilanish 79: «Kuzatuvchi admin» — butun platformani KO'RADI, hech narsani O'ZGARTIRA OLMAYDI.
--   * Bosh admin «O'qituvchilar» bo'limida yangi akkaunt ochadi (ism, telefon, parol) va unga
--     «👁 Kuzatuvchi» belgisini qo'yadi. Akkauntga sinf biriktirish shart emas.
--   * Kuzatuvchi ko'radi: bosh sahifa va statistika, barcha sinflar (baholar, reytinglar, infografika),
--     davomat (kelmaganlar, kech kelganlar, ketish), turniket holati, baho qo'yilmaganlar,
--     o'qituvchilar va ularning reytingi, ota-onalar ulanishi, fikr-mulohazalar, to'lovlar va hisobotlar,
--     xarajatlar, taomnoma.
--   * Ko'rmaydi: parollar va kirish kodlari, turniket/SMS/bildirishnoma kalitlari, zaxira nusxa.
--   * O'zgartira olmaydi: baza darajasida yozish taqiqlangan (har bir jadvalga cheklovchi qoida).
--     Belgi qo'yilganda akkaunt sinflardan ajratiladi — u baho qo'ya olmaydi.
-- Supabase → SQL Editor ga to'liq nusxalab, "Run" bosing (loyiha: yurt-school). Qayta ishga tushirish xavfsiz.

alter table public.profiles add column if not exists obs boolean not null default false;

create or replace function public.yk_obs() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select p.obs from public.profiles p where p.id = auth.uid() and p.role = 'teacher'), false)
$$;
grant execute on function public.yk_obs() to authenticated;

-- Kuzatuvchi ham 2-darajali admin kabi barcha O'QISH huquqlarini oladi (yozish huquqi — yo'q).
create or replace function public.yk_admin2() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select p.admin2 or p.obs from public.profiles p where p.id = auth.uid() and p.role = 'teacher'), false)
$$;
grant execute on function public.yk_admin2() to authenticated;

-- Bosh admin belgilaydi
create or replace function public.set_obs(p_id uuid, p_on boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if public.yk_role() is distinct from 'admin' then raise exception 'Faqat bosh admin' using errcode = '42501'; end if;
  update public.profiles set obs = coalesce(p_on, false) where id = p_id and role = 'teacher';
  if not found then raise exception 'Akkaunt topilmadi'; end if;
  -- Kuzatuvchi faqat ko'radi: sinf biriktirishlari (va ular bilan birga baho qo'yish huquqi) olib tashlanadi
  if coalesce(p_on, false) then delete from public.teacher_classes where user_id = p_id; end if;
end $$;
revoke all on function public.set_obs(uuid, boolean) from public, anon;
grant execute on function public.set_obs(uuid, boolean) to authenticated;

-- Hech kim o'z profilidagi «kuzatuvchi» belgisini o'zi o'zgartira olmasin
create or replace function public.yk_obs_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.obs is distinct from old.obs and public.yk_role() is distinct from 'admin'
     and current_user not in ('postgres', 'supabase_admin', 'service_role') then
    new.obs := old.obs;
  end if;
  return new;
end $$;
drop trigger if exists yk_obs_guard on public.profiles;
create trigger yk_obs_guard before update on public.profiles for each row execute function public.yk_obs_guard();

-- Faqat O'QISH: keyin qo'shilgan jadvallarga ham (maxfiylari bundan mustasno) «select» qoidasi
do $$
declare t text;
begin
  for t in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
            where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
              and c.relname not in ('student_private', 'class_codes', 'tk_config', 'push_secret', 'push_subs', 'push_queue',
                                    'staff_devices', 'parent_code_fail', 'parent_pw_set', 'sms_config', 'sms_settings',
                                    'sms_secret', 'sms_queue', 'parent_checkin', 'tk_alert')
              and c.relname !~ '(secret|token|config)' loop
    execute format('drop policy if exists admin2_read on public.%I', t);
    execute format('create policy admin2_read on public.%I for select to authenticated using (public.yk_admin2())', t);
  end loop;
end $$;

-- Kafolat: kuzatuvchining HAR QANDAY yozish urinishini baza rad etadi (cheklovchi qoidalar)
do $$
declare t text;
begin
  for t in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
            where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
              and c.relname <> 'push_subs' loop  -- o'z telefoniga bildirishnoma yoqishi mumkin
    execute format('drop policy if exists obs_no_ins on public.%I', t);
    execute format('drop policy if exists obs_no_upd on public.%I', t);
    execute format('drop policy if exists obs_no_del on public.%I', t);
    execute format('create policy obs_no_ins on public.%I as restrictive for insert to authenticated with check (not public.yk_obs())', t);
    execute format('create policy obs_no_upd on public.%I as restrictive for update to authenticated using (not public.yk_obs())', t);
    execute format('create policy obs_no_del on public.%I as restrictive for delete to authenticated using (not public.yk_obs())', t);
  end loop;
end $$;

notify pgrst, 'reload schema';

-- Tekshiruv: kuzatuvchi va 2-darajali adminlar
select full_name as "Ism", phone as "Telefon",
       case when obs then '👁 Kuzatuvchi' when admin2 then '2-darajali admin' end as "Huquq"
  from public.profiles where role = 'teacher' and (obs or admin2) order by 1;

-- ################################ 80 ################################
-- Yangilanish 80: Kuzatuvchi o'z telefoniga bildirishnoma yoqa oladi va turniket ogohlantirishlarini oladi.
-- Supabase → SQL Editor ga to'liq nusxalab, "Run" bosing (loyiha: yurt-school). Avval 79 ishga tushgan bo'lsin.

drop policy if exists obs_no_ins on public.push_subs;
drop policy if exists obs_no_upd on public.push_subs;
drop policy if exists obs_no_del on public.push_subs;

create or replace function public.yk_admin_push(p_key text, p_title text, p_body text) returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  insert into public.push_queue (user_id, kind, student_id, title, body)
  select p.id, 'tk', p_key, p_title, p_body
    from public.profiles p
   where (p.role = 'admin' or coalesce(p.admin2, false) or coalesce(p.obs, false))
     and exists (select 1 from public.push_subs s where s.user_id = p.id)
  on conflict do nothing;
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.yk_admin_push(text, text, text) from public, anon, authenticated;

notify pgrst, 'reload schema';
select 'Tayyor' as natija;

-- ################################ 81y ################################
-- «Ota-onaga yaxshilik» haftalik so'rovnomasi — ota-onalarga avtomatik eslatma (Yurt: weekly_kindness jadvali)
--   Juma 18:00 — so'rovnoma ochildi; yakshanba 18:00 — «bugun yopiladi» (hali javob bermaganlarga).
alter table public.push_queue drop constraint if exists push_queue_kind_check;
alter table public.push_queue add constraint push_queue_kind_check
  check (kind in ('keldi', 'ketdi', 'kelmadi', 'test', 'yomon', 'yaxshi', 'savol', 'javob', 'eslatma', 'tk', 'sorov'));

create or replace function public.yk_week_remind(p_last boolean) returns int
language plpgsql security definer set search_path = public as $$
declare d date := (now() at time zone 'Asia/Tashkent')::date; w date := date_trunc('week', d)::date; n int;
begin
  if extract(isodow from d) < 5 then return 0; end if;
  insert into public.push_queue (user_id, kind, student_id, title, body)
  select p.id, 'sorov', s.id::text,
         case when p_last then '⏰ So''rovnoma bugun yopiladi' else '📝 Haftalik so''rovnoma ochildi' end,
         case when p_last
              then s.full_name || ': «Ota-onaga yaxshilik» so''rovnomasiga hali javob bermadingiz. Bugun javob bering.'
              else s.full_name || ': shu hafta farzandingiz sizga qanday yaxshilik qildi? Ilovani ochib, 1 daqiqada javob bering (yakshanbagacha ochiq).' end
    from public.profiles p
    join public.students s on s.id = p.student_id
   where p.role = 'parent'
     and public.yurt_ctype(s.id) is not null
     and exists (select 1 from public.push_subs ps where ps.user_id = p.id)
     and not exists (select 1 from public.weekly_kindness wk where wk.student_id = s.id and wk.week_start = w)
  on conflict do nothing;
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.yk_week_remind(boolean) from public, anon, authenticated;

do $$ begin perform cron.unschedule('yk-sorov-juma'); exception when others then null; end $$;
do $$ begin perform cron.unschedule('yk-sorov-yakshanba'); exception when others then null; end $$;
do $$ begin
  perform cron.schedule('yk-sorov-juma', '0 13 * * 5', 'select public.yk_week_remind(false)');
  perform cron.schedule('yk-sorov-yakshanba', '0 13 * * 0', 'select public.yk_week_remind(true)');
exception when others then raise notice 'pg_cron topilmadi — jadval qo''yilmadi: %', sqlerrm;
end $$;

-- ################################ 83 ################################
-- Yangilanish 83: Ota-ona profili — «Reyting va o'rinlar».
--   Farzandning: 1) sinfdagi o'rni, 2) maktabdagi o'rni, 3) har bir guruh/fan (Matematika, Ingliz tili,
--   Arab/Koreys tili, repetitor) bo'yicha o'rni — ustozi, o'rtacha bali va o'tgan haftaga nisbatan o'zgarishi bilan.
--   O'rinlar shu o'quv yili boshidan (1-sentabr) hisoblanadi. O'zgarish — oxirgi 7 kunga nisbatan.
-- Supabase → SQL Editor ga to'liq nusxalab, "Run" bosing (loyiha: yurt-school). Avval 69 va 82 ishga tushgan bo'lsin.
-- Qayta ishga tushirish xavfsiz.

create or replace function public.parent_ranks(p_sid text default null) returns jsonb
language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_variable
declare kid text; cid bigint; g1 boolean; cname text; today date; yfrom date; wk date;
        cls jsonb; sch jsonb; subs jsonb; avg5 numeric;
begin
  if p_sid is not null then
    if not public.yk_is_my_kid(p_sid) then raise exception 'Bu sizning farzandingiz emas' using errcode = '42501'; end if;
    kid := p_sid;
  else
    select k.id::text into kid from public.my_kids() k order by k.full_name limit 1;
  end if;
  if kid is null then return null; end if;
  select s.class_id, c.name into cid, cname from public.students s join public.classes c on c.id = s.class_id where s.id::text = kid;
  g1 := public.yk_g1(cid);
  today := (now() at time zone 'Asia/Tashkent')::date;
  yfrom := make_date(case when extract(month from today) >= 9 then extract(year from today)::int else extract(year from today)::int - 1 end, 9, 1);
  wk := today - 7;

  -- 1) Sinfdagi o'rin (asosiy sinf, jami ball bo'yicha)
  with st as (select s.id from public.students s where s.class_id = cid and coalesce(btrim(s.full_name), '') <> ''),
  tot as (
    select st.id,
      coalesce(sum(public.yk_day_total(g1, d.att, d.book, d.sport, d.behavior, d.kindness, d.activity))
               filter (where d.day between yfrom and today), 0) as tnow,
      coalesce(sum(public.yk_day_total(g1, d.att, d.book, d.sport, d.behavior, d.kindness, d.activity))
               filter (where d.day between yfrom and wk), 0) as told,
      count(*) filter (where d.att is not null and d.day between yfrom and today) as days
      from st left join public.daily_scores d on d.student_id = st.id group by st.id),
  rk as (select id, tnow, days, rank() over (order by tnow desc) rn, rank() over (order by told desc) ro, count(*) over () sz from tot)
  select jsonb_build_object('rank', rn, 'size', sz, 'delta', ro - rn),
         case when days > 0 then round(tnow * 5.0 / (days * 51), 1) else null end
    into cls, avg5 from rk where id::text = kid;

  -- 2) Maktabdagi o'rin (barcha asosiy sinf o'quvchilari)
  with st as (
    select s.id, public.yk_g1(s.class_id) as g1
      from public.students s join public.classes c on c.id = s.class_id
     where c.kind is distinct from 'rep' and coalesce(c.grp, '') = '' and coalesce(c.subject, '') !~* '^(arab|koreys)'
       and coalesce(btrim(s.full_name), '') <> ''),
  tot as (
    select st.id,
      coalesce(sum(public.yk_day_total(st.g1, d.att, d.book, d.sport, d.behavior, d.kindness, d.activity))
               filter (where d.day between yfrom and today), 0) as tnow,
      coalesce(sum(public.yk_day_total(st.g1, d.att, d.book, d.sport, d.behavior, d.kindness, d.activity))
               filter (where d.day between yfrom and wk), 0) as told
      from st left join public.daily_scores d on d.student_id = st.id group by st.id),
  rk as (select id, rank() over (order by tnow desc) rn, rank() over (order by told desc) ro, count(*) over () sz from tot)
  select jsonb_build_object('rank', rn, 'size', sz, 'delta', ro - rn) into sch from rk where id::text = kid;

  -- 3) Fan va guruhlar bo'yicha o'rin
  with k as (
    select public.yk_norm3((select full_name from public.students where id::text = kid)) as nk,
           public.yk_norm3(public.yk_first2((select full_name from public.students where id::text = kid))) as nk2,
           coalesce((select grade from public.classes where id = cid),
                    nullif(substring(cname from '^\s*(\d+)'), '')::int) as cg),
  links as (  -- kid bog'langan guruh yozuvlari (yk_grades_of bilan bir xil qoida + student_links)
    select distinct g.id::text as gid, gc.id as gcid, gc.name::text as gname,
           coalesce(nullif(gc.subject, ''), gc.name)::text as subj, gc.kind is not distinct from 'rep' as rep
      from k, public.students g join public.classes gc on gc.id = g.class_id
     where coalesce(btrim(g.full_name), '') <> ''
       and (gc.kind = 'rep' or coalesce(gc.grp, '') <> '' or coalesce(gc.subject, '') ~* '^(arab|koreys)')
       and (public.yk_norm3(g.full_name) = k.nk or public.yk_norm3(public.yk_first2(g.full_name)) = k.nk2)
       and (gc.grade is null or k.cg is null or gc.grade = k.cg or gc.name ~ ('(^|[^0-9])' || k.cg || '([^0-9]|$)'))
    union
    select distinct sl.gid, gc.id, gc.name::text, coalesce(nullif(gc.subject, ''), gc.name)::text, gc.kind is not distinct from 'rep'
      from public.student_links sl join public.students g on g.id::text = sl.gid join public.classes gc on gc.id = g.class_id
     where sl.kid = kid),
  mem as (select l.gcid, l.gname, l.subj, l.rep, s.id as sid from links l
            join public.students s on s.class_id = l.gcid and coalesce(btrim(s.full_name), '') <> ''),
  gsc as (  -- guruh (3/4/6): kunlik att+hw+activity+behavior; repetitor: rep_pct
    select m.gcid, m.sid,
      coalesce(sum(case when (d.att = 1) then 1 else 0 end + coalesce(d.hw, 0) + coalesce(d.activity, 0) + coalesce(d.behavior, 0))
               filter (where d.day between yfrom and today), 0) as gnow,
      coalesce(sum(case when (d.att = 1) then 1 else 0 end + coalesce(d.hw, 0) + coalesce(d.activity, 0) + coalesce(d.behavior, 0))
               filter (where d.day between yfrom and wk), 0) as gold,
      round(avg((coalesce(d.hw, 0) + coalesce(d.activity, 0) + coalesce(d.behavior, 0)) / 3.0)
            filter (where d.day between yfrom and today and d.att is not null), 1) as gavg
      from mem m left join public.daily_scores d on d.student_id = m.sid where not m.rep group by m.gcid, m.sid),
  rsc as (
    select m.gcid, m.sid,
      coalesce(round(avg(public.yk_rep_pct(r.att, r.task)) filter (where r.day between yfrom and today), 1), 0) as gnow,
      coalesce(round(avg(public.yk_rep_pct(r.att, r.task)) filter (where r.day between yfrom and wk), 1), 0) as gold,
      round(avg(r.task) filter (where r.day between yfrom and today), 1) as gavg
      from mem m left join public.rep_daily r on r.student_id = m.sid where m.rep group by m.gcid, m.sid),
  allsc as (select * from gsc union all select * from rsc),
  rkd as (
    select a.*, rank() over (partition by a.gcid order by a.gnow desc) rn,
           rank() over (partition by a.gcid order by a.gold desc) ro, count(*) over (partition by a.gcid) sz
      from allsc a),
  tch as (
    select t.class_id, string_agg(p.full_name::text, ', ' order by p.full_name) as names
      from public.teacher_classes t join public.profiles p on p.id = t.user_id group by t.class_id),
  mine as (
    select l.gcid, l.gname, l.subj, l.rep, r.rn, r.ro, r.sz, r.gavg, l.gid
      from links l join rkd r on r.gcid = l.gcid and r.sid::text = l.gid)
  select coalesce(jsonb_agg(jsonb_build_object(
           'class_id', mine.gcid, 'name', mine.subj, 'group_name', mine.gname,
           'teacher', (select names from tch where tch.class_id = mine.gcid),
           'kind', case when mine.rep then 'repetitor' else 'guruh' end,
           'rank', mine.rn, 'size', mine.sz, 'delta', mine.ro - mine.rn,
           'avg', mine.gavg, 'medal', case when mine.rn <= 3 then mine.rn else null end)
           order by mine.rn, mine.subj), '[]'::jsonb)
    into subs from mine;

  return jsonb_build_object('sid', kid, 'name', (select full_name from public.students where id::text = kid),
    'class_id', cid, 'class_name', cname, 'avg', avg5, 'class', cls, 'school', sch, 'subjects', subs);
end $$;
revoke all on function public.parent_ranks(text) from public, anon;
grant execute on function public.parent_ranks(text) to authenticated;

notify pgrst, 'reload schema';

-- Tekshiruv uchun (ota-ona sifatida): select public.parent_ranks();
select 'Tayyor — parent_ranks() yaratildi' as natija;

-- ################################ 84 ################################
-- Yangilanish 84: 1) Har bir fan/guruh o'qituvchisi o'zi dars o'tadigan hafta kunlarini belgilaydi.
--                 2) Ingliz tili / Matematika (va boshqa guruh) o'qituvchilari o'z o'quvchisiga ota-ona
--                    telefon raqamini yozadi va bitta tugma bilan qo'ng'iroq qiladi.
-- Supabase → SQL Editor ga to'liq nusxalab, "Run" bosing (loyiha: yurt-school). Qayta ishga tushirish xavfsiz.

-- Yordamchi: joriy foydalanuvchi shu sinf/guruhda o'qituvchimi?
create or replace function public.yk_teaches(p_class bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select public.yk_role() = 'admin'
      or exists (select 1 from public.teacher_classes t where t.user_id = auth.uid() and t.class_id = p_class)
$$;
grant execute on function public.yk_teaches(bigint) to authenticated;

-- 1) O'qituvchi o'z dars kunlarini o'zi belgilaydi (o'z biriktirilgan sinfi uchun)
create or replace function public.set_my_days(p_class bigint, p_days smallint[]) returns smallint[]
language plpgsql security definer set search_path = public as $$
declare d smallint[];
begin
  if not exists (select 1 from public.teacher_classes t where t.user_id = auth.uid() and t.class_id = p_class)
     and public.yk_role() <> 'admin' then
    raise exception 'Bu sinf sizga biriktirilmagan' using errcode = '42501';
  end if;
  select array(select distinct x from unnest(coalesce(p_days, '{}'::smallint[])) x where x between 1 and 6 order by 1) into d;
  update public.teacher_classes set days = nullif(d, '{}'::smallint[])
   where user_id = auth.uid() and class_id = p_class;
  return d;
end $$;
revoke all on function public.set_my_days(bigint, smallint[]) from public, anon;
grant execute on function public.set_my_days(bigint, smallint[]) to authenticated;

-- 2a) Guruh o'qituvchisi: o'z o'quvchilarining ota-ona telefonlarini ko'radi
create or replace function public.group_phones(p_class bigint)
returns table (student_id text, parent_phone text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.yk_teaches(p_class) then
    raise exception 'Bu sinf sizga biriktirilmagan' using errcode = '42501';
  end if;
  return query
  select s.id::text, sp.parent_phone::text
    from public.students s left join public.student_private sp on sp.student_id = s.id
   where s.class_id = p_class and coalesce(btrim(s.full_name), '') <> '';
end $$;
revoke all on function public.group_phones(bigint) from public, anon;
grant execute on function public.group_phones(bigint) to authenticated;

-- 2b) Guruh o'qituvchisi: o'quvchiga ota-ona telefon raqamini yozadi/yangilaydi
create or replace function public.set_group_phone(p_sid text, p_phone text) returns text
language plpgsql security definer set search_path = public as $$
declare cid bigint; ph text;
begin
  select s.class_id into cid from public.students s where s.id::text = p_sid;
  if cid is null then raise exception 'O''quvchi topilmadi'; end if;
  if not public.yk_teaches(cid) then
    raise exception 'Bu o''quvchi sizning guruhingizda emas' using errcode = '42501';
  end if;
  ph := nullif(regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g'), '');
  if ph is not null and length(regexp_replace(ph, '\D', '', 'g')) < 9 then
    raise exception 'Telefon raqami to''liq emas';
  end if;
  update public.student_private set parent_phone = ph where student_id::text = p_sid;
  if not found then
    insert into public.student_private (student_id, parent_phone) values (p_sid::uuid, ph);
  end if;
  return ph;
end $$;
revoke all on function public.set_group_phone(text, text) from public, anon;
grant execute on function public.set_group_phone(text, text) to authenticated;

notify pgrst, 'reload schema';
select 'Tayyor — set_my_days, group_phones, set_group_phone yaratildi' as natija;

notify pgrst, 'reload schema';

-- Natija: o'rnatilgan imkoniyatlar
select (select count(*) from information_schema.columns where table_name = 'payments' and column_name in ('method', 'amount', 'yearly', 'rec_no')) = 4 as "to'lov",
       to_regclass('public.expenses') is not null as xarajatlar,
       to_regclass('public.pay_reports') is not null as hisobot,
       to_regprocedure('public.parent_grades(date,date)') is not null as "barcha baholar",
       to_regprocedure('public.parent_ranks(text)') is not null as reyting,
       to_regprocedure('public.teacher_gaps(date)') is not null as "baho qo'yilmaganlar",
       to_regclass('public.student_links') is not null as "guruh bog'lash",
       (select count(*) from information_schema.columns where table_name = 'profiles' and column_name in ('bux', 'obs', 'admin2')) = 3 as "buxgalter/kuzatuvchi";
