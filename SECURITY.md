# Security Policy

## Supported versions

MotionFolio is an early-stage starter project. Security fixes are applied to the
latest `main` branch and the most recent release.

| Version | Supported |
| ------- | --------- |
| 0.1.x   | ✅        |

## Frontend API keys are exposed to the browser

This is the most important security note for this project.

MotionFolio is a **client-side single-page app** built with Vite. Vite inlines every
environment variable prefixed with `VITE_` (and, in this project, `REACT_APP_`) into
the **production JavaScript bundle**. That means:

- **Any key in your `.env` ships to the browser** and is readable by anyone who opens
  your deployed site (via DevTools or by reading the bundled JS).
- The direct Cerebras call in `src/services/cerebras.js` is **demo-only**. It is fine
  for local development and quick demos, but **not safe for production** with a
  private/billable API key.

### Do not expose API keys in frontend code

- Never commit real API keys to the repository.
- Never rely on `VITE_*` / `REACT_APP_*` variables to "hide" a secret — they are not
  secret on the client.
- Keep `.env` files out of version control (they are git-ignored by default).

### Use a server-side / serverless proxy for AI provider keys

For production, move the AI provider call behind a backend you control so the API key
stays a **server-side secret**:

```text
Browser (frontend)  ->  Your serverless API route  ->  AI provider (Cerebras, etc.)
                        (holds the secret key)
```

The serverless function reads the key from a server-only environment variable (no
`VITE_`/`REACT_APP_` prefix), calls the provider, and streams the response back to the
browser. The frontend then calls your own endpoint instead of the provider directly.

See [docs/ai-terminal.md](docs/ai-terminal.md) for a recommended architecture and a
proxy example.

### Other hardening tips

- Add rate limiting and basic abuse protection to any proxy endpoint you deploy.
- Restrict allowed origins (CORS) on your proxy to your own domain.
- Rotate any key that may have been committed or shipped in a client bundle.
- Set spending limits / usage caps with your AI provider.

## Reporting a vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Preferred:** open a GitHub issue at
   https://github.com/zickrian/Portfolio-dev/issues. For sensitive reports, please
   avoid including exploit details in the public issue and ask for a private contact
   channel first.
2. **Maintainer contact:** you may also reach the maintainer through the contact
   details listed on the live site / repository profile.

Please include:

- A clear description of the issue and its impact.
- Steps to reproduce (proof of concept if possible).
- Affected version/commit.

We will acknowledge your report, investigate, and aim to provide a fix or mitigation
as quickly as is reasonable for a community project. Please give us reasonable time to
address the issue before any public disclosure.
