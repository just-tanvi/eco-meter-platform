// scripts/001_init_schema.sql
-- Initial database schema for ECO METER
-- Tables: profiles, contributions, pickups, friends
-- RLS policies included (basic)

-- Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  email text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Allow users to read all profiles (for labels on leaderboards)
create policy "profiles_select_all" on public.profiles for select
  to authenticated using (true);

-- Allow user to insert/update their own profile
create policy "profiles_upsert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- Contributions
create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  material_type text not null,
  weight_kg numeric not null check (weight_kg >= 0),
  points int not null default 0,
  created_at timestamptz default now()
);

alter table public.contributions enable row level security;

-- Read all for authenticated (for global leaderboard). Adjust if stricter privacy is needed.
create policy "contrib_select_all" on public.contributions
  for select to authenticated using (true);

-- Users manage their own contributions
create policy "contrib_insert_own" on public.contributions
  for insert to authenticated with check (auth.uid() = user_id);
create policy "contrib_update_own" on public.contributions
  for update to authenticated using (auth.uid() = user_id);
create policy "contrib_delete_own" on public.contributions
  for delete to authenticated using (auth.uid() = user_id);

-- Pickups
create table if not exists public.pickups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('pickup','dropoff')),
  address text not null,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('requested','scheduled','completed','cancelled')),
  created_at timestamptz default now()
);

alter table public.pickups enable row level security;

-- Users manage only their rows
create policy "pickups_select_own" on public.pickups for select to authenticated using (auth.uid() = user_id);
create policy "pickups_insert_own" on public.pickups for insert to authenticated with check (auth.uid() = user_id);
create policy "pickups_update_own" on public.pickups for update to authenticated using (auth.uid() = user_id);
create policy "pickups_delete_own" on public.pickups for delete to authenticated using (auth.uid() = user_id);

-- Friends (one-directional relationship)
create table if not exists public.friends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_id uuid not null references auth.users(id) on delete cascade,
  friend_username text,
  friend_email text,
  created_at timestamptz default now(),
  unique (user_id, friend_id)
);

alter table public.friends enable row level security;

-- Users can manage their own friend list
create policy "friends_select_own" on public.friends for select to authenticated using (auth.uid() = user_id);
create policy "friends_insert_own" on public.friends for insert to authenticated with check (auth.uid() = user_id);
create policy "friends_delete_own" on public.friends for delete to authenticated using (auth.uid() = user_id);
