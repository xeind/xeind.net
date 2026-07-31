# Design system

The visual contract for xeind.net. Every rule here is checkable against the code.

**Who wins a disagreement.** Two kinds of rule live here, with opposite
authority:

- **Inventories** — the token values, type sizes, spacing steps, opacity steps
  and z-layers actually present in `global.css` and `src/`. These are
  _descriptive_: the code wins. If the inventory here is stale, update it and
  say so.
- **Behaviors** — never `dark:`, never shadows, corner brackets mean "opens",
  hover ink is tertiary, compositor-only motion. These are _prescriptive_: this
  file wins. Code that violates one is a bug — fix the code, or bring the
  exception here first.

## 0. Who owns what

Change a value in the owning file. Nowhere else. Every other place either reads
it or renders it.

| Thing                        | Owner                                                              |
| ---------------------------- | ------------------------------------------------------------------ |
| Colors, themes, CSS vars     | `src/styles/global.css` (`@theme` + the two `[data-theme]` blocks) |
| Shared CSS classes           | `src/styles/global.css`                                            |
| Motion timing and springs    | `src/lib/config/animation.ts`                                      |
| Gaps and stacks              | §5 of this file (no config module — see there for why)             |
| Icon sizes and stroke        | `src/lib/config/design.ts`                                         |
| Site metadata, canonical URL | `src/lib/config/site.ts`                                           |
| Content (projects, jobs, …)  | `src/lib/data/*` typed by `src/lib/types.ts`                       |
| Reusable UI                  | `src/components/ui/*`                                              |
| Page shell                   | `src/layouts/Layout.astro`                                         |
| The rules                    | this file and `docs/animation.md`                                  |

**`/design` owns nothing.** `src/pages/design.astro` is a rendered specimen — a
place to look at the system in all three themes. It repeats token values as
sample text. Changing a swatch there changes the demo and not the system, and a
value there can go stale without breaking anything. When something looks wrong
on `/design`, fix the owner above, then check `/design` reflects it.

---

## 1. The look, in one paragraph

Ink on paper, drawn by a machine. Sharp corners, hairline rules, dashed borders
that firm up when you point at them, corner marks that step outward, a 16px grid
showing through. Nothing glows except the edges, nothing is round, nothing casts
a shadow. Three themes, one shape.

---

## 2. Themes

Three, switched by `data-theme` on `<html>`. The switch happens in an inline
script in `src/layouts/Layout.astro`.

| Theme           | `data-theme`         | Character                         |
| --------------- | -------------------- | --------------------------------- |
| **Kozo**        | _absent_ (`light`)   | Warm paper, ink on mulberry fibre |
| **Manila**      | `dark` (**default**) | Deep night, sodium lamps          |
| **Nightingale** | `nightingale`        | The author's Neovim colorscheme   |

Kozo is the fallback in CSS (declared in `@theme`), but Manila is what an
unknown visitor sees — the script picks `dark` when nothing is stored.

**Rule: every visual change must hold in all three themes.** Kozo is the one
that breaks. It is light-on-light (`#F8F6F2` card on a `#F0EBE2` page), so any
effect that removes contrast makes the element vanish there while looking fine
in the two dark themes. `--surface-hover-fill` exists for exactly this reason —
read its comment in `global.css` before you add a hover fill.

---

## 3. Color

### Never write a color

No hex, no `rgb()`, no `hsl()` in a component. The theme definitions and the
logo ladder in `global.css` are the source; everything else reads from them.

Three narrow exceptions, all of them geometry rather than color:

- **Alpha ramps in a CSS mask.** `mask-image: linear-gradient(to right, transparent, rgba(0,0,0,0.6), …)`
  describes where a layer is visible, not what color it is. The black is
  meaningless — only the alpha does work. Current sites: `CtaButton.astro`,
  `SectionDivider.tsx`, `CalloutLink.tsx`, `HeroSection.tsx`.
- **`fill="white"` / `fill="black"` inside an SVG `<mask>`.** Same reason.
- **Favicons and OG images**, which render outside the document.

