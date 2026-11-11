-- =====================================================================================
-- Yurt School: 1- va 2-guruh (asosiy) sinflarida "Fanlardagi faollik" yo'q
-- Avval 10-baholash-qoidalari.sql ishga tushirilgan bo'lishi kerak.
-- Koordinator endi to'ldiradigan kunlik vazifalar:
--   1-sinf:     Davomat, Sport, Odoblar, Ota-onaga yaxshilik (ota-ona juma kuni)
--   2–4-sinf:   Davomat, Kitob o'qish, Sport, Odoblar, Ota-onaga yaxshilik
--   5–9-sinf:   Davomat, Kitob o'qish, Odoblar, Ota-onaga yaxshilik
-- Kunlik maksimal 51 ball saqlanadi: olib tashlangan mezonlar bali qolganlariga mutanosib ravishda bazada
-- avtomatik yoziladi (1-sinf va 5–9-sinf: ×5/3, 2–4-sinf: ×1.25). Barcha reytinglar va tangalar o'zgarishsiz ishlaydi.
-- Qayta ishga tushirish xavfsiz.
-- =====================================================================================

-- Sinf turi: 'g1' — 1-sinf, 'quyi' — 2–4-sinf, 'yuqori' — 5–9-sinf; fan guruhlari va repetitorlar uchun null
create or replace function public.yurt_ctype(p_student uuid)
 returns text
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select case when c.kind = 'sinf' and coalesce(c.grp, '') = '' and coalesce(c.subject, '') = '' then
           case when g = 1 then 'g1' when g between 2 and 4 then 'quyi' when g >= 5 then 'yuqori' end end
    from public.students s join public.classes c on c.id = s.class_id,
         lateral (select coalesce(c.grade, nullif(substring(c.name from '^\s*(\d+)'), '')::int, 0) as g) x
   where s.id = p_student
$function$;

create or replace function public.yurt_daily_fill()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare t text; s int;
begin
  -- Ota-ona shu hafta so'rovnomaga javob bergan bo'lsa — kelgan kunga "Ota-onaga yaxshilik" bali yoziladi
  if new.kindness is null and new.att = 1 then
    select w.score into new.kindness from public.weekly_kindness w
     where w.student_id = new.student_id and w.week_start = date_trunc('week', new.day)::date;
  end if;
  t := public.yurt_ctype(new.student_id);
  if t = 'g1' then            -- Sport, Odoblar, Yaxshilik (30) → faollik ustuniga 1/3; bazada ×1.25 → 50
    s := case when coalesce(new.sport, new.behavior, new.kindness) is null then null
              else coalesce(new.sport, 0) + coalesce(new.behavior, 0) + coalesce(new.kindness, 0) end;
    new.activity := round(s::numeric / 3)::int;
  elsif t = 'quyi' then       -- Kitob, Sport, Odoblar, Yaxshilik (40) → faollik ustuniga 1/4 → 50
    s := case when coalesce(new.book, new.sport, new.behavior, new.kindness) is null then null
              else coalesce(new.book, 0) + coalesce(new.sport, 0) + coalesce(new.behavior, 0) + coalesce(new.kindness, 0) end;
    new.activity := round(s::numeric / 4)::int;
  elsif t = 'yuqori' then     -- Kitob, Odoblar, Yaxshilik (30) → sport va faollik ustunlariga jami 2/3 → 50
    s := case when coalesce(new.book, new.behavior, new.kindness) is null then null
              else coalesce(new.book, 0) + coalesce(new.behavior, 0) + coalesce(new.kindness, 0) end;
    new.sport := round(s::numeric / 3)::int;
    new.activity := round(s::numeric * 2 / 3)::int - round(s::numeric / 3)::int;
  end if;
  return new;
end $function$;
drop trigger if exists a_yurt_fill on public.daily_scores;
create trigger a_yurt_fill before insert or update on public.daily_scores for each row execute function public.yurt_daily_fill();

-- Koordinator kunni yakunladi deb hisoblanishi: avtomatik ustunlar (faollik, yuqori sinflarda sport) va
-- ota-ona belgilaydigan "Ota-onaga yaxshilik" talab qilinmaydi
create or replace function public.yk_mark_done()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare g text; t text; done boolean;
begin
  new.updated_at := now();
  if tg_table_name = 'rep_daily' then
    done := new.att is not null and (new.att = 0 or (new.hw is not null and new.test is not null and new.grade is not null));
  else
    select c.grp into g from public.students s join public.classes c on c.id = s.class_id where s.id = new.student_id;
    if coalesce(g, '') <> '' then
      done := new.att is not null and (new.att = 0 or (new.hw is not null and new.activity is not null and new.behavior is not null));
    else
      t := public.yurt_ctype(new.student_id);
      done := new.att is not null and (new.att = 0 or (new.behavior is not null
              and (t = 'g1' or new.book is not null) and (t = 'yuqori' or new.sport is not null)));
    end if;
  end if;
  if not done then new.done_at := null;
  elsif new.done_at is null then new.done_at := now();
  end if;
  return new;
end $function$;

-- Mavjud yozuvlarni yangi qoida bo'yicha qayta hisoblash (asosiy sinflar)
update public.daily_scores d set att = d.att where public.yurt_ctype(d.student_id) is not null;

notify pgrst, 'reload schema';
