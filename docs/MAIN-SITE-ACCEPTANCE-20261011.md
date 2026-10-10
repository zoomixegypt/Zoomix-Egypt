# Public website acceptance — expanded continuation

Scope: local public website. No deployment, commit/push, production briefs, or external messages. Existing unrelated Studio work is preserved.

## Changes

1. Optional browser storage: reads/writes/removals return safe fallbacks for privacy restrictions, quota failures and blocked storage getters.
2. Language initialization and persistence tolerate inaccessible storage; document language/direction updates are no longer preceded by an unsafe storage write.
3. Analytics consent reads tolerate inaccessible storage and default to unknown; page-view tracking is safe without a browser global. No consent is inferred from a failed read.
4. Brief initialization and clearing previous package choices tolerate unavailable storage.
5. WhatsApp draft opening is isolated and returns a blocked state rather than invalidating a saved request. The destination is fixed, message encoding is tested, and opener isolation retained.
6. Receipt messaging distinguishes saved request, prepared WhatsApp draft and blocked WhatsApp. It does not claim a WhatsApp message was sent.
7. Important receipt reference appears separately with Arial-family public-number styling, LTR isolation and no wrapping. The old English mobile receipt visibly split the reference into three lines at 360px.

## Acceptance evidence

| Area | Evidence | Limit |
| --- | --- | --- |
| Arabic email save/double click | Browser receipt ZMX-QA-004; mock POST count 3→4 | Same form, local mock only |
| Arabic call save | Browser receipt ZMX-QA-005; mock POST count 4→5 | No real call; previous build |
| English interface | Fresh English email journey reached review; missing email/consent produced explicit errors; valid double-click save returned ZMX-QA-006 with disabled saved button; mock count 5→6 | Local mock only; no real email |
| English mobile form | Latest receipt screenshot at 360×800; document width 360; reference on one line, computed Arial family and nowrap | Not complete visual acceptance of every public section |
| Mobile keyboard | First/last Tab and Shift+Tab wrap; Escape restores opener | Arabic mobile menu only |
| Recommendation paths | 32 bilingual route/render checks | Automated, not all browser journeys |
| Request helper | 16 bilingual success/failure/timeout cases | Injected responses, no production API |
| Optional storage | 19 normal/SSR/privacy/quota/getter checks | Utility behavior, not browser privacy settings |
| WhatsApp draft | 6 bilingual destination/encoding/open-block cases | Injected opener; no real WhatsApp open/send |
| Receipt rendering | 12 language/contact/block combinations | SSR, not final mobile screenshot |
| Storage-blocked integration | Language-provider SSR and analytics no-consent calls | Does not simulate every browser effect |

## Remaining before public-site acceptance

- Real-browser WhatsApp prepared/blocked flow; external draft must not be counted as a sent message.
- Complete fresh bilingual desktop/mobile visual review of all sections and project pages.
- Keyboard traversal of the whole page, text zoom, screen reader, slow network and image/link checks.
- Physical phone and actual Safari/Firefox testing.
- Independent published-catalog review and production integration only in an explicitly approved workflow.

This is not full release acceptance. Automated tests, local mock requests, browser evidence and production verification are distinct.

## Verification results

- Latest `npm run test:main-site`: exit 0; 32 recommendation/render checks, 16 submission-helper cases, 19 storage checks, 6 WhatsApp draft cases. Main suite also renders 12 receipt combinations and asserts storage-blocked analytics/language behavior.
- `npm run test:studio`: exit 0; core, commercial, matrix and display suites. This is regression protection for shared language/analytics changes, not a new Studio browser audit.
- Latest `npm run build`: exit 0, every configured route prerendered.
- Latest browser proof: `../main-english-success-fixed-20261011.png`. English email double-click produced exactly one new mock request. Temporary mobile viewport reset.
- Browser interaction sometimes returned a delayed language change; no confirmed language-switch defect is asserted. Storage guards address independently identified failure paths.
