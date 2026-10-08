# Studio — phases 4–6

## Phase 4: drafts and save safety
- Separate demo/cloud drafts and per-quote/per-lead workspaces, immediate device backups and timestamps.
- Draft list and reopen controls. New quotes have empty client/project/items and no automatic promo.
- Unsaved guards for internal navigation, browser unloading and logout; invalid promo attempts also mark the quote dirty.
- Device backup does not claim a database save; storage failures are surfaced.
- Catalog editor backups and demo catalog/promotion persistence. Legacy single local backup can be restored in the default demo workspace.
- Clean cloud quotes fetch current server versions; dirty recovery stays local until explicit database save. Stale base versions are rejected.

## Phase 5: navigation and follow-up
- URL parameters preserve section, selected record and draft workspace across reload/back.
- Search opens quote/catalog editors; request/project/payment results scroll to and highlight matching rows.
- Dashboard quote actions open specific quotes; saved quote list and local draft list support reopening.
- Search arrow keys, modal Tab trapping and Escape handling.
- Cloud refresh every 30 seconds while visible and on returning to tab, plus manual refresh and timestamp.
- Failed background refresh retains the editor and shows a warning; no silent demo fallback.

## Phase 6: publication and discounts
- Public catalog reads its published snapshot independently of admin drafts. Archive removes publication; publish replaces it after preview/confirmation.
- Recovery migration restores older publications from catalog versions/audit history where possible.
- Shared integer minor-unit calculations for Worker/admin/client. Frozen per-line discounts correctly follow optional selections.
- Server enforces category/item eligibility, dates, scheduled start, limits and a specific one-unit free addon.
- Redemption counted on acceptance only if the selected items receive a discount. Triggers prevent exhausted/duplicate redemption.
- Acceptance, project, payments, audit and redemption use one D1 transaction batch; failure rolls back all.
- Accepted quote versions are immutable. A new version invalidates its earlier public link and requires resending.

## Verification and limits
- `node scripts/test-studio.mjs`: Arabic/English section SSR, blank new quote and API guards.
- `node scripts/test-commercial.mjs`: in-memory SQLite migrations, storage failure/draft isolation, scoped/free rules, publication separation, quote read/send/accept, selection totals, duplicate acceptance, exhausted code and project-failure rollback.
- Migrations 0011–0013 applied to local D1 only; production unchanged.
- No browser used. Interaction/focus/storage recovery and configured Cloudflare flows need final browser review.
- No commit, push or deployment.
