-- A stale request cannot reopen a legally accepted quote.
CREATE TRIGGER accepted_quote_status_guard BEFORE UPDATE OF status ON commercial_quotes
WHEN OLD.status='accepted' AND NEW.status!='accepted'
BEGIN
 SELECT RAISE(ABORT,'Quote already accepted');
END;

CREATE TRIGGER quote_revision_version_guard BEFORE INSERT ON commercial_quote_events
WHEN NEW.event_type='revision_requested' AND NOT EXISTS (
  SELECT 1 FROM commercial_quotes q JOIN commercial_quote_versions v ON v.quote_id=q.id
  WHERE q.id=NEW.quote_id AND q.status='revision_requested' AND v.id=NEW.quote_version_id AND q.current_version=v.version_number
 )
BEGIN
 SELECT RAISE(ABORT,'Quote changed during revision');
END;
