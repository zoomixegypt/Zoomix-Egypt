# Contributing to MotionFolio

Thanks for your interest in contributing! MotionFolio is an open-source animated
portfolio starter, and contributions of all sizes are welcome — bug fixes, docs,
new animation patterns, theme presets, and accessibility improvements.

By participating in this project, you agree to abide by our
[Code of Conduct](CODE_OF_CONDUCT.md).

## Prerequisites

- Node.js 22 or newer
- npm 10 or newer

## Install

```bash
git clone https://github.com/zickrian/Portfolio-dev.git
cd Portfolio-dev
npm install
```

## Run locally

```bash
npm run dev
```

Vite prints a local URL (typically `http://localhost:5173`). The AI terminal
assistant is optional — local commands work without any API key. See the
[Environment Variables](README.md#environment-variables) section if you want to
enable AI chat.

Before opening a pull request, make sure the production build passes:

```bash
npm run build
```

## Create a branch

Use a short, descriptive branch name with a type prefix:

```bash
git checkout -b feat/theme-preset-midnight
git checkout -b fix/gallery-scroll-jump
git checkout -b docs/customization-typo
```

Suggested prefixes: `feat/`, `fix/`, `docs/`, `refactor/`, `chore/`, `a11y/`.

## Submit a pull request

1. Fork the repository and create your branch from `main`.
2. Make your changes in focused, logically separated commits.
3. Run `npm run build` and confirm there are no errors.
4. Push your branch and open a pull request against `main`.
5. Fill out the pull request template: describe **what** changed, **why**, and
   **how you tested** it. Add screenshots or screen recordings for UI/animation
   changes.
6. Link any related issues (e.g., `Closes #12`).

Keep pull requests small and scoped. Large, unrelated changes are harder to review
and more likely to stall.

## Coding style

- **Formatting:** this project uses [Prettier](https://prettier.io). Run
  `npm run format` to format your changes, or `npm run format:check` to verify them.
  Config lives in `.prettierrc.json`.
- **Language:** JavaScript + JSX (React 19, function components and hooks).
- **Indentation:** match the surrounding file (the codebase uses spaces; see
  `.editorconfig`).
- **Components:** one component per file; keep presentational logic separate from
  data. Content belongs in `src/data/`, not hardcoded in components.
- **Animations:** prefer the shared helpers in `src/utils/gsapAnimate.jsx`. Always
  respect `prefers-reduced-motion` (guard motion with
  `window.matchMedia('(prefers-reduced-motion: reduce)')` or rely on the helpers
  that already do).
- **Imports:** use relative imports consistent with existing files.
- **Naming:** `camelCase` for variables/functions, `PascalCase` for components,
  `SCREAMING_SNAKE_CASE` for exported constant data (e.g., `PORTFOLIO_DATA`).
- **No secrets in code:** never commit API keys. `VITE_*` / `REACT_APP_*` variables
  are bundled into the client — see [SECURITY.md](SECURITY.md).
- Keep comments meaningful; explain the "why", not the obvious "what".

## Good first contributions

- Add a new theme preset (colors/fonts via `tailwind.config.js` + `src/index.css`).
- Add a new reusable animation pattern to `src/utils/gsapAnimate.jsx`.
- Improve accessibility or expand `prefers-reduced-motion` coverage.
- Add a serverless proxy example for the AI assistant (see
  [docs/ai-terminal.md](docs/ai-terminal.md)).
- Improve documentation in `docs/` or the README.
- Add a new example portfolio section.

## Reporting bugs and requesting features

Use the issue templates:

- [Bug report](.github/ISSUE_TEMPLATE/bug_report.md)
- [Feature request](.github/ISSUE_TEMPLATE/feature_request.md)

Thank you for helping make MotionFolio better!
