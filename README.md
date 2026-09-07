# xeind.net

Personal site of Xein Deniel: portfolio, blog, tools list and a lab of
interface specimens. Static Astro, React only where something moves, deployed
from `main` by Cloudflare Pages.

Ink on paper, drawn in hairlines: sharp corners, dashed borders that firm up
under the cursor, corner marks that promise a modal, a 16px grid showing
through. Four themes share one shape and switch on `data-theme`:

| Theme           | Paper                            |
| --------------- | -------------------------------- |
| **Kozo**        | warm light paper                 |
| **Manila**      | sodium-lamp night                |
| **Nightingale** | my Neovim colorscheme            |
| **Blueprint**   | ruled drafting sheet, gutter lit |

Nothing is round, nothing casts a shadow, and the only ambient motion is a
lamp that follows your cursor along the page's edges.

## The design system is enforced, not described

The design rules bind, for people and for AI agents alike. The contract lives
in six documents and a checker:

| Piece                            | Job                                                 |
| -------------------------------- | --------------------------------------------------- |
| `docs/design-system.md`          | Tokens, closed sets, behaviors: what is legal       |
| `docs/animation.md`              | Timing, easing, loading, navigation, reduced motion |
| `docs/content.md`                | How long a title, description or bullet may be      |
| `docs/building.md`               | The generative recipe: how to compose something new |
| `docs/prd-grid-alignment.md`     | The grid's settled decisions                        |
| `docs/grid-inventory.md`         | Per-element ledger of where every hairline sits     |
| `scripts/check-design-rules.mjs` | Makes it real: `npm run check:design`               |

The checker greps the source for off-system values (raw colors, rounded
corners, shadows, off-ladder sizes and spacing, hand-written timing) and
parses the content files against their length bands. Exceptions live in
`scripts/design-rules-allowlist.json` with a reason each, never a baseline
count. A `pre-push` hook runs the full gate because a push here **is** a
production deploy; CI runs the checker again behind that.

Two ideas hold it together. Inventories are _descriptive_: the docs record
what the code does, and greps beat memory. Behaviors are _prescriptive_: no
`dark:` variants, no shadows, corner brackets only on things that open. Where
a value could drift between two places, one place owns it and the other
derives. The footer's font credits are parsed from `global.css` at build time,
`/design` renders its spec tables from the same config the components import,
and every markdown twin is built from the data modules the page renders.

### The grid

Every spacing value answers to one grid: an 8px half-cell and a 16px major
cell. Line-heights and small paddings step in 8s; panel edges, dividers and
band heights hit 16. Ink lands on the pixel after its boundary, so a box's
bottom rule draws at `bottom: -1px`, outside itself, and the corner diamonds
offset to match. Add `?grid` to any dev URL to draw the grid over the page
and measure instead of eyeballing.

## Details that took the longest

- **Cover-aware FLIP lightbox** (`public/blog-lightbox.js`). A zoomed image
  morphs back onto the exact crop its grid cell displays: uniform scale plus
  animated clip, no stretch, no pop. Images decode before they animate.
- **Card to modal expansion.** Shared-element morph with `layoutId` down to
  the title and tag, spring with no overshoot.
- **Edge glow.** One lamp lights the side rails, divider strips, corner
  diamonds and Blueprint's gutter ruling with the same curve. The CSS samples
  the same smoothstep the script computes, so paint and script cannot
  disagree.
- **Sound.** Clicks, hovers and the copy-confirm tap-tap are synthesized
  noise bursts; a plate with nowhere to go answers a press with a short sine
  thump. No audio files, gated on user gesture.
- **Project marks.** Each logo ships per theme with its hexes baked in,
  mirrored by a CSS tone ladder and swapped at runtime. An inline tile and a
  file-based logo land on the identical pixel.
- **Pixel-true centering.** The sheet wrapper rounds its start margin the
  way the paint rounds, so an odd viewport width never lands a hairline on a
  half pixel.
- **Lab specimens** (`/lab`). Agent-interface components (streaming text,
  thinking traces, approval cards, task rows) redrawn in this system instead
  of the soft-card vocabulary they usually arrive in.

Everything honours `prefers-reduced-motion`. Navigation uses Astro's
`ClientRouter`, and islands down the page hydrate on visibility so they don't
compete with the view transition.

## Readable by machines

Every content page has a plain-markdown twin (`/index.md`, `/tools.md`,
`/blog.md`, `/blog/<slug>.md`) advertised from its `<head>` via
`rel="alternate"`, plus `/llms.txt`, `/llms-full.txt` and `/rss.xml`. An
agent that wants the words can skip parsing the ink. Crawler policy in
`public/robots.txt` allows AI search and retrieval agents, opts in to the
training crawlers behind assistants people actually ask, and blocks bulk
scrapers.

## Stack

Astro 7 · Tailwind CSS v4 (`@theme` in `src/styles/global.css` is the single
source of tokens) · Motion for the hydrated islands · MDX on the `unified()`
processor, kept over Astro 7's Sätteri default for a custom image-grid rehype
plugin · Shiki with `css-variables` so code blocks recolor per theme ·
self-hosted Inter, JetBrains Mono and Latin Modern Roman · Cloudflare Pages.

```text
src/
  pages/        Routes: each page is a Panel / SectionDivider stack, plus the
                non-HTML endpoints (rss.xml, llms.txt, *.md)
  layouts/      Layout.astro: document, theme script, fonts, edge-glow shell
  components/   ui/ primitives · sections/ · hero/ · blog/ · lab/ · design/
  content/      blog/<slug>/index.mdx, one folder per post, images beside it
  lib/          config/ tokens · data/ content · hooks/ · markdown/ · types.ts
  styles/       global.css: tokens, all four themes, shared classes
  assets/       Per-theme project marks routed through the asset pipeline
public/         Fonts, vanilla scripts, icons, robots.txt, _headers, _redirects
scripts/        Design checker, icon and image tooling
docs/           The design contract (start with building.md)
```

`AGENTS.md` at the root is the instruction file for coding agents;
`CLAUDE.md` points at it. `.mcp.json` is project-scoped and adds Astro docs
plus Cloudflare build and log servers.

## Commands

```bash
npm run dev            # local dev on :3180 (drafts render here)
npm run build          # production build
npm run preview        # serve dist/ on :3181
npm run check          # Astro + TypeScript
npm run lint           # ESLint
npm run format:check   # Prettier (npm run format to fix)
npm run check:design   # design-rule checker (also runs pre-push and in CI)
npm run audit          # dead-code audit via fallow (non-blocking in CI)
npm run blog:images    # convert a post's images to WebP, downscale past 1840px
npm run claude:frames  # re-extract the Claude mark's animation frames
npm run lighthouse     # Lighthouse against preview on :3181
npm run deploy:dry     # validate a deploy without shipping
```

`npm install` runs `prepare`, which points `core.hooksPath` at `.githooks/`
so the pre-push gate is active from the first clone.

## Deployment

Push to `main` and Cloudflare Pages builds and ships it, about two minutes
end to end, which is why the pre-push gate exists. `npm run deploy` is the
manual wrangler fallback. Every build stamps the short commit hash and build
date into the page.

SEO plumbing: metadata in `src/components/Seo.astro`, canonical config in
`src/lib/config/site.ts`, sitemap filter in `astro.config.mjs`. Only
indexable routes belong in the sitemap; `/design`, `/lab` and `/badges` stay
`noindex`. `public/_headers` sets the security headers and CSP and scopes
cache rules so hashed build output stays immutable; `public/_redirects`
keeps canonical URLs extensionless.
