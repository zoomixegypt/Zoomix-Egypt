CREATE TABLE IF NOT EXISTS brief_rate_limits (
  fingerprint TEXT PRIMARY KEY,
  window_started_at TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_brief_rate_limits_expires_at ON brief_rate_limits(expires_at);
