-- Yurt School: 4-guruh (Ingliz tili) ga "5-sinf Ingliz tili" guruhini qo'shish. Boshqa narsaga tegilmaydi.
-- Qayta ishga tushirish xavfsiz.
insert into public.classes (id, name, kind, grade, subject, grp) values
  (105, '5-sinf Ingliz tili', 'sinf', 5, 'Ingliz tili', 'Umumiy')
on conflict (id) do update set name = excluded.name, kind = excluded.kind, grade = excluded.grade, subject = excluded.subject, grp = excluded.grp;

-- Natija: 4-guruh (Ingliz tili)
select id, name as nomi from public.classes where kind = 'sinf' and grp is not null and subject = 'Ingliz tili' order by grade, name;
