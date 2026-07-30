# Writing components

Read `docs/design-system.md` before your first component in a session. This file
is the shortcut: what already exists, and which file to put a new thing in.

---

## Before you build, check this table

Most requests are already solved. Reach for the existing primitive.

| You need                         | Use                                   | Don't                       |
| -------------------------------- | ------------------------------------- | --------------------------- |
| A page section                   | `ui/Panel`                            | Hand-roll a wrapper `<div>` |
| A rule between sections          | `ui/SectionDivider`                   | An `<hr>` or a bare border  |
| A tag, chip, tech label          | `ui/Badge`                            | A styled `<span>`           |
| A link inside a sentence         | `ui/InlineLink`                       | A bare `<a>`                |
| A full-width link band           | `ui/CalloutLink` (via `CalloutBand`)  | —                           |
| A primary action with a shortcut | `ui/CtaButton.astro`                  | A `<button>` from scratch   |
| A corner mark on a surface       | `ui/CornerDiamond`                    | Positioned `<div>`s         |
| A small icon that follows text   | `ui/InlineIcon` + an SVG in `public/` | An icon library             |
| A quote block in a post          | `blog/PullQuoteCard`                  | A styled `<blockquote>`     |
| A card that opens a modal        | Copy `sections/ProjectGrid`           | A new modal implementation  |

There is no icon library. `lucide-react` is not installed and must not be added.

**Coloring an SVG:** an inline icon uses `fill="currentColor"` /
`stroke="currentColor"` and takes its color from the parent's `text-*` — never
set a fill it could inherit. A reusable glyph lives in `public/` and goes
through `InlineIcon`, which masks `bg-current` through the shape. A mark that
needs depth uses the `--logo-ink-*` tone ladder, not opacity; one that needs two
hues uses a gradient with `--color-secondary` → `--color-tertiary` stops. Full
rules and the two literal-color exceptions are in `docs/design-system.md` §3.

---

## The existing primitives

```tsx
<Panel
  edges="none | top | bottom | both"      // default: both — full-bleed hairlines
  ornaments="none | top | bottom | all"   // default: all  — corner diamonds
  padding="sm | md | lg"                  // default: md
  showGrid={false}                        // 16px grid wash
  showNoise={false}                       // paper grain
/>

<SectionDivider variant="dashed | grid | grid-broken" />   // default: dashed

<Badge variant="default | accent | muted">TypeScript</Badge>

<CornerDiamond position="tl | tr | bl | br | all" size={8} variant="default | accent" />

<InlineLink href="…" external hintLabel="…">text</InlineLink>

<CalloutBand href="…" label="Visit my blog" icon={…} external />
// CalloutBand is a thin wrapper; the real component is ui/CalloutLink —
// full-width band, mask-ramp gradient, border /30 → /60 on hover (a ratified
// brightening pattern, see design-system.md §5).

<CtaButton href="…" label="Email me" shortcut="E" />   // .astro only

<InlineIcon src="/github.svg" />
```

Layout files: `layouts/Layout.astro` (document, theme script, fonts, SEO, edge
glow shell) and `components/Seo.astro` (metadata). Both are shared by every
page — changing them changes the whole site.

---

## Astro or React?

**Default to Astro.** React costs ~100KB of hydration on a static site.

Use a `.tsx` island only when the thing needs runtime state, a Motion animation,
or a browser API. Everything else is a `.astro` file or plain server-rendered
markup. Static content must never become an island.

When you do need an island, give it the narrowest directive that works —
`client:visible` over `client:load` — and say why in a comment, as
`index.astro` does for `ProjectGrid`.

Three patterns already avoid React entirely and are worth copying:

- **A vanilla script in `public/`** — `edge-glow.js`, `hero-interactions.js`,
  `codeblock-copy.js`, `blog-lightbox.js`. Loaded with
  `<script is:inline src="…" defer>`. Note: `public/` is not scanned for Tailwind
  classes, so these scripts write plain CSS class names defined in `global.css`.
- **An inline `<script>` in the page** — the theme-aware logo swapping in
  `index.astro`. Remember `ClientRouter` de-dupes inline scripts across
  navigations, so re-run work on `astro:after-swap`.
- **CSS-only state** — `group-hover:`, `group-focus-within:`, the `.ca-*` corner
  classes.

---

## Where files go

```
components/
  ui/          Primitives reused everywhere. Add here only if 2+ places need it.
  sections/    Home-page sections. One file per section.
  hero/        The hero and its logo.
  blog/        MDX components and post furniture.
  design/      Specimens for /design only. Nothing here ships to a real page.
lib/
  config/      Tokens as TS: animation.ts, design.ts, site.ts
               (no spacing module — write the Tailwind class, see design-system.md §5)
  data/        Content: projects, experience, awards, tools, personal
  hooks/       useReducedMotion, useFocusTrap, useMounted,
               useScrollbarCompensation, useClickSound
  types.ts     Project, Award, Experience, Tool, PersonalInfo
```

Content goes in `lib/data/`, typed by `lib/types.ts`. Never inline a project,
award, or job into a component. Length rules for that content live in
`docs/content.md` — nothing here truncates, so a long description changes the
layout rather than getting cut off.

Import with the `@/` alias — `@/components/ui/Panel`, `@/lib/config/animation`.
There is no barrel file; import the exact module. `@/lib/config` does not exist.

---

## Shape of a component

Match what is there. The house style:

- A `Props` interface above the component, optional props with defaults in the
  signature.
- Default export, function declaration.
- `className = ""` last, appended to the class string, so a caller can extend.
- Variants as a lookup object (`const variantStyles = { … }`), not a chain of
  ternaries.
- Tailwind classes in the markup; `style` only for what Tailwind can't express —
  masks, the transition constants, computed offsets.
- A doc comment on primitives explaining the design intent, not the mechanics.
  `Badge.tsx` and `InlineLink.tsx` are the models.

Accessibility is part of done: `aria-hidden` on decoration, real focus states
(`focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`),
`rel="noopener noreferrer"` on external links, and keyboard paths for anything
clickable.

---

## Comments

This codebase comments the _why_, at length, where a value is load-bearing —
read the `--surface-hover-fill` or `.edge-glow-layer` blocks in `global.css`.
Match that when you land on a non-obvious number. Skip the comment when the code
says it already.

---

## Before you call it done

```bash
npm run check        # Astro + TypeScript
npm run lint         # ESLint
npm run format:check # Prettier
npm run build        # must pass
```

A visual change is not done until you have checked it. "Looks right" on one
screen in one theme is not a result:

- [ ] **Every affected page**, not just the one you edited. `Panel`,
      `SectionDivider` and anything in `ui/` are shared — list who imports it
      before you claim done.
- [ ] **All three themes.** Kozo (no `data-theme`), Manila (`dark`),
      Nightingale. Kozo is the one that breaks.
- [ ] **Narrow and wide.** The layout caps at `max-w-5xl`; check mobile width
      and past the cap.
- [ ] **Keyboard.** Tab to it. A visible `focus-visible` ring, and a working
      Escape for anything that opens.
- [ ] **Reduced motion.** Turn it on in the OS and confirm the change degrades
      instead of disappearing.

Then read your diff against these three questions:

1. Did I write a color, a radius, a shadow, or a duration? Remove it — use the
   owner listed in `docs/design-system.md` §0.
2. Does it hold in all three themes?
3. Did I rebuild something in the table at the top of this file?
