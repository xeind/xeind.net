# xeind.net

Xein Deniel's personal site — portfolio, tools list and blog. Static Astro on
Cloudflare Pages. Ink-on-paper interface with three themes, drawn in hairlines
and dashed borders.

This site has a real design system. Follow it — do not invent one.

- **`docs/building.md`** — the recipe for anything NEW: priority order, four
  passes, per-case recipes (section, card, modal, page, affordance, content).
  Read it before adding something that doesn't exist yet.
- **`docs/design-system.md`** — tokens, color, type, shape, page architecture.
  Read it before your first visual change in a session.
- **`docs/animation.md`** — timing, easing, reduced motion, modal expansion.
- **`docs/content.md`** — how long a description, a bullet or a title may be.
  Read it before editing anything in `src/lib/data/`. Nothing on this site
  truncates, so length is layout.
- **`src/components/AGENTS.md`** — what already exists, where new files go.
  Scope-loads when you touch `src/components/` (its `CLAUDE.md` is a pointer).
- **`src/content/blog/CLAUDE.md`** — frontmatter, voice, post skeleton, images.
  Scope-loads when you touch a post. Read it before writing or editing one.
- **`README.md`** — stack, SEO, crawler files, deployment.

---

## Never

- **Never write a color.** No hex, no `rgb()`, no `hsl()` in a component. Use the
  token utilities (`bg-card`, `text-foreground`, `border-accent/30`) or
  `color-mix()`.
- **Never round a corner or cast a shadow.** No `rounded-md`/`lg`/`full`, no
  `shadow-*`. Sharp corners and hairlines are the whole look.
- **Never use `dark:`.** Themes switch on `data-theme`; `dark:` compiles to
  `prefers-color-scheme` and fires on the wrong theme.
- **Never trust `.github/*.md` or `tailwind.config.ts`.** Historical, load
  nothing, and each `.github` doc carries a banner saying so. `docs/` and
  `src/styles/global.css` are the truth.
- **Never add an icon library.** Icons are SVGs in `public/`, masked by
  `ui/InlineIcon`. Inline icons use `currentColor` and inherit; marks use the
  `--logo-ink-*` tone ladder, never opacity; gradients run
  `--color-secondary` → `--color-tertiary`. A hex in an SVG that renders in the
  page is a bug. See `docs/design-system.md` §3.
- **Never turn static content into a React island.**

## Ask first

- `npm run deploy` — ships to production. Needs an explicit yes, every time.
- Renaming tokens in the `@theme` block, or any change that repaints the whole
  site.
- Adding a dependency, or a second hydrated island to a page.
- Adding a new z-index value, a new type size, or a new hover color. All three
  are closed sets; extending one is a design decision, not an implementation
  detail.

## Always

- Check the change in all three themes. **Kozo (light) is the one that breaks** —
  it is light-on-light, so anything that drains contrast makes the element vanish
  there while looking fine in Manila and Nightingale.
- Reuse the primitive. `Panel` for sections, `SectionDivider` between them,
  `Badge`, `InlineLink`, `CtaButton`. The table at the top of
  `src/components/AGENTS.md` maps need → component. Exceptions to the
  Panel-stack rule: `404.astro` (hand-rolled error state), `badges.astro`
  (demo), and the non-HTML endpoints.
- Honour `prefers-reduced-motion`.
- Keep routes, layouts and metadata in Astro. React only for runtime state or
  Motion animation.
- Run `npm run check && npm run lint && npm run format:check && npm run check:design && npm run build`
  before calling a change done. That is the same gate `.githooks/pre-push` runs.

---

## Commands

| Command                 | Does                                           |
| ----------------------- | ---------------------------------------------- |
| `npm run dev`           | Local dev, port 3180 (drafts render here)      |
| `npm run preview`       | Serve the built site, port 3181                |
| `npm run check`         | Astro + TypeScript diagnostics                 |
| `npm run lint`          | ESLint                                         |
| `npm run format:check`  | Prettier check (`npm run format` to fix)       |
| `npm run build`         | Production build                               |
| `npm run audit`         | Dead-code audit (fallow)                       |
| `npm run check:design`  | Design-rule checker (closed sets, allowlist)   |
| `npm run blog:images`   | Convert a post's images to WebP, downscale     |
| `npm run claude:frames` | Re-extract the Claude mark's animation frames  |
| `npm run lighthouse`    | Lighthouse against `preview` on 3181           |
| `npm run deploy:dry`    | Validate a deploy without shipping             |
| `npm run deploy`        | Ship to production — **needs an explicit yes** |

## Map

```
src/pages/        Routes. Each page = <Panel> / <SectionDivider> stack.
                  Plus non-HTML endpoints: rss.xml, llms.txt, *.md.
src/layouts/      Layout.astro — document, theme script, fonts, edge-glow shell.
src/components/   ui/ primitives · sections/ · hero/ · blog/ · design/ (specimens)
src/content/      blog/<slug>/index.mdx — one folder per post, images beside it.
src/lib/          config/ tokens · data/ content · hooks/ · markdown/ · types.ts
src/styles/       global.css — @theme tokens, all three themes, shared classes
src/assets/       Per-theme project marks routed through the asset pipeline
                  (hashed /_astro/ URLs); public/projects/ holds the rest.
public/           Assets, vanilla scripts, robots.txt, _headers, _redirects
scripts/          Design checker, image and icon tooling. Run via npm scripts.
docs/             Design system, animation, content and building reference
```

`src/styles/global.css` is the single source of truth for every token. Its
comments explain load-bearing values at length — read the one next to a number
before changing it.

SEO and crawler files (`astro.config.mjs`, `public/robots.txt`,
`public/_headers`, `public/_redirects`) are covered in `README.md`. Read that
first before touching any of them.

## MCP

`.mcp.json` is project-scoped and holds three servers: `astro-docs` for Astro
API questions instead of guessing, and `cloudflare-builds` /
`cloudflare-observability` for reading deploy builds and logs.

## Critical rules learned here

Each earned by a real mistake in this repo. Add new ones the same way — never
guessed in advance.

- **Never `git stash` this tree.** Parallel sessions edit it; a stash cycle
  once briefly reverted another session's uncommitted work.
- **Re-read a file immediately before editing.** Files changed mid-edit four
  times in one session. `git diff` before staging anything in a shared file.
- **Every commit to `main` is production in ~2 minutes** (Cloudflare Pages
  auto-build). Commit only green states; the pre-push gate (`.githooks/`)
  enforces it, `git push --no-verify` bypasses it knowingly.
- **Visual calls need a rendered comparison before deciding.** The serif
  choice took five commits because each look was judged from description
  instead of side by side.