Use the token utilities: `bg-card`, `text-foreground`, `border-accent`,
`text-tertiary`, `bg-muted`. For a blend, use `color-mix(in srgb, var(--color-accent) 20%, transparent)`
or Tailwind's slash opacity (`border-accent/30`).

### The tokens

Each theme defines the same set. Add a token to one theme and you must add it to
all three, or that theme falls back to Kozo's value and looks wrong.

| Token                     | Role                                          |
| ------------------------- | --------------------------------------------- |
| `background`              | Page behind everything                        |
| `muted`                   | Paper backdrop (`.paper-background`, body)    |
| `card`                    | Every raised surface — panels, tiles, buttons |
| `foreground`              | Body text                                     |
| `border`                  | Plain outlines                                |
| `accent` / `accent-hover` | Ink for marks, rules, borders, resting links  |
| `primary` / `secondary`   | Same ink at other weights                     |
| `tertiary`                | **Hover ink.** See below                      |
| `info` / `warning`        | Reserved. Barely used — don't reach for them  |
| `destructive` / `success` | Reserved                                      |

### Hover ink is `tertiary`

`hover:text-tertiary` is the house hover — it is what nearly every interactive
element uses (`grep -r 'hover:text-' src` to see the current spread).
Never `hover:text-accent`, never `hover:text-primary`, never a new color.

Two ratified exceptions dim instead of brighten — a de-emphasis hover on labels
that yield to the element around them: `hover:text-foreground/60` in
`ProjectGrid.tsx` and `GridIterations.tsx`. Don't add a third without a reason
of the same shape.

