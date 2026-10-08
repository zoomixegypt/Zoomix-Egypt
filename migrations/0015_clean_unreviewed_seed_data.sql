-- Only untouched seed records in a workspace with no quotes are reset.
-- Existing edited/published records and workspaces with quotes are preserved.
UPDATE commercial_catalog_items
SET status='draft', visible_on_site=0, published_at=NULL, published_snapshot_json=NULL
WHERE id IN ('presence','content-build','event-signature','extra-reel','landing-page','rush-delivery','cairo-transport')
  AND created_at=updated_at
  AND NOT EXISTS (SELECT 1 FROM commercial_quotes)
  AND NOT EXISTS (SELECT 1 FROM commercial_catalog_versions v WHERE v.catalog_item_id=commercial_catalog_items.id)
  AND NOT EXISTS (SELECT 1 FROM commercial_audit_log a WHERE a.entity_type='catalog_item' AND a.entity_id=commercial_catalog_items.id);

UPDATE commercial_promotions SET status='paused', usage_count=0
WHERE id IN ('launch5','free-reel','november10') AND created_at=updated_at
  AND NOT EXISTS (SELECT 1 FROM commercial_quotes)
  AND NOT EXISTS (SELECT 1 FROM commercial_promotion_redemptions r WHERE r.promotion_id=commercial_promotions.id)
  AND NOT EXISTS (SELECT 1 FROM commercial_audit_log a WHERE a.entity_type='promotion' AND a.entity_id=commercial_promotions.id);
