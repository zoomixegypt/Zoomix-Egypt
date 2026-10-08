-- Explicit admin classification; never infer test status from customer names.
ALTER TABLE commercial_quotes ADD COLUMN is_test INTEGER NOT NULL DEFAULT 0 CHECK (is_test IN (0,1));
ALTER TABLE brief_requests ADD COLUMN is_test INTEGER NOT NULL DEFAULT 0 CHECK (is_test IN (0,1));
