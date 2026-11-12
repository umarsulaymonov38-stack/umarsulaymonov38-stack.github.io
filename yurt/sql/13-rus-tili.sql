-- =====================================================================================
-- Yurt School: 7-guruh — Rus tili
-- Baholash (Matematika va Ingliz tili guruhlaridagidek, 5 ballik): Davomat, Uyga vazifa, Sinfdagi faollik, Tartib-intizom.
-- Boshqa sinf va guruhlarga tegilmaydi. Qayta ishga tushirish xavfsiz.
-- =====================================================================================
insert into public.classes (id, name, kind, grade, subject, grp) values
  (131, '1-sinf Rus tili Fitratiy',  'sinf', 1, 'Rus tili', 'Fitratiy'),
  (132, '1-sinf Rus tili Temuriy',   'sinf', 1, 'Rus tili', 'Temuriy'),
  (133, '2-sinf Rus tili Navoiy',    'sinf', 2, 'Rus tili', 'Navoiy'),
  (134, '2-sinf Rus tili Ulug''bek', 'sinf', 2, 'Rus tili', 'Ulug''bek'),
  (135, '3-sinf Rus tili Beruniy',   'sinf', 3, 'Rus tili', 'Beruniy'),
  (136, '3-sinf Rus tili Farg''oniy','sinf', 3, 'Rus tili', 'Farg''oniy'),
  (137, '4-sinf Rus tili Boburiy',   'sinf', 4, 'Rus tili', 'Boburiy'),
  (138, '4-sinf Rus tili Buxoriy',   'sinf', 4, 'Rus tili', 'Buxoriy'),
  (139, '5-sinf Rus tili',           'sinf', 5, 'Rus tili', 'Umumiy'),
  (140, '6-sinf Rus tili',           'sinf', 6, 'Rus tili', 'Umumiy'),
  (141, '7-sinf Rus tili',           'sinf', 7, 'Rus tili', 'Umumiy'),
  (142, '8-sinf Rus tili',           'sinf', 8, 'Rus tili', 'Umumiy'),
  (143, '9-sinf Rus tili',           'sinf', 9, 'Rus tili', 'Umumiy')
on conflict (id) do update set name = excluded.name, kind = excluded.kind, grade = excluded.grade, subject = excluded.subject, grp = excluded.grp;

-- Natija: 7-guruh (Rus tili)
select id, name as nomi from public.classes where subject = 'Rus tili' and grp is not null order by grade, name;
