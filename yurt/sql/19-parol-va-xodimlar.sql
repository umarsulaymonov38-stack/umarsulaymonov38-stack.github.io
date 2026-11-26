-- =====================================================================================
-- Yurt School: 19-yangilanish — ota-ona parolini tiklash va xodimlar ruxsatlari
--  1) Ota-ona parolini unutsa: kirish oynasida «Parolni unutdingizmi?» → so'rov yuboradi →
--     admin (yoki sinf rahbari, yoki «parol» ruxsati bor xodim) 6 xonali TIKLASH KODINI beradi →
--     ota-ona telefon + kod bilan O'ZI yangi parol qo'yadi. Kod 24 soat amal qiladi, 5 ta noto'g'ri urinishdan
--     keyin bekor bo'ladi. Parol va kod faqat shifrlangan (bcrypt) holda saqlanadi.
--  2) Xodimlar: Buxgalter, Kuzatuvchi, Yordamchi admin. Bosh admin ularning profilini ko'radi
--     (oxirgi kirish vaqti), ismini va parolini o'zgartiradi, turini almashtiradi va QO'SHIMCHA RUXSATLAR beradi:
--       parol   — ota-onalar parolini tiklash (kod berish)
--       telefon — o'quvchilar ro'yxati va ota-ona telefonlari (ism, telefon, o'quvchi qo'shish)
--       baho    — baholar va davomatni tahrirlash
--       tolov   — to'lov qabul qilish va xarajatlar
--       taom    — taomnoma kiritish
--       fikr    — fikr-mulohazalarni ko'rish
--       zaxira  — zaxira nusxani yuklab olish
--     Ruxsatlar baza darajasida tekshiriladi: ruxsatsiz o'zgartirishni baza rad etadi.
-- yurt-school → SQL Editor → hammasini nusxalab → Run. Qayta ishga tushirish xavfsiz.
-- =====================================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- Xodim belgilari va ruxsatlar ----------
alter table public.profiles add column if not exists admin2 boolean not null default false;
alter table public.profiles add column if not exists obs boolean not null default false;
alter table public.profiles add column if not exists bux boolean not null default false;
alter table public.profiles add column if not exists perms text[] not null default '{}';

-- Hech kim o'z ruxsatlarini o'zi o'zgartira olmasin (faqat bosh admin)
create or replace function public.yk_perms_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if current_user in ('postgres', 'supabase_admin', 'service_role') or public.yk_role() = 'admin' then return new; end if;
  new.perms := old.perms; new.admin2 := old.admin2; new.obs := old.obs; new.bux := old.bux; new.role := old.role;
  return new;
end $$;
drop trigger if exists yk_perms_guard on public.profiles;
create trigger yk_perms_guard before update on public.profiles for each row execute function public.yk_perms_guard();

-- Ruxsat bormi? Bosh admin — hammasiga; xodim (buxgalter/kuzatuvchi/yordamchi admin) — berilganlariga
create or replace function public.yk_perm(p text) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select pr.role = 'admin'
                       or (pr.role = 'teacher' and (pr.obs or pr.admin2 or pr.bux) and p = any(pr.perms))
                     from public.profiles pr where pr.id = auth.uid()), false)
$$;
revoke all on function public.yk_perm(text) from public, anon;
grant execute on function public.yk_perm(text) to authenticated;

-- 2-darajali (yordamchi) admin va kuzatuvchi — hamma narsani O'QIYDI
create or replace function public.yk_admin2() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select p.admin2 or p.obs from public.profiles p where p.id = auth.uid() and p.role = 'teacher'), false)
$$;
grant execute on function public.yk_admin2() to authenticated;

-- «To'lovlar» ruxsati berilgan xodim buxgalter kabi ishlaydi (to'lov va xarajatlar)
create or replace function public.yk_bux() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select p.bux or ((p.obs or p.admin2) and 'tolov' = any(p.perms))
                     from public.profiles p where p.id = auth.uid() and p.role = 'teacher'), false)
$$;
grant execute on function public.yk_bux() to authenticated;

