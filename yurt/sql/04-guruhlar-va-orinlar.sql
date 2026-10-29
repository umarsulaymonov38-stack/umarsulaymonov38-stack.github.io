-- =====================================================================================
-- Yurt School: guruhlar va o'quvchi o'rinlari
--  1) 5-sinf Matematika va Ingliz tili guruhlari olib tashlanadi: bu fanlar faqat 6–9-sinflarda
--     guruhlarga bo'linib o'tiladi (Yuksalishdagidek). Guruhda o'quvchi yoki o'qituvchi bo'lsa, o'chirilmaydi.
--  2) Har bir asosiy sinfda (1–9) 15 tagacha bo'sh o'quvchi o'rni ochiladi — o'qituvchi faqat ismlarni yozadi.
--     Ko'proq kerak bo'lsa, platformadagi "+ O'quvchi qo'shish" tugmasi bilan qo'shiladi.
-- Qayta ishga tushirish xavfsiz: bor o'quvchilar o'zgarmaydi, o'rinlar 15 tadan oshmaydi.
-- =====================================================================================

-- 1) 5-sinf Matematika va Ingliz tili guruhlari
delete from public.classes c
 where c.grade = 5 and c.grp is not null and c.subject in ('Matematika', 'Ingliz tili')
   and not exists (select 1 from public.students s where s.class_id = c.id and btrim(s.full_name) <> '')
   and not exists (select 1 from public.teacher_classes t where t.class_id = c.id);

-- 2) Asosiy sinflarda 15 tadan o'quvchi o'rni
with yangi as (
  insert into public.students (class_id, slot, full_name)
  select c.id, g.slot, ''
    from public.classes c
    cross join generate_series(1, 15) as g(slot)
   where c.kind = 'sinf' and c.grp is null and c.subject is null and c.grade between 1 and 9
     and not exists (select 1 from public.students s where s.class_id = c.id and s.slot = g.slot)
  returning id
)
insert into public.student_private (student_id)
select id from yangi;

-- Natija: sinflar soni va o'quvchi o'rinlari
select count(*) filter (where kind = 'sinf' and grp is null) as asosiy_sinflar,
       count(*) filter (where grp is not null) as fan_guruhlari,
       count(*) filter (where kind = 'rep') as repetitor_guruhlari,
       (select count(*) from public.students) as oquvchi_orinlari
  from public.classes;
