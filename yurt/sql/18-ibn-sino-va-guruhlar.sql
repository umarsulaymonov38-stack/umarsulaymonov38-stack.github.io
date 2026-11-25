-- =====================================================================================
-- Yurt School: 18-yangilanish
--  1) 2-guruhga yangi sinf: «5-Ibn Sino» (15 ta o'quvchi o'rni)
--  2) 8-guruh (8-sinf va 9-sinf fanlari: Kimyo, Biologiya, Tarix, Fizika, Geografiya) ga asosiy sinf
--     (8-sinf / 9-sinf) o'quvchilari ko'chiriladi va asosiy sinfdagi farzand bilan bog'lanadi —
--     guruh baholari ota-onaga ko'rinadi. Guruhda bor o'quvchi qayta qo'shilmaydi.
--     Keyinroq asosiy sinfga yangi o'quvchi yozilsa — shu faylni qayta ishga tushiring.
--  3) Kuzatuvchi va admin uchun: maktab bo'yicha o'quvchilar reytingi (sinfda va maktabda o'rni, bali) — school_ranking()
--  4) 3-guruh (Matematika), 7-guruh (Rus tili), 8-guruh (fanlar): DAVOMAT yo'q — baholash Uyga vazifa,
--     Sinfdagi faollik, Tartib-intizom (kuniga ko'pi bilan 15 ball). Davomat asosiy sinfda qoladi.
-- yurt-school → SQL Editor → Run. Qayta ishga tushirish xavfsiz.
-- =====================================================================================

-- ---------- 1) 5-Ibn Sino ----------
insert into public.classes (id, name, kind, grade, subject, grp) values (23, '5-Ibn Sino', 'sinf', 5, null, null)
on conflict (id) do update set name = excluded.name, kind = excluded.kind, grade = excluded.grade, subject = excluded.subject, grp = excluded.grp;
with yangi as (
  insert into public.students (class_id, slot, full_name)
  select 23, g.slot, '' from generate_series(1, 15) as g(slot)
   where not exists (select 1 from public.students s where s.class_id = 23 and s.slot = g.slot)
  returning id)
insert into public.student_private (student_id) select id from yangi;

-- ---------- 2) 8-sinf va 9-sinf fan guruhlariga o'quvchilarni ko'chirish ----------
do $$
declare r record; nid public.students.id%type;
begin
  for r in
    select g.id as gid, s.id as kid, btrim(s.full_name) as full_name
      from public.classes g
      join public.classes m on m.kind = 'sinf' and coalesce(m.grp, '') = '' and coalesce(m.subject, '') = '' and m.grade = g.grade
      join public.students s on s.class_id = m.id and btrim(s.full_name) <> ''
     where g.kind = 'sinf' and coalesce(g.grp, '') <> '' and g.grade in (8, 9)
       and g.subject in ('Kimyo', 'Biologiya', 'Tarix', 'Fizika', 'Geografiya')
       and not exists (select 1 from public.students x where x.class_id = g.id
                         and public.yk_norm3(x.full_name) = public.yk_norm3(s.full_name))
     order by g.id, s.slot
  loop
    insert into public.students (class_id, slot, full_name)
    values (r.gid, (select coalesce(max(slot), 0) + 1 from public.students where class_id = r.gid), r.full_name)
    returning id into nid;
    insert into public.student_private (student_id) values (nid) on conflict do nothing;
    insert into public.student_links (gid, kid, auto) values (nid::text, r.kid::text, false)
    on conflict (gid) do update set kid = excluded.kid, auto = false;
  end loop;
end $$;

-- ---------- 3) Maktab bo'yicha o'quvchilar reytingi (admin va kuzatuvchi) ----------
create or replace function public.school_ranking(p_from date, p_to date)
 returns table (student_id text, full_name text, class_id bigint, total int, days int,
                class_rank int, class_size int, school_rank int, school_size int)
 language plpgsql stable security definer set search_path to 'public'
as $function$
begin
  if coalesce(public.yk_role(), '') <> 'admin' and not coalesce(public.yk_admin2(), false) then
    raise exception 'Ruxsat yo''q' using errcode = '42501';
  end if;
  return query
  with st as (
    select s.id, s.full_name, s.class_id, public.yk_g1(s.class_id) as g1
      from public.students s join public.classes c on c.id = s.class_id
     where c.kind = 'sinf' and coalesce(c.grp, '') = '' and coalesce(c.subject, '') = '' and btrim(s.full_name) <> ''),
  t as (
    select st.id, st.full_name, st.class_id,
           coalesce(sum(public.yk_day_total(st.g1, d.att, d.book, d.sport, d.behavior, d.kindness, d.activity)), 0)::int as tot,
           (count(d.day) filter (where d.att is not null))::int as dn
      from st left join public.daily_scores d on d.student_id = st.id and d.day between p_from and p_to
     group by st.id, st.full_name, st.class_id)
  select t.id::text, t.full_name::text, t.class_id::bigint, t.tot, t.dn,
         (rank() over (partition by t.class_id order by t.tot desc))::int,
         (count(*) over (partition by t.class_id))::int,
         (rank() over (order by t.tot desc))::int,
         (count(*) over ())::int
    from t;
