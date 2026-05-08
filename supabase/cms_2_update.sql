-- Li-Yu Menu OS CMS 2.0 update
-- Paste this into Supabase Dashboard → SQL Editor → New query → Run.
-- This keeps your existing menu_items data and adds:
-- 1. menu_categories: front-end category / series manager
-- 2. site_sections: editable front-page content blocks
-- 3. limited-time fields on menu_items

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

alter table public.menu_items
  add column if not exists label text,
  add column if not exists is_limited boolean not null default false,
  add column if not exists start_date date,
  add column if not exists end_date date;

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  english text,
  eyebrow text,
  note text,
  subnote text,
  sort_order integer not null default 0,
  visible boolean not null default true,
  layout_style text not null default 'list',
  group_title text,
  group_english text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_menu_categories_updated_at on public.menu_categories;
create trigger set_menu_categories_updated_at
before update on public.menu_categories
for each row
execute procedure public.set_updated_at();

alter table public.menu_categories enable row level security;

drop policy if exists "Public can read visible menu categories" on public.menu_categories;
create policy "Public can read visible menu categories"
on public.menu_categories
for select
using (visible = true);

drop policy if exists "Authenticated can read all menu categories" on public.menu_categories;
create policy "Authenticated can read all menu categories"
on public.menu_categories
for select
to authenticated
using (true);

drop policy if exists "Authenticated can insert menu categories" on public.menu_categories;
create policy "Authenticated can insert menu categories"
on public.menu_categories
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated can update menu categories" on public.menu_categories;
create policy "Authenticated can update menu categories"
on public.menu_categories
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated can delete menu categories" on public.menu_categories;
create policy "Authenticated can delete menu categories"
on public.menu_categories
for delete
to authenticated
using (true);

insert into public.menu_categories
  (title, english, eyebrow, note, subnote, sort_order, visible, layout_style, group_title, group_english)
values
  ('黑咖啡', 'Black Coffee', null, '咖啡 / 飲料可少冰｜無提供去冰服務｜甜度固定', null, 10, true, 'list', '想喝點咖啡', 'Coffee'),
  ('牛奶咖啡', 'Milk Coffee', '加點料', '咖啡 / 飲料可少冰｜無提供去冰服務｜甜度固定', '風味拿鐵：桂花 / 海鹽 / 焦糖 / 香草 / 黑糖', 20, true, 'list', '想喝點咖啡', 'Coffee'),
  ('特調咖啡', 'Signature Coffee', null, '咖啡 / 飲料可少冰｜無提供去冰服務｜甜度固定', null, 30, true, 'list', '想喝點咖啡', 'Coffee'),
  ('手沖咖啡', 'Pour Over Coffee', null, '160$｜單品風味依現場供應為主', null, 40, true, 'flavor', '想喝點咖啡', 'Coffee'),
  ('不想喝咖啡', 'Non-Coffee Drinks', null, '咖啡 / 飲料可少冰｜無提供去冰服務｜甜度固定', null, 50, true, 'list', '不想喝咖啡', 'Non-Coffee'),
  ('茶飲', 'Tea', null, '咖啡 / 飲料可少冰｜無提供去冰服務｜甜度固定', null, 60, true, 'list', '不想喝咖啡', 'Non-Coffee'),
  ('氣泡飲', 'Sparkling Drinks', null, '咖啡 / 飲料可少冰｜無提供去冰服務｜甜度固定', null, 70, true, 'list', '不想喝咖啡', 'Non-Coffee'),
  ('義大利麵', 'Pasta', '想吃點鹹', '供餐時間：最後加點 22:30 前', '口味調整請洽櫃檯 / Please speak to our staff for flavor adjustments.', 80, true, 'list', '想吃點鹹', 'Savory'),
  ('飯食', 'Rice', '想吃點鹹', '供餐時間：最後加點 22:30 前', '口味調整請洽櫃檯 / Please speak to our staff for flavor adjustments.', 90, true, 'list', '想吃點鹹', 'Savory'),
  ('套餐', 'Set Menu', null, '點主餐可加購任一套餐', '以上套餐可補差額更換', 100, true, 'list', '想吃點鹹', 'Savory'),
  ('想吃點甜', 'Desserts', null, '招牌人氣甜點：離域蘋果派', null, 110, true, 'list', '想吃點甜', 'Desserts & Snacks'),
  ('來點點心', 'Snacks & Savory Pie', null, null, null, 120, true, 'list', '想吃點甜', 'Desserts & Snacks')
