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

**Press feedback** is `active:scale-[0.96]`. Never below 0.95. Name `scale` in
the transition, not `transform`: Tailwind v4's `scale-*` utilities set the
standalone `scale` property, so a `transition-[…,transform]` leaves the press
snapping with no easing and nothing in DevTools looks wrong.

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

The clamp cannot reach a timer. Motion driven by `setInterval` or
`requestAnimationFrame` checks the setting itself: the ATAX logo's tile shuffle
(`ProjectLogo.tsx`) holds its frame, and the selection overlay snaps (§6).

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
   **A `layoutId` source must be measurable.** Hiding one with `display: none`
   (`hidden`, or a container-query `@max-*:hidden`) leaves Motion no rect, and
   the counterpart flies in from a garbage position — the plate tag did this
   on phones. Hide a source with `invisible` instead: same look on an
   absolutely-positioned element, but the rect survives for the morph.
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
**decided** first-paint trade (2026-08): `"auto"` was tried, measured to cut
every page 40–70%, and rejected — the owner keeps first-visit LCP unburdened
by a render-blocking CSS request. Don't re-propose it; do think twice before
adding any other global payload, since every page carries it. /design carries ~117KB of inline
specimen SVG and is the slowest page by design — it is a specimen sheet, not
a template to copy. A new content page should stay near the ~100KB the blog
pages weigh.

### Scripts that wait for the paint

A script that does nothing until the reader acts should not compete with the
largest paint. `selection-dimensions.js` is one: as a `defer` script its 56KB
went out before the largest paint and cost about 0.5s of LCP under
Lighthouse's throttled network. `Layout.astro` now loads it with a small inline
loader: after `load`, then the first `largest-contentful-paint` entry (the first
`paint` where LCP is not reported, as in Safari), then idle time, with a 1s
ceiling. `load` alone fired before the first paint on a fast connection, and
two animation frames ran before the paint in headless Chrome. A window flag
stops a second copy after a `ClientRouter` swap.

---

## 6. The selection outline

`public/selection-dimensions.js` moves the outline around selected text by
hand, in `requestAnimationFrame`. A script in `public/` cannot import
`animation.ts`, so it restates the values: change one, change both.

**Curve.** The outline is one band per visual line (`docs/design-system.md` §3).
When the selection reshapes, each band's four edges close the same share of
their gap per millisecond, `1 − e^(−dt/τ)`. τ is `300 / (10 ln 2)`, about 43ms,
which is `EASING.easeOutExpo` over `DURATION.slow`: within 0.1% at 300ms. The
state is only where an edge is and where it is going, so a new target mid-move
carries on from the shape in between.

**Why not a spring.** The `.theme-roll` comment in `global.css` records a
critically damped spring tried there and reverted: it starts at rest, so it
hangs before it moves. This approach starts at full speed, as easeOutExpo does.

**Bands grow one axis at a time** (`STAGED_GROWTH`, `STAGE_SHARE = 0.6`). An
arriving band grows its height at its neighbour's width, then widens or narrows
to its own once it reaches 60% of its height. A leaving band narrows to its
neighbour first, then collapses, and is dropped once the shape settles. So a
one-line rectangle grows its step instead of popping one in.

**The stroke dims while it moves.** Past 1px a frame the outline eases toward
0.4 of its ink (`MOVING_INK`), so an edge sweeping across a line of words does
not strike them through, and returns to full as it settles. Rules and labels
keep their own opacity.

**Rules draw per axis.** The rules measure the outline's bounding box. It
carries a width rule from 44px wide and a height rule from 28px tall. A shown
rule hides only under 40 and 24, so a drag across the line does not flicker it.
Below both, one centred `W × H` label stands in. A rule that forms draws out
from its number on the edges' curve while the number counts up from 0; one that
goes draws back in and counts down. A new outline starts with its rules drawn
and only fades: in over 150ms (`DURATION.fast`), out over 120ms, both on an
ease-out cubic. The exit is shorter than the entrance and than any token:
deselecting is the reader's own act, so the answer to it should come quicker.

**Rail rulers form with the box.** On the sheet's side rails, a ruler grows
from the selection's centre: the band's half-height and its number both follow
the ruler's visibility on the same curve, and it retracts the same way. Unlike
the rules, it forms on a new selection too. It appears away from the pointer,
so growing is how the eye finds it.

**Hover and focus redlines fade and morph.** A redline fades in over 100ms and
out over 120ms, on the same ease-out cubic. One that starts within 300ms of the
last on screen (`HOVER_WARM_MS`) shows at full at once: hovers and Tabs come in
runs, and a fade on every control reads as flicker. Moving straight to a
neighbour (`HOVER_MORPH`), by pointer or by Tab, carries the one box to the
next element on the edges' curve, with no fade between. In a run, the pointer
has to rest 100ms on the next element (`HOVER_DWELL_MS`) before the box goes
there, and the box fades out if the pointer has been off its element that long
without resting: a fast pass over the project grid used to drag one tile-sized
box after the pointer. No hover redline shows while a button is held, while the
pointer is outside the window, or in the footer. Keyboard focus draws its own
redline on the same elements when the browser shows its focus ring
(`:focus-visible`), so a mouse click on a link draws none, and the ring stays.
Hover and focus are separate boxes, so
both can show; an element under both gets one, kept by whichever arrived first.

**Reduced motion keeps the fades and drops the travel.** Edges, rules and
rulers land at once, so nothing counts, stages or dims, but the fades run:
they change opacity and move nothing. Hover and focus redlines stay, as
opacity only: the old box fades out where it is and the new one fades in at
its own place. The script runs for fine pointers only, which gates the focus
redline too. No frames run at rest, and a scroll needs no redraw: the overlay
scrolls with the page.

---

## 7. Margin notes

`blog/MarginNote.astro` draws a note on as it reaches 60% in view, once:
`public/margin-notes.js` adds the class and the CSS runs the draw. The
component writes the timings into custom properties from `animation.ts`, so
nothing is retyped:

| Step                                     | Timing                                                                  |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| Leader, dashed, through a mask           | `DURATION.slower` on `EASING.easeInOutCubic`                            |
| Arrowhead, after the leader              | `DURATION.fast` on `EASING.easeOutCubic`                                |
| Each line of text, after the head starts | `DURATION.slow` on `EASING.easeOutCubic`, half of `DURATION.fast` apart |

The leader is a pen that starts from rest and lands, hence the in-out curve.
Text writes on left to right through a `clip-path`, from 0.35 opacity so it
reads as ink while drawn. Below 92rem there is no leader, and the text starts
at once. The run takes about a second, which §2 allows because the draw is the
point.

Reduced motion and no JS both render the note fully drawn: the script never
arms a note under reduced motion, and only an armed note is hidden. A
reduced-motion block also covers a reader who turns it on after arming. The
note's stylesheet and `margin-notes.js` load only on pages that render a note.
