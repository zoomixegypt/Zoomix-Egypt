CREATE TABLE commercial_lead_operations (
 brief_id INTEGER PRIMARY KEY REFERENCES brief_requests(id),
 owner TEXT NOT NULL DEFAULT '', follow_up_at TEXT, loss_reason TEXT NOT NULL DEFAULT '',
 updated_at TEXT NOT NULL
);
CREATE TABLE commercial_project_entries (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 project_id INTEGER NOT NULL REFERENCES commercial_projects(id),
 entry_type TEXT NOT NULL CHECK(entry_type IN ('task','file','expense','team')),
 title TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','done','cancelled')),
 owner TEXT NOT NULL DEFAULT '', due_at TEXT,
 amount_minor INTEGER NOT NULL DEFAULT 0 CHECK(amount_minor>=0),
 created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX idx_project_entries ON commercial_project_entries(project_id,entry_type);
CREATE TABLE commercial_documents (
 id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL REFERENCES commercial_projects(id),
 payment_id INTEGER REFERENCES commercial_payments(id),
 document_type TEXT NOT NULL CHECK(document_type IN ('invoice','receipt','contract')),
 reference TEXT NOT NULL UNIQUE, snapshot_json TEXT NOT NULL, created_at TEXT NOT NULL
);
ALTER TABLE commercial_payments ADD COLUMN method TEXT NOT NULL DEFAULT '';
ALTER TABLE commercial_payments ADD COLUMN collection_reference TEXT NOT NULL DEFAULT '';
ALTER TABLE commercial_payments ADD COLUMN receipt_url TEXT NOT NULL DEFAULT '';
ALTER TABLE commercial_payments ADD COLUMN label TEXT NOT NULL DEFAULT '';
CREATE TABLE commercial_quote_rejections (
 quote_id INTEGER PRIMARY KEY REFERENCES commercial_quotes(id),
 version_number INTEGER NOT NULL, reason TEXT NOT NULL, created_at TEXT NOT NULL
);
ALTER TABLE commercial_quotes ADD COLUMN pricing_approved_version INTEGER;
ALTER TABLE commercial_quotes ADD COLUMN pricing_approval_reason TEXT NOT NULL DEFAULT '';
CREATE TRIGGER declined_quote_response_guard BEFORE UPDATE OF status ON commercial_quotes
WHEN OLD.status='cancelled' AND NEW.status IN ('accepted','revision_requested','viewed','sent')
BEGIN
 SELECT RAISE(ABORT,'Declined quote must have a new draft version');
END;
