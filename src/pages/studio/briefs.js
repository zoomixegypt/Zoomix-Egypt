import { ZOOMIX_PACKAGES } from "../../data/zoomixPackages";
import {
  ZOOMIX_CONTENT_PACKAGES,
  ZOOMIX_EVENT_PACKAGES,
  ZOOMIX_PARTNER_PACKAGES,
} from "../../data/zoomixOfferings";

const COPY = {
  "under-5000": ["أقل من 5,000 جنيه", "Under 5,000 EGP"],
  "5000-10000": ["5,000–10,000 جنيه", "5,000–10,000 EGP"],
  "10000-15000": ["10,000–15,000 جنيه", "10,000–15,000 EGP"],
  "over-15000": ["أكثر من 15,000 جنيه", "Over 15,000 EGP"],
  "within-two-weeks": ["خلال أسبوعين", "Within two weeks"],
  "within-2-weeks": ["خلال أسبوعين", "Within two weeks"],
  "within-month": ["خلال شهر", "Within a month"],
  "one-to-three-months": ["خلال 1–3 أشهر", "Within 1–3 months"],
  "not-sure": ["غير محدد بعد", "Not sure yet"],
  new: ["جديد", "New"],
  contacted: ["تم التواصل", "Contacted"],
  "in-progress": ["قيد المتابعة", "In progress"],
  won: ["تم الاتفاق", "Won"],
  lost: ["لم يتم الاتفاق", "Lost"],
  archived: ["مؤرشف", "Archived"],
  whatsapp: ["واتساب", "WhatsApp"],
  call: ["مكالمة", "Phone call"],
  email: ["بريد إلكتروني", "Email"],
  morning: ["صباحًا", "Morning"],
  afternoon: ["بعد الظهر", "Afternoon"],
  evening: ["مساءً", "Evening"],
  anytime: ["أي وقت", "Any time"],
};
export const briefLabel = (value, language = "ar") =>
  COPY[value]?.[language === "ar" ? 0 : 1] || value || "—";

export function safeDate(value, language = "ar") {
  if (!value) return "—";
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00Z` : value);
  if (!Number.isFinite(date.getTime())) return "—";
  return new Intl.DateTimeFormat(language === "ar" ? "ar-EG-u-nu-latn" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function leadForDraft(draftId, selectedQuoteId, requests) {
  if (selectedQuoteId || !draftId?.startsWith("lead-")) return null;
  return (requests || []).find((row) => String(row.id) === draftId.slice(5)) || null;
}

// Use current catalog prices only when reviewed. Otherwise use existing website
// package data, not unpublished seed prices. Unknown internal costs stay explicit.
export function resolveLeadOffer(lead, catalog) {
  if (!lead) return null;
  const aliases = { launch: "presence", start: "origin", "launch-content": "momentum" };
  const id = String(lead.offer_id || "").toLowerCase();
  const item = catalog.find((row) => row.id === id || row.id === aliases[id]);
  if (item?.status === "archived") return null;
  if (item && (!item.status || item.status === "published" || item.status === "active"))
    return item;
  const publicOffer = [
    ...ZOOMIX_PACKAGES,
    ...ZOOMIX_CONTENT_PACKAGES,
    ...ZOOMIX_EVENT_PACKAGES,
    ...ZOOMIX_PARTNER_PACKAGES,
  ].find((row) => row.id === id || row.name.en.toLowerCase().replaceAll(" ", "-") === id);
  if (!publicOffer) return null;
  const scope = (language) =>
    [
      publicOffer.description?.[language] || publicOffer.tagline?.[language],
      ...(publicOffer.outputs?.[language] || []),
      publicOffer.priceNote?.[language],
      publicOffer.exclusions?.[language],
    ]
      .filter(Boolean)
      .join("\n");
  return {
    id: null,
    policyId: publicOffer.id,
    category: ZOOMIX_PACKAGES.includes(publicOffer)
      ? "foundation"
      : ZOOMIX_CONTENT_PACKAGES.includes(publicOffer)
        ? "content"
        : ZOOMIX_EVENT_PACKAGES.includes(publicOffer)
          ? "events"
          : "partnership",
    name: publicOffer.name,
    description: { ar: scope("ar"), en: scope("en") },
    exclusions: publicOffer.exclusions,
    revisions:
      publicOffer.revisions ??
      { "content-start": 1, "content-build": 2, "content-campaign": 2 }[publicOffer.id],
    price: Number(publicOffer.price.replaceAll(",", "")),
    cost: null,
    costPending: true,
    duration: publicOffer.duration,
    source: "website",
  };
}

export function visibleQuoteDrafts(entries, quotes = []) {
  return entries.filter(
    ([, row]) =>
      (row.items?.length || row.clientName || row.projectName || row.record?.id) &&
      (!row.record?.id ||
        row.cloudDirty ||
        !quotes.some((quote) => String(quote.id) === String(row.record.id))),
  );
}
