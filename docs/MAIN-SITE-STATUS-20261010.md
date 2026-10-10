# Main website phases 1–5 — 2026-10-10

Scope: public website only. Existing unrelated Studio changes are preserved. No commit, push, deployment or production data changes.

## Implemented locally

- Explicit Arabic/English content scope: Zoomix shoots, produces and edits; equipment rental and travel excluded. Prices and deliverable counts unchanged.
- Contextual package buttons, price decimals, adjacent scope/payment notes and complete package details.
- Mobile package arrows, current-card indicator, keyboard navigation and comparison table.
- Packages in navigation, translated mobile navigation and secondary placement of external inspiration references.
- Recommendation skips singleton decisions; duplicate content goal dictionary key corrected. Short-question copy reflects two/three-question paths.
- Public Arabic typography and clear sensitive-number font; reduced desktop hero size.
- Final brief review with direct edit actions and factual data-use explanation.
- Immediate submission lock, busy/disabled button and retry after failed request; successful submission prevents another send from the same form. This is not server-side idempotency across reloads/devices.
- Lazy project modal focus containment and restoration.
- Case-study system cards now link to the original full direction/services/deliverables instead of repeating their text. Public Arabic font coverage includes case studies and footer.
- Submission success now requires an explicit `ok: true` and non-empty reference code. HTTP-200 HTML/invalid replies never produce a false success. A 30-second confirmation timeout releases the form lock with bilingual uncertainty wording; no automatic retries. Server error bodies are not exposed to the user.

## Verified

- Automated main-site suite rerun passed after submission guards and short-question copy: 32 Arabic/English recommendation branches, valid package IDs, package scope, rail semantics and public component SSR.
- Studio core/commercial/matrix suites passed in the regression run; final display suite initially failed on the superseded price-note phrase. Updated it to assert shooting/production/editing inclusion and equipment/travel exclusion in both languages; isolated display rerun passed.
- Production build/prerender passed after adding the submission lock, before the latest short-question copy changes.
- Local browser: content package carried into brief; complete review displayed; returning to basics/details retained name and description.
- Local browser: focus remained inside the lazy project dialog during loading and Tab; Escape removed the dialog and restored a project-card focus.
- Earlier local mobile check: rail arrows/indicator/comparison and package transfer, no body horizontal overflow at 360px. These are historical checks, not a fresh final mobile regression.

- Final build and all route prerenders after case-study refinements completed successfully.
- Language-switch retest succeeded: English hero and translated brief/navigation observed. Earlier immediate Arabic read was not proof of a broken switch; browser control had delayed responses/timeouts.
- Fresh English mobile check at actual 360×800: document width 360, no horizontal body overflow; next package showed 2 of 3; comparison retained complete scope for all three foundation packages. Temporary viewport reset.
- 16 isolated bilingual submission tests passed (8 per language): valid save, HTML response, empty object, missing reference, server failure, rate limit, offline, timeout. These exercise the real request helper with injected responses, not a browser or live API. Main recommendation/render suite also passed again.
- Browser isolated API test: selected Content Start, filled full basic details/description and email contact with `qa@example.com`, consent checked. Local QA server deliberately returned 503 after 1.5 seconds. During pending request, saving button was disabled; after rejection an explanatory alert appeared, send became enabled again, and the entered name remained after returning to edit. Server log confirmed exactly one POST. No real records, Telegram or email.
- `scripts/serve-brief-qa.mjs` is loopback-only, memory-only test infrastructure, never a production backend. All requests stay local; records disappear when it stops. Project name `QA FAIL` simulates a failed save.
- Real HTTP integration test passed via `scripts/test-brief-qa-http.mjs`: deliberate failure, one manual retry producing a valid email-contact save reference, then English call-contact save with a distinct reference. QA server log and status confirmed exactly three POSTs (one failure, two successes), with no automatic retry. This verifies the real request helper over local HTTP against the mock server, not the production worker/database/email or browser success UI.
- The next browser retry-success attempt still failed before accessing the existing test tab (control timeout). No successful browser-save or rapid-click claim is added.

## Not yet accepted / still open

### Expanded continuation — 2026-10-11

