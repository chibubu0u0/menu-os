-- Reduce Li-Yu featured items to a smaller curated set.
-- Supabase Dashboard → SQL Editor → New query → paste all → Run.

update public.menu_items
set featured = false;

update public.menu_items
set featured = true
where name in (
  '林檎美式｜Apple Americano',
  '牛肋條抹茶咖哩飯｜Matcha Curry Rice with Beef Short Ribs',
  '離域蘋果派｜Li-Yu Apple Pie'
);
