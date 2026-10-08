# Studio — phases 7–8 and final verification

Date: 2026-10-08. Local implementation; no production deployment, commit or push.

## Phase 7 — metrics and integrations

- Weighted open-quote margin uses aggregate net value and cost, not an average of percentages or tax-inclusive revenue.
- New-lead metric counts `new` requests; expired links are shown as expired in quote lists.
- Project net value is reconstructed from the accepted immutable quote version's tax percentage and accepted contract value, rounded to minor units. Historical projects without an acceptance/version tax record assume zero tax and require checking before accounting use.
- Reports distinguish contract value from collected payments. Conversion is a current-status ratio for the latest 200 quotes, not a historical/cohort conversion rate.
- Telegram checks both HTTP status and Telegram's `ok`, with a 10-second timeout. New requests notify the admin in addition to quote events.
- Integration loading failure stays unverified; cloud audit failures no longer silently display a device audit as if it were database data. Retry is available.
- Separate scheduled Worker configuration runs at 07:00 UTC daily. Pages does not itself provision a Cron Trigger. The Worker is bundled successfully in dry-run only, not deployed.
- Reminder batches use a database lease, daily suppression and groups of ten to limit message size. Failure releases the lease and does not mark an unsent group as delivered. Delivery is not exactly-once: a crash after Telegram receives a message and before the database update can cause a later repeat.

## Phase 8 — regression testing and browser fixes

- Added `npm run test:studio` to run both isolated test suites.
- Replaced the previous mutating API probe with read-only GET checks, exact expected HTTP status, JSON/type validation and timeouts. HTTP 500 is a failure, even with valid JSON. It is not an authenticated end-to-end test.
- Shortened backup/update timestamps for readability on mobile.
- Browser testing exposed unregistered ScrollTrigger during direct Studio entry. Registering GSAP before cleanup fixed it; direct reload and subsequent navigation produced no new console errors.

## Executed checks

- 20 Arabic/English section renders and frontend API JSON/401/HTML guards passed.
- Isolated SQLite applies all migrations and tests separate drafts, storage quota failures, fixed/scoped/free-item discounts, catalog draft/public separation, quote send/read/accept and optional selection.
- Duplicate acceptance, exhausted promotions and forced project-insert failure leave no partial acceptance/redemption.
- Net-of-tax values and mocked Telegram success, application-level failure, active lease exclusion, daily suppression and lock cleanup passed. No actual Telegram messages sent.
- Production build with route pre-rendering passed; Worker syntax check and Git whitespace check passed.
- Migration 0014 applied to local D1 only. Scheduler deploy dry-run passed.
- Browser checked all nine sections in Arabic and English at desktop 1440×900 and mobile 390×844: navigation and document overflow checks passed in explicit demo mode. Mobile drawer closed after selecting a section.
- Empty quote save was rejected with a clear validation message. Important numbers were verified with Arial/Helvetica and Latin digits. Temporary viewport overrides were reset.

## Still required before live release

### Follow-up verification

- Started Cloudflare Pages locally on `http://127.0.0.1:8788`, using local D1 and existing local Studio credentials.
- All eight read-only public/unauthenticated API probes passed.
- Authenticated GET checks passed for session, catalog, quotes, requests, projects, payments, promotions, audit and integrations. Test session was logged out afterward; business records were not changed.
- `wrangler whoami` reports no authenticated Cloudflare account. Local integration endpoint confirms Telegram is not configured; `.dev.vars` has only the Studio password.
- Remote migrations/deployment and real Telegram delivery remain blocked pending user Cloudflare sign-in and Telegram secret configuration. No real messages sent. Authenticated browser and cloud mutation/recovery tests are still pending; successful authenticated API reads do not replace them.

1. Review and apply pending D1 migrations to production with a backup; none were applied remotely here.
2. Deploy the Pages build and the separate reminders Worker, then configure that Worker's `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` secrets.
3. Confirm authenticated browser flows against Cloudflare-backed staging, including cloud save/recovery, session expiry, keyboard focus, client link acceptance and payment changes. Browser work here used Vite's explicit offline demo because port 5173 did not provide the Worker API; backend mutations were tested in an isolated VM/SQLite instead.
4. Authorize and run one real Telegram delivery check. Verify scheduled execution in Cloudflare logs.
5. No production data, actual customer links/messages, payment statuses or prices were changed by testing.
