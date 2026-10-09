CREATE TABLE commercial_attachments (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 project_id INTEGER NOT NULL REFERENCES commercial_projects(id),
 payment_id INTEGER REFERENCES commercial_payments(id),
 filename TEXT NOT NULL, mime_type TEXT NOT NULL,
 size_bytes INTEGER NOT NULL CHECK(size_bytes BETWEEN 1 AND 524288),
 content_base64 TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX idx_attachments_project ON commercial_attachments(project_id);
