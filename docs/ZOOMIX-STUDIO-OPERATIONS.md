# ZOOMIX Studio Operations

For hosting, deployment, Cloudflare, D1, and change-control details, use the [ZOOMIX Technical Source of Truth](./ZOOMIX-TECHNICAL-SOURCE-OF-TRUTH.md).

## Live capabilities

- Project briefs are stored in Cloudflare D1 through `POST /api/briefs`.
- WhatsApp remains the direct handoff when the client selects WhatsApp.
- Phone and email preferences are stored for follow-up inside Studio.
- Studio status flow: `new` → `contacted` → `in-progress` → `won` / `archived`.
- Internal notes are private to Studio and can be updated per request.
- Requests can be exported as a UTF-8 CSV from Studio, with an optional status filter.
- A full JSON backup of requests and recent analytics events can be downloaded from Studio without another storage service.
- Each request has direct WhatsApp, phone and email actions, so follow-up does not depend on a paid notification service.
- Studio shows non-sensitive operational signals from requests: routes, needs, sources and contact preference.
- Anonymous site-action measurement is opt-in only. It uses first-party D1 storage, no third-party SDK and no personal brief content.
- Brief submissions have an edge rate limit of five requests per 30 minutes per Cloudflare client fingerprint.

## Production secrets and bindings

- `STUDIO_PASSWORD` is a Cloudflare Pages production secret.
- `DB` is the `zoomix-studio` D1 binding.
- Automatic email notifications are intentionally not enabled to keep the current setup free. The owner can use the direct email action in Studio, or enable Cloudflare Email Sending later if a paid Workers plan is acceptable.
- Turnstile can be added when a site key and secret are available; the current honeypot and edge rate limit remain active without it.

## Owner workflow

1. Open `/studio` and sign in.
2. Review the newest requests first.
3. Add an internal note with the next move or last contact.
4. Update the status after each client touchpoint.
5. Export CSV when a handoff or weekly review is needed.
