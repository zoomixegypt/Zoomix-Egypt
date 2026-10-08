INSERT OR IGNORE INTO commercial_promotions
  (id, code, promotion_type, value_minor, percentage_value, scope_json, usage_limit, usage_count, starts_at, ends_at, status, created_at, updated_at)
VALUES
  ('launch5', 'LAUNCH5', 'percentage', 0, 5, '{"descriptionAr":"خصم 5% على عروض الإطلاق.","descriptionEn":"5% off launch quotes.","scope":"foundation","access":"private"}', 30, 12, '2026-01-01T00:00:00.000Z', '2027-12-31T23:59:59.999Z', 'active', datetime('now'), datetime('now')),
  ('free-reel', 'FREE-REEL', 'free_item', 120000, 0, '{"descriptionAr":"فيديو قصير مجاني مع باقات مختارة.","descriptionEn":"One free short video with selected packages.","scope":"selected","access":"private"}', 10, 4, '2026-01-01T00:00:00.000Z', '2027-12-31T23:59:59.999Z', 'active', datetime('now'), datetime('now')),
  ('november10', 'NOVEMBER10', 'percentage', 0, 10, '{"descriptionAr":"خصم 10% على أول شهر من الشراكة.","descriptionEn":"10% off the first month of a partnership.","scope":"partnership","access":"private"}', 20, 0, '2026-11-01T00:00:00.000Z', '2026-11-30T23:59:59.999Z', 'scheduled', datetime('now'), datetime('now'));
