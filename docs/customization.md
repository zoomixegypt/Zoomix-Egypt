# Customization Guide

MotionFolio is built so you can change almost everything about the **content** and
**look** without touching layout or animation code. This guide walks through each
customizable area.

> Tip: a fully-commented starter template for the main data lives in
> [`src/data/examplePortfolioData.js`](../src/data/examplePortfolioData.js). Copy it
> into `src/data/portfolioData.js` for a clean slate, then fill in your details.

## 1. Personal information

Edit [`src/data/portfolioData.js`](../src/data/portfolioData.js). The `profile`
object holds your identity:

```js
profile: {
  name: "Your Name",
  role: "Your Role / Headline",
  bio: "One or two sentences about you.",
  location: "City, Country",
  email: "you@example.com",
  socials: {
    github: "https://github.com/your-username",
    linkedin: "https://linkedin.com/in/your-username",
  },
},
```

This data is rendered across the site (hero, about, footer) and is also fed to the
AI assistant, so keep it accurate.

## 2. Projects

Projects have up to three layers. Keep the **`slug`** identical across all of them so
the gallery, the `cat <slug>` terminal command, and the AI assistant stay in sync.

1. **Gallery cards** — [`src/data/projectMeta.js`](../src/data/projectMeta.js):
   ```js
   {
     id: 1,
     slug: "my-project",
     title: "My Project",
     category: "Web Application",
     color: "bg-lime-400",   // Tailwind class for the card accent
     img: "https://.../image.png",
   }
   ```
2. **Case study details** —
   [`src/data/projectDetailsData.js`](../src/data/projectDetailsData.js): full info
   (tagline, year, stack, features, impact, links) used by detail pages and the
   `cat <slug>` command.
3. **Custom detail component (optional)** — add a component under
   [`src/projectDetails/`](../src/projectDetails/) and register it in
   `src/projectDetails/projectRegistry.js` for a bespoke detail page.

### Add a new project

1. Add a card entry in `projectMeta.js`.
2. Add a matching detail entry (same `slug`) in `projectDetailsData.js`.
3. (Optional) Create + register a custom detail component.

## 3. Skills

Edit `techStack` in [`src/data/portfolioData.js`](../src/data/portfolioData.js). Each
item has a `name` and a `category`; the AI assistant groups skills by `category`:

```js
techStack: [
  { name: "React", category: "Frontend" },
  { name: "Node.js", category: "Backend" },
],
```

High-level specializations live in the `capabilities` array in the same file.

## 4. Experience

Edit the `experience` array in
[`src/data/portfolioData.js`](../src/data/portfolioData.js):

```js
experience: [
  {
    title: "Job Title — Company",
    period: "Jan 2024 - Present",
    description: [
      "What you did, with concrete outcomes.",
      "Another impact bullet.",
    ],
  },
],
```

## 5. Theme / colors

- **Fonts and Tailwind theme:** [`tailwind.config.js`](../tailwind.config.js)
  (`fontFamily`, `extend.animation`, etc.).
- **Global styles, CSS variables, and keyframe animations:**
  [`src/index.css`](../src/index.css). The selection color, hero blob/orb keyframes,
  marquee animation, and the `prefers-reduced-motion` block all live here.
- **Per-element colors:** most accents use Tailwind utility classes directly in
  components (e.g. the `color` field on gallery cards, or `lime-400` accents).

The site is built around a high-contrast black/lime aesthetic — change the accent by
swapping the Tailwind color utilities and the `::selection` color in `index.css`.

## 6. Animations

Reusable GSAP helpers live in
[`src/utils/gsapAnimate.jsx`](../src/utils/gsapAnimate.jsx). Prefer these helpers over
ad-hoc tweens so behavior stays consistent.

- Entrance/scroll animations use **GSAP + ScrollTrigger**.
- Smooth scrolling uses **Lenis** (see [`src/hooks/useLenis.js`](../src/hooks/useLenis.js)).
- **Accessibility:** motion respects `prefers-reduced-motion`. The shared helpers,
  Lenis hook, hero parallax, and project gallery all check
  `window.matchMedia('(prefers-reduced-motion: reduce)')` and reduce/disable motion.
  Keep this behavior when adding new animations.

## 7. Terminal commands

Local terminal commands are defined in the `COMMANDS` object (and the `handleCat`
helper) in [`src/components/ChatWidget.jsx`](../src/components/ChatWidget.jsx).
Built-in commands: `help`, `ls`, `cat <slug>`, `neofetch`, `date`, `whoami` (plus
`history` and `clear`).

To add a command, add a new key to `COMMANDS`:

```js
const COMMANDS = {
  // ...
  socials: {
    desc: "Show social links",
    run: () => {
      const s = PORTFOLIO_DATA.profile.socials;
      return `GitHub: ${s.github}\nLinkedIn: ${s.linkedin}`;
    },
  },
};
```

These commands run **entirely locally** and require no API key.

## 8. AI assistant provider

The optional AI chat is powered by Cerebras through
[`src/services/cerebras.js`](../src/services/cerebras.js), and the assistant's
persona/system prompt is built in
[`src/services/aiContext.js`](../src/services/aiContext.js).

- **Persona / tone / rules:** edit `generateSystemPrompt()` in `aiContext.js`.
- **Provider / model / endpoint:** edit `cerebras.js` (model is `gpt-oss-120b`,
  endpoint is the Cerebras chat-completions URL).
- **API key:** set `VITE_CEREBRAS_API_KEY` in a `.env` file (a legacy
  `REACT_APP_CEREBRAS_API_KEY` is also read).

> ⚠️ Calling the provider directly from the browser exposes your API key in the
> client bundle. This is **demo-only**. For production, use a serverless proxy — see
> [`docs/ai-terminal.md`](ai-terminal.md) and [`SECURITY.md`](../SECURITY.md).

To switch providers, point `cerebras.js` at your provider's endpoint and adjust the
request/stream parsing, or (recommended) call your own proxy endpoint instead.

## 9. Deployment

1. Build:
   ```bash
   npm run build
   ```
2. Deploy the generated `build/` folder to any static host (Netlify, Vercel,
   Cloudflare Pages, GitHub Pages, etc.).
3. **SPA routing:** configure a rewrite/fallback so all routes serve `index.html`,
   otherwise deep links like `/projects/<slug>` will 404 on direct load.
   - Netlify: add a `_redirects` file with `/*  /index.html  200`.
   - Vercel: add a rewrite of `/(.*)` → `/index.html`.
4. Update branding before publishing: the `<title>`, meta tags, canonical URL, and
   structured data in [`index.html`](../index.html), plus assets in `public/`
   (`favicon.svg`, `og-icon.png`, `manifest.json`, profile image, `cv.pdf`).
5. If you enable the AI assistant in production, set your key as a **server-side**
   secret behind a proxy rather than a `VITE_*` variable.
