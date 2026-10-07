ALTER TABLE brief_requests ADD COLUMN edit_token_hash TEXT;
ALTER TABLE brief_requests ADD COLUMN edit_token_expires_at TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_brief_requests_edit_token_hash
  ON brief_requests(edit_token_hash);
