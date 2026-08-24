-- Migration 008: Create org_charts table for About Page 3 Organizational Structure Images

CREATE TABLE IF NOT EXISTS org_charts (
  chart_key TEXT PRIMARY KEY, -- 'org1', 'org2', 'org3'
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist
ALTER TABLE org_charts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE org_charts ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE org_charts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Enable Row Level Security
ALTER TABLE org_charts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view org_charts" ON org_charts;
DROP POLICY IF EXISTS "Anyone can insert org_charts" ON org_charts;
DROP POLICY IF EXISTS "Anyone can update org_charts" ON org_charts;

-- Create open RLS policies
CREATE POLICY "Anyone can view org_charts" ON org_charts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert org_charts" ON org_charts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update org_charts" ON org_charts FOR UPDATE USING (true);

-- Seed initial 3 key USG organizational structure charts
INSERT INTO org_charts (chart_key, title, subtitle, image_url) VALUES
  ('org1', 'USG Organizational Structure', 'Overall Student Government Tree Hierarchy & Governance Diagram', '/org1.png'),
  ('org2', 'The USG President''s Cabinet Officials', 'Executive Office & Cabinet Officials Roster', '/org2.png'),
  ('org3', 'The USG Executive Branch Cabinet Structure', 'Executive Departments & Departmental Crests Hierarchy', '/org3.png')
ON CONFLICT (chart_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle;
