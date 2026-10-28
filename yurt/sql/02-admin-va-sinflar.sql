-- =====================================================================================
-- Yurt School: birinchi admin va sinflar ro'yxati
-- Avval platforma/sql/01-baza-ornatish.sql ishga tushirilgan bo'lishi kerak.
-- =====================================================================================

-- 1) ADMIN
-- Supabase → Authentication → Users → "Add user" → "Create new user":
--    email va parol yozing, "Auto Confirm User" belgisini qo'ying → "Create user".
-- So'ng quyidagi qatordagi emailni o'sha email bilan almashtirib, shu faylni ishga tushiring.
update public.profiles
   set role = 'admin', full_name = 'Administrator'
 where id = (select id from auth.users where email = 'admin@yurtschool.uz');

-- 2) SINFLAR
-- id     — har bir sinf uchun takrorlanmas raqam (1, 2, 3 ...)
-- name   — sinf nomi, ekranda shunday ko'rinadi
-- grade  — sinf raqami (1–11). Sinflar guruhlarga shu bo'yicha ajraladi: 1–4 boshlang'ich, 5 va undan yuqori — yuqori sinflar
-- Fan guruhlari (Matematika, Ingliz tili) va repetitor guruhlari uchun alohida ustunlar bor: grp, subject, kind = 'rep'.
-- Quyidagi ro'yxat — NAMUNA. Yurt School sinflari bilan almashtiring.
insert into public.classes (id, name, grade) values
  (1, '1-A', 1),
  (2, '2-A', 2),
  (3, '5-A', 5)
on conflict (id) do nothing;

-- O'quvchilar ismini sinf rahbari yoki admin platformada kiritadi ("+ O'quvchi qo'shish" tugmasi).
