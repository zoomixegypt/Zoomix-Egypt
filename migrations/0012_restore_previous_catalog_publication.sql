-- Restore publications saved before draft/public separation.
UPDATE commercial_catalog_items SET published_snapshot_json=(
 SELECT snapshot_json FROM commercial_catalog_versions
 WHERE catalog_item_id=commercial_catalog_items.id AND change_type='published'
 ORDER BY version_number DESC LIMIT 1
) WHERE status='draft' AND published_snapshot_json IS NULL;
UPDATE commercial_catalog_items SET published_snapshot_json=(
 SELECT before_json FROM commercial_audit_log WHERE entity_type='catalog_item'
 AND entity_id=commercial_catalog_items.id AND json_extract(before_json,'$.status')='published'
 ORDER BY id DESC LIMIT 1
) WHERE status='draft' AND published_snapshot_json IS NULL;
