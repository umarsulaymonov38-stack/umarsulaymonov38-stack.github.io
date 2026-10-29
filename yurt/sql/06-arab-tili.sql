-- =====================================================================================
-- Yurt School: 6-guruh — faqat bitta "Umumiy Arab tili" sinfi
-- Koreys tili o'tilmaydi. Arab tili guruhlari bittaga birlashtiriladi.
-- Ortiqcha guruhlar faqat bo'sh bo'lsa (o'quvchi ismi yoki o'qituvchi yo'q) o'chiriladi.
-- Qayta ishga tushirish xavfsiz.
-- =====================================================================================

insert into public.classes (id, name, kind, grade, subject, grp) values
  (50, 'Umumiy Arab tili', 'sinf', null, 'Arab tili', 'Umumiy')
on conflict (id) do update set name = excluded.name, kind = excluded.kind, grade = excluded.grade, subject = excluded.subject, grp = excluded.grp;

delete from public.classes c
 where c.subject in ('Arab tili', 'Koreys tili') and c.id <> 50
   and not exists (select 1 from public.students s where s.class_id = c.id and btrim(s.full_name) <> '')
   and not exists (select 1 from public.teacher_classes t where t.class_id = c.id);

-- Natija: 6-guruhda qolgan sinflar
select id, name from public.classes where subject in ('Arab tili', 'Koreys tili') order by id;
