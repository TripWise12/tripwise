-- TripWise — Supabase Schema
-- Run this entire file in: Supabase dashboard → SQL Editor → New query → Run

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIPS
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists trips (
  id                uuid default gen_random_uuid() primary key,
  user_id           text not null,          -- Firebase UID (string, not auth.users ref)
  user_email        text,
  user_name         text,
  title             text not null default 'My Trip',
  destination       text not null,
  origin            text not null,
  start_date        date,
  end_date          date,
  interests         text[],
  pace              text default 'balanced',
  stay_type         text default 'hotel',
  budget_usd        integer default 0,
  group_size        integer default 1,
  dietary           text[],
  personal_notes    text,
  planning_to_drive boolean default false,
  invite_code       text unique,
  viability_report  jsonb,
  itinerary         jsonb,
  status            text default 'planned', -- planned | ongoing | completed
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Index for fast user history queries
create index if not exists trips_user_id_idx on trips(user_id);
create index if not exists trips_created_at_idx on trips(created_at desc);

-- Row Level Security — disabled since we use Firebase Auth (not Supabase Auth)
-- We validate user_id in the API layer instead
alter table trips disable row level security;


-- ─────────────────────────────────────────────────────────────────────────────
-- TRIP MEMBERS (group trips)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists trip_members (
  id          uuid default gen_random_uuid() primary key,
  trip_id     uuid references trips(id) on delete cascade,
  user_id     text not null,
  user_email  text,
  user_name   text,
  role        text default 'member',
  joined_at   timestamptz default now(),
  unique(trip_id, user_id)
);

create index if not exists trip_members_user_idx on trip_members(user_id);
alter table trip_members disable row level security;


-- ─────────────────────────────────────────────────────────────────────────────
-- EXPENSES
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists expenses (
  id           uuid default gen_random_uuid() primary key,
  trip_id      uuid references trips(id) on delete cascade,
  paid_by      text not null,
  paid_by_name text,
  title        text not null,
  amount_usd   numeric(12,2) not null default 0,
  category     text default 'misc',
  split_type   text default 'equal',
  created_at   timestamptz default now()
);

create index if not exists expenses_trip_idx on expenses(trip_id);
alter table expenses disable row level security;


-- ─────────────────────────────────────────────────────────────────────────────
-- AUTO-UPDATE updated_at
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trips_updated_at on trips;
create trigger trips_updated_at
  before update on trips
  for each row execute procedure update_updated_at();
