// Local browser regression fixture. No live API requests, messages or payments.
import React from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ClientQuote from "../src/pages/ClientQuote";
import Studio from "../src/pages/CommercialStudioPrototype";
import { PROTOTYPE_CATALOG } from "../src/data/commercialStudioPrototype";
import "../src/index.css";

const requests = [
  {
    id: 901,
    name: "QA Alpha",
    project: "QA Origin",
    reference_code: "QA-901",
    offer_id: "start",
    offer_name: "ORIGIN",
    budget: "5000-10000",
    launch_timeline: "within-month",
    phone: "+12025550101",
    email: "qa@example.com",
    description: "Fictional complete brief: logo, four posts and menu.",
    status: "new",
  },
  {
    id: 902,
    name: "QA Beta",
    project: "QA Conference",
    reference_code: "QA-902",
    offer_id: "event-signature",
    offer_name: "SIGNATURE",
    budget: "10000-15000",
    launch_timeline: "within-2-weeks",
    event_date: "2026-11-05",
    event_location: "Fictional QA location",
    description: "Fictional event brief: photo and video coverage.",
    status: "contacted",
  },
];
const catalog = PROTOTYPE_CATALOG.map((row) => ({ ...row, status: "draft" }));
const scenario = new URLSearchParams(window.location.search).get("scenario");
const quotes = [
  {
    id: 901,
    reference: "QA-QUOTE-901",
    clientName: "QA Alpha",
    projectName: "QA Origin",
    status: scenario === "accepted" ? "accepted" : "revision_requested",
    total: 6000,
    version: 1,
  },
];
const saved = {
  revisionRequest: {
    message: "اختبار: تقليل عدد البنود مع الحفاظ على النطاق المتفق عليه.",
    created_at: "2026-10-09T00:00:00Z",
  },
  briefRequestId: 901,
  clientName: "QA Alpha",
  projectName: "QA Origin",
  duration: "12–14 days",
  revisions: 2,
  taxPercent: 0,
  depositPercent: 60,
  items: [
    {
      rowId: "qa-origin",
      catalogId: null,
      name: { ar: "البداية", en: "ORIGIN" },
      description: { ar: "نطاق اختبار غير حقيقي", en: "Fictional QA scope" },
      quantity: 1,
      unitPrice: 6000,
      cost: 3000,
      discount: 0,
      optional: false,
    },
  ],
  record: quotes[0],
};
const promotions = [
  {
    id: "qa-fixed",
    code: "QA-FIXED500",
    kind: "fixed",
    value: 500,
    status: "active",
    description: { ar: "خصم اختبار فقط", en: "Test discount only" },
    scope: "all",
    uses: 0,
    limit: 20,
    endsAt: "2026-12-31T23:59:59.999Z",
  },
];
window.fetch = async (input, options = {}) => {
  const path = String(input);
  let payload;
  if (options.method && options.method !== "GET")
    return new Response(JSON.stringify({ error: "Fixture is read-only; no live writes." }), {
      status: 409,
      headers: { "Content-Type": "application/json" },
    });
  if (path === "/api/quotes/QA-CLIENT/fixture-only")
    payload = {
      quote: {
        reference: "QA-CLIENT",
        version: 1,
        language: "ar",
        status: "accepted",
        clientName: "QA فقط",
        projectName: "عرض مقبول — بيانات غير حقيقية",
        expiresAt: "2030-01-01T00:00:00Z",
        subtotal: 8000,
        discount: 0,
        tax: 0,
        total: 8000,
        taxPercent: 0,
        depositPercent: 60,
        timeline: "شهر تجريبي",
        revisions: 2,
        selectedOptionalItemIds: [],
        items: [
          {
            id: 1,
            name: { ar: "النطاق الأساسي", en: "Core scope" },
            description: { ar: "اختبار حفظ حالة القبول بعد التحميل", en: "Accepted reload QA" },
            quantity: 1,
            unitPrice: 6000,
            discount: 0,
            optional: false,
          },
          {
            id: 2,
            name: { ar: "إضافة لم يقبلها العميل", en: "Unselected addon" },
            description: { ar: "لا تدخل في الإجمالي المقبول", en: "Not in accepted total" },
            quantity: 1,
            unitPrice: 2000,
            discount: 0,
            optional: true,
          },
        ],
      },
    };
  else if (path === "/api/studio/catalog") payload = { items: catalog };
  else if (path === "/api/studio/promotions") payload = { promotions };
  else if (path === "/api/studio/quotes") payload = { quotes };
  else if (path === "/api/studio/quotes/901") payload = { draft: saved };
  else if (path === "/api/studio/requests") payload = { requests };
  else if (path === "/api/studio/projects") payload = { projects: [] };
  else if (path === "/api/studio/payments") payload = { payments: [] };
  else if (path === "/api/studio/integrations") payload = { telegram: { configured: false } };
  else if (path === "/api/studio/audit") payload = { entries: [] };
  else
    return new Response(JSON.stringify({ error: "Unsupported fixture request" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  return new Response(JSON.stringify(payload), { headers: { "Content-Type": "application/json" } });
};
createRoot(document.getElementById("root")).render(
  <MemoryRouter
    initialEntries={[
      scenario === "client-accepted"
        ? "/q/QA-CLIENT/fixture-only"
        : "/studio?view=quotes&record=901",
    ]}
  >
    {scenario === "client-accepted" ? (
      <Routes>
        <Route path="/q/:reference/:token" element={<ClientQuote />} />
      </Routes>
    ) : (
      <Studio />
    )}
  </MemoryRouter>,
);