end $function$;
revoke all on function public.school_ranking(date, date) from public, anon;
grant execute on function public.school_ranking(date, date) to authenticated;

-- ---------- 4) Davomatsiz guruhlar: Matematika (3), Rus tili (7), 8-guruh fanlari ----------
create or replace function public.yurt_noatt(p_class bigint)
 returns boolean language sql stable security definer set search_path to 'public'
as $function$
  select coalesce((select coalesce(c.grp, '') <> '' and c.kind is distinct from 'rep'
                          and coalesce(c.subject, '') ~* '^(matem|rus|kimyo|biologiya|tarix|fizika|geografiya)'
                     from public.classes c where c.id = p_class), false)
$function$;

-- Kun yakunlandi: davomatsiz guruhlarda — uyga vazifa, faollik va tartib-intizom qo'yilgan bo'lsa
create or replace function public.yk_mark_done()
 returns trigger language plpgsql security definer set search_path to 'public'
as $function$
declare g text; cid bigint; t text; done boolean;
begin
  new.updated_at := now();
  if tg_table_name = 'rep_daily' then
    done := new.att is not null and (new.att = 0 or (new.hw is not null and new.test is not null and new.grade is not null));
  else
    select c.grp, c.id into g, cid from public.students s join public.classes c on c.id = s.class_id where s.id = new.student_id;
    if coalesce(g, '') <> '' and public.yurt_noatt(cid) then
      done := new.hw is not null and new.activity is not null and new.behavior is not null;
    elsif coalesce(g, '') <> '' then
      done := new.att is not null and (new.att = 0 or (new.hw is not null and new.activity is not null and new.behavior is not null));
    else
      t := public.yurt_ctype(new.student_id);
      done := new.att is not null and (new.att = 0 or (new.behavior is not null
              and (t = 'g1' or new.book is not null) and (t = 'yuqori' or new.sport is not null)));
    end if;
  end if;
  if not done then new.done_at := null;
  elsif new.done_at is null then new.done_at := now();
  end if;
  return new;
end $function$;

-- Sinflar reytingi: davomatsiz guruhlarda kunlik maksimal 15 ball
create or replace function public.class_ranking2(p_day date)
 returns table (class_id bigint, students integer, marked integer, total integer, pct numeric)
 language plpgsql stable security definer set search_path to 'public'
as $function$
begin
  if coalesce(public.yk_role(), '') not in ('admin', 'teacher') and not coalesce(public.yk_admin2(), false) then
    raise exception 'Ruxsat yo''q' using errcode = '42501';
  end if;
  return query
  with c as (
    select cl.id, cl.kind = 'rep' as rep, coalesce(cl.grp, '') <> '' or coalesce(cl.subject, '') ~* '^(arab|koreys)' as grp,
           public.yurt_noatt(cl.id) as na, public.yk_g1(cl.id) as g1,
           (select count(*) from public.students s where s.class_id = cl.id and coalesce(btrim(s.full_name), '') <> '')::int as n
      from public.classes cl),
  d as (
    select s.class_id, count(*)::int as m,
           sum(case when c.grp then (case when x.att = 1 and not c.na then 1 else 0 end) + coalesce(x.hw, 0) + coalesce(x.activity, 0) + coalesce(x.behavior, 0)
                    else public.yk_day_total(c.g1, x.att, x.book, x.sport, x.behavior, x.kindness, x.activity) end)::int as t
      from public.daily_scores x join public.students s on s.id = x.student_id join c on c.id = s.class_id
     where x.day = p_day and not c.rep group by s.class_id),
  r as (
    select s.class_id, count(*)::int as m,
           avg((select avg(v) from unnest(array[case when x.att is null then null else x.att * 100.0 end,
                                               case when x.hw is null then null else x.hw * 10.0 end,
                                               x.test::numeric]) v)) as p
      from public.rep_daily x join public.students s on s.id = x.student_id
     where x.day = p_day group by s.class_id)
  select c.id::bigint, c.n,
         coalesce(case when c.rep then r.m else d.m end, 0),
         case when c.rep then null else coalesce(d.t, 0) end,
         case when c.rep then round(r.p, 1)
              when coalesce(d.m, 0) = 0 or c.n = 0 then null
              else round(d.t * 100.0 / (c.n * case when c.na then 15 when c.grp then 16 else 51 end), 1) end
    from c left join d on d.class_id = c.id left join r on r.class_id = c.id;
end $function$;

-- Mavjud yozuvlarni yangi qoida bo'yicha qayta belgilash (davomatsiz guruhlar)
update public.daily_scores d set att = d.att
  from public.students s where s.id = d.student_id and public.yurt_noatt(s.class_id);

notify pgrst, 'reload schema';

-- Natija
select (select name from public.classes where id = 23) as yangi_sinf,
       (select count(*) from public.students s join public.classes c on c.id = s.class_id
         where c.grade in (8, 9) and c.subject in ('Kimyo', 'Biologiya', 'Tarix', 'Fizika', 'Geografiya') and btrim(s.full_name) <> '') as guruhlardagi_oquvchilar,
       to_regprocedure('public.school_ranking(date,date)') is not null as reyting,
       (select count(*) from public.classes where public.yurt_noatt(id)) as davomatsiz_guruhlar;
