-- =====================================================================================
-- Yurt School: 2–4-sinflarda ham Sport yo'q (1-sinfda Sport qoladi)
-- Avval 10-baholash-qoidalari.sql va 11-faolliksiz.sql ishga tushirilgan bo'lishi kerak.
-- Koordinator: 1-sinf — Davomat, Sport, Odoblar; 2–9-sinf — Davomat, Kitob o'qish, Odoblar.
-- (Ota-onaga yaxshilik — ota-ona juma kuni.) Kunlik maksimal 51 saqlanadi: 2–9-sinflarda sport va faollik
-- ustunlariga bazada avtomatik ball yoziladi (×5/3). Qayta ishga tushirish xavfsiz.
-- =====================================================================================

-- Sinf turi: 'g1' — 1-sinf; 'yuqori' — Sportsiz sinflar (2–9); fan guruhlari va repetitorlar uchun null
create or replace function public.yurt_ctype(p_student uuid)
 returns text
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select case when c.kind = 'sinf' and coalesce(c.grp, '') = '' and coalesce(c.subject, '') = '' then
           case when g = 1 then 'g1' when g >= 2 then 'yuqori' end end
    from public.students s join public.classes c on c.id = s.class_id,
         lateral (select coalesce(c.grade, nullif(substring(c.name from '^\s*(\d+)'), '')::int, 0) as g) x
   where s.id = p_student
$function$;

-- Mavjud yozuvlarni yangi qoida bo'yicha qayta hisoblash (2–4-sinflar)
update public.daily_scores d set att = d.att where public.yurt_ctype(d.student_id) is not null;

notify pgrst, 'reload schema';
