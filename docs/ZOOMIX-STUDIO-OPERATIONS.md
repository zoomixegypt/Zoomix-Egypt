# ZOOMIX Studio Operations

## Live capabilities

- Project briefs are stored in Cloudflare D1 through `POST /api/briefs`.
- WhatsApp remains the direct handoff when the client selects WhatsApp.
- Phone and email preferences are stored for follow-up inside Studio.
- Studio status flow: `new` → `contacted` → `in-progress` → `won` / `archived`.
- Internal notes are private to Studio and can be updated per request.
- Requests can be exported as a UTF-8 CSV from Studio, with an optional status filter.
- Studio shows non-sensitive operational signals from requests: routes, needs, sources and contact preference.
- Anonymous site-action measurement is opt-in only. It uses first-party D1 storage, no third-party SDK and no personal brief content.
- Brief submissions have an edge rate limit of five requests per 30 minutes per Cloudflare client fingerprint.

## Production secrets and bindings

- `STUDIO_PASSWORD` is a Cloudflare Pages production secret.
- `DB` is the `zoomix-studio` D1 binding.
- Automatic email notifications are ready in the Worker but require Cloudflare Email Sending authorization plus `EMAIL`, `EMAIL_FROM` and `ADMIN_EMAIL` configuration.
- Turnstile can be added when a site key and secret are available; the current honeypot and edge rate limit remain active without it.

## Owner workflow

1. Open `/studio` and sign in.
2. Review the newest requests first.
3. Add an internal note with the next move or last contact.
4. Update the status after each client touchpoint.
5. Export CSV when a handoff or weekly review is needed.
