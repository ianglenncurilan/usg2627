-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('RESOLUTION', 'MEMORANDUM', 'EXECUTIVE ORDER', 'SPECIAL ORDER')),
  tracking_number TEXT NOT NULL UNIQUE,
  issuing_body TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'published', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view published documents"
  ON documents FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can view all documents"
  ON documents FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert documents"
  ON documents FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update documents"
  ON documents FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete documents"
  ON documents FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
