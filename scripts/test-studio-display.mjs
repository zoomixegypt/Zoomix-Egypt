import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { studioLabel, paymentLabel, qaMetricsNote } from "../src/pages/studio/labels.js";
import {
  catalogDescription,
  catalogTerms,
  reviewedCost,
} from "../src/pages/studio/catalogDefaults.js";
import { ZOOMIX_CONTENT_PACKAGES, ZOOMIX_PARTNER_PACKAGES } from "../src/data/zoomixOfferings.js";
assert.match(catalogDescription({id:"content-start",included:{en:["2 short videos from client-provided footage"]}}).en, /shot and edited by the Zoomix team/);
assert.match(catalogDescription({id:"partner-core",included:{en:["4 videos from client-provided footage"]}}).en, /client-provided footage/);
assert.equal(
  catalogDescription({
    description: { ar: "وصف", en: "Scope" },
    included: { ar: ["بند"], en: ["Item"] },
  }).en,
  "Scope\nItem",
);
assert.match(catalogTerms({ category: "partnership" }, "en").conditions, /one deliverable/);
assert.match(
  catalogTerms({ category: "content", id: "content-start" }, "ar").conditions,
  /جلسة تصوير/,
);
assert.equal(
  catalogTerms({ category: "content", type: "addon", id: "extra-reel" }, "ar").conditions,
  "",
);
assert.equal(catalogTerms({ category: "events" }, "en").conditions, "");
assert.equal(catalogTerms({ category: "content", type: "package", id: "custom-shoot" }, "en").conditions, "");
assert.equal(reviewedCost({ cost: 0, costReviewed: true }), true);
assert.equal(reviewedCost({ cost: 0, costPending: true }), false);
assert.equal(reviewedCost({ cost: null }), false);
for (const item of ZOOMIX_CONTENT_PACKAGES) {
  assert.match(item.outputs.en.join(" "), /shoot and content production/);
  assert.match(item.priceNote.ar, /يشمل التصوير وإنتاج المحتوى والمونتاج/);
  assert.match(item.priceNote.ar, /لا يشمل إيجار المعدات أو الانتقالات/);
  assert.match(item.priceNote.en, /Equipment rental and travel are not included/);
}
for (const item of ZOOMIX_PARTNER_PACKAGES)
  assert.match(item.outputs.en.join(" "), /one deliverable/);
for (const state of [
  "confirmed",
  "planning",
  "production",
  "review",
  "delivered",
  "closed",
  "paid",
  "pending",
  "overdue",
  "cancelled",
  "selected",
  "private",
]) {
  assert.notEqual(studioLabel(state, "ar"), state);
  assert.ok(studioLabel(state, "en"));
}
assert.equal(paymentLabel({ type: "custom", label: "مرحلة التصميم" }, "ar"), "مرحلة التصميم");
assert.equal(paymentLabel({ type: "custom", label: "Design review" }, "en"), "Design review");
assert.equal(paymentLabel({ type: "custom" }, "ar"), "دفعة مخصصة");
assert.equal(paymentLabel({ type: "deposit" }, "ar"), "المقدم");
assert.equal(paymentLabel({ type: "balance" }, "en"), "Balance");
assert.match(qaMetricsNote("ar"), /لا تشمل/);
const worker = await readFile("public/_worker.js", "utf8");
assert.equal((worker.match(/type: item.payment_type, label: item.label/g) || []).length, 2);
const quote = await readFile("src/pages/studio/QuoteView.jsx", "utf8");
assert.ok(!quote.includes("valid for 14 days"));
assert.ok(quote.includes("commercial.paymentSchedule?.map"));
assert.ok(quote.includes("commercial.conditions") && quote.includes("commercial.exclusions"));
console.log(
  "PASS: bilingual labels, custom instalments, API label preservation, QA notices and dynamic preview contracts",
);
