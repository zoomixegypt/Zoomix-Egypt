import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import vm from "node:vm";
import { webcrypto } from "node:crypto";
import { calculateCommercial, promotionError } from "../public/commercial-rules.js";
import { writeDraft, readDrafts } from "../src/pages/studio/drafts.js";

const values = new Map();
const storage = {
  getItem: (key) => values.get(key),
  setItem: (key, value) => values.set(key, value),
};
writeDraft("a", { kind: "quote", clientName: "A" }, storage);
writeDraft("b", { kind: "quote", clientName: "B" }, storage);
assert.equal(readDrafts(storage).a.clientName, "A");
assert.equal(readDrafts(storage).b.clientName, "B");
assert.throws(() =>
  writeDraft(
    "c",
    {},
    {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceeded");
      },
    },
  ),
);
const lines = [
  { catalogId: "presence", category: "foundation", quantity: 1, unitPrice: 11000 },
  { catalogId: "extra-reel", quantity: 2, unitPrice: 1200 },
];
const scoped = { kind: "percentage", value: 5, scope: "foundation" };
assert.equal(calculateCommercial(lines, scoped).discountMinor, 55000);
const free = {
  kind: "free-item",
  scope: "selected",
  catalogIds: ["presence"],
  freeItemId: "extra-reel",
};
assert.equal(calculateCommercial(lines, free).discountMinor, 120000);
assert.equal(calculateCommercial([lines[1]], free).discountMinor, 0);
assert.equal(
  calculateCommercial(
    Array.from({ length: 5 }, () => ({ unitPrice: 0.01, quantity: 1 })),
    { kind: "fixed", scope: "all", value: 0.02 },
  ).discountMinor,
  2,
);
assert.ok(promotionError({ status: "active", limit: 1, uses: 1 }));
assert.ok(promotionError({ status: "active", startsAt: "2099-01-01" }));

const db = new DatabaseSync(":memory:");
db.exec("PRAGMA foreign_keys=ON");
for (const name of (await readdir("migrations")).filter((name) => name.endsWith(".sql")).sort())
  db.exec(await readFile(`migrations/${name}`, "utf8"));
