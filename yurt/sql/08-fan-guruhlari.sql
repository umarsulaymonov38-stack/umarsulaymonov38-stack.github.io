-- =====================================================================================
-- Yurt School: fan guruhlarini yangilash
--  4-guruh (Ingliz tili): eski guruhlar o'rniga — 5-sinf Ingliz tili, 6-7-sinflar B1, 8-9-sinflar B1, 6-7-sinflar A2, 8-9-sinflar A2
--  3-guruh (Matematika):  eski guruhlar o'rniga — 5-sinf Matematika, 6-7-sinflar Alfa va Betta, 8-9-sinflar Alfa va Betta
--  6-guruh (Arab tili va Ona tili): Ona tili — 6-7-sinflar Alfa va Betta, 8-9-sinflar Alfa va Betta
--                                   ("Umumiy Arab tili" o'zgarmaydi)
-- Eski guruhga o'quvchi ismi yozilgan yoki o'qituvchi biriktirilgan bo'lsa, u O'CHIRILMAYDI — natijada ko'rinadi.
-- Boshqa sinflar va guruhlarga tegilmaydi. Qayta ishga tushirish xavfsiz.
-- =====================================================================================

-- 1) Yangi guruhlar (nomi yangilanadi, yo'q bo'lsa qo'shiladi)
insert into public.classes (id, name, kind, grade, subject, grp) values
  (105, '5-sinf Ingliz tili',          'sinf', 5, 'Ingliz tili', 'Umumiy'),
  (101, '6-7-sinflar Ingliz tili B1',   'sinf', 6, 'Ingliz tili', 'B1'),
  (102, '8-9-sinflar Ingliz tili B1',   'sinf', 8, 'Ingliz tili', 'B1'),
  (103, '6-7-sinflar Ingliz tili A2',   'sinf', 6, 'Ingliz tili', 'A2'),
  (104, '8-9-sinflar Ingliz tili A2',   'sinf', 8, 'Ingliz tili', 'A2'),
  (111, '5-sinf Matematika',            'sinf', 5, 'Matematika', 'Umumiy'),
  (112, '6-7-sinflar Matematika Alfa',  'sinf', 6, 'Matematika', 'Alfa'),
  (113, '6-7-sinflar Matematika Betta', 'sinf', 6, 'Matematika', 'Betta'),
  (114, '8-9-sinflar Matematika Alfa',  'sinf', 8, 'Matematika', 'Alfa'),
  (115, '8-9-sinflar Matematika Betta', 'sinf', 8, 'Matematika', 'Betta'),
  (121, '6-7-sinflar Ona tili Alfa',    'sinf', 6, 'Ona tili', 'Alfa'),
  (122, '6-7-sinflar Ona tili Betta',   'sinf', 6, 'Ona tili', 'Betta'),
  (123, '8-9-sinflar Ona tili Alfa',    'sinf', 8, 'Ona tili', 'Alfa'),
  (124, '8-9-sinflar Ona tili Betta',   'sinf', 8, 'Ona tili', 'Betta')
on conflict (id) do update set name = excluded.name, kind = excluded.kind, grade = excluded.grade, subject = excluded.subject, grp = excluded.grp;

-- 2) Eski Ingliz tili va Matematika guruhlarini olib tashlash (faqat bo'shlari)
delete from public.classes c
 where c.kind = 'sinf' and c.grp is not null and c.subject in ('Ingliz tili', 'Matematika')
   and c.id not in (101, 102, 103, 104, 105, 111, 112, 113, 114, 115)
   and not exists (select 1 from public.students s where s.class_id = c.id and btrim(s.full_name) <> '')
   and not exists (select 1 from public.teacher_classes t where t.class_id = c.id);

-- Natija: fan guruhlari (eski guruh qolgan bo'lsa — ichida o'quvchi yoki o'qituvchi bor)
select case when subject ~* '^matem' then '3. Matematika' when subject ~* '^(arab|ona tili)' then '6. Arab tili va Ona tili' else '4. Ingliz tili' end as guruh,
       id, name as nomi,
       case when id in (101,102,103,104,105,111,112,113,114,115,121,122,123,124) or subject ~* '^arab' then 'yangi / joyida' else 'ESKI — ichida ma''lumot bor, o''chirilmadi' end as holat
  from public.classes
 where kind = 'sinf' and grp is not null
 order by 1, grade, name;
