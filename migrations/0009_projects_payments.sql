CREATE TABLE IF NOT EXISTS commercial_projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL UNIQUE,
  reference_code TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL DEFAULT '',
  project_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'confirmed',
  contract_value_minor INTEGER NOT NULL DEFAULT 0,
  expected_cost_minor INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (quote_id) REFERENCES commercial_quotes(id)
);

CREATE TABLE IF NOT EXISTS commercial_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('deposit', 'balance', 'custom')),
  amount_minor INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  due_at TEXT,
  paid_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES commercial_projects(id)
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON commercial_projects(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON commercial_payments(status, due_at);
