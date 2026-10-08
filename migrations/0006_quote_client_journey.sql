CREATE TABLE IF NOT EXISTS commercial_quote_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  quote_version_id INTEGER,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'viewed', 'accepted', 'revision_requested')),
  message TEXT NOT NULL DEFAULT '',
  selection_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY (quote_id) REFERENCES commercial_quotes(id),
  FOREIGN KEY (quote_version_id) REFERENCES commercial_quote_versions(id)
);

CREATE INDEX IF NOT EXISTS idx_quote_events_quote
  ON commercial_quote_events(quote_id, created_at DESC);
