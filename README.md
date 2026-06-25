# xeind.net

Xein Deniel's personal portfolio, built as a static Astro site and deployed
through Cloudflare Workers static assets.

## Stack

- Astro for routing, layouts, metadata, and static HTML
- React islands only where client-side state or animation is required
- Tailwind CSS v4 for styling
- Cloudflare Workers static assets for deployment

## Project structure

```text
src/
  components/   Astro and React presentation components
  config/       Site-wide metadata and canonical URL configuration
  layouts/      Shared document layout
  lib/          Data, types, hooks, and design tokens
  pages/        File-based Astro routes
  styles/       Global theme and utility styles
public/         Static assets, crawler files, headers, and redirects
```

Keep routes and document metadata in Astro. Add React only for interactions
that require runtime state; static content should remain server-rendered HTML.

## Commands

```bash
npm run dev          # local development on port 3180
npm run check        # Astro and TypeScript diagnostics
npm run lint         # ESLint
npm run format:check # Prettier verification
npm run build        # production build
npm run preview      # preview production output on port 3181
npm run deploy:dry   # Cloudflare deployment validation
npm run deploy       # build and deploy
```

## SEO and crawlers

- Global metadata and social tags: `src/components/Seo.astro`
- Canonical site details: `src/config/site.ts`
- Structured data: page-level `structuredData` passed to `Layout.astro`
- Sitemap generation and exclusions: `astro.config.mjs`
- Crawler policy: `public/robots.txt`
- Security and cache headers: `public/_headers`
- Redirects: `public/_redirects`

Only indexable, useful routes belong in the sitemap. Placeholder and component
demo routes should use `noindex` until they contain publishable content.

## Deployment

`wrangler.jsonc` serves `dist/` directly from Cloudflare. The site is fully
static, so no server adapter is required. Authenticate with the intended
Cloudflare account before running `npm run deploy`.
