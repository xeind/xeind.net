# xeind.net

Xein Deniel's personal portfolio. Static Astro site, deployed to Cloudflare Workers static assets. Full stack, structure, and SEO details: `README.md`.

## Commands

- `npm run dev` — local dev, port 3180
- `npm run check` — Astro + TypeScript diagnostics
- `npm run lint` — ESLint
- `npm run format:check` — Prettier check (`npm run format` to fix)
- `npm run build` — production build
- `npm run deploy:dry` — validate a deploy without shipping it
- `npm run deploy` — build and deploy to production (Cloudflare, `main` branch) — needs my explicit yes, per the global "Before You Act" rule

## Conventions

- Routes, layouts, and metadata stay in Astro. React only where client-side state or animation is required.
- Static content stays server-rendered HTML — don't turn it into a React island.
- SEO/crawler files (`astro.config.mjs`, `public/robots.txt`, `public/_headers`, `public/_redirects`) are covered in `README.md` — read that before touching any of them.

## MCP

- `astro-docs` is already configured in `.mcp.json`, project-scoped.

## Critical Rules

None logged yet. Add one here only after a real mistake in this repo — not guessed in advance.
