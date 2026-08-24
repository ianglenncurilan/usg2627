-- Migration 006: Create or Update members table for USG Legislative & Cabinet Members
-- Stores profile details, department affiliation, and JSONB filed_bills (number, title, description)

CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  full_name TEXT,
  slug TEXT,
  role TEXT,
  role_badge TEXT,
  position TEXT,
  title TEXT,
  department TEXT,
  department_name TEXT,
  profile_url TEXT,
  phone_number TEXT,
  email TEXT,
  room_address TEXT,
  facebook_url TEXT,
  filed_bills JSONB DEFAULT '[]'::jsonb, -- Array of objects: [{"number": "Senate Bill No. 2627-021", "title": "...", "description": "..."}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

-- Ensure all required columns exist even if the members table pre-existed in Postgres
ALTER TABLE members ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS role_badge TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS department_name TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS profile_url TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS room_address TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS filed_bills JSONB DEFAULT '[]'::jsonb;
ALTER TABLE members ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE members ADD COLUMN IF NOT EXISTS created_by UUID;

-- Dynamically drop NOT NULL constraints on all non-primary key columns in members table
DO $$
DECLARE
    col RECORD;
BEGIN
    FOR col IN
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'members'
          AND column_name != 'id'
          AND is_nullable = 'NO'
    LOOP
        EXECUTE 'ALTER TABLE members ALTER COLUMN ' || quote_ident(col.column_name) || ' DROP NOT NULL';
    END LOOP;
END $$;

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view members" ON members;
DROP POLICY IF EXISTS "Authenticated users can view all members" ON members;
DROP POLICY IF EXISTS "Authenticated users can insert members" ON members;
DROP POLICY IF EXISTS "Authenticated users can update members" ON members;
DROP POLICY IF EXISTS "Authenticated users can delete members" ON members;
DROP POLICY IF EXISTS "Anyone can insert members" ON members;
DROP POLICY IF EXISTS "Anyone can update members" ON members;
DROP POLICY IF EXISTS "Anyone can delete members" ON members;

-- Open policies for members table
CREATE POLICY "Anyone can view members" ON members FOR SELECT USING (true);
CREATE POLICY "Anyone can insert members" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update members" ON members FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete members" ON members FOR DELETE USING (true);
