-- =====================================================================================
-- Yurt School: «function public.yk_is_my_kid(text) does not exist» xatosini tuzatish
-- Ota-ona profilidagi «Reyting va o'rinlar» shu funksiyadan foydalanadi (o'quvchi shu ota-onaning farzandimi).
-- yurt-school → SQL Editor → Run. Qayta ishga tushirish xavfsiz.
-- =====================================================================================
create or replace function public.yk_is_my_kid(p_sid text) returns boolean
language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from public.student_private sp
     where sp.student_id::text = p_sid
       and (sp.claimed_by = auth.uid()
            or right(regexp_replace(coalesce(sp.parent_phone, ''), '\D', '', 'g'), 9)
               = (select substring(u.email from '^p(\d{9})@') from auth.users u where u.id = auth.uid())))
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.student_id::text = p_sid)
  or exists (select 1 from public.my_kids() k where k.id::text = p_sid)
$$;
revoke all on function public.yk_is_my_kid(text) from public, anon;
grant execute on function public.yk_is_my_kid(text) to authenticated;

notify pgrst, 'reload schema';

select to_regprocedure('public.yk_is_my_kid(text)') is not null as tuzatildi;
