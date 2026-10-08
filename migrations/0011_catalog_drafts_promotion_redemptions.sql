ALTER TABLE commercial_catalog_items ADD COLUMN published_snapshot_json TEXT;
UPDATE commercial_catalog_items SET published_snapshot_json = json_object(
 'id',id,'item_type',item_type,'category',category,'name_ar',name_ar,'name_en',name_en,
 'description_ar',description_ar,'description_en',description_en,'price_minor',price_minor,
 'currency',currency,'unit',unit,'status','published','visible_on_site',visible_on_site,
 'featured',featured,'sort_order',sort_order,'included_json',included_json,'exclusions_ar',exclusions_ar,
 'exclusions_en',exclusions_en,'duration_ar',duration_ar,'duration_en',duration_en,'revisions',revisions,'updated_at',updated_at
) WHERE status='published';
CREATE TABLE commercial_promotion_redemptions (
 quote_id INTEGER PRIMARY KEY REFERENCES commercial_quotes(id),
 promotion_id TEXT NOT NULL REFERENCES commercial_promotions(id),
 redeemed_at TEXT NOT NULL
);
CREATE TRIGGER quote_acceptance_guard BEFORE UPDATE OF status ON commercial_quotes
WHEN NEW.status='accepted' AND OLD.status='accepted'
BEGIN SELECT RAISE(ABORT, 'Quote already accepted'); END;
CREATE TRIGGER promotion_redemption_guard BEFORE INSERT ON commercial_promotion_redemptions
BEGIN
 SELECT CASE WHEN NOT EXISTS (
  SELECT 1 FROM commercial_promotions WHERE id=NEW.promotion_id
  AND status IN ('active','scheduled') AND (starts_at IS NULL OR starts_at <= NEW.redeemed_at)
  AND (ends_at IS NULL OR ends_at >= NEW.redeemed_at)
  AND (usage_limit IS NULL OR usage_count < usage_limit)
 ) THEN RAISE(ABORT, 'Promotion unavailable or exhausted') END;
END;
CREATE TRIGGER promotion_redemption_count AFTER INSERT ON commercial_promotion_redemptions
BEGIN
 UPDATE commercial_promotions SET usage_count=usage_count+1, updated_at=NEW.redeemed_at WHERE id=NEW.promotion_id;
END;
UPDATE commercial_promotions SET scope_json=json_set(scope_json,'$.catalogIds',json('["presence","content-build","event-signature"]'),'$.freeItemId','extra-reel') WHERE code='FREE-REEL';
