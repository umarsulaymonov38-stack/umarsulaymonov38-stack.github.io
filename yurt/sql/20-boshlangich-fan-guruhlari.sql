-- =====================================================================================
-- Yurt School: 20-yangilanish — boshlang'ich sinflar (1–4) uchun fan guruhlari
--  1) Har bir boshlang'ich sinfga ALOHIDA uchta guruh, asosiy sinf nomi bilan:
--       «1-Fitratiy Arab tili», «1-Fitratiy Matematika», «1-Fitratiy Ingliz tili» va h.k.
--     Platformada ular «9-guruh: Boshlang'ich sinflar fan guruhlari» bo'limida chiqadi.
--  2) Asosiy sinf o'quvchilari guruhlarga KO'CHIRILADI va asosiy sinfdagi farzand bilan bog'lanadi —
--     guruh baholari ota-ona profilida va reytingda ko'rinadi.
--  3) Avtomatik moslash: asosiy sinfga yangi o'quvchi yozilsa, ismi o'zgartirilsa yoki o'chirilsa,
--     uchala guruhda ham o'zi o'zgaradi; o'quvchi boshqa boshlang'ich sinfga o'tkazilsa — guruhlari ham
--     (baholari saqlangan holda) yangi sinf guruhlariga o'tadi. Faylni qayta ishga tushirish shart emas.
--  4) Baholash: DAVOMATSIZ (davomat asosiy sinfda) — Uyga vazifa, Darsdagi faollik, Tartib-intizom
--     (har biri 0–5, kuniga ko'pi bilan 15 ball). Tartib-intizom 5 dan past bo'lsa, o'qituvchi izoh
--     (qaysi band buzilgani) tanlaydi — ota-onaga ko'rinadi.
-- yurt-school → SQL Editor → hammasini nusxalab → Run. Qayta ishga tushirish xavfsiz.
-- =====================================================================================

alter table public.daily_scores add column if not exists beh_band smallint;
do $$ begin
  alter table public.daily_scores add constraint daily_scores_beh_band_chk check (beh_band is null or beh_band between 1 and 3);
exception when duplicate_object then null; end $$;

-- Boshlang'ich asosiy sinfmi (1–4-sinf, guruh/fan emas)
create or replace function public.yurt_bosh_main(p_class bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select c.kind = 'sinf' and coalesce(c.grp, '') = '' and coalesce(c.subject, '') = '' and c.grade between 1 and 4
                     from public.classes c where c.id = p_class), false)
$$;

-- Asosiy sinfning fan guruhlari (Arab tili, Matematika, Ingliz tili)
create or replace function public.yurt_bosh_groups(p_class bigint)
returns table (gid bigint, subject text)
language sql stable security definer set search_path = public as $$
  select g.id::bigint, g.subject::text from public.classes m
    join public.classes g on g.kind = 'sinf' and g.grade = m.grade
     and g.grp = btrim(regexp_replace(m.name, '^\s*\d+\s*-\s*', ''))
     and g.subject in ('Arab tili', 'Matematika', 'Ingliz tili')
   where m.id = p_class
$$;

-- ---------- 1) Guruhlarni yaratish ----------
do $$
declare m record; s text; k int; gname text; short text; nid int; n int := 0;
begin
  for m in select c.id, c.name, c.grade from public.classes c
            where c.kind = 'sinf' and coalesce(c.grp, '') = '' and coalesce(c.subject, '') = '' and c.grade between 1 and 4
            order by c.grade, c.id loop
    short := btrim(regexp_replace(m.name, '^\s*\d+\s*-\s*', ''));
    k := 0;
    foreach s in array array['Arab tili', 'Matematika', 'Ingliz tili'] loop
      k := k + 1;
      gname := m.name || ' ' || s;
      if exists (select 1 from public.classes where kind = 'sinf' and grade = m.grade and grp = short and subject = s) then
        update public.classes set name = gname where kind = 'sinf' and grade = m.grade and grp = short and subject = s and name <> gname;
        continue;
      end if;
      nid := 180 + k * 20 + m.id;                    -- Arab tili: 201…, Matematika: 221…, Ingliz tili: 241…
      if exists (select 1 from public.classes where id = nid) then nid := (select max(id) + 1 from public.classes); end if;
      insert into public.classes (id, name, kind, grade, grp, subject) values (nid, gname, 'sinf', m.grade, short, s);
      n := n + 1;
    end loop;
  end loop;
  raise notice 'Yangi guruhlar: %', n;
end $$;

