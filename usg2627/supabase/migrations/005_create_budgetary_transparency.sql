-- Create budgetary_transparency table
CREATE TABLE IF NOT EXISTS budgetary_transparency (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  status TEXT NOT NULL DEFAULT 'In Progress',
  amount NUMERIC,
  academic_year TEXT DEFAULT '2025-2026',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create index on status and created_at
CREATE INDEX IF NOT EXISTS idx_budgetary_transparency_status ON budgetary_transparency(status);
CREATE INDEX IF NOT EXISTS idx_budgetary_transparency_created_at ON budgetary_transparency(created_at DESC);

-- Enable Row Level Security
ALTER TABLE budgetary_transparency ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view budgetary transparency"
  ON budgetary_transparency FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can view all budgetary transparency"
  ON budgetary_transparency FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert budgetary transparency"
  ON budgetary_transparency FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update budgetary transparency"
  ON budgetary_transparency FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete budgetary transparency"
  ON budgetary_transparency FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_budgetary_transparency_updated_at
  BEFORE UPDATE ON budgetary_transparency
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
