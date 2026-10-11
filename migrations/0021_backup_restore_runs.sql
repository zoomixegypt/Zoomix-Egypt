CREATE TABLE IF NOT EXISTS commercial_backup_restore_runs (
  id TEXT PRIMARY KEY,
  state TEXT NOT NULL CHECK (state IN ('restored', 'rolled_back')),
  backup_hash TEXT NOT NULL,
  previous_backup_json TEXT NOT NULL,
  restored_backup_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  rolled_back_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_backup_restore_runs_state
  ON commercial_backup_restore_runs(state, created_at DESC);