on conflict (title) do update set
  english = excluded.english,
  eyebrow = excluded.eyebrow,
  note = excluded.note,
  subnote = excluded.subnote,
  sort_order = excluded.sort_order,
  visible = excluded.visible,
  layout_style = excluded.layout_style,
  group_title = excluded.group_title,
  group_english = excluded.group_english;

-- Any category already used by your menu but not listed above will be created automatically.
insert into public.menu_categories (title, english, sort_order, visible, layout_style, group_title, group_english)
select distinct mi.category, null, 900, true, 'list', '其他', 'Others'
from public.menu_items mi
where mi.category is not null
  and not exists (
    select 1 from public.menu_categories mc where mc.title = mi.category
  );

create table if not exists public.site_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  title text not null,
  english text,
  body text,
  style text not null default 'text',
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_site_sections_updated_at on public.site_sections;
create trigger set_site_sections_updated_at
before update on public.site_sections
for each row
execute procedure public.set_updated_at();

alter table public.site_sections enable row level security;

drop policy if exists "Public can read visible site sections" on public.site_sections;
create policy "Public can read visible site sections"
on public.site_sections
for select
using (visible = true);

drop policy if exists "Authenticated can read all site sections" on public.site_sections;
create policy "Authenticated can read all site sections"
on public.site_sections
for select
to authenticated
using (true);

drop policy if exists "Authenticated can insert site sections" on public.site_sections;
create policy "Authenticated can insert site sections"
on public.site_sections
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated can update site sections" on public.site_sections;
create policy "Authenticated can update site sections"
on public.site_sections
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated can delete site sections" on public.site_sections;
create policy "Authenticated can delete site sections"
on public.site_sections
for delete
to authenticated
using (true);

insert into public.site_sections (section_key, title, english, body, style, visible, sort_order)
values
  ('hero', '離域', 'Li-Yu Menu', '在城市的縫隙裡，留一段可以慢下來的時間。', 'hero', true, 0),
  ('opening_time', 'Opening Time', '營業時間', 'Monday ~ Friday 15:00 ~ 00:00\nSaturday & Sunday 14:00 ~ 00:00\n（最後收客 23:30） We stop seating guests 30 minutes before closing time.', 'opening', true, 10),
  ('house_rules', '入店規章', 'House Rules', '每人低消兩百五十元，不合併計算\n座位依現場安排為主，用餐時間兩小時，禁用外食\n目前僅提供現金結帳\n點主餐可加購任一套餐\n外食垃圾請自行帶出去處理，遺留者收取 200 元清潔費\n破杯清潔費酌收 300 元，嘔吐清潔費酌收 2000 元\n目前無配合特約停車場，請勿違停影響交通與住戶出入\n晚間十點後，二樓戶外區不開放，請勿大聲喧嘩\n如有寵物隨行請置於寵物推車或寵物籃，勿影響其他客人用餐權益', 'rules', true, 20),
  ('limited_notice', '期間限定', 'Limited Items', '這裡可以放本月限定、季節新品或活動公告。若暫時不用，可以在後台關閉這個區塊。', 'notice', false, 30)
on conflict (section_key) do update set
  title = excluded.title,
  english = excluded.english,
  body = excluded.body,
  style = excluded.style,
  visible = excluded.visible,
  sort_order = excluded.sort_order;
