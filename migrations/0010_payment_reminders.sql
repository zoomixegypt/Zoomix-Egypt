ALTER TABLE commercial_payments ADD COLUMN reminder_sent_at TEXT;

CREATE INDEX IF NOT EXISTS idx_payments_reminder_due
  ON commercial_payments(status, due_at, reminder_sent_at);
