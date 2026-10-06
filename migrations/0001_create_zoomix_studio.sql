CREATE TABLE IF NOT EXISTS brief_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  project TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  contact_preference TEXT NOT NULL,
  preferred_time TEXT DEFAULT '',
  activity TEXT DEFAULT '',
  service TEXT NOT NULL,
  route TEXT DEFAULT '',
  offer_id TEXT DEFAULT '',
  offer_name TEXT DEFAULT '',
  show_type TEXT DEFAULT '',
  content_source TEXT DEFAULT '',
  event_type TEXT DEFAULT '',
  event_date TEXT DEFAULT '',
  event_location TEXT DEFAULT '',
  coverage_type TEXT DEFAULT '',
  stage TEXT DEFAULT '',
  budget TEXT DEFAULT '',
  launch_timeline TEXT DEFAULT '',
  source TEXT DEFAULT '',
  project_link TEXT DEFAULT '',
  goal TEXT DEFAULT '',
  description TEXT NOT NULL,
  consent INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_brief_requests_status ON brief_requests(status);
CREATE INDEX IF NOT EXISTS idx_brief_requests_created_at ON brief_requests(created_at DESC);

CREATE TABLE IF NOT EXISTS studio_sessions (
  token_hash TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_studio_sessions_expires_at ON studio_sessions(expires_at);
