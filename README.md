# MotionFolio

> Open-source animated portfolio starter for modern developers.

MotionFolio is an open-source animated portfolio starter built with React, Vite,
Tailwind CSS, GSAP, Lenis, and an optional AI-powered terminal assistant. It helps
developers build creative portfolio websites faster using reusable motion patterns,
centralized content data, project case studies, smooth scrolling, and customizable
sections.

Instead of starting from a blank page, you fork the project, edit a few data files,
swap the assets, and ship a polished animated portfolio.

## Features

- **React + Vite** for a fast dev server and optimized production builds.
- **Tailwind CSS** utility-first styling with a typography plugin.
- **GSAP animations** for entrance, scroll, and micro-interactions.
- **ScrollTrigger** for scroll-linked timelines and pinned sections.
- **Lenis smooth scrolling** integrated with GSAP/ScrollTrigger.
- **Reusable animation patterns** centralized in `src/utils/gsapAnimate.jsx`.
- **Centralized portfolio data** so content edits never touch layout code.
- **Project case study pages** with gallery cards, detail routes, and modals.
- **Optional AI-powered terminal assistant** with local commands plus an optional
  LLM-backed chat.
- **Responsive design** across mobile, tablet, and desktop.
- **Accessibility-friendly motion**: respects the OS `prefers-reduced-motion`
  setting in CSS and JS (Lenis, hero parallax, gallery, and shared GSAP helpers all
  reduce or disable motion when requested).

## Tech Stack

- React 19
- Vite
- Tailwind CSS (+ `@tailwindcss/typography`)
- GSAP + ScrollTrigger
- Lenis
- React Router
- react-markdown, lucide-react, react-icons

## Prerequisites

- Node.js 22 or newer
- npm 10 or newer

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/zickrian/Portfolio-dev.git
cd Portfolio-dev
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

### 4. Build for production

```bash
npm run build
```

The output is written to the `build/` folder.

### 5. Preview the production build

```bash
npm run preview
```

### 6. Pre-deploy check

```bash
npm run check
```

This runs the production build and audits production dependencies.

### Available scripts

- `npm run dev` — start the development server.
- `npm run start` — alias for `npm run dev`.
- `npm run build` — create a production build in `build/`.
- `npm run preview` — preview the local production build.
- `npm run check` — build + audit production dependencies.

## Environment Variables

The AI terminal assistant is **optional**. Local terminal commands (`help`, `ls`,
`cat <slug>`, etc.) always work without any keys. The AI chat only activates when an
API key is present.

Create a `.env` file in the project root:

```env
VITE_CEREBRAS_API_KEY=your_key_here
```

A legacy prefix is also read for backward compatibility:

```env
REACT_APP_CEREBRAS_API_KEY=your_key_here
```

> ⚠️ **Security warning — read this before deploying.**
> Vite inlines every `VITE_*` (and here, `REACT_APP_*`) variable into the **client
> bundle**. Any key you put in `.env` ships to the browser and is publicly readable
> by anyone who opens your site. The direct-from-frontend call in
> `src/services/cerebras.js` is **demo-only**. For production, route AI requests
> through a server-side / serverless proxy that holds the key as a server secret.
> See [`docs/ai-terminal.md`](docs/ai-terminal.md) and [`SECURITY.md`](SECURITY.md).

Notes:

- No API key → local commands still work; AI responses are simply disabled.
- AI responses activate only when one of the keys above is available.

## Customization Guide

You can change most content without touching layout or animation code. Full details
are in [`docs/customization.md`](docs/customization.md). Quick reference:

- **Profile, experience, tech stack, projects, achievements, capabilities:**
  `src/data/portfolioData.js`
- **Generic placeholder/example content** to copy from:
  `src/data/examplePortfolioData.js`
- **Project gallery card metadata:** `src/data/projectMeta.js`
- **Project case study details (used by `cat <slug>` and detail pages):**
  `src/data/projectDetailsData.js`
- **Navigable sections (navbar + chat):** `src/data/sectionRegistry.js`
- **Custom per-project detail routes:** `src/projectDetails/projectRegistry.js`
- **Theme/colors and fonts:** `tailwind.config.js` and `src/index.css`
- **Reusable animations:** `src/utils/gsapAnimate.jsx`
- **Terminal commands:** `COMMANDS` in `src/components/ChatWidget.jsx`
- **AI assistant behavior/persona:** `src/services/aiContext.js` and
  `src/services/cerebras.js`

### Add a new project

1. Add card metadata in `src/data/projectMeta.js`.
2. Add matching detail data with the same `slug` in `src/data/projectDetailsData.js`.
3. (Optional) Create a custom detail component in `src/projectDetails/`.
4. Register that component in `src/projectDetails/projectRegistry.js`.

### Add a new section

1. Add the section to `src/data/sectionRegistry.js`.
2. Ensure the rendered component has a matching `elementId`.
3. The chat widget and intent router pick it up automatically.

## Project Structure

```text
.
├── index.html
├── public/                 # static assets (images, og image, cv, favicon)
├── docs/                   # customization, AI terminal, and roadmap docs
├── src/
│   ├── components/         # UI sections and widgets
│   │   └── projects/       # project gallery + detail modal
│   ├── data/               # centralized content + example data
│   ├── hooks/              # custom hooks (e.g., Lenis)
│   ├── pages/              # route-level pages (Home)
│   ├── projectDetails/     # custom per-project detail components + registry
│   ├── services/           # AI context, Cerebras client, intent router
│   └── utils/              # reusable animation + easing helpers
├── tailwind.config.js
├── vite.config.js
└── build/                  # production output (generated)
```

## Roadmap

See [`docs/roadmap.md`](docs/roadmap.md) for the full list. Highlights:

- Add a template mode with sample data toggle.
- Add multiple theme presets.
- Improve `prefers-reduced-motion` coverage.
- Extract reusable animation hooks.
- Add more portfolio section examples.
- Add a serverless proxy example for the AI terminal.
- Add an accessibility audit checklist.
- Add a performance optimization guide.

## Contributing

Contributions are welcome! Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) for setup,
branch naming, coding style, and pull request guidelines, and follow our
[`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

Good first contributions:

- Add a new theme preset.
- Add a new reusable animation pattern.
- Improve accessibility or `prefers-reduced-motion` coverage.
- Add a serverless proxy example for the AI assistant.

## Security

`VITE_*` / `REACT_APP_*` environment variables are **exposed to the browser**. Never
put private API keys directly in frontend code for production — use a server-side or
serverless proxy. To report a vulnerability or for full guidance, see
[`SECURITY.md`](SECURITY.md).

## Deploy

Deploy the generated `build/` folder to any static host (Netlify, Vercel, Cloudflare
Pages, GitHub Pages, etc.). Because this is an SPA, configure a rewrite/fallback so all
routes serve `index.html`; otherwise deep links such as project detail routes will 404
on direct load.

## Troubleshooting

- **AI not responding:** check `.env`, confirm the API key is set, then restart the dev
  server.
- **Commands work but AI fails:** usually a missing/invalid key, rate limit, or network
  issue.
- **Build not where expected:** output is in `build/`, not `dist/`.
- **GitHub stats empty:** likely public API rate limiting.

## License

Licensed under the [MIT License](LICENSE). Copyright (c) 2026 Firdaus Zickrian.
