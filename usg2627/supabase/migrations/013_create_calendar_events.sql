-- Migration 013: Create calendar_events table with strict RLS policies

-- 1. Create calendar_events table if not exists
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  category TEXT DEFAULT 'Assembly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. Ensure columns exist on calendar_events table
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Assembly';
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 3. Create indexes on event_date and category for fast calendar queries
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date ASC);
CREATE INDEX IF NOT EXISTS idx_calendar_events_category ON calendar_events(category);

-- 4. Enable Row Level Security
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- 5. Drop policies if exists for clean policy setup
DROP POLICY IF EXISTS "Anyone can view calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Authenticated users can insert calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Authenticated users can update calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Authenticated users can delete calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Anyone can insert calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Anyone can update calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Anyone can delete calendar events" ON calendar_events;

-- 6. Strict RLS Policies: Public can ONLY view (read-only). Only authenticated admins can modify.
CREATE POLICY "Anyone can view calendar events" ON calendar_events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert calendar events" ON calendar_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update calendar events" ON calendar_events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete calendar events" ON calendar_events FOR DELETE TO authenticated USING (true);

-- 7. Trigger to automatically update updated_at column
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON calendar_events;
    CREATE TRIGGER update_calendar_events_updated_at
      BEFORE UPDATE ON calendar_events
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