-- ---------- 2) O'quvchilarni ko'chirish va 3) avtomatik moslash ----------
-- Bitta asosiy sinf o'quvchisini uning uchala guruhi bilan moslaydi
create or replace function public.yurt_bosh_sync_one(p_kid text) returns void
language plpgsql security definer set search_path = public as $$
declare s public.students; g record; cur record; nid public.students.id%type;
begin
  select * into s from public.students where id::text = p_kid;
  if not found or not public.yurt_bosh_main(s.class_id) then return; end if;
  for g in select * from public.yurt_bosh_groups(s.class_id) loop
    -- shu fan bo'yicha bog'langan guruh yozuvi (boshqa sinf guruhida bo'lsa ham)
    select gs.id, gs.class_id, gs.full_name into cur
      from public.student_links sl join public.students gs on gs.id::text = sl.gid join public.classes gc on gc.id = gs.class_id
     where sl.kid = p_kid and gc.subject = g.subject and gc.grade between 1 and 4 and coalesce(gc.grp, '') <> ''
     order by (gs.class_id = g.gid) desc limit 1;
    if found then
      if cur.class_id <> g.gid then          -- o'quvchi boshqa sinfga o'tkazilgan: guruh yozuvi ham (baholari bilan) ko'chadi
        update public.students set class_id = g.gid,
               slot = (select coalesce(max(slot), 0) + 1 from public.students where class_id = g.gid), full_name = s.full_name
         where id = cur.id;
      elsif cur.full_name is distinct from s.full_name then
        update public.students set full_name = s.full_name where id = cur.id;
      end if;
    elsif btrim(coalesce(s.full_name, '')) <> '' then
      -- guruhda shu ismli, hali hech kimga bog'lanmagan yozuv bo'lsa — o'shani bog'laymiz, aks holda yangisini qo'shamiz
      select gs.id into nid from public.students gs
       where gs.class_id = g.gid and public.yk_norm3(gs.full_name) = public.yk_norm3(s.full_name)
         and not exists (select 1 from public.student_links x where x.gid = gs.id::text and x.kid <> p_kid)
       order by gs.slot limit 1;
      if nid is null then
        select gs.id into nid from public.students gs where gs.class_id = g.gid and btrim(gs.full_name) = ''
           and not exists (select 1 from public.student_links x where x.gid = gs.id::text)
         order by gs.slot limit 1;
        if nid is not null then update public.students set full_name = s.full_name where id = nid;
        else
          insert into public.students (class_id, slot, full_name)
          values (g.gid, (select coalesce(max(slot), 0) + 1 from public.students where class_id = g.gid), s.full_name)
          returning id into nid;
        end if;
      end if;
      insert into public.student_private (student_id) values (nid) on conflict do nothing;
      insert into public.student_links (gid, kid, auto) values (nid::text, p_kid, false)
      on conflict (gid) do update set kid = excluded.kid, auto = false;
    end if;
  end loop;
end $$;
revoke all on function public.yurt_bosh_sync_one(text) from public, anon, authenticated;

create or replace function public.yurt_bosh_trg() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if pg_trigger_depth() > 1 then return null; end if;   -- guruh yozuvlarini o'zgartirganda qayta ishlamasin
  if public.yurt_bosh_main(new.class_id) then
    perform public.yurt_bosh_sync_one(new.id::text);
  elsif tg_op = 'UPDATE' and public.yurt_bosh_main(old.class_id) then
    -- yuqori sinfga o'tkazilgan: boshlang'ich guruhlardagi yozuvlari ro'yxatdan chiqariladi (baholari o'chmaydi)
    update public.students gs set full_name = ''
      from public.student_links sl, public.classes gc
     where sl.kid = new.id::text and gs.id::text = sl.gid and gc.id = gs.class_id
       and gc.grade between 1 and 4 and gc.subject in ('Arab tili', 'Matematika', 'Ingliz tili') and coalesce(gc.grp, '') <> '';
  end if;
  return null;
end $$;
drop trigger if exists yurt_bosh_sync on public.students;
create trigger yurt_bosh_sync after insert or update of full_name, class_id on public.students
  for each row execute function public.yurt_bosh_trg();

-- Hozirgi o'quvchilarni ko'chirish (bor bo'lganlari qayta qo'shilmaydi)
do $$
declare r record; n int := 0;
begin
  for r in select s.id from public.students s join public.classes c on c.id = s.class_id
            where c.kind = 'sinf' and coalesce(c.grp, '') = '' and coalesce(c.subject, '') = '' and c.grade between 1 and 4
              and btrim(s.full_name) <> '' order by c.id, s.slot loop
    perform public.yurt_bosh_sync_one(r.id::text); n := n + 1;
  end loop;
  raise notice 'Tekshirilgan o''quvchilar: %', n;
end $$;

-- ---------- 4) Davomatsiz guruhlar ro'yxatiga qo'shish ----------
create or replace function public.yurt_noatt(p_class bigint)
 returns boolean language sql stable security definer set search_path to 'public'
as $function$
  select coalesce((select coalesce(c.grp, '') <> '' and c.kind is distinct from 'rep'
                          and (coalesce(c.subject, '') ~* '^(matem|rus|kimyo|biologiya|tarix|fizika|geografiya)'
                               or (c.grade between 1 and 4 and coalesce(c.subject, '') ~* '^(arab|ingliz)'))
                     from public.classes c where c.id = p_class), false)
$function$;

notify pgrst, 'reload schema';

-- Natija: har bir boshlang'ich sinf guruhlari va o'quvchilar soni
select m.name as "Asosiy sinf",
       (select count(*) from public.students s where s.class_id = m.id and btrim(s.full_name) <> '') as "Sinfda",
       string_agg(g.subject || ': ' || (select count(*) from public.students s where s.class_id = g.gid and btrim(s.full_name) <> ''), ' · '
                  order by g.subject) as "Guruhlarda"
  from public.classes m cross join lateral public.yurt_bosh_groups(m.id) g
 where public.yurt_bosh_main(m.id)
 group by m.id, m.name order by m.grade, m.id;
