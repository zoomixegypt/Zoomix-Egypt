# Studio live browser QA — 2026-10-08

Scope: production Studio, five submitted QA customer requests (QA01–QA05). Browser testing at desktop 1440px and mobile 390px. This is a partial workflow review, not full acceptance testing.

## Verified

- All five QA requests appear alongside four pre-existing requests.
- QA05 Signature request preselects Event Signature; adding Cairo transport produces 13,100 EGP (12,500 + 600).
- Saved draft QT-2026-93D388, record 1, version 1 persists after reload. Internal cost 7,700 EGP and displayed margin 41%.
- Client preview shows the correct line-item total without internal cost/margin.
- Reports show one draft and no sent/accepted quotes. Projects and payments remain empty, correctly.
- Desktop global search returns both QA05 request and quote; price-list search for transport filters to Cairo transport.
- Arabic/English switch works on the quote editor; sensitive numbers use Western digits.
- Mobile quote-editor document width is 390px at a 390px viewport (no document-level horizontal overflow).

## Findings

1. **P1 — Promotions crashes the whole Studio view.** Opening Promotions in English produces a blank page. Reload reproduces it. Console: `RangeError: Invalid time value` in StudioEntry, while rendering a mapped list. Exact offending record/date not yet identified.
2. **P1 — Stale request context when opening a saved quote.** Open QA01 from Leads, then open saved QA05 quote: client fields and quote items correctly show QA05, but the request summary still shows QA01 / ZMX-2026-B8454B. Persists after settling and switching language. Reload removes stale context but loses the original budget/timeline display. No save was performed in this mixed-context state; database corruption is not established.
3. **P1 — Client preview contains hard-coded sample proposal copy.** QA05 event quote displays `PROPOSAL / NILE ATELIER` and a brand-launch headline/description instead of its client/project-specific presentation.
4. **P2 — Request details inaccessible from Leads.** List exposes name/reference/project/service/budget and Create quote, but no full brief/contact/event-details view or request-specific filter/status controls. Full customer data cannot be reviewed from this UI.
5. **P2 — ORIGIN mapping missing.** Creating QA01 quote correctly populates its client/project but leaves the quote with zero items. Catalog only contains seven draft seed entries; ORIGIN is absent.
6. **P2 — Saved quote loses request metadata display after reload.** Budget/timeline become em dashes, and the request-reference summary becomes the quote reference.
7. **P2 — Raw enum values in Arabic UI.** Budget/timeline values include `5000-10000`, `over-15000`, `within-month` rather than readable localized labels.
8. **P2 — Local backups multiply in quote list.** Multiple entries for QA05 appear alongside the single database quote, with minute-level timestamps and no clear saved/local distinction in list labels.
9. **Review required — Draft seed prices available for quote creation.** All seven catalog entries show DRAFT, yet Event Signature is automatically selected for QA05. Confirm intended policy for unapproved prices before sending commercial quotes.

## Not exercised

Quote sending/public link, client revisions/acceptance, project creation from acceptance, actual collection, promotion creation/application, price publication, scheduled Telegram payment reminders, settings/audit interactions. No real payment, customer contract acceptance, price publication, or deletion performed.

## Test artifacts

- Production database: one QA draft QT-2026-93D388, total 13,100 EGP. Not sent.
- Browser-local QA01 draft and QA05 backups remain for inspection.
- Mobile preview screenshot saved outside repository: ../studio-qa-mobile-preview.jpg.
- Browser returned to Arabic saved QA05 quote with normal viewport.

Fix order: Promotions crash and stale context; dynamic proposal copy and original brief association; complete Leads details and package mapping; localized labels and backup-list clarity. Repeat live end-to-end QA after fixes, using marked test data and no actual financial transactions.
