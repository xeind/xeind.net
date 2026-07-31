# Animation

Motion rules for xeind.net. Companion to `docs/design-system.md`.

Source of truth: `src/lib/config/animation.ts` (JS/Motion) and the shared
classes in `src/styles/global.css` (CSS).

---

## 1. The house transition

Everything that reacts to a cursor uses one timing:

```
0.2s · cubic-bezier(0.215, 0.61, 0.355, 1)
```

Import it rather than retyping it:

```tsx
import { CSS_TRANSITIONS } from "@/lib/config/animation";

<a style={CSS_TRANSITIONS.border}>…</a>; // 0.2s ease-out-cubic — borders, corners
// .fade  → 0.15s, same curve
// .hover → 0.2s, plain `ease`
```

Astro templates take a style _string_, not React's style object, so `.astro`
files import the same constant and serialize it in the frontmatter.
`CtaButton.astro` shows the pattern — copy it rather than retyping the numbers.

In CSS, the `.t-border` class carries the same job.

**Note on the name.** Two curves in this repo are both called "easeOutCubic":
`animation.ts` uses Penner's `(0.215, 0.61, 0.355, 1)`, and `global.css` uses
easings.net's `(0.33, 1, 0.68, 1)`. They are close and both are in use. Don't
"correct" one to the other — match whichever file you are editing.

---

## 2. Rules

**Fast.** 0.15s–0.3s for interface motion. Never over 1s unless the motion is
the point (the Claude spinner, the Pioneer sparkle).

**Ease-out by default.** Things arriving decelerate. Never `ease-in` on
anything a reader waits for — it reads as lag.

**Compositor for motion; paint is fine for state.** Two different budgets:

- Anything that _moves, scales or reveals_ animates `transform`, `opacity`,
  `filter`, `clip-path` — exclusively. To move something, translate it.
- Small _state transitions_ — `color`, `background-color`, `border-color`,
  `fill` on hover/focus — are allowed and expected. They repaint a few hundred
  pixels, not the page. This is what every dashed→solid border and tertiary
  hover in the site does.

The line: changing _where it is or how big it is_ → compositor properties only.
Changing _what color it is_ → a named color transition is fine. Never animate
`width`, `height`, `top`, `left`, `margin`, `padding` in either case.

**Name the properties.** `transition-[background-color,border-color,color]`,
not `transition-all`. `will-change` only on `transform`, `opacity`, `clipPath`,
`filter`, and only while it matters.

**Blur is expensive.** Never animate a blur over 20px, and only on small
elements. A large blurred layer plus animation crashes mobile Safari.

**Press feedback** is `active:scale-[0.96]`. Never below 0.95.

**Origin.** A thing that opens from a trigger animates from that trigger —
set `transform-origin` to match.

---

## 3. Reduced motion

Non-negotiable, and there are two ways to honour it. Use whichever fits:

```tsx
// React — branch on it
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

// Markup — kill the transition
className = "transition-colors motion-reduce:transition-none";
```

`global.css` also clamps every animation and transition to `0.01ms` under
`prefers-reduced-motion: reduce`, and CSS that sets its own transitions
(edge glow, logo crossfade, lightbox) each restate `transition: none` in a
reduced-motion block. If you write bespoke CSS motion, add that block too.

Dozens of touchpoints already honour it (`grep -rn "motion-reduce\|useReducedMotion" src`).
Don't be the first to skip it.

---

## 4. Motion (Framer) usage

The library is `motion` v12, imported from `motion/react`:

```tsx
import { motion, AnimatePresence, type Transition } from "motion/react";
```

### Palette, not a menu to browse

`animation.ts` is kept complete on purpose — the full `EASING` table is a
reference worth having, and the spring variants are there when a case calls for
one. But only a few are the **house defaults**, and those are what you reach for
unless you have a reason:

| Job                      | House default            |
| ------------------------ | ------------------------ |
| Borders, corners, hover  | `CSS_TRANSITIONS.border` |
| Quick fades              | `CSS_TRANSITIONS.fade`   |
| Curve, when hand-writing | `EASING.easeOutCubic`    |
| Duration                 | `DURATION.normal` (0.2s) |
| Modals and layout        | `SPRING_CONFIG.noBounce` |

Everything else in that file is available, not endorsed. Picking
`SPRING_CONFIG.snappy` because it sounds right is how a codebase ends up with
six spring feels. If a case genuinely needs one, say why in a comment.

Springs are the default for Motion, from `SPRING_CONFIG`:

