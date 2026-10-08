CREATE TRIGGER accepted_quote_version_guard BEFORE UPDATE OF current_version ON commercial_quotes
WHEN OLD.status='accepted' AND NEW.current_version!=OLD.current_version
BEGIN SELECT RAISE(ABORT,'Quote already accepted'); END;
CREATE TRIGGER quote_acceptance_version_guard BEFORE INSERT ON commercial_quote_events
WHEN NEW.event_type='accepted'
BEGIN
 SELECT CASE WHEN NOT EXISTS (
  SELECT 1 FROM commercial_quotes q JOIN commercial_quote_versions v ON v.quote_id=q.id
  WHERE q.id=NEW.quote_id AND q.status='accepted' AND v.id=NEW.quote_version_id AND q.current_version=v.version_number
 ) THEN RAISE(ABORT,'Quote changed during acceptance') END;
END;
