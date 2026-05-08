-- Menu OS Supabase schema
-- Paste this into Supabase Dashboard → SQL Editor → New query → Run.

create extension if not exists pgcrypto;

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category text not null default '未分類',
  name text not null,
  description text,
  price numeric(10, 0) not null default 0,
  image_url text,
  available boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_menu_items_updated_at on public.menu_items;
create trigger set_menu_items_updated_at
before update on public.menu_items
for each row
execute procedure public.set_updated_at();

alter table public.menu_items enable row level security;

drop policy if exists "Public can read available menu items" on public.menu_items;
create policy "Public can read available menu items"
on public.menu_items
for select
using (available = true or auth.role() = 'authenticated');

drop policy if exists "Authenticated users can insert menu items" on public.menu_items;
create policy "Authenticated users can insert menu items"
on public.menu_items
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update menu items" on public.menu_items;
create policy "Authenticated users can update menu items"
on public.menu_items
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete menu items" on public.menu_items;
create policy "Authenticated users can delete menu items"
on public.menu_items
for delete
to authenticated
using (true);

insert into public.menu_items (category, name, description, price, available, featured, sort_order)
values
  ('咖啡', '美式咖啡', '中深焙豆，乾淨尾韻', 120, true, false, 10),
  ('咖啡', '拿鐵', '濃縮咖啡與柔和牛奶', 150, true, true, 20),
  ('甜點', '巴斯克乳酪蛋糕', '焦香表層，綿密口感', 180, true, true, 30),
  ('主餐', '香料雞肉咖哩飯', '季節蔬菜與自製咖哩醬', 260, true, false, 40)
on conflict do nothing;