| Key        | Shape                     | Use                      |
| ---------- | ------------------------- | ------------------------ |
| `default`  | stiffness 400, damping 30 | General                  |
| `smooth`   | stiffness 300, damping 30 | Larger travel            |
| `modal`    | duration 0.6, bounce 0.3  | —                        |
| `gentle`   | duration 0.5, bounce 0.2  | Dropdowns                |
| `snappy`   | duration 0.4, bounce 0.4  | —                        |
| `noBounce` | duration 0.3, bounce 0    | **Modals.** No overshoot |
| `bouncy`   | stiffness 500, damping 25 | Drag gestures only       |

Bounce is for drag. A modal that overshoots looks cheap — use `noBounce`.

Use `AnimatePresence initial={false}` so nothing animates on page load.

### Card → modal expansion

Both `ProjectGrid` and `GridIterations` expand a card into a centred modal with
shared-element FLIP, and any new one must match them. 33 `layoutId` usages back
this pattern.

1. The card and the modal share a `layoutId`.
2. **Children share `layoutId`s too** — title, image, badges. Without this the
   text stretches like rubber during the morph.
3. `AnimatePresence` swaps them. Never animate width/height in CSS to fake it.
4. Backdrop is `fixed inset-0 z-40 bg-black/30`; the modal is `z-50`; the close
   button is `z-30` inside it.
5. Lock scroll with `useScrollbarCompensation` — overflow only. `<html>` already
   has `scrollbar-gutter: stable`, so adding padding double-compensates and
   shifts the page.
6. Trap focus with `useFocusTrap`, and close on `Escape`.

Read `src/components/sections/ProjectGrid.tsx` before writing a new one.

### Images in motion

**Never animate an undecoded image.** An `<img>` without pixels paints blank,
pops in mid-animation, and reports `naturalWidth: 0` — which silently breaks
any geometry computed from it (the lightbox's cover-aware FLIP did exactly
this on the first click after a page swap). The pattern, used by both the
lightbox's open and its next/prev:

```js
const pre = new Image();
pre.src = src;
try {
  await pre.decode();
} catch {}
// now measure, then animate
```

Cached images resolve within a frame, so this costs nothing after the first
encounter. While an uncached one decodes, whatever triggered the animation is
still on screen untouched — the wait is invisible. This applies to any future
image morph, carousel, or reveal.

### Scroll-linked motion

Use `useScroll` + `useTransform` from `motion/react`. Never a `useEffect`
listening to `window.scrollY` — the JS thread lags the native scroll thread and
Safari janks.

---

## 5. Loading & navigation

### Islands

Motion plus React is roughly 100KB. The home page carries two islands —
`ProjectGrid` and `AwardsGrid` — both late in the stack on purpose, both
`client:visible={{ rootMargin: "300px" }}` so they hydrate while the reader
scrolls. The margin must stay smaller than the section's gap below the mobile
fold, or the fetch fires at load and the deferral is wasted.

**`client:visible` is the only directive in normal use.** `client:load`
hydrates on arrival and competes with the view transition for the main
thread — the /design Claude tile did exactly this and made every navigation
there feel heavy. Reach for `client:load` only when something must be
interactive above the fold at t=0, and say why in a comment.

Adding another island is an ask-first change (`AGENTS.md`). Before asking,
check whether CSS can do it. Most of this site's motion is CSS — the hover
states, the corner marks, the edge glow, the logo crossfade, the view
transitions, the blog lightbox — and none of it costs hydration.

### Prefetch

`ClientRouter` enables prefetch by default: `prefetchAll: true`, strategy
`hover`. That covers desktop for free. **Phones have no hover**, so primary
navigation — the callout band, the footer's /design link — carries
`data-astro-prefetch="viewport"`: the page is fetched the moment the link
scrolls into view, and a tap swaps instantly. Use `viewport` only on the few
links a reader is likely to tap (each one costs a page download); leave
everything else on the hover default. External links never prefetch.

### The crossfade

Page navigations fade out 100ms / in 160ms (`::view-transition-*` in
`global.css`). These run concurrently, so the perceived settle is ~160ms —
inside the house 0.15–0.3s band, but at the fast end on purpose: navigation
is user-initiated, and every millisecond here sits on top of fetch + parse.
Don't slow it down to make it "smoother"; the smoothness budget belongs to
the modal, not the page swap.

### Page weight

The router fetches the whole next page on click, so HTML size IS navigation
latency. `inlineStylesheets: "always"` puts ~74KB of CSS in every page — a
deliberate first-paint trade that taxes every subsequent navigation; revisit
it before adding any other global payload. /design carries ~117KB of inline
specimen SVG and is the slowest page by design — it is a specimen sheet, not
a template to copy. A new content page should stay near the ~100KB the blog
pages weigh.