- See `MAIN-SITE-ACCEPTANCE-20261011.md` for the expanded change list and evidence matrix.
- Optional-storage guards added for language initialization/persistence, analytics consent and brief package selection/clearing. Analytics page-view invocation is SSR-safe.
- Added 19 storage utility checks, 6 bilingual injected WhatsApp-opener cases and 12 receipt render combinations, plus blocked-storage language/analytics integration assertions.
- English interface was eventually observed with existing saved receipt and retained project data. At 360×800 document width was 360. This is not a new English save.
- English mobile inspection found reference wrapping into three lines. Receipt now uses a separate no-wrap, LTR public-number reference. WhatsApp receipt copy distinguishes a draft from a sent message and blocked opening from successful preparation.
- Fresh latest-build English email save passed with missing-field validation first, then double-click yielding receipt ZMX-QA-006 and exactly one mock POST (5→6). At 360×800 the corrected reference stayed on one line in Arial; document width 360. Screenshot: `../main-english-success-fixed-20261011.png`. WhatsApp real-browser acceptance remains open. No production writes or deployment.
- Latest main-site suite, all Studio regression suites and build/prerender finished with exit 0. See the 2026-10-11 evidence matrix for test limits.

### Contact-path continuation and confirmed-save hardening

- Arabic call-contact browser scenario passed with fictional reserved number +12025550101: saving disabled state followed by saved receipt `ZMX-QA-005`. Local mock count increased from 4 to 5. Screenshot: `../main-call-success-20261010.png`. No real call/notification was made. English test data does not mean the interface was English: it remained Arabic, so English UI acceptance is still open.
- Confirmed-save handling now tolerates localStorage cleanup failure and exceptions opening WhatsApp. Neither should revert a confirmed server receipt into a retryable failed-save state; blocked WhatsApp retains the existing manual fallback. Browser scenario above ran the previous built bundle; these new exception guards are not browser fault-injection tested yet.
- Main-site automated suite passed after the guards (32 route/render cases and 16 request-helper cases). These suites do not simulate storage/window exceptions inside the React component.
- Build and every configured route prerender completed with exit 0 after these guards.
- WhatsApp browser flow, English contact flow and final mobile-form visual review remain open; no acceptance claim is made for them.

### Browser acceptance continuation — successful local save and mobile keyboard

- Browser connection recovered in a fresh local test tab. Retained Arabic draft basics/description were reviewed at step 3; test email `qa@example.com` and explicit contact consent were supplied.
- Native double-click on Send caused the disabled saving state, followed by disabled saved state and receipt `ZMX-QA-004`. Local mock status changed from 3 to 4 submissions: exactly one POST for the double-click. This proves same-form rapid-click protection in this Arabic email scenario, not server idempotency or all contact paths.
- Saved screenshot: `../main-brief-success-20261010.png`. No production request, email or Telegram was sent.
- At 360×800, Arabic mobile-menu opening focused its first control. Shift+Tab wrapped to its last control; Tab wrapped back to the first. Escape closed the menu and restored focus to the menu opener. Temporary viewport override was reset.
- These observations supersede the earlier inability to verify this particular success/rapid-click/menu-boundary scenario. Full bilingual/contact-path/visual acceptance remains incomplete.

### Latest continuation — keyboard hardening and verification

- Mobile navigation now focuses its dialog container before its first control, excludes hidden/inert controls from keyboard wrapping, and recaptures Tab/Shift+Tab when focus starts outside the dialog. Existing Escape/trigger restoration remains unchanged.
- Added source regression assertions for these navigation guards. `npm run test:main-site` passed: 32 bilingual recommendation/render checks and 16 isolated request-helper cases. Source assertions are not a substitute for keyboard browser testing.
- `npm run build` finished with exit 0, including every configured route prerender, after the navigation change.
- Browser continuation could not be completed: the next-step click timed out before command dispatch, and the subsequent snapshot returned no usable page state. Successful browser submission, rapid-click protection and fresh keyboard acceptance remain open. No additional browser POST is claimed.
- No production deployment, commit or push was performed.

- Full fresh Arabic/English desktop/mobile visual review, actual submission/retry/double-click behavior against an isolated API, all contact paths.
- Same-form rapid-click protection is browser-verified for the Arabic email scenario above; remaining languages/contact scenarios and server-side idempotency are not yet accepted. A timeout can follow a successful server save; the UI warns before manual resubmission.
- Browser retry-success scenario could not be completed: repeated browser-control timeouts occurred during step navigation, and replacement-tab creation timed out. The failure/recovery observations above are valid, but successful UI save/rapid-click tests remain open. Do not treat a browser-control timeout as a confirmed application defect.
- Simplification of repeated route terminology and image-specific case-study captions; repeated system-card body text has been removed, final visual review of that change remains.
- Full keyboard traversal including Shift+Tab at dialog boundaries, text zoom, slow/offline network, links/images, contrast and screen-reader checks.
- Actual Safari/Firefox and physical phone testing.
- Published cloud catalog may override local defaults; review independently before any deployment.

Phases 1–4 have local implementation, with remaining content refinements. Phase 5 is partially verified, not complete. Do not describe the product as fully tested or released.
