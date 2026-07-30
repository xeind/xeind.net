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

### Scroll-linked motion

Use `useScroll` + `useTransform` from `motion/react`. Never a `useEffect`
listening to `window.scrollY` — the JS thread lags the native scroll thread and
Safari janks.

---

## 5. Hydration cost

Motion plus React is roughly 100KB. The home page carries two islands —
`ProjectGrid` and `AwardsGrid` — both late in the stack on purpose, both
`client:visible={{ rootMargin: "300px" }}` so they hydrate while the reader
scrolls. The margin must stay smaller than the section's gap below the mobile
fold, or the fetch fires at load and the deferral is wasted.

Adding another island is an ask-first change (`AGENTS.md`). Before asking,
check whether CSS can do it. Most of this
site's motion is CSS — the hover states, the corner marks, the edge glow, the
logo crossfade, the view transitions, the blog lightbox — and none of it costs
hydration.
