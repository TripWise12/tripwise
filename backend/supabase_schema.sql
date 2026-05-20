-- TripIQ Supabase Schema
-- Run this in your Supabase SQL Editor (supabase.com → your project → SQL Editor)

-- ─────────────────────────────────────────────
-- TRIPS
-- ─────────────────────────────────────────────
create table if not exists trips (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  invite_code text unique,
  title text,
  destination text not null,
  origin text,
  start_date date,
  end_date date,
  interests text[],
  pace text default 'balanced',
  stay_type text default 'hotel',
  budget_inr integer,
  group_size integer default 1,
  dietary text[],
  planning_to_drive boolean default false,
  viability_report jsonb,
  itinerary jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security
alter table trips enable row level security;

create policy "Users can view their own trips"
  on trips for select using (auth.uid() = user_id);

create policy "Users can insert their own trips"
  on trips for insert with check (auth.uid() = user_id);

create policy "Users can update their own trips"
  on trips for update using (auth.uid() = user_id);

-- Anyone with invite code can read trip (for group sharing)
create policy "Anyone can read trip by invite code"
  on trips for select using (invite_code is not null);

-- ─────────────────────────────────────────────
-- TRIP MEMBERS
-- ─────────────────────────────────────────────
create table if not exists trip_members (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references trips(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'member', -- 'owner' | 'member'
  display_name text,
  joined_at timestamptz default now(),
  unique(trip_id, user_id)
);

alter table trip_members enable row level security;

create policy "Members can view trip members"
  on trip_members for select using (
    trip_id in (select trip_id from trip_members where user_id = auth.uid())
  );

create policy "Users can join trips"
  on trip_members for insert with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- EXPENSES
-- ─────────────────────────────────────────────
create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references trips(id) on delete cascade,
  paid_by uuid references auth.users(id),
  paid_by_name text,
  title text not null,
  amount_inr numeric(12,2) not null,
  category text default 'misc',
  split_between uuid[],
  split_type text default 'equal',
  created_at timestamptz default now()
);

alter table expenses enable row level security;

create policy "Trip members can view expenses"
  on expenses for select using (
    trip_id in (select trip_id from trip_members where user_id = auth.uid())
  );

create policy "Trip members can add expenses"
  on expenses for insert with check (
    trip_id in (select trip_id from trip_members where user_id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- COMMENTS (collaborative editing suggestions)
-- ─────────────────────────────────────────────
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references trips(id) on delete cascade,
  user_id uuid references auth.users(id),
  activity_index text, -- e.g. "day_1_slot_2"
  content text not null,
  resolved boolean default false,
  created_at timestamptz default now()
);

alter table comments enable row level security;

create policy "Trip members can view comments"
  on comments for select using (
    trip_id in (select trip_id from trip_members where user_id = auth.uid())
  );

create policy "Trip members can add comments"
  on comments for insert with check (
    trip_id in (select trip_id from trip_members where user_id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- REALTIME (enable for live collaboration)
-- ─────────────────────────────────────────────
-- In Supabase dashboard: Database → Replication → enable realtime for:
-- trips, trip_members, expenses, comments

-- ─────────────────────────────────────────────
-- UPDATED_AT trigger
-- ─────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trips_updated_at
  before update on trips
  for each row execute procedure update_updated_at();
