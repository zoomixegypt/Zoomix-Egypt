# Comprehensive Acceptance QA — 2026-10-11

## Scope

This run covers the requested acceptance tracks only:

- S8 — Studio lifecycle and locked states.
- A1 — Main-site acceptance in Arabic and English, desktop and responsive checks.
- A2 — Studio acceptance under repeated actions, offline/error conditions and concurrent pressure.
- I1 — Isolated QA flow from public selection/request through Studio, quote, client acceptance, project, payments and reports.

All data used by the API and lifecycle tests is in-memory SQLite or explicitly marked `is_test`. No production D1, live API, real client data, commit, push or deploy was used.

## Results

### S8 — Studio lifecycle and locked states: PASS

- Commercial lifecycle tests passed for quote creation, sending, public viewing, acceptance, duplicate acceptance and project/payment creation.
- Accepted quotes reject mutation and resend attempts.
- Declined quotes reject acceptance and resend attempts.
- Accepted status cannot be reopened.
- Race tests preserve accepted state and reject stale quote sends.
- Preview/print/public-view contracts and bilingual labels passed.

Evidence: `npm run test:studio` — the isolated matrix reported **265/265 passed**.

### A1 — Main-site acceptance: PASS

- `test:main-site` passed **32 bilingual route branches** and verified package scope, visible comparison, final review, privacy copy and navigation guards.
- The submission suite passed **16 isolated bilingual cases**.
- Studio SSR/render checks passed **20 Arabic/English section renders** plus API/401/HTML and responsive CSS guards.
- Production build passed and prerendered `/`, `/route-finder`, Studio and all project routes.
- Local preview smoke check at `1690×1319` verified:
  - Arabic Route Finder loads.
  - Quick Match advances from question 1 to question 2 to the recommendation.
  - Recommendation, comparison-only alternatives and “Continue with your project details” are present.
  - Language switch changes `lang`/`dir` to English; English Route Finder renders the English recommendation and package labels.

The responsive checks are source/CSS and built-page acceptance checks. A physical iOS/Android device was not used in this local run.

### A2 — Studio resilience and repeated actions: PASS

- Offline, timeout, malformed/HTML/empty responses and server rejection are covered with no automatic retry behavior.
- Browser-storage denial, quota failure, blocked getter and SSR behavior passed **19 checks**.
- Rate limit behavior passed: five accepted attempts, sixth rejected, expiry reset accepted.
- Duplicate acceptance, stale versions, concurrent send/view races and rollback-on-failure passed.
- Large-body rejection, auth guards and invalid payloads passed.

No live production stress test or production network outage simulation was run.

### I1 — Isolated end-to-end QA flow: PASS

The isolated matrix executed this linked flow:

1. Create a QA-tagged public brief/request.
2. Create and send a quote linked to that brief.
3. Open the client-facing quote and accept it with terms.
4. Verify the brief becomes `won`.
5. Verify exactly one project and the expected payment schedule are created.
6. Record payment metadata and generate the related operational document path.
7. Verify reports exclude QA leads from business loss analysis while preserving the linked lifecycle.

Backup preview/restore/rollback tests also passed on isolated mode only, including exact restored data and foreign-key validation.

## Commands run

```text
npm run test:main-site
npm run test:studio
npm run build
```

## Notes

- Node emitted existing module-type performance warnings for source files; they did not affect test results.
- No production lifecycle script was run because it requires live credentials and would mutate the live environment.
