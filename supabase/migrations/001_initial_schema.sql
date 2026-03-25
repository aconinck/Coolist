-- Coolist MVP — Initial Schema
-- Run this in the Supabase SQL Editor to set up all three modules.

-- ─────────────────────────────────────────────
-- 1. CHECKLIST ITEMS
-- ─────────────────────────────────────────────
create table if not exists checklist_items (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  is_done    boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable real-time for this table (needed for live sync)
alter publication supabase_realtime add table checklist_items;

-- ─────────────────────────────────────────────
-- 2. WISHLIST ITEMS
-- ─────────────────────────────────────────────
create table if not exists wishlist_items (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  url           text,
  priority      text check (priority in ('low', 'medium', 'high')) default 'medium',
  family_member text,
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 3. EVENTS
-- ─────────────────────────────────────────────
create table if not exists events (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  event_date date not null,
  notes      text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY (permissive for MVP)
-- ─────────────────────────────────────────────
alter table checklist_items enable row level security;
alter table wishlist_items   enable row level security;
alter table events           enable row level security;

-- Allow all operations for now (tighten this when you add auth)
create policy "allow_all_checklist" on checklist_items for all using (true) with check (true);
create policy "allow_all_wishlist"  on wishlist_items  for all using (true) with check (true);
create policy "allow_all_events"    on events          for all using (true) with check (true);
