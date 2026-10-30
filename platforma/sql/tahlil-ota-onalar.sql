-- =====================================================================================
-- Ota-onalar ulanishi tahlili (faqat o'qiydi, hech narsani o'zgartirmaydi)
-- Asosiy sinflar bo'yicha: nechta o'quvchi, nechtasiga ota-ona telefoni yozilgan,
-- nechta ota-ona platformaga ulangan. Boshlang'ich (1–4) va yuqori (5+) sinflar alohida, oxirida jami.
-- Ishlatish: maktab Supabase loyihasi → SQL Editor → shu faylni Run.
-- =====================================================================================
with sinf as (
  select c.id, c.name, coalesce(c.grade, nullif(substring(c.name from '^\d+'), '')::int, 0) as g
    from public.classes c
   where c.kind = 'sinf' and c.grp is null and c.subject is null
),
oq as (
  select s.class_id, s.id,
         public.norm_phone(sp.parent_phone) as tel,
         sp.claimed_by is not null as ulangan
    from public.students s
    left join public.student_private sp on sp.student_id = s.id
   where btrim(s.full_name) <> ''
),
qator as (
  select case when sinf.g between 1 and 4 then '1. Boshlang''ich (1–4)' else '2. Yuqori (5+)' end as guruh,
         sinf.name as sinf, sinf.g,
         count(oq.id) as oquvchi,
         count(oq.id) filter (where length(oq.tel) = 9) as telefon_bor,
         count(oq.id) filter (where oq.ulangan) as ulangan,
         count(oq.id) filter (where length(oq.tel) = 9 and not oq.ulangan) as taklif_kutilmoqda,
         count(oq.id) filter (where coalesce(length(oq.tel), 0) <> 9) as telefonsiz
    from sinf left join oq on oq.class_id = sinf.id
   group by 1, 2, 3
)
select guruh, sinf, oquvchi, telefon_bor, ulangan, taklif_kutilmoqda, telefonsiz,
       round(100.0 * ulangan / nullif(oquvchi, 0)) || '%' as ulanish
  from (
    select guruh, sinf, g, 0 as t, oquvchi, telefon_bor, ulangan, taklif_kutilmoqda, telefonsiz from qator
    union all
    select guruh, '— JAMI —', 99, 1, sum(oquvchi), sum(telefon_bor), sum(ulangan), sum(taklif_kutilmoqda), sum(telefonsiz) from qator group by guruh
    union all
    select '3. Butun maktab', '— JAMI —', 99, 2, sum(oquvchi), sum(telefon_bor), sum(ulangan), sum(taklif_kutilmoqda), sum(telefonsiz) from qator
  ) x
 order by guruh, t, g, sinf;
