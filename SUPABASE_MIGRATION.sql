-- ═══════════════════════════════════════════════════════════════
-- TripWise — Group Feature Migration
-- Run this in your Supabase SQL editor
-- ═══════════════════════════════════════════════════════════════

-- 1. EXPENSES TABLE (replaces old schema, adds amount_usd)
-- Drop and recreate if you had the old amount_inr version
CREATE TABLE IF NOT EXISTS expenses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id         uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  paid_by         text NOT NULL,          -- user_id of payer
  paid_by_name    text NOT NULL DEFAULT '',
  title           text NOT NULL,
  amount_usd      numeric(10,2) NOT NULL,
  category        text DEFAULT 'misc',
  split_between   text[] DEFAULT '{}',    -- array of user_ids
  split_type      text DEFAULT 'equal',
  created_at      timestamptz DEFAULT now()
);

-- If you had old expenses with amount_inr, migrate them:
-- ALTER TABLE expenses ADD COLUMN IF NOT EXISTS amount_usd numeric(10,2);
-- UPDATE expenses SET amount_usd = COALESCE(amount_inr, 0) WHERE amount_usd IS NULL;
-- ALTER TABLE expenses ADD COLUMN IF NOT EXISTS paid_by_name text DEFAULT '';

-- 2. TRIP MEMBERS TABLE — ensure it exists with all needed columns
CREATE TABLE IF NOT EXISTS trip_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id     text NOT NULL,
  user_email  text DEFAULT '',
  user_name   text DEFAULT '',
  role        text DEFAULT 'member',   -- 'owner' | 'member'
  joined_at   timestamptz DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

-- 3. TRIP NOTES TABLE — ensure it exists
CREATE TABLE IF NOT EXISTS trip_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id     text NOT NULL,
  user_name   text DEFAULT '',
  content     text NOT NULL,
  pinned      boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- 4. ROW LEVEL SECURITY (recommended)
-- Allow anyone who is a member of a trip to read its expenses/notes/members

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_notes ENABLE ROW LEVEL SECURITY;

-- Simple open policies (tighten as needed with auth.uid())
CREATE POLICY "Allow all for now" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for now" ON trip_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for now" ON trip_notes FOR ALL USING (true) WITH CHECK (true);

-- 5. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_expenses_trip    ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_members_trip     ON trip_members(trip_id);
CREATE INDEX IF NOT EXISTS idx_members_user     ON trip_members(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_trip       ON trip_notes(trip_id);
