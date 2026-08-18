-- Create news table
CREATE TABLE IF NOT EXISTS news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  headline TEXT NOT NULL,
  summary TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  category TEXT NOT NULL DEFAULT 'NEWS',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);

-- Enable Row Level Security
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view news"
  ON news FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can view all news"
  ON news FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert news"
  ON news FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update news"
  ON news FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete news"
  ON news FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
