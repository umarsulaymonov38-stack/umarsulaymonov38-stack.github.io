-- =====================================================================================
-- Yurt School: sinf nomlari va repetitor guruhlari
--  1-guruh (boshlang'ich): 1-Fitratiy, 1-Temuriy, 2-Ulug'bek, 2-Navoiy, 3-Farg'oniy, 3-Beruniy, 4-Boburiy, 4-Buxoriy
--  2-guruh (yuqori):       5-Marg'inoniy, 6-Avloniy, 7-Marg'inoniy, 8-Behbudiy, 9-Qodiriy
--  Repetitor guruhlari:    Ingliz tili, Ona tili, Matematika, Huquq
-- Ortiqcha sinf va repetitor guruhlari olib tashlanadi — faqat bo'sh bo'lsa (o'quvchi ismi yoki o'qituvchi
-- biriktirilmagan bo'lsa). Fan guruhlari (Matematika, Ingliz tili, Arab, Koreys) o'zgarmaydi.
-- Qayta ishga tushirish xavfsiz.
-- =====================================================================================

-- 1) Kerakli sinflar va repetitor guruhlari (nomi yangilanadi, yo'q bo'lsa qo'shiladi)
insert into public.classes (id, name, kind, grade, subject, grp) values
  (1,  '1-Fitratiy',    'sinf', 1, null, null),
  (2,  '1-Temuriy',     'sinf', 1, null, null),
  (4,  '2-Ulug''bek',   'sinf', 2, null, null),
  (5,  '2-Navoiy',      'sinf', 2, null, null),
  (7,  '3-Farg''oniy',  'sinf', 3, null, null),
  (8,  '3-Beruniy',     'sinf', 3, null, null),
  (10, '4-Boburiy',     'sinf', 4, null, null),
  (11, '4-Buxoriy',     'sinf', 4, null, null),
  (13, '5-Marg''inoniy','sinf', 5, null, null),
  (15, '6-Avloniy',     'sinf', 6, null, null),
  (17, '7-Marg''inoniy','sinf', 7, null, null),
  (19, '8-Behbudiy',    'sinf', 8, null, null),
  (21, '9-Qodiriy',     'sinf', 9, null, null),
  (33, 'Repetitor: Ingliz tili', 'rep', null, 'Ingliz tili', null),
  (34, 'Repetitor: Ona tili',    'rep', null, 'Ona tili',    null),
  (35, 'Repetitor: Matematika',  'rep', null, 'Matematika',  null),
  (36, 'Repetitor: Huquq',       'rep', null, 'Huquq',       null)
on conflict (id) do update set name = excluded.name, kind = excluded.kind, grade = excluded.grade, subject = excluded.subject, grp = excluded.grp;

-- 2) Ro'yxatda yo'q asosiy sinflar va repetitor guruhlarini olib tashlash (faqat bo'shlari)
delete from public.classes c
 where ((c.kind = 'sinf' and c.grp is null and c.subject is null) or c.kind = 'rep')
   and c.id not in (1, 2, 4, 5, 7, 8, 10, 11, 13, 15, 17, 19, 21, 33, 34, 35, 36)
   and not exists (select 1 from public.students s where s.class_id = c.id and btrim(s.full_name) <> '')
   and not exists (select 1 from public.teacher_classes t where t.class_id = c.id);

-- 3) Har bir asosiy sinfda 15 tadan o'quvchi o'rni (yangi qo'shilgan sinflar uchun ham)
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

-- Natija
select string_agg(name, ', ' order by grade, name) filter (where kind = 'sinf' and grp is null) as asosiy_sinflar,
       string_agg(name, ', ' order by name) filter (where kind = 'rep') as repetitor_guruhlari,
       count(*) filter (where grp is not null) as fan_guruhlari,
       (select count(*) from public.students) as oquvchi_orinlari
  from public.classes;