-- «O'quvchilar va telefonlar» ruxsati: barcha sinflarda o'quvchi ismi, ota-ona telefoni, o'quvchi qo'shish
create or replace function public.yk_can_class(p_class bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select public.yk_role() = 'admin'
      or public.yk_perm('telefon')
      or exists (select 1 from public.teacher_classes t where t.user_id = auth.uid() and t.class_id = p_class and t.role = 'rahbar')
      or (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher' and p.class_id = p_class)
          and not exists (select 1 from public.teacher_classes t where t.user_id = auth.uid() and t.class_id = p_class))
$$;
grant execute on function public.yk_can_class(bigint) to authenticated;

-- Jadval darajasidagi ruxsatlar (mavjud qoidalarga QO'SHIMCHA)
do $$
declare r record;
begin
  for r in select * from (values
      ('menu', 'taom', 'all'), ('feedback', 'fikr', 'select'),
      ('students', 'telefon', 'update'), ('student_private', 'telefon', 'select'), ('student_private', 'telefon', 'update'),
      ('daily_scores', 'baho', 'all'), ('rep_daily', 'baho', 'all'), ('subject_scores', 'baho', 'all'), ('score_changes', 'baho', 'insert')
    ) v(t, p, op)
  loop
    if to_regclass('public.' || r.t) is null then continue; end if;
    execute format('drop policy if exists %I on public.%I', 'perm_' || r.p || '_' || r.op, r.t);
    if r.op = 'select' then
      execute format('create policy %I on public.%I for select to authenticated using (public.yk_perm(%L))', 'perm_' || r.p || '_' || r.op, r.t, r.p);
    elsif r.op = 'insert' then
      execute format('create policy %I on public.%I for insert to authenticated with check (public.yk_perm(%L))', 'perm_' || r.p || '_' || r.op, r.t, r.p);
    elsif r.op = 'update' then
      execute format('create policy %I on public.%I for update to authenticated using (public.yk_perm(%L)) with check (public.yk_perm(%L))', 'perm_' || r.p || '_' || r.op, r.t, r.p, r.p);
    else
      execute format('create policy %I on public.%I for all to authenticated using (public.yk_perm(%L)) with check (public.yk_perm(%L))', 'perm_' || r.p || '_' || r.op, r.t, r.p, r.p);
    end if;
  end loop;
end $$;

-- Kuzatuvchi: hech narsani o'zgartira olmaydi — faqat bosh admin bergan ruxsat doirasida
create or replace function public.yk_obs_ok(t text) returns boolean
language sql stable security definer set search_path = public as $$
  select case
    when t = 'menu' then public.yk_perm('taom')
    when t = 'feedback' then public.yk_perm('fikr')
    when t in ('students', 'student_private') then public.yk_perm('telefon')
    when t in ('daily_scores', 'subject_scores', 'rep_daily', 'score_changes') then public.yk_perm('baho')
    when t ~ '^(payments|expenses|pay_)' then public.yk_perm('tolov')
    else false end
$$;
grant execute on function public.yk_obs_ok(text) to authenticated;

do $$
declare t text;
begin
  for t in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
            where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity and c.relname <> 'push_subs' loop
    execute format('drop policy if exists obs_no_ins on public.%I', t);
    execute format('drop policy if exists obs_no_upd on public.%I', t);
    execute format('drop policy if exists obs_no_del on public.%I', t);
    execute format('create policy obs_no_ins on public.%I as restrictive for insert to authenticated with check (not public.yk_obs() or public.yk_obs_ok(%L))', t, t);
    execute format('create policy obs_no_upd on public.%I as restrictive for update to authenticated using (not public.yk_obs() or public.yk_obs_ok(%L))', t, t);
    execute format('create policy obs_no_del on public.%I as restrictive for delete to authenticated using (not public.yk_obs() or public.yk_obs_ok(%L))', t, t);
  end loop;
end $$;

-- ---------- Bosh admin: xodimlar ro'yxati va boshqaruvi ----------
create or replace function public.staff_list()
returns table (id uuid, full_name text, phone text, kind text, perms text[], last_sign_in timestamptz,
               created_at timestamptz, classes int)
language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
begin
  if public.yk_role() is distinct from 'admin' then raise exception 'Faqat bosh admin' using errcode = '42501'; end if;
  return query
  select p.id, p.full_name::text, p.phone::text,
         case when p.bux then 'bux' when p.admin2 then 'admin2' when p.obs then 'obs' else '' end,
         coalesce(p.perms, '{}'), u.last_sign_in_at, u.created_at,
         (select count(*) from public.teacher_classes t where t.user_id = p.id)::int
    from public.profiles p left join auth.users u on u.id = p.id
   where p.role = 'teacher'
   order by (p.bux or p.admin2 or p.obs) desc, p.full_name;
end $$;
revoke all on function public.staff_list() from public, anon;
grant execute on function public.staff_list() to authenticated;

-- Turini va ruxsatlarini belgilash. p_kind: '' (oddiy o'qituvchi), 'bux', 'obs', 'admin2'
create or replace function public.set_staff(p_id uuid, p_kind text, p_perms text[]) returns void
language plpgsql security definer set search_path = public as $$
declare k text := coalesce(p_kind, ''); ps text[];
begin
  if public.yk_role() is distinct from 'admin' then raise exception 'Faqat bosh admin' using errcode = '42501'; end if;
  if k not in ('', 'bux', 'obs', 'admin2') then raise exception 'Noma''lum xodim turi: %', k; end if;
  select coalesce(array_agg(distinct x order by x), '{}') into ps from unnest(coalesce(p_perms, '{}')) x
   where x in ('parol', 'telefon', 'baho', 'tolov', 'taom', 'fikr', 'zaxira')
     and (k <> 'bux' or x in ('parol', 'taom', 'fikr'));
  if k = '' then ps := '{}'; end if;
  update public.profiles set bux = (k = 'bux'), obs = (k = 'obs'), admin2 = (k = 'admin2'), perms = ps
   where id = p_id and role = 'teacher';
  if not found then raise exception 'Akkaunt topilmadi'; end if;
  -- Kuzatuvchi va yordamchi admin boshqaruv panelida ishlaydi: sinf biriktirishlari olib tashlanadi
  if k in ('obs', 'admin2') then delete from public.teacher_classes where user_id = p_id; end if;
end $$;
revoke all on function public.set_staff(uuid, text, text[]) from public, anon;
grant execute on function public.set_staff(uuid, text, text[]) to authenticated;

-- ---------- Ota-ona parolini tiklash ----------
create table if not exists public.parent_pw_reset (
  phone text primary key,
  user_id uuid not null,
  code_hash text,
  expires_at timestamptz,
  tries int not null default 0,
  issued_by uuid,
  issued_name text,
  issued_at timestamptz,
  requested_at timestamptz,
  req_n int not null default 0,
  done_at timestamptz
);
alter table public.parent_pw_reset enable row level security;
revoke all on public.parent_pw_reset from anon, authenticated;
drop policy if exists admin2_read on public.parent_pw_reset;

-- Telefon bo'yicha ota-ona akkaunti
create or replace function public.yk_parent_uid(p_phone text) returns uuid
language sql stable security definer set search_path = public as $$
  select sp.claimed_by from public.student_private sp join public.profiles pr on pr.id = sp.claimed_by and pr.role = 'parent'
   where public.norm_phone(sp.parent_phone) = public.norm_phone(p_phone) and length(public.norm_phone(p_phone)) = 9
   order by sp.student_id limit 1
$$;
revoke all on function public.yk_parent_uid(text) from public, anon, authenticated;

-- Ota-ona: «Parolni unutdim» so'rovi. Javob: ok | none (raqam ro'yxatda yo'q) | noacc (hali ro'yxatdan o'tmagan) | bad
create or replace function public.pw_request(p_phone text) returns text
language plpgsql security definer set search_path = public as $$
declare ph text := public.norm_phone(p_phone); uid uuid;
begin
  if length(coalesce(ph, '')) <> 9 then return 'bad'; end if;
  uid := public.yk_parent_uid(ph);
  if uid is null then
    return case when exists (select 1 from public.student_private where public.norm_phone(parent_phone) = ph) then 'noacc' else 'none' end;
  end if;
  insert into public.parent_pw_reset as r (phone, user_id, requested_at, req_n) values (ph, uid, now(), 1)
  on conflict (phone) do update set user_id = excluded.user_id, requested_at = now(), done_at = null,
    req_n = case when r.requested_at > now() - interval '2 minutes' then r.req_n else least(r.req_n + 1, 99) end;
  return 'ok';
end $$;
revoke all on function public.pw_request(text) from public;
grant execute on function public.pw_request(text) to anon, authenticated;

-- Kod berish huquqi: bosh admin, «parol» ruxsati bor xodim yoki farzandining sinf rahbari
create or replace function public.yk_pw_can(p_phone text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.yk_perm('parol') or exists (
    select 1 from public.student_private sp join public.students s on s.id = sp.student_id
      join public.teacher_classes t on t.class_id = s.class_id and t.user_id = auth.uid() and t.role = 'rahbar'
     where public.norm_phone(sp.parent_phone) = public.norm_phone(p_phone))
$$;
revoke all on function public.yk_pw_can(text) from public, anon, authenticated;

-- Kutilayotgan so'rovlar (so'nggi 14 kun)
create or replace function public.pw_requests()
returns table (phone text, requested_at timestamptz, req_n int, kids text, issued_at timestamptz, issued_name text, active boolean)
language sql stable security definer set search_path = public as $$
  select r.phone, r.requested_at, r.req_n,
         (select string_agg(s.full_name || ' (' || c.name || ')', ', ' order by c.id, s.slot)
            from public.student_private sp join public.students s on s.id = sp.student_id join public.classes c on c.id = s.class_id
           where public.norm_phone(sp.parent_phone) = r.phone and btrim(s.full_name) <> ''
             and coalesce(c.grp, '') = '' and c.kind is distinct from 'rep'),
         r.issued_at, r.issued_name, (r.code_hash is not null and r.expires_at > now())
    from public.parent_pw_reset r
   where r.requested_at > now() - interval '14 days' and r.done_at is null and public.yk_pw_can(r.phone)
   order by r.requested_at desc
$$;
revoke all on function public.pw_requests() from public, anon;
grant execute on function public.pw_requests() to authenticated;

-- 6 xonali tiklash kodi (24 soat). Kod faqat shu javobda bir marta ko'rinadi.
create or replace function public.pw_issue_code(p_phone text)
returns table (code text, kids text, expires_at timestamptz)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare ph text := public.norm_phone(p_phone); uid uuid; c text; nm text;
begin
  if length(coalesce(ph, '')) <> 9 then raise exception 'Telefon raqam noto''g''ri (9 ta raqam)'; end if;
  if not public.yk_pw_can(ph) then raise exception 'Bu ota-onaga kod berishga ruxsatingiz yo''q' using errcode = '42501'; end if;
  uid := public.yk_parent_uid(ph);
  if uid is null then raise exception 'Bu raqam bilan ota-ona hali ro''yxatdan o''tmagan — unga «Ro''yxatdan o''tish» ni ayting'; end if;
  c := lpad(((('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint) % 1000000)::text, 6, '0');
  select full_name into nm from public.profiles where id = auth.uid();
  insert into public.parent_pw_reset as r (phone, user_id, code_hash, expires_at, tries, issued_by, issued_name, issued_at, done_at)
  values (ph, uid, extensions.crypt(c, extensions.gen_salt('bf')), now() + interval '24 hours', 0, auth.uid(), nm, now(), now())
  on conflict (phone) do update set user_id = excluded.user_id, code_hash = excluded.code_hash, expires_at = excluded.expires_at,
    tries = 0, issued_by = excluded.issued_by, issued_name = excluded.issued_name, issued_at = now(), done_at = now();
  return query select c,
    (select string_agg(s.full_name, ', ' order by s.class_id, s.slot) from public.student_private sp join public.students s on s.id = sp.student_id
      join public.classes cl on cl.id = s.class_id
     where public.norm_phone(sp.parent_phone) = ph and btrim(s.full_name) <> '' and coalesce(cl.grp, '') = '' and cl.kind is distinct from 'rep'),
    now() + interval '24 hours';
end $$;
revoke all on function public.pw_issue_code(text) from public, anon;
grant execute on function public.pw_issue_code(text) to authenticated;

-- Ota-ona: telefon + kod + yangi parol. Javob: ok yoki xato matni
create or replace function public.pw_reset(p_phone text, p_code text, p_pw text) returns text
language plpgsql security definer set search_path = public as $$
declare ph text := public.norm_phone(p_phone); r public.parent_pw_reset;
begin
  if length(coalesce(ph, '')) <> 9 then return 'Telefon raqam noto''g''ri (9 ta raqam)'; end if;
  if length(coalesce(p_pw, '')) < 6 then return 'Yangi parol kamida 6 belgidan iborat bo''lsin'; end if;
  select * into r from public.parent_pw_reset where phone = ph for update;
  if not found or r.code_hash is null then return 'Bu raqamga tiklash kodi berilmagan. Avval so''rov yuboring va maktabdan kod oling'; end if;
  if r.expires_at < now() then update public.parent_pw_reset set code_hash = null where phone = ph;
    return 'Kod muddati tugagan (24 soat). Maktabdan yangi kod oling'; end if;
  if r.tries >= 5 then update public.parent_pw_reset set code_hash = null where phone = ph;
    return 'Juda ko''p noto''g''ri urinish. Maktabdan yangi kod oling'; end if;
  if extensions.crypt(btrim(coalesce(p_code, '')), r.code_hash) <> r.code_hash then
    update public.parent_pw_reset set tries = tries + 1 where phone = ph;
    return 'Kod noto''g''ri. Yana ' || (4 - r.tries) || ' marta urinish mumkin';
  end if;
  update auth.users set encrypted_password = extensions.crypt(p_pw, extensions.gen_salt('bf')), updated_at = now() where id = r.user_id;
  update public.parent_pw_reset set code_hash = null, tries = 0, done_at = now() where phone = ph;
  return 'ok';
end $$;
revoke all on function public.pw_reset(text, text, text) from public;
grant execute on function public.pw_reset(text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';

-- Natija
select (select count(*) from public.profiles where role = 'teacher' and (bux or obs or admin2)) as xodimlar,
       to_regprocedure('public.pw_reset(text,text,text)') is not null as parol_tiklash,
       to_regprocedure('public.set_staff(uuid,text,text[])') is not null as ruxsatlar;
