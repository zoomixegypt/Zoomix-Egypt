CREATE TABLE IF NOT EXISTS commercial_catalog_items (
  id TEXT PRIMARY KEY,
  item_type TEXT NOT NULL CHECK (item_type IN ('package', 'service', 'addon', 'expense')),
  category TEXT NOT NULL DEFAULT '',
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  price_minor INTEGER NOT NULL DEFAULT 0 CHECK (price_minor >= 0),
  cost_minor INTEGER NOT NULL DEFAULT 0 CHECK (cost_minor >= 0),
  minimum_price_minor INTEGER NOT NULL DEFAULT 0 CHECK (minimum_price_minor >= 0),
  currency TEXT NOT NULL DEFAULT 'EGP',
  unit TEXT NOT NULL DEFAULT 'project',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  visible_on_site INTEGER NOT NULL DEFAULT 0 CHECK (visible_on_site IN (0, 1)),
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_catalog_status_sort
  ON commercial_catalog_items(status, sort_order, updated_at DESC);

CREATE TABLE IF NOT EXISTS commercial_catalog_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  catalog_item_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  snapshot_json TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'draft_saved', 'published', 'archived')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (catalog_item_id) REFERENCES commercial_catalog_items(id),
  UNIQUE(catalog_item_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_catalog_versions_item
  ON commercial_catalog_versions(catalog_item_id, version_number DESC);

CREATE TABLE IF NOT EXISTS commercial_quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_code TEXT NOT NULL UNIQUE,
  brief_request_id INTEGER,
  client_name TEXT NOT NULL DEFAULT '',
  project_name TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'revision_requested', 'accepted', 'expired', 'cancelled')),
  current_version INTEGER NOT NULL DEFAULT 1,
  public_token_hash TEXT UNIQUE,
  expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (brief_request_id) REFERENCES brief_requests(id)
);

CREATE INDEX IF NOT EXISTS idx_quotes_status_updated
  ON commercial_quotes(status, updated_at DESC);

CREATE TABLE IF NOT EXISTS commercial_quote_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  version_number INTEGER NOT NULL,
  subtotal_minor INTEGER NOT NULL DEFAULT 0,
  discount_minor INTEGER NOT NULL DEFAULT 0,
  tax_minor INTEGER NOT NULL DEFAULT 0,
  total_minor INTEGER NOT NULL DEFAULT 0,
  internal_cost_minor INTEGER NOT NULL DEFAULT 0,
  deposit_percent REAL NOT NULL DEFAULT 0,
  timeline_text TEXT NOT NULL DEFAULT '',
  revisions INTEGER NOT NULL DEFAULT 0,
  terms_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY (quote_id) REFERENCES commercial_quotes(id),
  UNIQUE(quote_id, version_number)
);

CREATE TABLE IF NOT EXISTS commercial_quote_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_version_id INTEGER NOT NULL,
  catalog_item_id TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  quantity REAL NOT NULL DEFAULT 1,
  unit_price_minor INTEGER NOT NULL DEFAULT 0,
  cost_minor INTEGER NOT NULL DEFAULT 0,
  discount_minor INTEGER NOT NULL DEFAULT 0,
  optional INTEGER NOT NULL DEFAULT 0 CHECK (optional IN (0, 1)),
  FOREIGN KEY (quote_version_id) REFERENCES commercial_quote_versions(id),
  FOREIGN KEY (catalog_item_id) REFERENCES commercial_catalog_items(id)
);

CREATE TABLE IF NOT EXISTS commercial_promotions (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  promotion_type TEXT NOT NULL CHECK (promotion_type IN ('percentage', 'fixed', 'free_item')),
  value_minor INTEGER NOT NULL DEFAULT 0,
  percentage_value REAL NOT NULL DEFAULT 0,
  scope_json TEXT NOT NULL DEFAULT '{}',
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  starts_at TEXT,
  ends_at TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'expired', 'archived')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS commercial_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  before_json TEXT,
  after_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_commercial_audit_entity
  ON commercial_audit_log(entity_type, entity_id, created_at DESC);

INSERT OR IGNORE INTO commercial_catalog_items
  (id, item_type, category, name_ar, name_en, description_ar, description_en, price_minor, cost_minor, minimum_price_minor, currency, unit, status, visible_on_site, featured, sort_order, created_at, updated_at, published_at)
VALUES
  ('presence', 'package', 'foundation', 'الحضور', 'Presence', 'هوية ومحتوى بداية وصفحة هبوط ومطبوعات أساسية.', 'Identity, launch content, landing page and essential print.', 1100000, 570000, 900000, 'EGP', 'project', 'published', 1, 1, 10, datetime('now'), datetime('now'), datetime('now')),
  ('content-build', 'package', 'content', 'محتوى التطوير', 'Content Build', 'جلسة إنتاج ومحتوى متنوع لحضور أقوى.', 'A focused production session with varied content for a stronger presence.', 700000, 390000, 600000, 'EGP', 'project', 'published', 1, 0, 20, datetime('now'), datetime('now'), datetime('now')),
  ('event-signature', 'package', 'events', 'التغطية الكاملة', 'Event Signature', 'تغطية متزامنة كاملة بالصور والفيديو.', 'Full parallel photo and video event coverage.', 1250000, 730000, 1050000, 'EGP', 'event', 'published', 1, 0, 30, datetime('now'), datetime('now'), datetime('now')),
  ('extra-reel', 'addon', 'content', 'فيديو قصير إضافي', 'Extra short video', 'مونتاج فيديو رأسي إضافي من خامات المشروع.', 'One extra vertical edit from project footage.', 120000, 50000, 100000, 'EGP', 'video', 'published', 1, 0, 40, datetime('now'), datetime('now'), datetime('now')),
  ('landing-page', 'service', 'digital', 'صفحة هبوط', 'Landing Page', 'صفحة واحدة حتى ستة أقسام.', 'One-page website up to six sections.', 350000, 165000, 290000, 'EGP', 'page', 'published', 1, 0, 50, datetime('now'), datetime('now'), datetime('now')),
  ('rush-delivery', 'addon', 'operations', 'تسليم سريع', 'Rush delivery', 'أولوية إنتاج وتقليل المدة المتفق عليها.', 'Production priority and a shorter agreed timeline.', 200000, 70000, 160000, 'EGP', 'project', 'published', 0, 0, 60, datetime('now'), datetime('now'), datetime('now')),
  ('cairo-transport', 'expense', 'production', 'انتقالات القاهرة', 'Cairo transport', 'انتقالات فريق الإنتاج داخل القاهرة.', 'Production-team transport inside Cairo.', 60000, 40000, 50000, 'EGP', 'day', 'published', 1, 0, 70, datetime('now'), datetime('now'), datetime('now'));
