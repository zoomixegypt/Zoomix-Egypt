# ZOOMIX production-readiness audit — 2026-10-11

## Scope and safety boundary

This audit covers the public React/Vite site, the Cloudflare Pages Worker, local D1 migrations, the commercial studio routes, client quote flows, brief submission, bilingual rendering, responsive behavior, SEO output, security guards, and isolated end-to-end logic.

The audit was run in the active worktree only. No production D1, Cloudflare deployment, live reminder, email, Telegram message, commit, push, or deploy was performed. Existing prices and package definitions were not changed, and `Unused/` was not touched.

## Executive verdict

**Local release candidate: PASS WITH FOLLOW-UP.**

The functional and data-integrity paths are in good shape for a controlled release candidate. The main remaining release gates are operational rather than a failing local code path: verify production bindings and email/Telegram delivery, run real-device browser checks, and collect real Core Web Vitals. The last three items cannot be honestly marked complete from this environment without production access or a supported DevTools performance session.

Approximate readiness scores:

| Area | Score | Finding |
| --- | ---: | --- |
| Main-site functionality | 9/10 | Bilingual route/package/brief branches pass isolated regression tests. |
| Studio functionality and data integrity | 9/10 | 276 isolated matrix checks pass, including locked quote states and backup preview/restore/rollback. |
| Security baseline | 8.5/10 | Origin checks, HttpOnly/SameSite sessions, body limits, honeypot/rate limits, CSP and security headers are present. External WAF/Turnstile/penetration testing remains unverified. |
| Accessibility and responsive UX | 7.5/10 | Semantic controls, focus behavior, RTL/LTR paths and local browser smoke are covered; physical iOS/Android and screen-reader passes remain. |
| Performance | 7/10 | Build is healthy and route chunks are split; actual LCP/INP/CLS were not measured because the configured Chrome DevTools MCP is unavailable. |
| SEO/shareability | 8/10 | Prerendered HTML, canonical URLs, sitemap, robots and PNG OG image are present. English is still client-selected on the same URL, so separate hreflang/indexable English pages remain a follow-up. |

## Fixes applied during this audit

### 1. Response security headers

`public/_worker.js` now applies a baseline to API responses, HTML, static assets, SPA fallbacks and live-update responses:

- Content Security Policy allowing only the site, Google Fonts, Google Tag/Analytics, WhatsApp form targets and required media/image sources.
- `X-Content-Type-Options: nosniff`.
- `X-Frame-Options: DENY` and `frame-ancestors 'none'`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- A restrictive `Permissions-Policy`.
- `X-Permitted-Cross-Domain-Policies: none`.
- HSTS is added only for HTTPS requests, so local HTTP development is not forced to HTTPS.

The font loader in `index.html` no longer relies on an inline `onload` handler, which keeps the CSP stricter.

### 2. Studio login abuse protection

Migration `0022_studio_login_rate_limits.sql` adds a local/production-safe D1 table for failed login attempts. The Worker allows ten attempts per IP + user-agent fingerprint within fifteen minutes, returns `429` with `Retry-After`, and resets the counter after a successful login. Local requests without a Cloudflare client IP are intentionally not throttled.

### 3. Reproducible Cloudflare local development

- Wrangler is now an exact development dependency in `package.json`, with the resolved package recorded in `package-lock.json`.
- `dev:cf` now applies **local** D1 migrations before building and starting Pages. It never uses `--remote`.
- `.env.example` documents the optional `ADMIN_EMAIL` binding without exposing secrets.
- Prettier ignores macOS `._*` resource-fork files that were polluting the shared worktree.

## Verification results

### Automated regression

