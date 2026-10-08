ALTER TABLE commercial_catalog_items ADD COLUMN included_json TEXT NOT NULL DEFAULT '{"ar":[],"en":[]}';
ALTER TABLE commercial_catalog_items ADD COLUMN exclusions_ar TEXT NOT NULL DEFAULT '';
ALTER TABLE commercial_catalog_items ADD COLUMN exclusions_en TEXT NOT NULL DEFAULT '';
ALTER TABLE commercial_catalog_items ADD COLUMN duration_ar TEXT NOT NULL DEFAULT '';
ALTER TABLE commercial_catalog_items ADD COLUMN duration_en TEXT NOT NULL DEFAULT '';
ALTER TABLE commercial_catalog_items ADD COLUMN revisions INTEGER NOT NULL DEFAULT 0;
