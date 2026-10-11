CREATE TABLE IF NOT EXISTS studio_login_rate_limits (
  fingerprint TEXT PRIMARY KEY,
  window_started_at TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_studio_login_rate_limits_expires_at
  ON studio_login_rate_limits(expires_at);
