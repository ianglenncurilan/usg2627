-- Cloudflare D1 SQLite Schema for USG 2627
-- Generated from Supabase PostgreSQL migrations

-- 1. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY, -- UUID string
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('RESOLUTION', 'EXECUTIVE ORDER', 'ADMINISTRATIVE ORDER', 'MEMORANDUM', 'SPECIAL ORDER', 'ADVISORY', 'FINANCIAL DOCUMENTS')),
  tracking_number TEXT NOT NULL UNIQUE,
  issuing_body TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'published', 'rejected')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  published_at TEXT,
  created_by TEXT -- Supabase auth user_id UUID string
);

CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Trigger for documents updated_at
CREATE TRIGGER IF NOT EXISTS trg_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW
BEGIN
  UPDATE documents SET updated_at = datetime('now') WHERE id = NEW.id;
END;


-- 2. NEWS TABLE
CREATE TABLE IF NOT EXISTS news (
  id TEXT PRIMARY KEY,
  headline TEXT NOT NULL,
  summary TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  category TEXT NOT NULL DEFAULT 'NEWS',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);

-- Trigger for news updated_at
CREATE TRIGGER IF NOT EXISTS trg_news_updated_at
BEFORE UPDATE ON news
FOR EACH ROW
BEGIN
  UPDATE news SET updated_at = datetime('now') WHERE id = NEW.id;
END;


-- 3. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TEXT,
  is_upcoming INTEGER DEFAULT 0,
  image_urls TEXT,
  location TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date ASC);

-- Trigger for events updated_at
CREATE TRIGGER IF NOT EXISTS trg_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
BEGIN
  UPDATE events SET updated_at = datetime('now') WHERE id = NEW.id;
END;


-- 4. BUDGETARY TRANSPARENCY TABLE
CREATE TABLE IF NOT EXISTS budgetary_transparency (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  status TEXT NOT NULL DEFAULT 'In Progress',
  amount REAL,
  academic_year TEXT DEFAULT '2025-2026',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_budgetary_transparency_status ON budgetary_transparency(status);
CREATE INDEX IF NOT EXISTS idx_budgetary_transparency_created_at ON budgetary_transparency(created_at DESC);

-- Trigger for budgetary_transparency updated_at
CREATE TRIGGER IF NOT EXISTS trg_budgetary_updated_at
BEFORE UPDATE ON budgetary_transparency
FOR EACH ROW
BEGIN
  UPDATE budgetary_transparency SET updated_at = datetime('now') WHERE id = NEW.id;
END;


-- 5. MEMBERS TABLE
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT,
  full_name TEXT,
  slug TEXT,
  role TEXT,
  role_badge TEXT,
  branch TEXT,
  position TEXT,
  title TEXT,
  department TEXT,
  department_name TEXT,
  profile_url TEXT,
  phone_number TEXT,
  email TEXT,
  room_address TEXT,
  trunk_line TEXT,
  direct_line TEXT,
  facebook_url TEXT,
  avatar_url TEXT,
  biography TEXT,
  filed_bills TEXT DEFAULT '[]', -- JSON string of filed bills array
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_members_slug ON members(slug);
CREATE INDEX IF NOT EXISTS idx_members_department ON members(department);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at DESC);

-- Trigger for members updated_at
CREATE TRIGGER IF NOT EXISTS trg_members_updated_at
BEFORE UPDATE ON members
FOR EACH ROW
BEGIN
  UPDATE members SET updated_at = datetime('now') WHERE id = NEW.id;
END;


-- 6. USER PROFILES TABLE (Mirrors Supabase Auth Users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE, -- References Supabase Auth user id
  username TEXT,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'User', -- 'Admin' or 'User'
  is_verified INTEGER DEFAULT 0, -- 0 for false, 1 for true
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Trigger for user_profiles updated_at
CREATE TRIGGER IF NOT EXISTS trg_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
BEGIN
  UPDATE user_profiles SET updated_at = datetime('now') WHERE id = NEW.id;
END;


-- 7. ORG CHARTS TABLE
CREATE TABLE IF NOT EXISTS org_charts (
  chart_key TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Seed initial org chart records
INSERT OR IGNORE INTO org_charts (chart_key, title, subtitle, image_url) VALUES
  ('org1', 'USG Organizational Structure', 'Overall Student Government Tree Hierarchy & Governance Diagram', '/2.webp'),
  ('org2', 'The USG President''s Cabinet Officials', 'Executive Office & Cabinet Officials Roster', '/3.webp'),
  ('org3', 'The USG Executive Branch Cabinet Structure', 'Executive Departments & Departmental Crests Hierarchy', '/org3.webp');


-- 8. CALENDAR EVENTS TABLE
CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT DEFAULT 'Assembly',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date ASC);
CREATE INDEX IF NOT EXISTS idx_calendar_events_category ON calendar_events(category);

-- Trigger for calendar_events updated_at
CREATE TRIGGER IF NOT EXISTS trg_calendar_events_updated_at
BEFORE UPDATE ON calendar_events
FOR EACH ROW
BEGIN
  UPDATE calendar_events SET updated_at = datetime('now') WHERE id = NEW.id;
END;
