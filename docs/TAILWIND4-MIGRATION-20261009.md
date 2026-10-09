# Tailwind 4 migration — 2026-10-09

## Scope and support decision

The owner explicitly changed the browser-support decision to modern browsers before release. Minimum supported versions: Chrome/Edge 111, Firefox 128, Safari/iOS 16.4. Older browsers are not supported by this release. See https://tailwindcss.com/docs/upgrade-guide.

This change upgrades frontend tooling only. It does not change D1 schemas, customer records, Telegram secrets, or the reminder worker.

## Implementation

- Tailwind and its Vite integration pinned to 4.3.3; removed the old Tailwind/PostCSS configuration and Autoprefixer dependency.
- CSS-first theme preserves brand fonts, slow-spin animation and typography plugin. Explicit source scanning is limited to `src`.
- Preserved the previous border color and enabled-button cursor defaults.
- Moved existing global overrides into the utilities layer to preserve their cascade against Tailwind utilities.
- Excluded explicit `font-arabic` elements from the generic bold font override; Arabic headings resolve to Cairo.
- Migrated renamed outline, small backdrop-blur and gradient utilities; gradients explicitly retain sRGB interpolation.
- Important financial numbers remain English digits in Arial/Helvetica. Studio and client quote component CSS was not changed.
- Vite build targets and Browserslist now agree on the modern browser baseline.

## Verification before release

- Production build succeeds, including prerendered routes.
- Existing Studio matrix: 250 passed, 0 failed. Existing bilingual SSR suite: 20 routes passed. Commercial atomic-write/rollback tests passed.
- Full dependency audit, including development dependencies: 0 reported vulnerabilities. This is an advisory audit, not a penetration test.
- Browser review in the Codex Chromium-based browser: home Arabic/English at mobile and desktop sizes; mobile menu language switching; authenticated local Studio quote workspace Arabic/English.
- Studio DOM inspection confirms Cairo heading, Arial financial values and no page-level horizontal overflow at 360px or desktop width.
- Screenshots saved outside Git, in the parent workspace: `tailwind4-home-ar-mobile.png`, `tailwind4-home-en-mobile.png`, `tailwind4-studio-ar.png`.
- Studio/client-quote CSS bundles remain byte-identical to the pre-migration versions. Main CSS is **not** byte-identical: it is approximately 114.40 KB / 20.10 KB gzip, compared with 88.82 KB / 17.35 KB gzip previously.

## Limitations

Safari and Firefox were not independently exercised. The browser review is a focused migration regression check, not a fresh exhaustive verification of every business operation. Production deployment and post-deployment smoke verification must be recorded after they actually succeed.