const env = {
  STUDIO_PASSWORD: "test-only",
  DB: {
    prepare(sql) {
      return {
        params: [],
        bind(...params) {
          this.params = params;
          return this;
        },
        async first() {
          return db.prepare(sql).get(...this.params) || null;
        },
        async all() {
          return { results: db.prepare(sql).all(...this.params) };
        },
        async run() {
          const r = db.prepare(sql).run(...this.params);
          return { meta: { last_row_id: Number(r.lastInsertRowid), changes: Number(r.changes) } };
        },
      };
    },
    async batch(statements) {
      db.exec("BEGIN");
      try {
        const rows = [];
        for (const statement of statements) rows.push(await statement.run());
        db.exec("COMMIT");
        return rows;
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
  },
};
let source = await readFile("public/_worker.js", "utf8");
source = source
  .replace(/^import .*\n/gm, "")
  .replace(
    "export async function processPaymentReminders",
    "async function processPaymentReminders",
  )
  .replace("export class StudioLiveUpdates", "class StudioLiveUpdates")
  .replace("export default {", "const worker = {");
const context = vm.createContext({
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
});
vm.runInContext(source, context);
const login = await context.studioLogin(
  new Request("http://test/api/studio/login", {
    method: "POST",
    body: JSON.stringify({ password: "test-only" }),
  }),
  env,
);
assert.equal(login.status, 200);
const cookie = login.headers.get("set-cookie").split(";")[0];
const request = (payload) =>
  new Request("http://test/api/studio/test", {
    method: "POST",
    headers: { Cookie: cookie },
    body: JSON.stringify(payload),
  });
assert.equal((await (await context.publicCatalog(env)).json()).items.length, 0);
assert.equal(
  db
    .prepare(
      "SELECT COUNT(*) AS count FROM commercial_promotions WHERE status!='paused' OR usage_count!=0",
    )
    .get().count,
  0,
);
assert.equal(
  db
    .prepare(
      "SELECT COUNT(*) AS count FROM commercial_catalog_items WHERE status!='draft' OR published_snapshot_json IS NOT NULL",
    )
    .get().count,
  0,
);
// Explicit test fixtures; production starts with unpublished prices and paused codes.
db.exec("UPDATE commercial_promotions SET status='active' WHERE code='FREE-REEL'");
assert.equal(
  (await context.studioCatalogUpdate(request({ publish: true, visible: true }), env, "presence"))
    .status,
  200,
);
const publicBefore = (await (await context.publicCatalog(env)).json()).items.find(
  (row) => row.id === "presence",
).price;
await context.studioCatalogUpdate(
  request({ price: 15000, status: "draft", publish: false }),
  env,
  "presence",
);
assert.equal(
  (await (await context.publicCatalog(env)).json()).items.find((row) => row.id === "presence")
    .price,
  publicBefore,
);
await context.studioCatalogUpdate(request({ price: 15000, publish: true }), env, "presence");
assert.equal(
  (await (await context.publicCatalog(env)).json()).items.find((row) => row.id === "presence")
    .price,
  15000,
);
const payload = {
  clientName: "Test client",
  projectName: "Test project",
  items: lines.map((row) => ({
    ...row,
    name: { ar: "اختبار", en: "Test" },
    description: { ar: "", en: "" },
    cost: 100,
    optional: row.catalogId === "extra-reel",
  })),
  depositPercent: 60,
  taxPercent: 14,
  revisions: 2,
  promoCode: "FREE-REEL",
};
const created = await context.studioQuoteCreate(request(payload), env);
assert.equal(created.status, 201);
assert.equal(
  (await context.studioQuoteCreate(request({ ...payload, briefRequestId: null }), env)).status,
  201,
);
assert.equal(
  (await context.studioQuoteCreate(request({ ...payload, briefRequestId: 999999 }), env)).status,
  400,
);
assert.equal(
  context.validateQuotePayload({ ...payload, items: [{ ...payload.items[0], quantity: 0 }] }).error,
  "Every quote item needs valid names, quantity and prices.",
);
assert.ok(
  context.validateQuotePayload({
    ...payload,
    items: [{ ...payload.items[0], cost: null, costPending: true }],
  }).error,
);
const quote = (await created.json()).quote;
db.exec("UPDATE commercial_promotions SET status='active', starts_at='2020-01-01T00:00:00Z', ends_at='2099-01-01T00:00:00Z' WHERE code='LAUNCH5'");
const fallbackLine = context.quoteItemFromPayload({name:{ar:'البداية',en:'Origin'},quantity:1,unitPrice:6000,cost:3000,category:'foundation'},0);
assert.equal((await context.resolvePromotion(env,'LAUNCH5',[fallbackLine])).discountMinor,30000);
const fallbackQuote = await context.studioQuoteCreate(request({...payload,promoCode:'LAUNCH5',items:[{name:{ar:'البداية',en:'Origin'},quantity:1,unitPrice:6000,cost:3000,category:'foundation'}]}),env);
const fallbackRecord = (await fallbackQuote.json()).quote;
const fallbackDetail = await context.studioQuoteDetail(new Request('http://test',{headers:{Cookie:cookie}}),env,fallbackRecord.id);
assert.equal((await fallbackDetail.json()).draft.items[0].category,'foundation');
const sent = await (await context.studioQuoteSend(request({}), env, null, quote.id)).json();
const url = new URL(sent.clientUrl);
const token = url.pathname.split("/").pop();
const read = await context.publicQuote(new Request(url), env, null, quote.reference, token);
const view = (await read.json()).quote;
assert.equal(view.discount, 1200);
assert.ok(view.discountPlan);
assert.equal(
  (
    await context.studioQuoteDetail(
      new Request("http://test", { headers: { Cookie: cookie } }),
      env,
      quote.id,
    )
  ).status,
  200,
);
const usesBefore = db
  .prepare("SELECT usage_count FROM commercial_promotions WHERE code='FREE-REEL'")
  .get().usage_count;
const accepted = await context.publicQuoteRespond(
  request({ action: "accept", termsAccepted: true, selectedOptionalItemIds: [] }),
  env,
  null,
  quote.reference,
  token,
);
assert.equal(accepted.status, 200);
assert.equal(
  db.prepare("SELECT usage_count FROM commercial_promotions WHERE code='FREE-REEL'").get()
    .usage_count,
  usesBefore,
);
assert.equal(
  db.prepare("SELECT contract_value_minor FROM commercial_projects WHERE quote_id=?").get(quote.id)
    .contract_value_minor,
  1254000,
);
assert.equal(
  (
    await context.publicQuoteRespond(
      request({ action: "accept", termsAccepted: true }),
      env,
      null,
      quote.reference,
      token,
    )
  ).status,
  409,
);
assert.equal(
  db.prepare("SELECT usage_count FROM commercial_promotions WHERE code='FREE-REEL'").get()
    .usage_count,
  usesBefore,
);
console.log(
  "PASS: isolated SQLite migrations, separate drafts, storage failure, scoped/free-item rules, published-vs-draft prices, quote read/send/accept, optional selection, atomic redemption and duplicate acceptance. No live data writes.",
);
const nextQuote = (await (await context.studioQuoteCreate(request(payload), env)).json()).quote;
const nextSent = await (await context.studioQuoteSend(request({}), env, null, nextQuote.id)).json();
const nextToken = new URL(nextSent.clientUrl).pathname.split("/").pop();
const nextIds = db
  .prepare(
    "SELECT i.id FROM commercial_quote_items i JOIN commercial_quote_versions v ON v.id=i.quote_version_id WHERE v.quote_id=? AND i.optional=1",
  )
  .all(nextQuote.id)
  .map((row) => row.id);
db.exec(
  "CREATE TRIGGER fail_test_project BEFORE INSERT ON commercial_projects BEGIN SELECT RAISE(ABORT,'Test project failure'); END;",
);
await assert.rejects(
  context.publicQuoteRespond(
    request({ action: "accept", termsAccepted: true, selectedOptionalItemIds: nextIds }),
    env,
    null,
    nextQuote.reference,
    nextToken,
  ),
  /Test project failure/,
);
assert.equal(
  db.prepare("SELECT status FROM commercial_quotes WHERE id=?").get(nextQuote.id).status,
  "sent",
);
assert.equal(
  db
    .prepare("SELECT COUNT(*) AS n FROM commercial_promotion_redemptions WHERE quote_id=?")
    .get(nextQuote.id).n,
  0,
);
assert.equal(
  db.prepare("SELECT usage_count FROM commercial_promotions WHERE code='FREE-REEL'").get()
    .usage_count,
  usesBefore,
);
db.exec("DROP TRIGGER fail_test_project");
db.exec("UPDATE commercial_promotions SET usage_count=usage_limit WHERE code='FREE-REEL'");
assert.equal(
  (
    await context.publicQuoteRespond(
      request({ action: "accept", termsAccepted: true, selectedOptionalItemIds: nextIds }),
      env,
      null,
      nextQuote.reference,
      nextToken,
    )
  ).status,
  409,
);
assert.equal(
  db.prepare("SELECT status FROM commercial_quotes WHERE id=?").get(nextQuote.id).status,
  "sent",
);
db.exec(`UPDATE commercial_promotions SET usage_count=${usesBefore} WHERE code='FREE-REEL'`);
console.log(
  "PASS: project failure rolls back acceptance/redemption; exhausted promotions reject without partial writes.",
);
const finalAcceptance = await context.publicQuoteRespond(
  request({ action: "accept", termsAccepted: true, selectedOptionalItemIds: nextIds }),
  env,
  null,
  nextQuote.reference,
  nextToken,
);
assert.equal(finalAcceptance.status, 200);
assert.equal(
  db.prepare("SELECT usage_count FROM commercial_promotions WHERE code='FREE-REEL'").get()
    .usage_count,
  usesBefore + 1,
);
const projectsPayload = await (
  await context.studioProjects(
    new Request("http://test/api/studio/projects", { headers: { Cookie: cookie } }),
    env,
  )
).json();
assert.equal(
  projectsPayload.projects[0].netContractValue,
  Math.round((projectsPayload.projects[0].contractValue * 100) / 1.14) / 100,
);
let telegramCalls = 0;
context.fetch = async () => {
  telegramCalls++;
  return Response.json({ ok: true });
};
const telegramEnv = { ...env, TELEGRAM_BOT_TOKEN: "test-only", TELEGRAM_CHAT_ID: "test-only" };
db.exec(
  "INSERT INTO commercial_job_locks VALUES ('payment-reminders','other-run','2099-01-01T00:00:00Z')",
);
assert.equal((await context.processPaymentReminders(telegramEnv)).busy, true);
assert.equal(telegramCalls, 0);
db.exec("DELETE FROM commercial_job_locks");
db.exec("UPDATE commercial_payments SET due_at='2020-01-01T00:00:00Z'");
const reminders = await context.processPaymentReminders(telegramEnv);
assert.ok(reminders.sent > 0);
assert.equal((await context.processPaymentReminders(telegramEnv)).sent, 0);
assert.equal(telegramCalls, 1);
context.fetch = async () => Response.json({ ok: false });
db.exec("UPDATE commercial_payments SET reminder_sent_at=NULL");
await assert.rejects(context.processPaymentReminders(telegramEnv), /Telegram/);
assert.equal(db.prepare("SELECT COUNT(*) AS count FROM commercial_job_locks").get().count, 0);
assert.equal(
  db
    .prepare("SELECT COUNT(*) AS count FROM commercial_payments WHERE reminder_sent_at IS NOT NULL")
    .get().count,
  0,
);
const { checkResponse } = await import("./check-api.mjs");
assert.equal(await checkResponse(Response.json({ error: "failure" }, { status: 500 }), 200), false);
assert.equal(await checkResponse(new Response("<html/>", { status: 200 }), 200), false);
assert.equal(await checkResponse(Response.json({ items: [] }), 200, "items"), true);
console.log(
  "PASS: net-of-tax project values, mocked Telegram success/failure, daily reminder suppression, released locks, HTTP 500/HTML rejection.",
);
db.close();
