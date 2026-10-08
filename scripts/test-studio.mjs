import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "vite";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
const vite = await createServer({ server: { middlewareMode: true }, appType: "custom" });
try {
  const { PROTOTYPE_CATALOG, PROTOTYPE_PROMOTIONS } = await vite.ssrLoadModule(
    "/src/data/commercialStudioPrototype.js",
  );
  const views = [
    "ControlView",
    "CatalogView",
    "LeadsView",
    "QuoteView",
    "PromotionsView",
    "SettingsView",
    "ProjectsView",
    "PaymentsView",
    "ReportsView",
    "PlaceholderView",
  ];
  for (const language of ["ar", "en"])
    for (const name of views) {
      const { default: View } = await vite.ssrLoadModule(`/src/pages/studio/${name}.jsx`);
      const html = renderToString(
        React.createElement(View, {
          language,
          storageMode: "local",
          catalog: PROTOTYPE_CATALOG,
          promotions: PROTOTYPE_PROMOTIONS,
          quotes: null,
          requests: null,
          projects: null,
          payments: null,
          freshRef: { current: 0 },
          page: "reports",
        }),
      );
      assert.ok(html.length > 0, name);
    }
  const { studioRequest } = await vite.ssrLoadModule("/src/pages/studio/api.js");
  const { default: Studio } = await vite.ssrLoadModule("/src/pages/CommercialStudioPrototype.jsx");
  const builder = renderToString(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/prototype/commercial-studio?view=quotes"] },
      React.createElement(Studio, { demo: true }),
    ),
  );
  assert.ok(builder.includes("جارٍ تحميل العرض"));
  assert.ok(!builder.includes("Nile Atelier"));
  assert.ok(!builder.includes('value="LAUNCH5"'));
  const { safeDate, briefLabel, leadForDraft, resolveLeadOffer, visibleQuoteDrafts } =
    await vite.ssrLoadModule("/src/pages/studio/briefs.js");
  for (const language of ["ar", "en"]) {
    for (const value of ["2026-12-31", "2026-12-31T23:59:59.999Z", null, "", "bad-date"])
      assert.equal(typeof safeDate(value, language), "string");
    const { default: Promotions } = await vite.ssrLoadModule(
      "/src/pages/studio/PromotionsView.jsx",
    );
    const html = renderToString(
      React.createElement(Promotions, {
        language,
        promotions: [
          {
            id: "iso",
            code: "ISO10",
            kind: "percentage",
            value: 10,
            status: "paused",
            endsAt: "2026-12-31T23:59:59.999Z",
            description: {},
            uses: 0,
            limit: 20,
          },
          {
            id: "fixed",
            code: "FIXED500",
            kind: "fixed",
            value: 500,
            status: "active",
            endsAt: null,
            uses: 0,
            limit: 20,
          },
          {
            id: "bad",
            code: "BADDATE",
            kind: "free-item",
            status: "expired",
            endsAt: "bad-date",
            uses: 0,
            limit: 20,
          },
        ],
      }),
    );
    assert.ok(html.includes("FIXED500") && html.includes("500"));
    assert.ok(!html.includes("Invalid time"));
  }
  assert.equal(briefLabel("within-2-weeks", "en"), "Within two weeks");
  const qaLeads = [
    { id: 1, name: "QA Alpha", offer_id: "start" },
    { id: 2, name: "QA Beta", offer_id: "event-signature" },
  ];
  assert.equal(leadForDraft("lead-1", null, qaLeads).name, "QA Alpha");
  assert.equal(leadForDraft("lead-1", "2", qaLeads), null);
  assert.equal(leadForDraft("working", null, qaLeads), null);
  const origin = resolveLeadOffer(qaLeads[0], []);
  assert.equal(origin.price, 6000);
  assert.equal(origin.cost, null);
  assert.ok(origin.description.ar.includes("4 بوستات"));
  assert.ok(origin.costPending);
  assert.equal(
    resolveLeadOffer(qaLeads[1], [{ id: "event-signature", status: "draft", price: 999 }]).price,
    12500,
  );
  assert.equal(
    resolveLeadOffer(qaLeads[1], [{ id: "event-signature", status: "published", price: 15000 }])
      .price,
    15000,
  );
  assert.equal(resolveLeadOffer(qaLeads[1], [{ id: "event-signature", status: "archived" }]), null);
  assert.equal(
    visibleQuoteDrafts(
      [
        ["a", { record: { id: 1 } }],
        ["b", { record: { id: 1 }, cloudDirty: true }],
        ["c", {clientName:'Unsaved'}],
      ],
      [{ id: 1 }],
    ).length,
    2,
  );
  const quoteSource = await readFile("src/pages/studio/QuoteView.jsx", "utf8");
  assert.ok(!quoteSource.includes("NILE ATELIER"));
  assert.ok(!quoteSource.includes("saved.briefRequestId || lead"));
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ authenticated: true }), {
        headers: { "Content-Type": "application/json" },
      });
    assert.equal((await studioRequest("/api/studio/session")).authenticated, true);
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: "Login required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    await assert.rejects(studioRequest("/api/studio/session"), (error) => error.status === 401);
    globalThis.fetch = async () =>
      new Response("<html>Vite fallback</html>", { headers: { "Content-Type": "text/html" } });
    await assert.rejects(studioRequest("/api/studio/session"));
  } finally {
    globalThis.fetch = originalFetch;
  }
  const css = await readFile("src/pages/studio/studioLayout.css", "utf8");
  assert.ok(css.includes("repeat(2, minmax(0, 1fr))"));
  assert.ok(css.includes('input[type="number"]'));
  console.log(
    "PASS: 20 Arabic/English section renders; API JSON/401/HTML checks; responsive/numeric CSS guards. No browser or live writes.",
  );
} finally {
  await vite.close();
}
