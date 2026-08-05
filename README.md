# xeind.net

Personal site of Xein Deniel. Static Astro, React only where something moves,
deployed from `main` by Cloudflare Pages.

Ink on paper, drawn in hairlines: sharp corners, dashed borders that firm up
under the cursor, corner marks that promise a modal, a 16px grid showing
through. Three themes — **Kozo** (warm paper), **Manila** (sodium-lamp night),
**Nightingale** (my Neovim colorscheme) — switched by `data-theme`, sharing one
shape. Nothing is round, nothing casts a shadow, and the only ambient motion
is a lamp that follows your cursor along the page's edges.

## The design system is enforced, not described

This repo's distinguishing feature is that its design rules bind — for people
and for AI agents. The contract lives in four documents and a checker:

| Piece                            | Job                                                 |
| -------------------------------- | --------------------------------------------------- |
| `docs/design-system.md`          | Tokens, closed sets, behaviors — what is legal      |
| `docs/animation.md`              | Timing, easing, loading, navigation                 |
| `docs/content.md`                | How long a title, description, or bullet may be     |
| `docs/building.md`               | The generative recipe: how to compose something new |
| `scripts/check-design-rules.mjs` | Makes it real — `npm run check:design`              |

The checker greps the source for off-system values (raw colors, rounded
corners, shadows, off-ladder sizes and spacing, hand-written timing) and
parses the content files against their length bands. Exceptions live in an
explicit allowlist with reasons, never a baseline count. A `pre-push` hook
runs the full gate because a push here **is** a production deploy; CI runs it
again behind that.

Two ideas hold it together. Inventories are _descriptive_ — the docs record
what the code does, and greps beat memory. Behaviors are _prescriptive_ — no
`dark:` variants, no shadows, hover ink is `tertiary`, corner brackets only on
things that open. Where a value could drift between two places, one place owns
it and the other derives: the footer's font credits are parsed from
`global.css` at build time, and `/design`'s spec tables render from the same
config the components import.

## Details that took the longest

- **Cover-aware FLIP lightbox** (`public/blog-lightbox.js`) — a zoomed image
  morphs back onto the exact crop its grid cell displays, uniform scale plus
  animated clip, no stretch, no pop. Images decode before they animate.
- **Card → modal expansion** — shared-element morph with `layoutId` down to
  the title and tag, spring with no overshoot.
- **Edge glow** — one lamp lights the side rails, divider strips, and corner
  diamonds with the same curve; the CSS samples the same smoothstep the
  script computes, so paint and script cannot disagree.
- **Sound** — clicks, hovers, and the copy-confirm tap-tap are synthesized
  noise bursts in `public/hero-interactions.js`. No audio files, nothing
  tonal, gated on user gesture.
- **Project marks** — each logo ships per-theme with its hexes baked in,
  mirrored by a CSS tone ladder, swapped at runtime; an inline tile and a
  file-based logo land on the identical pixel.

All of it honours `prefers-reduced-motion`, and the last Lighthouse pass of
the live site scored 100 across the board.

## Readable by machines

Every content page has a plain-markdown twin (`/index.md`, `/blog/<slug>.md`,
linked via `rel="alternate"`), plus `/llms.txt` and `/llms-full.txt` — an
agent that wants the words can skip parsing the ink. Crawler policy in
`public/robots.txt` distinguishes AI search from model-training crawlers.

## Stack

Astro 7 · Tailwind CSS v4 (`@theme` in `src/styles/global.css` is the single
source of tokens) · Motion for the two hydrated islands · Shiki with
css-variables so code blocks recolor per theme · Cloudflare Pages.

```text
src/
  pages/        Routes — each page is a Panel / SectionDivider stack
  layouts/      Layout.astro: document, theme script, fonts, edge-glow shell
  components/   ui/ primitives · sections/ · hero/ · blog/ · design/ specimens
  lib/          config/ tokens · data/ content · hooks/ · types.ts
  styles/       global.css — tokens, all three themes, shared classes
public/         Assets, vanilla scripts, robots.txt, _headers, _redirects
docs/           The design contract (start with building.md)
```

## Commands

```bash
npm run dev          # local dev on :3180
npm run build        # production build
npm run preview      # serve dist/ on :3181
npm run check        # Astro + TypeScript
npm run lint         # ESLint
npm run format:check # Prettier
npm run check:design # design-rule checker (also runs pre-push and in CI)
npm run audit        # dead-code audit (fallow)
```

## Deployment

Push to `main` and Cloudflare Pages builds and ships it, about two minutes
end to end — which is why the pre-push gate exists. `npm run deploy` is the
manual wrangler fallback. SEO plumbing: metadata in
`src/components/Seo.astro`, canonical config in `src/lib/config/site.ts`,
sitemap filter in `astro.config.mjs`, headers and redirects in `public/`.
Only indexable routes belong in the sitemap; demo pages stay `noindex`.
