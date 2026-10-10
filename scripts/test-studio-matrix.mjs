// Exploratory acceptance matrix. All writes are to an in-memory SQLite database.
import { readFile, readdir } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import vm from "node:vm";
import {
  businessOperations,
  quoteCommercialTerms,
  instalments,
  limitedJson,
} from "../public/business-operations.js";
import { webcrypto } from "node:crypto";
import { calculateCommercial, promotionError } from "../public/commercial-rules.js";

const db = new DatabaseSync(":memory:");
db.exec("PRAGMA foreign_keys=ON");
for (const name of (await readdir("migrations")).filter((n) => n.endsWith(".sql")).sort())
  db.exec(await readFile(`migrations/${name}`, "utf8"));
const env = {
  STUDIO_PASSWORD: "qa-only",
  DB: {
    prepare(sql) {
      return {
        params: [],
        bind(...p) {
          this.params = p;
          return this;
        },
        async first() {
          return db.prepare(sql).get(...this.params) || null;
        },
        async all() {
          return { results: db.prepare(sql).all(...this.params) };
        },
        async run() {
          if (/^SELECT/i.test(sql.trim())) return { results: db.prepare(sql).all(...this.params) };
          const r = db.prepare(sql).run(...this.params);
          return { meta: { last_row_id: Number(r.lastInsertRowid), changes: Number(r.changes) } };
        },
      };
    },
    async batch(statements) {
      db.exec("BEGIN");
      try {
        const r = [];
        for (const s of statements) r.push(await s.run());
        db.exec("COMMIT");
        return r;
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    },
  },
};
const source = (await readFile("public/_worker.js", "utf8"))
  .replace(/^import .*\n/gm, "")
  .replace(
    "export async function processPaymentReminders",
    "async function processPaymentReminders",
  )
  .replace("export class StudioLiveUpdates", "class StudioLiveUpdates")
  .replace("export default {", "const worker = {");
const c = vm.createContext({
  businessOperations,
  quoteCommercialTerms,
  instalments,
  limitedJson,
  calculateCommercial,
  promotionError,
  DurableObject: class {},
  crypto: webcrypto,
  Request,
  Response,
  URL,
  Date,
  console,
  setTimeout,
  clearTimeout,
  TextEncoder,
  AbortSignal,
  fetch: async () => Response.json({ ok: true }),
});
vm.runInContext(source, c);
// Legacy matrix fixtures intentionally use very low prices. Approvals are explicit,
// audited fixture setup, not an application bypass. New pricing tests call rawSend.
const rawSend = c.studioQuoteSend;
c.studioQuoteSend = async (request, environment, ctx, id) => {
  const q = db.prepare("SELECT current_version FROM commercial_quotes WHERE id=?").get(id);
  if (q)
    await c.studioPricingApproval(
      new Request(request.url, {
        method: "POST",
        headers: request.headers,
        body: JSON.stringify({
          baseVersion: q.current_version,
          reason: "Isolated legacy QA fixture approval",
        }),
      }),
      environment,
      id,
    );
  return rawSend(request, environment, ctx, id);
};
const login = await c.studioLogin(
  new Request("https://test/api/studio/login", {
    method: "POST",
    body: JSON.stringify({ password: "qa-only" }),
  }),
  env,
);
const cookie = login.headers.get("set-cookie").split(";")[0];
const req = (payload = {}, authenticated = true) =>
  new Request("https://test/api/studio/qa", {
    method: "POST",
    headers: authenticated ? { Cookie: cookie } : {},
    body: JSON.stringify(payload),
  });
const results = [];
const check = async (name, expected, fn) => {
  try {
    const r = await fn();
    const actual = r instanceof Response ? r.status : r;
    results.push({ name, expected, actual, result: actual === expected ? "PASS" : "FAIL" });
  } catch (e) {
    results.push({ name, expected, actual: String(e.message), result: "FAIL" });
  }
};
const line = {
  catalogId: "presence",
  name: { ar: "اختبار", en: "QA" },
  description: { ar: "QA", en: "QA" },
  quantity: 1,
  unitPrice: 1000,
  cost: 400,
};
const valid = {
  clientName: "QA",
  projectName: "QA",
  timeline: "QA only",
  items: [line],
  taxPercent: 14,
  depositPercent: 60,
  revisions: 2,
};

for (const name of [
  "studioRequests",
  "studioCatalog",
  "studioQuotes",
  "studioProjects",
  "studioPayments",
  "studioPromotions",
  "studioIntegrations",
  "studioAudit",
  "studioInsights",
  "studioExport",
  "studioBackup",
])
  await check(`auth:${name}`, 401, () => c[name](req({}, false), env));
for (const [name, patch] of [
  ["empty items", { items: [] }],
  ["101 items", { items: Array.from({ length: 101 }, () => ({ ...line })) }],
  ["zero quantity", { items: [{ ...line, quantity: 0 }] }],
  ["negative quantity", { items: [{ ...line, quantity: -1 }] }],
  ["negative price", { items: [{ ...line, unitPrice: -1 }] }],
  ["negative cost", { items: [{ ...line, cost: -1 }] }],
  ["unknown cost", { items: [{ ...line, cost: null, costPending: true }] }],
  ["missing English name", { items: [{ ...line, name: { ar: "QA", en: "" } }] }],
  ["negative tax", { taxPercent: -1 }],
  ["tax over 100", { taxPercent: 101 }],
  ["negative deposit", { depositPercent: -1 }],
  ["deposit over 100", { depositPercent: 101 }],
  ["fractional revisions", { revisions: 1.5 }],
  ["revisions over 100", { revisions: 101 }],
  ["missing client name", { clientName: "" }],
  ["missing project name", { projectName: "" }],
  ["missing duration", { timeline: "" }],
  ["null item", { items: [null] }],
  ["unknown catalog ID", { items: [{ ...line, catalogId: "not-existing" }] }],
])
  await check(`quote rejects:${name}`, 400, () =>
    c.studioQuoteCreate(req({ ...valid, ...patch }), env),
  );
await check("quote valid create", 201, () => c.studioQuoteCreate(req(valid), env));
const promo = {
  code: "QA-MATRIX",
  kind: "percentage",
  value: 10,
  limit: 2,
  scope: "selected",
  catalogIds: ["presence"],
  startsAt: "2020-01-01",
  endsAt: "2099-01-01",
};
for (const [name, patch] of [
  ["percentage >80", { value: 81 }],
  ["zero discount", { value: 0 }],
  ["negative value", { value: -1 }],
  ["invalid kind", { kind: "unsupported" }],
  ["bad code", { code: "!" }],
  ["no eligible items", { catalogIds: [] }],
  ["nonexistent eligible item", { catalogIds: ["not-existing"] }],
  ["free item omitted", { kind: "free-item" }],
  ["free service instead of addon", { kind: "free-item", freeItemId: "presence" }],
  ["invalid date", { startsAt: "nonsense" }],
  ["end before start", { endsAt: "2010-01-01" }],
  ["fractional usage limit", { limit: 1.5 }],
  ["zero usage limit", { limit: 0 }],
  ["invalid scope", { scope: "not-existing" }],
])
  await check(`promo rejects:${name}`, 400, () =>
    c.studioPromotionCreate(req({ ...promo, ...patch }), env),
  );
await check("promo create", 201, () => c.studioPromotionCreate(req(promo), env));
await check("promo duplicate code", 409, () => c.studioPromotionCreate(req(promo), env));
await check("catalog negative price", 400, () =>
  c.studioCatalogCreate(
    req({
      id: "qa-negative",
      name: { ar: "QA", en: "QA" },
      price: -1,
      cost: 0,
      minimumPrice: 0,
      type: "service",
    }),
    env,
  ),
);
await check("catalog nonexistent update", 404, () =>
  c.studioCatalogUpdate(req({ price: 1 }), env, "not-existing"),
);
await check("quote nonexistent detail", 404, () => c.studioQuoteDetail(req(), env, 99999));
await check("quote nonexistent send", 404, () => c.studioQuoteSend(req(), env, null, 99999));
await check("payment nonexistent update", 404, () =>
  c.studioPaymentUpdate(req({ status: "paid" }), env, 99999),
);
await check("payment invalid status", 400, () =>
  c.studioPaymentUpdate(req({ status: "unknown" }), env, 99999),
);
await check("promo nonexistent update", 404, () =>
  c.studioPromotionUpdate(req({ status: "active" }), env, "not-existing"),
);
await check("public invalid token", 404, () =>
  c.publicQuote(
    new Request("https://test/api/quotes/x/x"),
    env,
    null,
    "QT-INVALID",
    "a".repeat(64),
  ),
);
const created = await (await c.studioQuoteCreate(req(valid), env)).json();
const id = created.quote.id;
await check("stale base version", 409, () =>
  c.studioQuoteNewVersion(req({ ...valid, baseVersion: 999 }), env, id),
);
const issued = await (await c.studioQuoteSend(req(), env, null, id)).json();
const token = new URL(issued.clientUrl).pathname.split("/").pop();
const ref = created.quote.reference;
await check("public accept without consent", 400, () =>
  c.publicQuoteRespond(req({ action: "accept", termsAccepted: false }), env, null, ref, token),
);
await check("public empty revision", 400, () =>
  c.publicQuoteRespond(req({ action: "revision", message: "" }), env, null, ref, token),
);
await check("public unknown action", 400, () =>
  c.publicQuoteRespond(req({ action: "unknown" }), env, null, ref, token),
);
await check("public accept", 200, () =>
  c.publicQuoteRespond(req({ action: "accept", termsAccepted: true }), env, null, ref, token),
);
await check("public duplicate accept", 409, () =>
  c.publicQuoteRespond(req({ action: "accept", termsAccepted: true }), env, null, ref, token),
);
await check("accepted quote immutable", 409, () =>
  c.studioQuoteNewVersion(req({ ...valid, baseVersion: 1 }), env, id),
);
await check("accepted quote cannot resend", 409, () => c.studioQuoteSend(req(), env, null, id));
await check("accepted project count", 1, () =>
  Number(db.prepare("SELECT COUNT(*) n FROM commercial_projects WHERE quote_id=?").get(id).n),
);
await check("accepted payment count", 2, () =>
  Number(
    db
      .prepare(
        "SELECT COUNT(*) n FROM commercial_payments p JOIN commercial_projects j ON j.id=p.project_id WHERE j.quote_id=?",
      )
      .get(id).n,
  ),
);
db.prepare("UPDATE commercial_quotes SET expires_at=? WHERE id=?").run("2000-01-01T00:00:00Z", id);
await check("public expired token", 404, () =>
  c.publicQuote(new Request("https://test"), env, null, ref, token),
);
for (const [name, p] of [
  ["paused", { status: "paused" }],
  ["expired", { status: "active", endsAt: "2000-01-01" }],
  ["future", { status: "scheduled", startsAt: "2099-01-01" }],
  ["exhausted", { status: "active", uses: 2, limit: 2 }],
])
  await check(`promo rule:${name}`, true, () => Boolean(promotionError(p)));
await check(
  "fixed discount capped at total",
  0,
  () =>
    calculateCommercial([{ quantity: 1, unitPrice: 10 }], {
      kind: "fixed",
      scope: "all",
      value: 100,
    }).totalMinor,
);
const validBrief = {
  name: "QA",
  service: "QA",
  description: "QA",
  contactPreference: "call",
  phone: "+12025550106",
  consent: true,
};
for (const [name, patch] of [
  ["name required", { name: "" }],
  ["service required", { service: "" }],
  ["description required", { description: "" }],
  ["phone required", { phone: "" }],
  ["consent required", { consent: false }],
  ["invalid contact", { contactPreference: "unknown" }],
  ["invalid email", { contactPreference: "email", email: "bad" }],
  ["honeypot", { website: "spam" }],
  ["show subtype required", { route: "show", showType: "" }],
  ["event date required", { route: "show", showType: "events", eventDate: "" }],
])
  await check(`brief rejects:${name}`, true, () =>
    Boolean(
      c.validateBrief(c.briefFromPayload({ ...validBrief, ...patch }, "QA"), {
        ...validBrief,
        ...patch,
      }),
    ),
  );
for (const [name, patch] of [
  ["call", {}],
  ["WhatsApp", { contactPreference: "whatsapp" }],
  ["email", { contactPreference: "email", email: "qa@example.com", phone: "" }],
])
  await check(`brief accepts:${name}`, "", () =>
    c.validateBrief(c.briefFromPayload({ ...validBrief, ...patch }, "QA"), {
      ...validBrief,
      ...patch,
    }),
  );
const beforeOrphan = Number(db.prepare("SELECT COUNT(*) n FROM commercial_quotes").get().n);
await check("brief rejects alphabetic phone", true, () =>
  Boolean(
    c.validateBrief(c.briefFromPayload({ ...validBrief, phone: "not-a-phone" }, "QA"), validBrief),
  ),
);
for (const eventDate of ["not-a-date", "2026-02-30", "2026-13-01"])
  await check(`brief rejects invalid event date:${eventDate}`, true, () =>
    Boolean(
      c.validateBrief(
        c.briefFromPayload({ ...validBrief, route: "show", showType: "events", eventDate }, "QA"),
        validBrief,
      ),
    ),
  );
try {
  await c.studioQuoteCreate(
    req({ ...valid, items: [{ ...line, catalogId: "not-existing" }] }),
    env,
  );
} catch {}
await check(
  "failed quote create has no orphan record",
  0,
  () => Number(db.prepare("SELECT COUNT(*) n FROM commercial_quotes").get().n) - beforeOrphan,
);
for (const [name, p] of [
  ["null", null],
  ["array", []],
])
  await check(`invalid body:${name}`, 400, () => c.studioQuoteCreate(req(p), env));
const rateRequest = new Request("https://test/api/briefs", {
  headers: { "CF-Connecting-IP": "192.0.2.123", "User-Agent": "QA-matrix" },
});
for (let i = 1; i <= 5; i++)
  await check(
    `brief rate limit accepts ${i}`,
    true,
    async () => (await c.enforceBriefRateLimit(rateRequest, env)).allowed,
  );
await check(
  "brief rate limit rejects sixth",
  false,
  async () => (await c.enforceBriefRateLimit(rateRequest, env)).allowed,
);
db.exec("UPDATE brief_rate_limits SET expires_at='2000-01-01T00:00:00Z'");
await check(
  "brief rate limit resets after expiry",
  true,
  async () => (await c.enforceBriefRateLimit(rateRequest, env)).allowed,
);
await check("invalid brief edit token", 404, () =>
  c.getBriefForEdit(new Request("https://test"), env, "a".repeat(64)),
);
await check("CSV formula text neutralized", true, () => c.csvCell("=1+1").startsWith("\"'"));
for (const attribute of ["HttpOnly", "Secure", "SameSite=Lax"])
  await check(`session cookie:${attribute}`, true, () =>
    login.headers.get("set-cookie").includes(attribute),
  );
// Regression tests for the fixes, including forced storage failures.
for (const f of [
  "studioCatalogCreate",
  "studioPromotionCreate",
  "studioPromotionUpdate",
  "studioPaymentUpdate",
  "studioQuoteNewVersion",
]) {
  const target =
    f === "studioPromotionUpdate"
      ? db.prepare("SELECT id FROM commercial_promotions LIMIT 1").get().id
      : f === "studioQuoteNewVersion"
        ? db.prepare("SELECT id FROM commercial_quotes WHERE status='draft' LIMIT 1").get().id
        : id;
  await check(`null body safe:${f}`, 400, () => c[f](req(null), env, target));
}
await check(
  "non-event payload clears stale event fields",
  "",
  () =>
    c.briefFromPayload(
      {
        ...validBrief,
        route: "continue",
        showType: "events",
        eventDate: "2030-01-01",
        eventLocation: "stale",
      },
      "QA",
    ).eventDate,
);
await check(
  "event payload keeps relevant event fields",
  "2030-01-01",
  () =>
    c.briefFromPayload(
      { ...validBrief, route: "show", showType: "events", eventDate: "2030-01-01" },
      "QA",
    ).eventDate,
);
await check("accepted status cannot be reopened", true, () => {
  try {
    db.prepare("UPDATE commercial_quotes SET status='sent' WHERE id=?").run(id);
    return false;
  } catch {
    return true;
  }
});
for (const prefix of ["=", "+", "-", "@", " ="])
  await check(`CSV safe prefix:${prefix}`, true, () => c.csvCell(`${prefix}1`).startsWith("\"'"));
await check("test flag anonymous denied", 401, () =>
  c.studioQuoteTestMode(req({ isTest: true }, false), env, id),
);
await check("test flag rejects non-boolean", 400, () =>
  c.studioQuoteTestMode(req({ isTest: "true" }), env, id),
);
await check("test flag accepted quote annotation", 200, () =>
  c.studioQuoteTestMode(req({ isTest: true }), env, id),
);
await check(
  "project inherits test flag",
  true,
  async () =>
    (await (await c.studioProjects(req(), env)).json()).projects.find((p) => p.quoteId === id)
      .isTest,
);
await check("payments inherit test flag", true, async () =>
  (await (await c.studioPayments(req(), env)).json()).payments
    .filter(
      (p) =>
        p.projectId ===
        Number(db.prepare("SELECT id FROM commercial_projects WHERE quote_id=?").get(id).id),
    )
    .every((p) => p.isTest),
);
db.prepare("UPDATE commercial_quotes SET expires_at=? WHERE id=?").run("2099-01-01T00:00:00Z", id);
await check("accepted page returns persisted selection", true, async () =>
  Array.isArray(
    (await (await c.publicQuote(new Request("https://test"), env, null, ref, token)).json()).quote
      .selectedOptionalItemIds,
  ),
);
const beforeFailure = Number(db.prepare("SELECT COUNT(*) n FROM commercial_quotes").get().n);
db.exec(
  "CREATE TRIGGER qa_force_insert_failure BEFORE INSERT ON commercial_quote_items BEGIN SELECT RAISE(ABORT,'QA forced item failure'); END",
);
try {
  await c.studioQuoteCreate(req(valid), env);
} catch {}
await check("forced item failure rolls back quote", beforeFailure, () =>
  Number(db.prepare("SELECT COUNT(*) n FROM commercial_quotes").get().n),
);
db.exec("DROP TRIGGER qa_force_insert_failure");
const draft = (await (await c.studioQuoteCreate(req(valid), env)).json()).quote;
db.exec(
  "CREATE TRIGGER qa_force_version_failure BEFORE INSERT ON commercial_quote_items BEGIN SELECT RAISE(ABORT,'QA forced version failure'); END",
);
try {
  await c.studioQuoteNewVersion(req({ ...valid, baseVersion: 1 }), env, draft.id);
} catch {}
await check("failed version preserves current version", 1, () =>
  Number(
    db.prepare("SELECT current_version FROM commercial_quotes WHERE id=?").get(draft.id)
      .current_version,
  ),
);
await check("failed version leaves no orphan", 1, () =>
  Number(
    db.prepare("SELECT COUNT(*) n FROM commercial_quote_versions WHERE quote_id=?").get(draft.id).n,
  ),
);
db.exec("DROP TRIGGER qa_force_version_failure");
const revisionLink = await (await c.studioQuoteSend(req(), env, null, draft.id)).json();
const revisionToken = new URL(revisionLink.clientUrl).pathname.split("/").pop();
await check("valid revision succeeds", 200, () =>
  c.publicQuoteRespond(
    req({ action: "revision", message: "QA lower quantity" }),
    env,
    null,
    draft.reference,
    revisionToken,
  ),
);
await check(
  "admin sees requested change",
  "QA lower quantity",
  async () =>
    (await (await c.studioQuoteDetail(req(), env, draft.id)).json()).draft.revisionRequest.message,
);
// Expanded commercial workflows are isolated; no real contracts or messages.
const op = (path, data, authenticated = true) =>
  businessOperations(
    new Request(`https://test/api/studio/${path}`, {
      method: data === undefined ? "GET" : "POST",
      headers: authenticated ? { Cookie: cookie } : {},
      ...(data === undefined ? {} : { body: JSON.stringify(data) }),
    }),
    env,
    c.authenticateStudio,
  );
for (const path of ["lead-operations", "project-workspace/1", "payment-details/1", "documents/1"])
  await check(`business auth:${path}`, 401, () => op(path, undefined, false));
for (const patch of [
  { expiryDays: 0 },
  { expiryDays: 91 },
  { paymentSchedule: [{ label: "A", percent: 90, days: 0 }] },
  { paymentSchedule: [{ label: "A", percent: 100, days: -1 }] },
  { paymentSchedule: null },
])
  await check(`commercial terms reject:${JSON.stringify(patch)}`, 400, () =>
    c.studioQuoteCreate(req({ ...valid, ...patch }), env),
  );
const scopedQuote = (
  await (
    await c.studioQuoteCreate(
      req({
        ...valid,
        conditions: "QA public conditions",
        exclusions: "QA exclusions",
        internalNotes: "DO NOT SHARE INTERNAL SECRET",
        expiryDays: 7,
        paymentSchedule: [
          { label: "First", percent: 33.33, days: 0 },
          { label: "Second", percent: 33.33, days: 10 },
          { label: "Final", percent: 33.34, days: 20 },
        ],
      }),
      env,
    )
  ).json()
).quote;
await check("minimum price sending blocked", 409, () => rawSend(req(), env, null, scopedQuote.id));
await check("pricing approval missing reason", 400, () =>
  c.studioPricingApproval(
    req({ baseVersion: scopedQuote.version, reason: "" }),
    env,
    scopedQuote.id,
  ),
);
await check("pricing approval stale version", 409, () =>
  c.studioPricingApproval(req({ baseVersion: 999, reason: "QA" }), env, scopedQuote.id),
);
await check("pricing approval explicit reason", 200, () =>
  c.studioPricingApproval(
    req({ baseVersion: scopedQuote.version, reason: "QA isolated min price exception" }),
    env,
    scopedQuote.id,
  ),
);
const scopedSent = await (await rawSend(req(), env, null, scopedQuote.id)).json();
const scopedToken = new URL(scopedSent.clientUrl).pathname.split("/").pop();
await check(
  "configurable seven day expiry",
  true,
  () => Math.abs(Date.parse(scopedSent.expiresAt) - Date.now() - 7 * 86400000) < 10000,
);
const scopedRead = await (
  await c.publicQuote(req(), env, null, scopedQuote.reference, scopedToken)
).json();
await check("public terms visible", "QA public conditions", () => scopedRead.quote.conditions);
await check("public internal notes never leaked", false, () =>
  JSON.stringify(scopedRead).includes("DO NOT SHARE INTERNAL SECRET"),
);
await check("custom instalment acceptance", 200, () =>
  c.publicQuoteRespond(
    req({ action: "accept", termsAccepted: true }),
    env,
    null,
    scopedQuote.reference,
    scopedToken,
  ),
);
const scopedProject = db
  .prepare("SELECT * FROM commercial_projects WHERE quote_id=?")
  .get(scopedQuote.id);
await check("attachment auth protected", 401, () =>
  op(`attachments/${scopedProject.id}`, undefined, false),
);
await check("unsafe attachment rejected", 400, () =>
  op(`attachments/${scopedProject.id}`, {
    filename: "evil.html",
    contentBase64: btoa("<script>alert(1)</script>"),
  }),
);
await check("oversized attachment rejected", 413, () =>
  op(`attachments/${scopedProject.id}`, {
    filename: "huge.pdf",
    contentBase64: "A".repeat(700001),
  }),
);
await check("invalid attachment base64 rejected", 400, () =>
  op(`attachments/${scopedProject.id}`, { filename: "bad.pdf", contentBase64: "@@invalid@@" }),
);
const pngFixture =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX9sAAAAASUVORK5CYII=";
await check("private image attachment stored", 201, () =>
  op(`attachments/${scopedProject.id}`, { filename: "qa.png", contentBase64: pngFixture }),
);
const attachment = db
  .prepare("SELECT id FROM commercial_attachments WHERE project_id=?")
  .get(scopedProject.id);
await check("attachment list excludes bytes", false, async () =>
  JSON.stringify(await (await op(`attachments/${scopedProject.id}`)).json()).includes(
    "content_base64",
  ),
);
const download = await businessOperations(
  new Request(`https://test/api/studio/attachments/${attachment.id}?download=1`, {
    headers: { Cookie: cookie },
  }),
  env,
  c.authenticateStudio,
);
await check("attachment download is forced", true, () =>
  download.headers.get("Content-Disposition").startsWith("attachment;"),
);
await check("attachment bytes match", pngFixture, async () =>
  Buffer.from(await download.arrayBuffer()).toString("base64"),
);
await check("cross-origin write rejected", 403, () =>
  c.api(
    new Request("https://test/api/studio/lead-operations/1", {
      method: "POST",
      headers: { Cookie: cookie, Origin: "https://evil.test" },
      body: "{}",
    }),
    env,
    null,
  ),
);
await check("large request rejected before parsing", 413, () =>
  c.api(
    new Request("https://test/api/studio/lead-operations/1", {
      method: "POST",
      headers: { Cookie: cookie, "Content-Length": "1048577" },
      body: "{}",
    }),
    env,
    null,
  ),
);
await check("tiny amount schedule has no negative rounding", true, () =>
  instalments(
    1,
    {
      paymentSchedule: Array.from({ length: 10 }, (_, i) => ({
        label: String(i),
        percent: 10,
        days: i,
      })),
    },
    0,
    "2026-01-01T00:00:00Z",
  ).every((row) => row.amount >= 0),
);
const scopedPayments = db
  .prepare("SELECT * FROM commercial_payments WHERE project_id=? ORDER BY id")
  .all(scopedProject.id);
await check("three instalments created", 3, () => scopedPayments.length);
await check("instalments exact amount conservation", scopedProject.contract_value_minor, () =>
  scopedPayments.reduce((sum, row) => sum + row.amount_minor, 0),
);
await check(
  "zero negative instalments",
  0,
  () => scopedPayments.filter((row) => row.amount_minor < 0).length,
);
await check("payment unsafe receipt URL rejected", 400, () =>
  op(`payment-details/${scopedPayments[0].id}`, { receiptUrl: "javascript:alert(1)" }),
);
await check("payment metadata save", 200, () =>
  op(`payment-details/${scopedPayments[0].id}`, {
    method: "QA cash",
    reference: "QA-001",
    receiptUrl: "https://example.com/qa-receipt",
  }),
);
await check("receipt cannot precede payment", 409, () =>
  op(`documents/${scopedProject.id}`, { type: "receipt", paymentId: scopedPayments[0].id }),
);
await check("invoice generated", 201, () =>
  op(`documents/${scopedProject.id}`, { type: "invoice" }),
);
await check("contract draft generated", 201, () =>
  op(`documents/${scopedProject.id}`, { type: "contract" }),
);
await check("documents exclude internal costs and notes", false, () =>
  db
    .prepare("SELECT snapshot_json FROM commercial_documents WHERE project_id=?")
    .all(scopedProject.id)
    .some((row) => /DO NOT SHARE|expected_cost|internalNotes|public_token/.test(row.snapshot_json)),
);
await check("project invalid phase rejected", 400, () =>
  op(`project-workspace/${scopedProject.id}`, { projectStatus: "fake" }),
);
await check("project production phase", 200, () =>
  op(`project-workspace/${scopedProject.id}`, { projectStatus: "production" }),
);
for (const type of ["task", "team", "expense"])
  await check(`project add:${type}`, 201, () =>
    op(`project-workspace/${scopedProject.id}`, {
      type,
      title: `QA ${type}`,
      owner: "QA owner",
      detail: "QA only",
      amount: 55.5,
    }),
  );
await check("project file unsafe link denied", 400, () =>
  op(`project-workspace/${scopedProject.id}`, {
    type: "file",
    title: "QA unsafe",
    detail: "http://example.com",
  }),
);
await check("project file safe link", 201, () =>
  op(`project-workspace/${scopedProject.id}`, {
    type: "file",
    title: "QA file",
    detail: "https://example.com/qa",
  }),
);
const task = db
  .prepare("SELECT id FROM commercial_project_entries WHERE project_id=? AND entry_type='task'")
  .get(scopedProject.id);
await check("project task completes", 200, () =>
  op(`project-workspace/${scopedProject.id}`, { entryId: task.id, status: "done" }),
);
await check("project foreign entry mutation denied", 404, () =>
  op("project-workspace/1", { entryId: task.id, status: "cancelled" }),
);
await check(
  "project expense precision",
  5550,
  () =>
    db
      .prepare(
        "SELECT amount_minor FROM commercial_project_entries WHERE project_id=? AND entry_type='expense'",
      )
      .get(scopedProject.id).amount_minor,
);
await c.studioPaymentUpdate(req({ status: "paid" }), env, scopedPayments[0].id);
await check("paid receipt generated", 201, () =>
  op(`documents/${scopedProject.id}`, { type: "receipt", paymentId: scopedPayments[0].id }),
);
await check("collection reversal requires reason", 400, () =>
  c.studioPaymentUpdate(req({ status: "pending" }), env, scopedPayments[0].id),
);
await check(
  "rejected reversal preserves payment",
  "paid",
  () =>
    db.prepare("SELECT status FROM commercial_payments WHERE id=?").get(scopedPayments[0].id)
      .status,
);
await check("collection reversal records reason", 200, () =>
  c.studioPaymentUpdate(
    req({ status: "pending", reason: "QA incorrect collection" }),
    env,
    scopedPayments[0].id,
  ),
);
await check(
  "collection reversal reason audited",
  "QA incorrect collection",
  () =>
    JSON.parse(
      db
        .prepare(
          "SELECT after_json FROM commercial_audit_log WHERE entity_type='payment' AND entity_id=? ORDER BY id DESC LIMIT 1",
        )
        .get(String(scopedPayments[0].id)).after_json,
    ).reason,
);
await check(
  "reversal preserves historical receipt",
  1,
  () =>
    db
      .prepare(
        "SELECT COUNT(*) AS n FROM commercial_documents WHERE payment_id=? AND document_type='receipt'",
      )
      .get(scopedPayments[0].id).n,
);
await c.studioPaymentUpdate(req({ status: "paid" }), env, scopedPayments[0].id);
const declineQuote = (await (await c.studioQuoteCreate(req(valid), env)).json()).quote;
const declineSent = await (await c.studioQuoteSend(req(), env, null, declineQuote.id)).json();
const declineToken = new URL(declineSent.clientUrl).pathname.split("/").pop();
await check("decline requires reason", 400, () =>
  c.publicQuoteRespond(
    req({ action: "reject", message: "" }),
    env,
    null,
    declineQuote.reference,
    declineToken,
  ),
);
await check("decline with reason", 200, () =>
  c.publicQuoteRespond(
    req({ action: "reject", message: "QA too expensive" }),
    env,
    null,
    declineQuote.reference,
    declineToken,
  ),
);
await check("declined quote cannot accept", 409, () =>
  c.publicQuoteRespond(
    req({ action: "accept", termsAccepted: true }),
    env,
    null,
    declineQuote.reference,
    declineToken,
  ),
);
await check("declined quote cannot resend", 409, () => rawSend(req(), env, null, declineQuote.id));
await check(
  "decline creates no project",
  0,
  () =>
    db
      .prepare("SELECT COUNT(*) AS n FROM commercial_projects WHERE quote_id=?")
      .get(declineQuote.id).n,
);
await check(
  "decline reason visible to admin",
  "QA too expensive",
  async () =>
    (await (await c.studioQuoteDetail(req(), env, declineQuote.id)).json()).draft.rejection.reason,
);
await check("declined version can become new draft", 200, () =>
  c.studioQuoteNewVersion(req({ ...valid, baseVersion: 1 }), env, declineQuote.id),
);
await check("previous approval not reusable after version", 409, () =>
  rawSend(req(), env, null, declineQuote.id),
);
await check("new catalog costs require review", 400, () =>
  c.studioCatalogUpdate(req({ publish: true }), env, "content-start"),
);
await check(
  "new catalog public details preserved",
  true,
  () =>
    JSON.parse(
      db
        .prepare("SELECT included_json FROM commercial_catalog_items WHERE id='content-start'")
        .get().included_json,
    ).ar.length > 0,
);
await check("catalog version history protected", 401, () =>
  c.studioCatalogHistory(req({}, false), env, "presence"),
);
await check("catalog history missing version", 404, () =>
  c.studioCatalogHistory(req({ version: 999999 }), env, "presence"),
);
await check("catalog reviewed publication", 200, () =>
  c.studioCatalogUpdate(
    req({ publish: true, costReviewed: true, cost: 1000, price: 5000, visible: true }),
    env,
    "content-start",
  ),
);
await check("catalog second draft", 200, () =>
  c.studioCatalogUpdate(req({ status: "draft", price: 6000 }), env, "content-start"),
);
const priorPublication = db
  .prepare("SELECT published_snapshot_json FROM commercial_catalog_items WHERE id='content-start'")
  .get().published_snapshot_json;
await check("catalog history restore creates draft", 200, () =>
  c.studioCatalogHistory(req({ version: 1 }), env, "content-start"),
);
await check(
  "catalog history preserves publication",
  priorPublication,
  () =>
    db
      .prepare(
        "SELECT published_snapshot_json FROM commercial_catalog_items WHERE id='content-start'",
      )
      .get().published_snapshot_json,
);
await check(
  "catalog restore does not publish",
  "draft",
  () =>
    db.prepare("SELECT status FROM commercial_catalog_items WHERE id='content-start'").get().status,
);
await check("catalog archive action", 200, () =>
  c.studioCatalogUpdate(req({ status: "archived" }), env, "content-start"),
);
await check("catalog archived offering unavailable", true, async () =>
  (await (await c.publicCatalog(env)).json()).unavailableIds.includes("content-start"),
);
db.prepare(
  "INSERT INTO brief_requests(reference_code,name,contact_preference,service,description,is_test,created_at,updated_at) VALUES('QA-FOLLOWUP','QA Follow-up','email','QA','QA only',1,?,?)",
).run(new Date().toISOString(), new Date().toISOString());
const followBrief = db
  .prepare("SELECT id FROM brief_requests WHERE reference_code='QA-FOLLOWUP'")
  .get().id;
await check("lead follow-up save", 200, () =>
  op(`lead-operations/${followBrief}`, {
    owner: "QA owner",
    followUpAt: "2026-10-10T12:00:00Z",
    lossReason: "QA reason",
  }),
);
await check("lead follow-up read", true, async () =>
  (await (await op("lead-operations")).json()).rows.some(
    (row) => row.brief_id === followBrief && row.owner === "QA owner",
  ),
);
await check("lead invalid follow-up date", 400, () =>
  op(`lead-operations/${followBrief}`, { followUpAt: "invalid" }),
);
await check("business report private access", 401, () => op("business-report", undefined, false));
await check("QA lead excluded from loss analysis", false, async () =>
  (await (await op("business-report")).json()).losses.some(
    (row) => row.loss_reason === "QA reason",
  ),
);
await check("chunked large body rejected", 400, () =>
  op(`lead-operations/${followBrief}`, { owner: "x".repeat(1048577) }),
);
const backup = JSON.parse((await (await c.studioBackup(req(), env)).text()).replace(/^\uFEFF/, ""));
await check("QA overdue reminders excluded", 0, async () => {
  db.prepare(
    "UPDATE commercial_payments SET due_at='2000-01-01T00:00:00Z' WHERE project_id=(SELECT id FROM commercial_projects WHERE quote_id=?)",
  ).run(id);
  return (
    await c.processPaymentReminders({
      ...env,
      TELEGRAM_BOT_TOKEN: "qa-only",
      TELEGRAM_CHAT_ID: "qa-only",
    })
  ).sent;
});
const paymentId = Number(db.prepare("SELECT id FROM commercial_payments LIMIT 1").get().id);
db.prepare("UPDATE commercial_payments SET due_at='2000-01-01T00:00:00Z' WHERE id=?").run(
  paymentId,
);
await check(
  "pending response matches overdue list",
  "overdue",
  async () =>
    (
      await (
        await c.studioPaymentUpdate(
          req({ status: "pending", reason: "QA reversal" }),
          env,
          paymentId,
        )
      ).json()
    ).payment.status,
);
db.prepare(
  "INSERT INTO brief_requests (reference_code,name,service,contact_preference,description,created_at,updated_at) VALUES ('QA-linked','QA','QA','call','QA',?,?)",
).run(new Date().toISOString(), new Date().toISOString());
const briefId = Number(
  db.prepare("SELECT id FROM brief_requests WHERE reference_code='QA-linked'").get().id,
);
const linkedQuote = (
  await (await c.studioQuoteCreate(req({ ...valid, briefRequestId: briefId }), env)).json()
).quote;
const linkedIssued = await (await c.studioQuoteSend(req(), env, null, linkedQuote.id)).json();
await c.publicQuoteRespond(
  req({ action: "accept", termsAccepted: true }),
  env,
  null,
  linkedQuote.reference,
  new URL(linkedIssued.clientUrl).pathname.split("/").pop(),
);
await check(
  "accepted brief becomes won",
  "won",
  () => db.prepare("SELECT status FROM brief_requests WHERE id=?").get(briefId).status,
);
await check(
  "deposit not immediately overdue",
  true,
  () =>
    Date.parse(
      db
        .prepare(
          "SELECT due_at FROM commercial_payments p JOIN commercial_projects j ON j.id=p.project_id WHERE j.quote_id=? AND payment_type='deposit'",
        )
        .get(linkedQuote.id).due_at,
    ) > Date.now(),
);
await check("brief test marker save", 200, () =>
  c.studioRequestUpdate(req({ isTest: true, notes: "QA notes" }), env, briefId),
);
await check("brief test marker propagates", 1, () =>
  Number(
    db.prepare("SELECT is_test FROM commercial_quotes WHERE id=?").get(linkedQuote.id).is_test,
  ),
);
await check("brief invalid test marker", 400, () =>
  c.studioRequestUpdate(req({ isTest: "true" }), env, briefId),
);
await check("backup covers business tables", 18, () => Object.keys(backup.tables).length);
await check("backup excludes auth sessions", false, () => "studio_sessions" in backup.tables);
const restored = new DatabaseSync(":memory:");
const raceQuote = (await (await c.studioQuoteCreate(req(valid), env)).json()).quote;
let raceOnce = true;
const raceEnv = {
  ...env,
  DB: {
    ...env.DB,
    batch: async (statements) => {
      if (raceOnce) {
        raceOnce = false;
        await c.studioQuoteNewVersion(req({ ...valid, baseVersion: 1 }), env, raceQuote.id);
      }
      return env.DB.batch(statements);
    },
  },
};
await check("send rejects interleaved version change", 409, () =>
  c.studioQuoteSend(req(), raceEnv, null, raceQuote.id),
);
await check("stale send creates no sent event", 0, () =>
  Number(
    db
      .prepare(
        "SELECT COUNT(*) n FROM commercial_quote_events WHERE quote_id=? AND event_type='sent'",
      )
      .get(raceQuote.id).n,
  ),
);
const viewRace = (await (await c.studioQuoteCreate(req(valid), env)).json()).quote;
const viewIssued = await (await c.studioQuoteSend(req(), env, null, viewRace.id)).json();
const viewToken = new URL(viewIssued.clientUrl).pathname.split("/").pop();
let viewOnce = true;
const viewEnv = {
  ...env,
  DB: {
    ...env.DB,
    batch: async (statements) => {
      if (viewOnce) {
        viewOnce = false;
        await c.publicQuoteRespond(
          req({ action: "accept", termsAccepted: true }),
          env,
          null,
          viewRace.reference,
          viewToken,
        );
      }
      return env.DB.batch(statements);
    },
  },
};
await check(
  "view race preserves accepted status",
  "accepted",
  async () =>
    (
      await (
        await c.publicQuote(
          new Request("https://test"),
          viewEnv,
          null,
          viewRace.reference,
          viewToken,
        )
      ).json()
    ).quote.status,
);
restored.exec("PRAGMA foreign_keys=ON");
for (const name of (await readdir("migrations")).filter((n) => n.endsWith(".sql")).sort())
  restored.exec(await readFile(`migrations/${name}`, "utf8"));
for (const table of Object.keys(backup.tables).reverse()) restored.exec(`DELETE FROM ${table}`);
for (const [table, rows] of Object.entries(backup.tables))
  for (const row of rows) {
    const keys = Object.keys(row);
    restored
      .prepare(`INSERT INTO ${table} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`)
      .run(...keys.map((key) => row[key]));
  }
for (const [table, rows] of Object.entries(backup.tables))
  await check(`backup restore rows:${table}`, rows.length, () =>
    Number(restored.prepare(`SELECT COUNT(*) n FROM ${table}`).get().n),
  );
for (const [table, rows] of Object.entries(backup.tables))
  await check(`backup restore exact data:${table}`, JSON.stringify(rows), () =>
    JSON.stringify(restored.prepare(`SELECT * FROM ${table}`).all()),
  );
await check(
  "backup restored foreign keys valid",
  0,
  () => restored.prepare("PRAGMA foreign_key_check").all().length,
);
restored.close();
db.exec("UPDATE studio_sessions SET expires_at='2000-01-01T00:00:00Z'");
await check("expired session denied", 401, () => c.studioCatalog(req(), env));
console.log(
  JSON.stringify(
    {
      environment: "isolated SQLite; no production writes",
      total: results.length,
      passed: results.filter((r) => r.result === "PASS").length,
      failed: results.filter((r) => r.result === "FAIL").length,
      results,
    },
    null,
    2,
  ),
);
db.close();
if (results.some((r) => r.result === "FAIL")) process.exitCode = 1;
