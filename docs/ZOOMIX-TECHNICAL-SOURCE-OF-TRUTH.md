# ZOOMIX Technical Source of Truth

> This file is the operational reference for the live ZOOMIX website and Studio. Update it whenever production architecture, hosting, data, secrets, or deployment behavior changes.

Last verified: 2026-10-07  
Latest verified commit: `5b84b4f`

## 1. Canonical architecture

ZOOMIX uses one repository, one Cloudflare Pages project, and one domain:

- Public website: `https://zoomixegypt.com/`
- Private owner Studio: `https://zoomixegypt.com/studio`
- Route Finder: `https://zoomixegypt.com/route-finder`
- GitHub repository: `https://github.com/zoomixegypt/Zoomix-Egypt`
- Production branch: `main`
- Cloudflare Pages project: `zoomix-egypt`

Studio is a private route inside the same application. It is not a second website, subdomain, repository, or Cloudflare project.

The older Cloudflare Pages project named `zoomixegypt` is legacy infrastructure. Do not deploy new production changes there.

## 2. Deployment flow

The approved production flow is:

1. Make and test the code change locally.
2. Run `npm run build`.
3. Commit to `main`.
4. Push to `origin/main`.
5. Cloudflare Pages automatically builds and deploys the new commit.
6. Verify the live website and Studio routes.

Do not use a direct `wrangler pages deploy` for normal production releases. GitHub → Cloudflare automatic deployment is the source of truth.

### Build settings

Configured in Cloudflare Pages:

```text
Build command: npm run build
Build output directory: build
Production branch: main
```

The build command also runs `scripts/prepare-pages-routes.mjs`, which creates direct entry files for `build/studio/index.html` and `build/route-finder/index.html`.

## 3. Cloudflare configuration

The project configuration is in [`wrangler.jsonc`](../wrangler.jsonc):

```jsonc
{
  "name": "zoomix-egypt",
  "pages_build_output_dir": "./build",
  "compatibility_date": "2026-10-06",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "zoomix-studio",
      "database_id": "436ac787-322e-41a8-974f-856e98fa89b5"
    }
  ]
}
```

### Required production secret

Cloudflare Pages → Settings → Variables and secrets → Production:

```text
Name: STUDIO_PASSWORD
Type: Secret
Value: never store in this file or in GitHub
```

The actual password is intentionally excluded from this document.

### Binding rules

- `DB` must remain the exact binding name used by the Worker.
- The D1 database must be created in the same Cloudflare account that owns the `zoomix-egypt` Pages project.
- A database with the same name in another Cloudflare account is not valid for this deployment.
- Do not add Durable Object migrations or an unconfigured `STUDIO_EVENTS` binding to the Pages config. Studio has a polling fallback and does not require Durable Objects for the current setup.
- D1 schema migrations are currently applied from the D1 Console because the local Wrangler login may belong to a different Cloudflare account.

## 4. D1 data layer

Database:

```text
Name: zoomix-studio
Binding: DB
Database ID: 436ac787-322e-41a8-974f-856e98fa89b5
```

Schema files, in order:

1. [`migrations/0001_create_zoomix_studio.sql`](../migrations/0001_create_zoomix_studio.sql)
2. [`migrations/0002_studio_operations.sql`](../migrations/0002_studio_operations.sql)
3. [`migrations/0003_create_zoomix_analytics.sql`](../migrations/0003_create_zoomix_analytics.sql)

Expected tables:

- `brief_requests`
- `studio_sessions`
- `brief_rate_limits`
- `analytics_events`

The expected table count is 4.

## 5. Runtime and API behavior

The Worker is [`public/_worker.js`](../public/_worker.js).

- `/api/*` requests are handled by the Worker.
- Non-API client routes are served through the SPA fallback without changing the browser URL.
- `/studio` and `/route-finder` must return `200`, not redirect to `/`.
- Logged-out `GET /api/studio/requests` should return `401 Studio login required.`.
- A `503 Studio access is not configured yet.` means `DB` or `STUDIO_PASSWORD` is missing from the active production deployment.

Important API routes:

```text
POST /api/briefs
POST /api/studio/login
POST /api/studio/logout
GET  /api/studio/requests
GET  /api/studio/events
GET  /api/studio/insights
GET  /api/studio/export.csv
GET  /api/studio/backup.json
POST /api/analytics/events
```

Current status values:

```text
new → contacted → in-progress → won / archived
```

Email notifications are intentionally disabled. Client handoff uses WhatsApp, phone, or the manually selected contact method inside Studio.

## 6. Project brief experience

The brief keeps the same ZOOMIX visual language and page layout, but the form is a real three-step Wizard:

1. Basics: name, project, activity, and the carried-over Route Finder/package selection.
2. Details: only the fields relevant to the selected route, including event or content fields when applicable.
3. Send: preferred contact method, only the contact fields required for that method, consent, and submission.

Route Finder and package choices are carried into the brief and are not requested a second time. The client can use **Change selection** to return to Route Finder. Optional and route-specific fields remain hidden until they are useful.

## 7. Verification checklist after every production change

Run locally:

```bash
npm run build
git diff --check
```

After Cloudflare finishes the GitHub deployment, check:

```text
https://zoomixegypt.com/
https://zoomixegypt.com/studio
https://zoomixegypt.com/route-finder
```

Then verify that:

- The latest deployment commit is the commit just pushed to `main`.
- `/studio` does not redirect to `/`.
- Studio login works with `STUDIO_PASSWORD`.
- The Studio request list loads.
- A test brief appears in Studio after submission.
- No production secret appears in Git, logs, screenshots, or this file.

## 8. Known operational rules

- Keep Arabic and English experiences in the same application and maintain both when changing user-facing copy.
- Keep Route Finder independent from the package display on the home page; it guides the user toward a suitable path and then carries the choice into the brief.
- Do not remove existing D1 data or the old project without an explicit backup and approval.
- Before any Cloudflare data operation, verify the active account is the Zoomix account, not another local Wrangler profile.
- Use the D1 backup endpoint from Studio before any destructive database operation.

## 9. Change log

### 2026-10-07 — Studio deployment stabilized

- Added direct route entry generation for `/studio` and `/route-finder`.
- Fixed the Pages Worker fallback to fetch `/` internally, preserving client-side URLs.
- Added the production D1 binding `DB` to the Wrangler configuration.
- Replaced the wrong-account database ID with the Zoomix-account database ID.
- Removed invalid trailing-slash redirect rules that Cloudflare reported as infinite loops.
- Confirmed `/studio` and `/route-finder` return `200`.
- Confirmed the Studio API progressed from `503` to `401`, proving the D1 binding and production secret are active.
- Converted the Project Brief into a three-step Wizard while preserving the existing page layout and visual identity.
- Added conditional visibility for route-specific and contact-specific fields.

Relevant commits:

- `f5773f5` — publish direct entries for client routes
- `e998f18` — preserve client routes in Pages fallback
- `3ce2f78` — initial D1 binding attempt (wrong account ID; superseded)
- `5b84b4f` — bind Studio to the Zoomix D1 database
