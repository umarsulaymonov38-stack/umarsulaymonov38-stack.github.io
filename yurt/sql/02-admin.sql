-- =====================================================================================
-- Yurt School: birinchi admin
-- Avval platforma/sql/01-baza-ornatish.sql ishga tushirilgan bo'lishi kerak.
-- =====================================================================================

-- 1) ADMIN
-- Supabase → Authentication → Users → "Add user" → "Create new user":
--    email va parol yozing, "Auto Confirm User" belgisini qo'ying → "Create user".
-- So'ng quyidagi qatordagi emailni o'sha email bilan almashtirib, shu faylni ishga tushiring.
update public.profiles
   set role = 'admin', full_name = 'Administrator'
 where id = (select id from auth.users where email = 'admin@yurtschool.uz');

-- 2) SINFLAR — yurt/sql/03-sinflar.sql faylida.
