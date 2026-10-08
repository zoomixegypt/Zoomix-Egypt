# Production operational cycle — QA06

Date: 2026-10-09, Africa/Cairo. Status: core operational cycle completed after explicit acceptance confirmation; professionalism defects remain. The initial checkpoint below is preserved and superseded by the completion section.

## Production changes made

- Submitted the previously prepared, clearly fictional QA06 learning-center monthly brief through the public browser form. Reserved test phone +12025550106, example.com project link. No contact to that phone.
- Brief reference: ZMX-2026-EDF9BF; request ID 10.
- Created quote QT-2026-9FE7AB, version 1, then version 2 and issued both public links. Tokens deliberately not copied into this report.
- Selected 14% solely as a calculation test, not advice on applicable tax treatment.
- Monthly base 13,000, internal test cost 7,800; optional custom video initially 1,200, cost 500, then revised price 1,000; 60% deposit, 15 revisions, duration explicitly says no real contract.
- Sent a public revision request stating this is QA only and asking for optional video price 1,000. No acceptance, collection, catalog publication, or real customer changes.
- Test records affect live counts and must be excluded from real business reporting. No automatic destructive cleanup.

## Verified results

1. Public form saved a reference and edit link; phone-call preference did not require WhatsApp.
2. Studio refresh/search located 1 matching record among 10 total requests.
3. Quote creation ultimately transferred QA06 names, reference, 13,000 price and full monthly deliverables. A transient prior QA05 editor rendered before settling; no wrong-customer server save was performed.
4. Saving with unknown cost/missing duration was blocked with an actionable warning.
5. Invalid promotion returned 'الكود غير صالح'; clearing its input left that old feedback visible (minor UX issue).
6. Version 1: 14,200 subtotal + 1,988 tax = 16,188. Public optional deselection: 13,000 + 1,820 = 14,820. Internal cost/margin not present in visible client page text.
7. At 390px, client page document width was 390px, without horizontal overflow.
8. Public revision submission showed success; Studio notification reflected revision_requested and opened the correct quote.
9. Modified optional price saved version 2. Public page showed version 2 and 14,000 + 1,960 = 15,960.
10. Version 1 link then showed unavailable, correctly invalidated after a new version/link.

## Observed defects / professionalism gaps

- High: monthly QA06 brief retained irrelevant event fields from the preceding QA05 selection: conference, November 5, venue and parallel coverage. Conditional field clearing on selection changes is not reliable; stale data reached production storage/display.
- Medium: quote editor status chip continued to say draft after send and after a revision notification. Displayed editor state is not reliably synchronized to actual server lifecycle.
- Medium: revision notification identifies the event but the client's requested change text was not visible in the opened quote editor snapshot. Admin cannot complete the revision journey from that screen alone.
- Minor: invalid-code feedback persisted after clearing input.
- Existing audit gaps remain: PDF, rejection, detailed terms/expiry/payment amounts, real WhatsApp/email hand-off, full catalog migration, Lead Won transition.

## Not yet verified

- User confirmation of Telegram brief/send/view/revision notifications. Browser submission success is not proof of Telegram delivery.
- Acceptance and resulting project/payment creation on production; requires explicit action-time confirmation even though the quote is clearly fictional.
- Expected version-2 result if both items selected: contract 15,960; deposit 9,576; balance 6,384; net-of-tax expected profit 5,700. These are expectations, not verified database outcomes.
- Paid status/collection, reports reconciliation, audit trail and repeated acceptance handling after the acceptance gate.
- Real daily overdue reminder delivery and complete desktop/multi-breakpoint verification.

Screenshots saved in the parent workspace: studio-cycle-qa06-stale-fields.jpg, studio-cycle-client-mobile.jpg, studio-cycle-before-acceptance.jpg.

## Completion after user confirmation

The user explicitly confirmed the acceptance action and confirmed receipt of the earlier Telegram notifications. Accepted version 2 with both items selected in the public browser.

Verified on production:

- Client showed successful acceptance; Studio notification showed accepted.
- Exactly one project PRJ-2026-26433BE8, with contract 15,960, expected profit 5,700 and rounded margin 41%.
- Exactly two payments: deposit 9,576 and balance 6,384.
- Marked only the QA deposit paid as a record-update test, not a financial transfer. UI and reports showed 9,576 collected / 6,384 outstanding.
- Reports matched in Arabic and English. Direct full-page navigation resets UI language to Arabic, so English persistence across reloads is not established.
- Reversed the test collection using the UI's cancel-registration action. Final reports show collected 0, contract 15,960 and expected profit 5,700. No real money moved.
- Audit displayed quote creation, sends, revision, version creation, acceptance and both payment status changes.
- Read-only remote SQL confirmed quote ID 2, accepted, version 2, project count 1, payment count 2 and no paid amounts. Query wrote zero rows.
- At desktop width 1440, Studio document width was 1440 with no overflow on the examined leads screen; desktop sidebar/report/payment views were reviewed. Client mobile width 390 had already passed. This is not every breakpoint or every possible editor/dialog combination.
- Browser error logs were empty on Studio; the old invalid-link error was expected, and current client error logs were empty.

Additional defects confirmed:

- Linked lead still displays New after accepted quote/project creation.
- Reloading an accepted public quote restores optional selections and acceptance/revision inputs rather than displaying persistent accepted/read-only state. Server source rejects repeated acceptance, but the UI offers misleading actions after reload. No second legally binding acceptance was clicked.
- Deposit due time equals acceptance time and becomes overdue immediately. Payment-update response shows pending, while a refresh computes overdue; transient inconsistent status until refresh was observed.
- QA records are included in conversion/revenue/profit reports (100% conversion in this tiny dataset); there is no verified test-record exclusion. Final collection is zero but the accepted QA deal still contributes 15,960 contract value and 5,700 projected profit.

The successful core cycle does not certify the entire approved vision or professional readiness. Daily scheduled reminder delivery, all promotion/publication cases, PDF and other missing audit features remain outside completed verification. The user confirmed Telegram messages before acceptance; receipt of the later acceptance alert has not been separately confirmed.

Final records retained transparently: one clearly labeled QA06 brief, one accepted QA quote with two versions, one QA project, two unpaid payment records and audit history. No real customer records or published prices were changed. Do not delete or hide these without a scoped cleanup instruction; they can trigger scheduled overdue reminders.

Completion screenshots in parent workspace: studio-cycle-project.jpg, studio-cycle-reports-paid.jpg (temporary paid test), studio-cycle-final-report.jpg (final zero collection).
