CREATE TABLE IF NOT EXISTS commercial_job_locks (
  name TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
