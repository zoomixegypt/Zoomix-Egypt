# AI Terminal Assistant

MotionFolio ships with an **optional** terminal-style assistant (see
[`src/components/ChatWidget.jsx`](../src/components/ChatWidget.jsx)). It has two
layers:

1. **Local commands** — `help`, `ls`, `cat <slug>`, `neofetch`, `date`, `whoami`
   (plus `history` and `clear`). These run entirely in the browser, use your
   portfolio data, and **require no API key**.
2. **AI chat (optional)** — natural-language answers about you, powered by an LLM.
   This only activates when an API key is present.

If no key is configured, the local commands still work and AI replies are simply
disabled.

## How the AI chat works today

- [`src/services/cerebras.js`](../src/services/cerebras.js) reads the API key from
  `import.meta.env.VITE_CEREBRAS_API_KEY` (or the legacy
  `REACT_APP_CEREBRAS_API_KEY`) and calls the Cerebras chat-completions endpoint
  **directly from the browser**, streaming the response back into the widget.
- [`src/services/aiContext.js`](../src/services/aiContext.js) builds the system
  prompt and a query-scoped context from your portfolio data.
- [`src/services/intentRouter.js`](../src/services/intentRouter.js) maps user intent
  to section navigation; [`src/services/responseSanitizer.js`](../src/services/responseSanitizer.js)
  cleans up model output.

## ⚠️ Why the default setup is demo-only

This is a **client-side Vite app**. Every `VITE_*` (and `REACT_APP_*`) environment
variable is **inlined into the production JavaScript bundle** at build time. So:

- The API key you put in `.env` is **shipped to every visitor's browser** and can be
  read with DevTools or by inspecting the bundled JS.
- Anyone can extract the key and run up usage/cost on your account.

The direct call in `cerebras.js` is great for **local development and quick demos**,
but it is **not safe for production** with a private/billable key.

## ✅ Recommended architecture: frontend → serverless proxy → AI provider

Move the provider call behind a backend you control. The key becomes a **server-side
secret** that never reaches the browser.

```text
┌──────────────┐     POST /api/chat      ┌─────────────────────┐     Bearer KEY     ┌──────────────┐
│   Frontend   │ ──────────────────────▶ │  Serverless API     │ ─────────────────▶ │  AI provider │
│ (ChatWidget) │ ◀────── stream ──────── │  route (holds key)  │ ◀──── stream ───── │  (Cerebras)  │
└──────────────┘                         └─────────────────────┘                    └──────────────┘
```

- The frontend calls **your** endpoint (`/api/chat`), never the provider directly.
- The serverless function reads the key from a **server-only** env var (no `VITE_` /
  `REACT_APP_` prefix), forwards the request, and streams the response back.
- The key is never present in the client bundle.

### Example: serverless proxy (Vercel / Netlify style)

Create `api/chat.js` (deployed as a serverless function — exact folder depends on
your host):

```js
// Server-side only. NOTE: no VITE_/REACT_APP_ prefix => not exposed to the client.
const CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.CEREBRAS_API_KEY; // server secret
  if (!apiKey) {
    res.status(500).json({ error: "Server is missing CEREBRAS_API_KEY" });
    return;
  }

  // Optional but recommended: validate/limit the incoming payload, and
  // restrict CORS to your own origin before forwarding.
  const { messages } = req.body ?? {};
  if (!Array.isArray(messages)) {
    res.status(400).json({ error: "Invalid 'messages' payload" });
    return;
  }

  const upstream = await fetch(CEREBRAS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      model: "gpt-oss-120b",
      max_tokens: 1024,
      temperature: 0.35,
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    res.status(upstream.status || 502).json({ error: "Upstream error" });
    return;
  }

  // Stream the provider response straight back to the browser.
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    res.write(decoder.decode(value, { stream: true }));
  }
  res.end();
}
```

Set the secret in your host's dashboard (server environment, **not** a `VITE_` var):

```bash
CEREBRAS_API_KEY=your_real_key_here
```

### Point the frontend at your proxy

In [`src/services/cerebras.js`](../src/services/cerebras.js), replace the direct
provider URL + `Authorization` header with a call to your own endpoint, and remove
the client-side key entirely:

```js
// Instead of calling the provider with a bundled key, call your own proxy:
const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ messages: conversation }),
});
// ...then parse the streamed response exactly as before.
```

Because the key is no longer in the client, you can drop
`VITE_CEREBRAS_API_KEY` / `REACT_APP_CEREBRAS_API_KEY` from the frontend `.env`.

## Hardening checklist for the proxy

- [ ] Store the key as a server-only secret (no `VITE_`/`REACT_APP_` prefix).
- [ ] Restrict CORS to your own domain.
- [ ] Add rate limiting / basic abuse protection.
- [ ] Validate and size-limit the incoming `messages` payload.
- [ ] Set usage/spending caps with your AI provider.
- [ ] Rotate any key that was ever shipped in a client bundle.

## Switching providers

The assistant uses an OpenAI-compatible streaming format. To use a different
provider, change the endpoint, model, and (if needed) the SSE parsing in
`cerebras.js` — or, better, do that translation inside your serverless proxy and keep
the frontend calling `/api/chat`.

See also: [`SECURITY.md`](../SECURITY.md) and [`docs/customization.md`](customization.md).
