-- Create table if it doesn't exist
create table if not exists public.pickups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  pickup_at timestamptz not null,
  address text not null,
  materials jsonb not null default '[]'::jsonb,
  notes text,
  status text not null default 'scheduled',
  created_at timestamptz not null default now()
);

-- Ensure extension for gen_random_uuid (if missing)
-- create extension if not exists "pgcrypto";

-- Indexes
create index if not exists idx_pickups_user_id on public.pickups(user_id);
create index if not exists idx_pickups_pickup_at on public.pickups(pickup_at);

-- Enable Row Level Security
alter table public.pickups enable row level security;

-- Policies: users can manage their own pickups
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'pickups' and policyname = 'Pickups select own'
  ) then
    create policy "Pickups select own"
      on public.pickups for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'pickups' and policyname = 'Pickups insert self'
  ) then
    create policy "Pickups insert self"
      on public.pickups for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'pickups' and policyname = 'Pickups update own'
  ) then
    create policy "Pickups update own"
      on public.pickups for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'pickups' and policyname = 'Pickups delete own'
  ) then
    create policy "Pickups delete own"
      on public.pickups for delete
      using (auth.uid() = user_id);
  end if;
end $$;
