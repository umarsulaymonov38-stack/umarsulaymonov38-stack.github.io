-- =====================================================================================
-- Yurt School: 8-sinf va 9-sinf uchun ALOHIDA fan guruhlari
--  8-guruh (8–9-sinflar fanlari): Kimyo, Biologiya, Tarix, Fizika, Geografiya — 8-sinf va 9-sinf alohida (10 ta guruh)
--  7-guruh (Rus tili): 8-sinf va 9-sinf alohida (avvaldan bor); umumiy "8-9-sinflar Rus tili" olib tashlanadi
-- Baholash (5 ballik): Davomat, Uyga vazifa, Sinfdagi faollik, Tartib-intizom.
-- Boshqa sinf va guruhlarga tegilmaydi. Qayta ishga tushirish xavfsiz.
-- =====================================================================================
insert into public.classes (id, name, kind, grade, subject, grp) values
  (152, '8-sinf Kimyo',       'sinf', 8, 'Kimyo',      'Umumiy'),
  (153, '8-sinf Biologiya',   'sinf', 8, 'Biologiya',  'Umumiy'),
  (154, '8-sinf Tarix',       'sinf', 8, 'Tarix',      'Umumiy'),
  (155, '8-sinf Fizika',      'sinf', 8, 'Fizika',     'Umumiy'),
  (156, '8-sinf Geografiya',  'sinf', 8, 'Geografiya', 'Umumiy'),
  (162, '9-sinf Kimyo',       'sinf', 9, 'Kimyo',      'Umumiy'),
  (163, '9-sinf Biologiya',   'sinf', 9, 'Biologiya',  'Umumiy'),
  (164, '9-sinf Tarix',       'sinf', 9, 'Tarix',      'Umumiy'),
  (165, '9-sinf Fizika',      'sinf', 9, 'Fizika',     'Umumiy'),
  (166, '9-sinf Geografiya',  'sinf', 9, 'Geografiya', 'Umumiy'),
  (142, '8-sinf Rus tili',    'sinf', 8, 'Rus tili',   'Umumiy'),
  (143, '9-sinf Rus tili',    'sinf', 9, 'Rus tili',   'Umumiy')
on conflict (id) do update set name = excluded.name, kind = excluded.kind, grade = excluded.grade, subject = excluded.subject, grp = excluded.grp;

-- Umumiy "8-9-sinflar Rus tili" kerak emas (faqat bo'sh bo'lsa o'chiriladi)
delete from public.classes c
 where c.id = 151
   and not exists (select 1 from public.students s where s.class_id = c.id and btrim(s.full_name) <> '')
   and not exists (select 1 from public.teacher_classes t where t.class_id = c.id);

-- Natija: 8- va 9-sinf fan guruhlari
select id, name as nomi from public.classes
 where kind = 'sinf' and grp is not null and grade in (8, 9)
   and subject in ('Kimyo', 'Biologiya', 'Tarix', 'Fizika', 'Geografiya', 'Rus tili')
 order by grade, subject;