`hover:bg-muted` is the quiet fill hover for standalone buttons (Footer's theme
cycler, the 404 back-link, /design's theme button). `group-hover:bg-tertiary` is
the corner-bracket recolor — 40 uses, all inside bracket markup; it is part of
the bracket pattern, not a general-purpose hover.

The same idea drives the shortcut badge: `--badge-ink` at rest,
`--badge-hover-ink` on hover, both defined per theme. Read their comments in
`global.css` — Manila's accent-hover sits at the ceiling and had nowhere
brighter to travel, which is why the badge uses its own variables and not the
generic ones.

### Opacity ladder

Slash opacities step through a fixed set. This is the closed set in use — adding
a step means editing this table, not just typing a new number.

`8 · 10 · 15 · 20 · 25 · 30 · 35 · 40 · 45 · 50 · 55 · 60 · 70 · 80 · 85 · 90`

The load-bearing steps and their jobs:

| Value | Where                                                        |
| ----- | ------------------------------------------------------------ |
| `/8`  | Badge fill                                                   |
| `/10` | Very subtle wash (`bg-tertiary/10` hover fills)              |
| `/15` | Code block borders                                           |
| `/20` | Structural hairlines, panel edges, dividers (82 uses)        |
| `/30` | Card and interactive borders, focus rings (the workhorse)    |
| `/40` | Emphasis borders, quiet meta text                            |
| `/50` | Active state, secondary text (`text-foreground/50`, 49 uses) |
| `/60` | Secondary ink and brightened hover borders (41 uses)         |
| `/80` | Body text at reduced emphasis (`text-foreground/80`)         |

The steps between (`25 35 45 55 70 85 90`) are rarer — mostly optical tuning in
`PrecisionMarks`, `PullQuoteCard` and text shades. Legal, but reach for a
load-bearing step first.

### SVG and icon color

An SVG must follow the theme like everything else. There are five ways to make
that happen, and which one you use depends on how the SVG reaches the page.
Pick from this table — do not invent a sixth.

| What you're drawing                   | Mechanism                                                       |
| ------------------------------------- | --------------------------------------------------------------- |
| Interface icon, inline in a component | `fill="currentColor"` / `stroke="currentColor"`                 |
| Reusable glyph living in `public/`    | `<InlineIcon src="/github.svg" />` — CSS mask over `bg-current` |
| Brand mark inline, needing depth      | `fill="var(--logo-ink-NN)"` from the tone ladder                |
| Mark needing two hues                 | Gradient whose stops are theme variables                        |
| Project logo loaded as `<img>`        | Three baked files, one per theme, swapped at runtime            |

**1. `currentColor` is the default.** An inline icon should not name a color at
all. It inherits from the text around it, so `text-foreground/80` on the parent
colors the glyph, and `hover:text-tertiary` moves it with everything else for
free. This is how the social icons, the arrow marks and the copy-confirm
checkmark work. Never set a fill on an icon that could inherit one.

**2. Masked glyphs ignore their own fill.** SVGs in `public/` reach the page
through `InlineIcon`, which paints a `bg-current` box and punches the shape out
of it with `mask-image`. Only the alpha channel matters, so `fill="black"`
inside `github.svg`, `linkedin.svg` and `map-pin.svg` is not a violation — it is
the mask's silhouette, and changing it to a token would do nothing.

**3. A project mark's depth comes from the tone ladder, not from opacity.** This
applies to marks that exist in **both** an inline and a file-based form — the
project logos. A mark that lives only inline (the XD logo in `design.astro` and
`XeinLogoServer`) may use `opacity` freely, because there is no baked twin for
it to disagree with.

Where the ladder does apply, use the four solid tones:

```
--logo-ink-100  --logo-ink-75  --logo-ink-55  --logo-ink-35
--logo-accent-100  --logo-accent-35
```

Each is the theme's ink already composited over the tile background, so a tile
at `55` and a file-based logo at `55` land on the identical pixel. Reaching for
`opacity: 0.55` instead breaks that agreement — an `<img>`-loaded SVG cannot
read these variables and has to bake the same hex, so the two halves of the
system would disagree. `ProjectLogo`'s ATAX grid is the reference: 25 tiles,
each naming a tone.

**4. Gradient stops are variables, not colors.** The Astro mark in `Footer.astro`
runs `--color-secondary` → `--color-tertiary`:

```html
<stop stop-color="var(--color-secondary)"></stop>
<stop offset="1" stop-color="var(--color-tertiary)"></stop>
```

Secondary into tertiary is the house gradient — it moves with every theme and
lands on the same hover ink the rest of the site uses. A gradient with literal
stops is frozen in one theme and will be wrong in the other two.

**5. `<img>`-loaded logos need one file per theme.** An `<img>` has its own
document and cannot see your CSS variables, so those logos ship as
`*-light.svg`, `*-dark.svg` and `*-nightingale.svg` with the ladder's hexes
baked in, swapped by `PROJECT_LOGO_URLS` and an inline script on theme change.
**Both halves must agree:** retuning means editing `src/assets/projects/*.svg`
_and_ the matching variables in `global.css`. Read the comment above
`--logo-ink-100` first — the Nightingale block explains why the documented
palette hexes are used instead of what the `hsl()` tokens compute.

#### The only two places a literal color may appear in an SVG

- **Inside a `<mask>`.** `fill="white"` and `fill="black"` there are alpha, not
  color — see the Pioneer sparkle cutout in `ProjectLogo.tsx`.
- **Favicons and app icons.** `public/icon.svg` carries `#808080` because it is
  rasterized by `scripts/generate-icons.mjs` into PNGs that render in browser
  chrome, outside the document. Nothing there can read a variable.

Anywhere else, a hex in an SVG is a bug.

---

## 4. Typography

### Families

| Utility      | Face               | Use for                                  |
| ------------ | ------------------ | ---------------------------------------- |
| `font-serif` | Latin Modern Roman | Headings, prose, project titles, labels  |
| `font-sans`  | Inter              | Body copy, UI text (set on `<body>`)     |
| `font-mono`  | JetBrains Mono     | Metadata, badges, section eyebrows, code |

Latin Modern Roman is lighter than the Georgia fallback the site accidentally
shipped for months. That hairline weight is the intended look — don't "fix" it
by fattening headings or reordering the stack.

Section headings are lowercase-eyebrow style: `text-accent font-mono text-xs tracking-wide`,
in caps, e.g. `TYPOGRAPHY`. Follow that for any new section label.

### Variable names are Tailwind v4 namespaces — keep them exact

The `@theme` block declares `--font-serif/sans/mono`, `--text-*` and
`--leading-*`. Those exact prefixes are what Tailwind v4 builds the `font-*`,
`text-*` and `leading-*` utilities from. Rename one (say, to
`--font-family-serif`) and the utility silently falls back to Tailwind's
defaults — the site once shipped months of Georgia headings this way. If a
declared font doesn't render, check these names before anything else.

### Scale

Three voices, each owning its few sizes — that is the differentiation system.
Family says what kind of thing you're reading; size says its rank within the
voice.

**Serif — the reading voice.** Two body tiers plus a heading ladder:

| Size        | px  | Job                                                               |
| ----------- | --- | ----------------------------------------------------------------- |
| `text-sm`   | 14  | Descriptions: modal bullets, timeline, blog excerpts, band labels |
| `text-base` | 16  | Prose paragraphs, card titles                                     |
| `text-lg`   | 18  | h2 inside prose                                                   |
| `text-xl`   | 20  | h1, the modal title (bold)                                        |
| `text-2xl`  | 24  | Section headings                                                  |

The 14/16 split is deliberate: prose reads at 16, a card's supporting copy
reads at 14. Don't collapse them and don't add a third body tier.

**Sans — the UI voice.** `text-sm` almost everywhere (it is the `<body>`
default), `text-xs` for small controls.

**Mono — the meta voice.** `text-xs` and the micro sizes below; eyebrows,
badges, timestamps, plate tags. Mono never carries prose.

Where regular Latin Modern reads too thin at a small size on a prominent
element, the fix is the shipped **Bold cut** (`font-bold`), not a size bump —
the modal title and the callout band label do this.

Below 12px the site uses three ratified micro sizes — labels on plates, tile
captions, specimen annotations:

| Size               | px  | Job                                      |
| ------------------ | --- | ---------------------------------------- |
| `text-[0.625rem]`  | 10  | Plate captions, specimen annotations     |
| `text-[0.6875rem]` | 11  | Badges, card meta — the standard micro   |
| `text-[0.8125rem]` | 13  | Between-size for dense prose (PullQuote) |

That is the whole legal set for new work. Two display outliers are ratified in
place and go no further: `text-6xl` on the 404 numeral (`404.astro`) and on
PullQuoteCard's quote glyph. `src/components/blog/` additionally carries a
handful of grandfathered one-off sizes (`0.64rem`–`0.72rem`, `2rem`, em-based) —
legal there, not precedent anywhere else.

### Weight

Three weights: regular (default), `font-medium` (inline emphasis — company
names, strong prose), `font-bold` (the 404 numeral, the modal title, the
callout band label — small-but-prominent serif that needs the Bold cut).
There is no `font-semibold` and no `font-light` — don't introduce them. The
serif ships regular and bold only, so `font-medium` on serif text synthesizes;
keep it on sans/mono.

### Text opacity

Text de-emphasis steps down the opacity ladder above. The working steps:
`/80` body at reduced emphasis · `/60` secondary (the workhorse) · `/50`
tertiary · `/40` quiet meta. Rarer steps exist (see the ladder); prefer these
four.

---

## 5. Shape

### Sharp corners

The repo contains two radius values, both optical corrections rather than
styling: `rounded-[1px]` (10 uses — corner diamonds, tiny rotated squares in
`Layout.astro`, `MDXComponents`, the blog index) and one `rounded-[2px]` (the
`<mark>` highlight in PullQuoteCard). Nothing else.

**Never use `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-full`.** Not on
buttons, not on cards, not on avatars, not on images.

### No shadows

`--text-shadow-subtle`, `--text-shadow-strong`, `--text-shadow-on-image` are all
set to `none` on purpose, to keep paint cost off the LCP element. Never add
`shadow-*`, `drop-shadow-*`, or a `box-shadow`. Depth here comes from hairlines
and corner marks, not blur.

### Borders

The signature. `1px dashed`, drawn in accent ink, going **solid** on hover.

```
border border-dashed border-accent/30   →   hover:border-solid
```

The default hover changes the _style_, not the ink: `dashed → solid` at
unchanged opacity. Fading a border in (opacity 0 → visible) is never right —
the border is a drafting mark that firms up under the cursor, not one that
appears.

Two ratified variants brighten as well as solidify:

- **The CalloutLink pattern** — `/30 → group-hover:/60`. The full-width band
  activates as one piece, so its border brightens with it. Also used by the
  modal's list rows.
- **The button pattern** — `hover:border-accent/50` on standalone buttons
  (Footer theme cycler, 404 back-link, /design theme button), and
  `hover:border-tertiary/50` on the modal close button, where the border joins
  the icon's tertiary hover.

Do not invent a third brightening pattern; reuse one of these.

Where each weight goes at rest: `/15` code blocks, `/20` structure and
dividers, `/30` cards and interactive elements, `/40` emphasis.

### Corner marks mean "this opens"

Two related marks, and they carry meaning:

- **Corner diamonds** (`CornerDiamond`, or the `.edge-glow-node` spans in
  `Layout.astro`) — 8px rotated squares pinned to a surface's corners. They mark
  a structural edge. `Panel` places them automatically.
- **Corner brackets** — L-shaped 1px rules at each corner that step outward and
  recolor to `tertiary` on hover (`.ca-tl`/`.ca-tr`/`.ca-bl`/`.ca-br` in
  `global.css`, or hand-built like in `CtaButton.astro`).

**Rule: corner brackets only go on things that open the centre modal.** A card
that is not clickable gets the dashed border and nothing else. This is how a
reader tells, at a glance, what will respond.

### The 16px grid

`--grid-cell-size: 16px`. Grid backgrounds (`.bg-grid-pattern`,
`.bg-hero-grid`) draw 16px cells; the divider grid draws 4px. Structural
spacing lands on multiples of 16 (`--footer-height: 128px` is 8 cells).
Everything else steps in 4s.

Write the Tailwind class. There is no spacing config module, and that is
deliberate: an alias like `GAP_SPACING.xs = "gap-2"` renames a value without
constraining anything — it never stopped anyone writing `gap-7`. The scale is a
closed set, documented here and enforced by `npm run check:design`.

**Legal gaps**: `gap-1` `gap-1.5` `gap-2` `gap-3` `gap-4` `gap-5` `gap-6`
`gap-8`, plus the axis forms in use: `gap-x-3` `gap-x-4` `gap-y-1` `gap-y-2`.
One micro half-step exists for optical alignment (`gap-0.75`).
**Legal stacks**: `space-y-1` `space-y-1.5` `space-y-2` `space-y-3` `space-y-4`
`space-y-6` `space-y-8`.

Anything outside those needs a reason and an allowlist entry. Responsive
prefixes are fine (`sm:gap-4`, `md:gap-8`).

Exception: MDX components use `mb-*`/`mt-*` directly, because MDX renders
siblings into `<article>` with no shared flex parent. Standard paragraph margin
there is `mb-5`.

---

## 6. Page architecture

Every page is the same sandwich, and `Layout.astro` builds the bread:

```
.paper-background            muted backdrop, full viewport
  .mx-auto.max-w-5xl
    main.edge-glow-shell     card surface, left/right borders, full-bleed
                             top/bottom hairlines, 4 corner diamonds
      <slot />               ← your page
  <Footer />                 fixed at -z-10, revealed by main's bottom margin
```

Inside the slot, a page is an alternating stack — nothing else:

```astro
<div class="flex flex-col">
  <Panel>…</Panel>
  <SectionDivider variant="grid" />
  <Panel>…</Panel>
  <SectionDivider variant="grid" />
  <Panel>…</Panel>
</div>
```

`Panel` owns section padding, the card surface, the full-bleed hairlines and the
corner diamonds. **Never hand-roll a section wrapper.** If a section needs
different padding, use `padding="sm|md|lg"`; if it needs different edges, use
`edges` and `ornaments`.

Exceptions to the stack rule, all deliberate:

- **`404.astro`** is fully hand-rolled — a centred error state, not a section
  page. Don't "fix" it into a Panel stack, and don't cite it as precedent.
- **`badges.astro`** is a demo page: one Panel wrapping bare `<section>`s.
- **The non-HTML endpoints** (`*.md.ts`, `llms*.txt.ts`, `rss.xml.ts`) emit
  text, not markup — the rule doesn't apply.

The footer is revealed by scroll: `main` carries `mb-(--footer-height)` and the
footer sits behind at `-z-10`. Don't change that without reading `Footer.astro`.

### z-index ladder

| Layer     | Contents                                                                                       |
| --------- | ---------------------------------------------------------------------------------------------- |
| `-10`     | Footer, behind the page                                                                        |
| `0`       | Written explicitly (`z-0`, 15 uses) to pin backgrounds under content in a new stacking context |
| `10`      | Content inside a Panel, edge-glow strips                                                       |
| `20`      | Corner diamonds and brackets                                                                   |
| `30`      | Modal close button                                                                             |
| `40`      | Modal backdrop (`bg-black/30`)                                                                 |
| `50`      | Modal content                                                                                  |
| `2`       | Lightbox nav/counter, plain CSS inside the 9998/9999 layers                                    |
| 9998/9999 | Blog image lightbox (plain CSS, `global.css`)                                                  |

Stay on this ladder. A new value means a new layer, and there is no room for one.

### Edge glow

One lamp lights the side rails, the divider strips and the corner diamonds, all
with the same reach and curve. Driven by `public/edge-glow.js`, which reads
`--edge-glow-radius` at init; `--edge-glow-stops` samples the identical
smoothstep so paint and script cannot drift.

To make something participate, give it the right class — don't write a new glow:

| Class                                              | What it lights          |
| -------------------------------------------------- | ----------------------- |
| `.edge-glow-shell` + `.edge-glow-shell-vertical`   | Left/right rails        |
| `.edge-glow-shell` + `.edge-glow-shell-horizontal` | A divider band          |
| `.edge-glow-layer`                                 | The wash inside a shell |
| `.edge-glow-line`                                  | A 1px full-bleed strip  |
| `.edge-glow-node`                                  | A corner diamond        |

The `-1px` insets and `±9999px` bleeds in these rules are load-bearing. The
comments in `global.css` explain each one. Read before adjusting.

---

## 7. Reference: what not to do

Everything here has a reason above.

| Never                                         | Instead                                                    |
| --------------------------------------------- | ---------------------------------------------------------- |
| A hex, `rgb()` or `hsl()` in a component      | A token utility or `color-mix()`                           |
| `rounded-md` / `rounded-lg` / `rounded-full`  | Sharp corners (`[1px]`/`[2px]` optical only)               |
| `shadow-*`, `drop-shadow-*`, `box-shadow`     | Hairlines and corner marks                                 |
| `dark:` variants                              | Tokens — they already flip                                 |
| `hover:text-accent` or a new hover color      | `hover:text-tertiary`                                      |
| A new border-hover brightening pattern        | One of the two ratified variants in §5                     |
| Corner brackets on a non-clickable card       | Dashed border only                                         |
| A hand-rolled section wrapper                 | `Panel` + `SectionDivider` (404/badges are the exceptions) |
| A new arbitrary `text-[…]` size               | The scale + three micro sizes in §4                        |
| A new z-index value                           | The ladder above                                           |
| `transition-all` with a duration you invented | `CSS_TRANSITIONS` from `@/lib/config/animation`            |
| Editing `tailwind.config.ts`                  | `@theme` in `global.css` — see below                       |

### `dark:` does not do what it looks like

Themes switch on `data-theme`. Tailwind v4's `dark:` compiles to
`@media (prefers-color-scheme: dark)`, which tracks the operating system and
ignores the theme the reader picked. A `dark:` class therefore fires in Kozo on
a dark-mode Mac. Never use it — per-theme values belong in `global.css` as
variables.

### Files that are not authoritative

- **`tailwind.config.ts`** — dead. Tailwind v4 reads `@theme` in
  `src/styles/global.css`, and nothing loads this file (no `@config` directive).
  Its content globs point at `./app`, `./pages`, `./components`, which do not
  exist, and its `darkMode: "class"` contradicts the real `data-theme` switch.
  Do not edit it and do not learn from it.
- **`.github/*.md`** — historical notes, each carrying a banner saying so.
  Where any of them conflicts with `docs/`, `docs/` wins.
