# Studio QA fixes — 9 October 2026

Implemented in the local working tree. Not deployed or committed by this task.

## Resolved findings

- Promotion date formatting accepts date-only and full ISO timestamps; missing/invalid dates render safely instead of crashing Studio.
- Fixed-amount promotions show EGP instead of “free item”; paused labels, creation errors, percentage limits, duplicate-code and date-order validation corrected.
- Request context now derives from the active draft URL or the saved quote's actual brief ID, never the last opened request. Reload restores the original budget and timeline from the loaded requests.
- Client preview uses actual client/project names and neutral project copy instead of NILE ATELIER/sample launch text. Internal-preview simulation is explicitly labelled.
- Leads exposes full descriptions, contacts, requested timeline and event details, with search and status filtering. Existing package scope is preserved.
- Missing public package mappings (including ORIGIN/MOMENTUM) use existing website package data, not invented/unreviewed seed prices. Unknown internal costs are explicit and must be entered before save; no fake 100% margin.
- Internal quote cost fields are editable. Backend rejects pending/null costs and zero quantity. Scoped categories for custom/public fallback items survive saved versions.
- Standalone quote creation handles null brief IDs correctly and rejects nonexistent/invalid linked briefs.
- Clean backups of saved quotes no longer duplicate database rows; empty device drafts are hidden, dirty local backups remain accessible and labelled.
- Payments surface network/update errors, guard repeated clicks, and include overdue balances in outstanding totals.
- Quote-send guard avoids repeated clicks; clipboard failure no longer hides the successfully generated link.
- Archived catalog entries are excluded from the quote item picker; draft prices are visibly labelled unreviewed.
- Section error boundary preserves navigation if a view fails instead of losing the entire Studio UI.
- Mobile legacy table CSS no longer hides create-quote/payment actions, service/status data, or budget/timeline. Quote cost/action layout adapted; scope line breaks preserved.

## Verification

- `npm run test:studio`: Arabic/English renders, date-only/ISO/null/invalid promotion regressions, fixed amounts, package fallback pricing/cost flags, linked-draft isolation and backup filtering. Isolated SQLite tests cover standalone/invalid brief IDs, quantities/cost validation, custom scoped promotions and category restoration, plus the existing quote acceptance/atomicity/payment/Telegram mocks.
- Browser fixture: `/scripts/studio-browser-qa.html` at localhost:5174. Fictional read-only API fixtures, no real contacts, payments or Telegram calls. Complete brief search/details, request-to-draft, saved-quote context isolation, dynamic preview, promotion ISO rendering in Arabic/English, all view loading, unknown-cost guard and fixed 500 EGP discount tested.
- Mobile 390px: ORIGIN prefilled at 6,000 EGP with complete existing package scope; 500 EGP test discount gives 5,500 EGP; document width equals viewport width. Create quote visible/usable after mobile CSS fix.
- Local Vite preview on port 5174 is this working tree. Earlier 5173 tab contained an older served build and was not modified.

## Limits

No live database modifications, public price publication, real client agreement, collection, new Telegram messages, commit/push or production deployment performed in this fix pass. Full production end-to-end retesting remains necessary after an approved release. Browser fixture mocks responses; backend tests use isolated SQLite and mocked Telegram, not the production scheduler.

Screenshot outside repository: ../studio-fixed-mobile-preview.jpg.
