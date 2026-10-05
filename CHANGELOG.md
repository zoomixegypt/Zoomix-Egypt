# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - Initial open-source release

### Added

- React + Vite starter with an optimized production build (output to `build/`).
- Tailwind CSS styling with the `@tailwindcss/typography` plugin.
- GSAP motion system with ScrollTrigger for scroll-linked and pinned animations.
- Lenis smooth scrolling integrated with GSAP/ScrollTrigger.
- Project case study structure: gallery cards (`projectMeta.js`), detail data
  (`projectDetailsData.js`), detail routes/modals, and a custom detail registry.
- Centralized portfolio data (`portfolioData.js`) so content is edited separately
  from layout and animation code.
- Optional AI-powered terminal assistant with local commands (`help`, `ls`,
  `cat <slug>`, `neofetch`, `date`, `whoami`) plus an optional LLM-backed chat.
- Accessibility-friendly motion that respects the OS `prefers-reduced-motion`
  setting in CSS and JS.
- Open-source project files: MIT license, README, contributing guide, security
  policy, code of conduct, issue/PR templates, and customization, AI terminal, and
  roadmap docs.
- Example/placeholder portfolio data (`examplePortfolioData.js`) to make the project
  easy to reuse as a starter.

[0.1.0]: https://github.com/zickrian/Portfolio-dev/releases/tag/v0.1.0
