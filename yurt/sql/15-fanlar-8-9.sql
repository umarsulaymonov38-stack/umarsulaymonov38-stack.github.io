-- =====================================================================================
-- Yurt School: 8–9-sinflar uchun fan guruhlari
--  7-guruh (Rus tili):            8-9-sinflar Rus tili
--  8-guruh (8–9-sinflar fanlari): 8-9-sinflar Kimyo, Biologiya, Tarix, Fizika, Geografiya
-- Baholash (boshqa fan guruhlaridagidek, 5 ballik): Davomat, Uyga vazifa, Sinfdagi faollik, Tartib-intizom.
-- Boshqa sinf va guruhlarga tegilmaydi. Qayta ishga tushirish xavfsiz.
-- =====================================================================================
insert into public.classes (id, name, kind, grade, subject, grp) values
  (151, '8-9-sinflar Rus tili',    'sinf', 8, 'Rus tili',   'Umumiy'),
  (152, '8-9-sinflar Kimyo',       'sinf', 8, 'Kimyo',      'Umumiy'),
  (153, '8-9-sinflar Biologiya',   'sinf', 8, 'Biologiya',  'Umumiy'),
  (154, '8-9-sinflar Tarix',       'sinf', 8, 'Tarix',      'Umumiy'),
  (155, '8-9-sinflar Fizika',      'sinf', 8, 'Fizika',     'Umumiy'),
  (156, '8-9-sinflar Geografiya',  'sinf', 8, 'Geografiya', 'Umumiy')
on conflict (id) do update set name = excluded.name, kind = excluded.kind, grade = excluded.grade, subject = excluded.subject, grp = excluded.grp;

-- Natija: yangi guruhlar
select id, name as nomi from public.classes where id between 151 and 156 order by id;