- `npm run test:main-site` — PASS: 32 bilingual route/package/navigation branches, 16 isolated bilingual submission cases, 19 browser-storage cases, and 6 WhatsApp draft cases.
- `npm run test:studio:matrix` — PASS: **276/276** isolated SQLite checks, including login throttling, auth guards, quote lifecycle, discount/tax/payment rules, locked accepted quotes, attachment limits, backup preview, restore, rollback and foreign-key validation.
- `npm run test:studio` — PASS: bilingual studio views, commercial rules, matrix and display contracts.
- `npm run build` — PASS: 1,785 modules transformed; route chunks generated; 17 HTML routes prerendered.
- `npm audit --omit=dev` — PASS: 0 vulnerabilities reported.
- `npm ci --dry-run --ignore-scripts` — PASS.
- `npm run db:local` — PASS: all 22 migrations applied to isolated local D1.

### Local runtime smoke

With `npm run dev:cf`:

- `/api/catalog` — `200` after automatic local migrations.
- `/route-finder` — `200`.
- `/studio` — `200`.
- `/`, `/route-finder`, `/robots.txt`, `/sitemap.xml` and API responses carried the security headers.
- A cross-origin POST to `/api/briefs` returned `403` (`Cross-origin writes are not allowed.`).
- No production endpoint was called.

### Build-size observations

The largest generated browser assets were approximately:

- main JavaScript: 316 KB raw / 100 KB gzip;
- studio lazy JavaScript: 177 KB raw / 49 KB gzip;
- main CSS: 117 KB raw / 21 KB gzip;
- Route Finder lazy JavaScript: 76 KB raw / 18 KB gzip.

Images have WebP variants and the gallery uses responsive `srcSet`, lazy loading and async decoding for non-critical images. These figures are acceptable for the current candidate but should be a future performance optimization target on mobile 4G.

## Remaining findings and release gates

### P1 — production configuration still needs an authorized check

The local code cannot prove that the production Pages project has the correct `DB`, `STUDIO_PASSWORD`, `ADMIN_EMAIL`, `EMAIL`/`EMAIL_FROM`, Telegram secrets, scheduled reminder binding and migration state. This is the final operational gate before release. It must be checked from Cloudflare with the owner’s explicit approval; no secret should be pasted into chat or committed.

### P1 — real-device and performance evidence is still missing

The local browser smoke covered representative Arabic/English flows, Quick Match, Route Finder, package selection and studio rendering. It did not replace a physical 360/375/390px iOS and Android pass, Safari/Firefox pass, screen-reader pass, or a real network trace. The available performance tool did not expose Chrome DevTools navigation/trace/network APIs in this session, so LCP, INP, CLS, TBT and real 4G behavior remain **unmeasured**, not failed.

### P2 — format baseline is not clean

`npm run format:check` still reports 43 existing source/script files as not formatted. The macOS metadata parser failures were removed from the check, but the project-wide formatting baseline itself was not rewritten because doing that would create a large unrelated diff. The next maintenance pass should format those files in a dedicated change.

### P2 — English SEO is client-selected, not a separate indexable URL

Arabic prerendered metadata, canonical links, sitemap, robots and JSON-LD are present. The language toggle updates document metadata in the browser, but there is no separate English URL/hreflang pair. If English organic search is a goal, add `/en/` (or equivalent) with server/prerendered English metadata before adding hreflang.

### P2 — external delivery integrations need a controlled verification

Brief storage and response behavior are tested. Actual email, Telegram and scheduled-reminder delivery were intentionally not invoked in this audit. Verify them with QA-only recipients and isolated records after production bindings are confirmed.

### P3 — optional hardening and polish

- Add a managed WAF/Turnstile layer if spam volume justifies it; the current honeypot, request-size guard and edge rate limits remain active.
- Add real-user monitoring or a supported Lighthouse/DevTools run and set budgets for the main bundle and mobile Core Web Vitals.
- Consider a service worker only if offline/PWA behavior is an actual product requirement; the manifest and mobile metadata alone are not a full offline PWA.

## Recommended next sequence

1. Owner-approved production configuration check and migration dry run.
2. QA-only production smoke: login, catalog, brief, quote, client response, project, payment and report paths.
3. Real-device Arabic/English accessibility and overflow pass.
4. Performance trace and image/bundle budget pass.
5. Review the final diff; only then decide separately whether to commit, push or deploy.
