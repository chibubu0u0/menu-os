-- Optional: remove the extra flavor note under Flavored Latte / 風味拿鐵.
-- Run this only if you still want to delete the line "桂花 / 海鹽 / 焦糖 / 香草 / 黑糖" from the front menu.

update public.menu_items
set description = null,
    updated_at = now()
where name like '%風味拿鐵%'
   or name ilike '%Flavored Latte%';
