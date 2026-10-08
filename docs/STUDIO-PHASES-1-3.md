# Studio — phases 1–3 implementation

## Scope
- Source backup before edits: sibling `studio-backup-20261008-195549` directory. No reset, commit, push, remote migration or deployment.
- Browser intentionally not used. Responsive checks here are code checks, not visual acceptance.

## Phase 1
- Extracted ten sections into `src/pages/studio/` and shared formatting/UI/audit helpers.
- Unified initial resource loading, abort cleanup, loading/error/retry states in `useStudioData`.
- Central JSON transport rejects HTML fallbacks; authenticated reads and writes detect HTTP 401.
- Preserved existing business behavior; draft persistence and promotion rules remain later phases.

## Phase 2
- Final scoped layout layer: shrinkable grid children and full-width inputs; no intrinsic numeric-input overflow.
- Quote summary stacks below the editor at <=1250px; rows use three columns, then two <=560px.
- Dedicated Latin numeric font for sensitive totals, quantities, references and number inputs; Arabic text retains its own font.
- Improved secondary text contrast and input touch heights; package details remain visible.
- Existing CSS retained for compatibility; new layout/type decisions are centralized in `studioLayout.css`. Complete legacy CSS removal is deferred until visual regression review.

## Phase 3
- `/studio` is the authenticated entry; prototype permits explicit demo mode.
- Session endpoint reuses existing cookie authentication; no password embedded in client source.
- Login/logout, session-expiry handling, periodic session verification and visibility checks.
- No silent fallback from failed cloud requests into demo mode; failed logout reports failure.
- Both entry routes prerender with noindex/nofollow; public site navigation/consent overlays excluded.

## Verification
- `node scripts/test-studio.mjs`: renders every extracted section in Arabic/English; checks JSON success, 401, HTML fallback rejection and responsive/numeric CSS guards.
- `npm run build`: compilation and prerender, including `/studio`.
- Final browser review still required at 360/390/768/1024/1440px and against a configured Cloudflare test environment for actual login/logout/expiry.
- Standard Vite at port 5173 does not implement Cloudflare API endpoints. Use the existing `dev:cf` workflow with local DB migrations and environment configuration to test authenticated flows; demo remains available explicitly.
