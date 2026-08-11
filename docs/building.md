# Building something new

The generative recipe. `design-system.md` says what exists and what is legal;
this file says how to compose a new thing from it **without further
instruction**. If you follow this, the owner should not have to direct you
piece by piece — that is its test.

## Voice of the artifact

Everything built here should come out: **drawn, not decorated. Precise, quiet,
technical, restrained.** A new element should look like it was always on the
page — drafted by the same hand, on the same grid, in the same ink. If a new
element draws attention to its own styling, it is wrong.

## Priority order — when rules collide

Resolve conflicts top-down. Never resolve one silently in the other direction.

1. **Works in Kozo.** The light theme breaks first; a thing that vanishes
   there is broken everywhere.
2. **Behaviors** (design-system.md's prescriptive rules: no `dark:`, no
   shadows, brackets mean "opens", hover ink is tertiary).
3. **Reuse an existing primitive** — even when a bespoke element would be
   slightly better. Sameness IS the design.
4. **Closed sets** (type, spacing, opacity, z, radii — the checker's
   constants). Need a new value? That's an ask-first design decision, not an
   implementation detail.
5. **Taste.** Only after 1–4 hold does polish get a vote.

## The four passes

Build in this order; don't blend the passes.

**1. Frame** — What is this thing? Answer in the system's vocabulary before
writing markup: Is it a _section_ (→ `Panel` in a page stack)? A _card in a
grid_ (→ plate pattern)? An _inline affordance_ (→ `InlineLink`/`Badge`)? A
_full-width action_ (→ `CalloutLink`/`CtaButton`)? An _overlay_ (→ the
ProjectGrid modal pattern)? If it is none of these, stop and ask — a new
category is an owner decision.

**2. Compose** — Assemble from primitives only, no styling yet. The table in
`src/components/AGENTS.md` maps need → component. Content comes from
`src/lib/data/`, typed in `types.ts`, sized per `content.md`. Astro by
default; a React island only for runtime state or Motion, and a _new_ island
is ask-first.

**3. Execute** — Now the visual layer, and it is mostly already decided:

| Decision | Already answered by                                         |
| -------- | ----------------------------------------------------------- |
| Color    | Token utilities; hover ink `tertiary`; never a literal      |
| Surface  | `bg-card` on panels, `bg-muted` for wells/stages            |
| Border   | `1px dashed accent/30 → hover:solid`; brackets iff it opens |
| Type     | Voice first (serif read / sans UI / mono meta), then rank   |
| Spacing  | The gap/stack ladder; structure on the 16px grid            |
| Motion   | `CSS_TRANSITIONS.border`; modals `SPRING_CONFIG.noBounce`   |
| Icons    | `currentColor` inline, or `InlineIcon` mask from `public/`  |
| Depth    | Hairlines and corner marks — never shadow, never blur       |

What is genuinely yours to decide in this pass: internal layout of the
content, which tier of each ladder, and copy. That's it.

**4. Review** — Before "done": all three themes (Kozo first), narrow + wide,
keyboard (visible focus, Escape closes), reduced motion, then
`npm run check && npm run lint && npm run format:check && npm run check:design && npm run build`.

## Recipes

### A new home-page section

`index.astro` stack gains `<SectionDivider variant="grid" />` + `<Panel>`.
Inside: `<h2 class="text-foreground font-serif text-2xl">Name</h2>` then a
`space-y-4` body. Content module in `src/lib/data/`, typed. Server-rendered
unless it must animate. Look at `AboutSection` (simplest) and `AwardsGrid`
(grid of cards) as the two poles.

### A new card in a grid

Copy the plate: `bg-muted` stage, `DashedBorders` from `ui/frame`, labels in the plate
(serif title bottom-left, mono tag bottom-right, `@container` so the tag
drops itself when narrow). **Brackets + `GradientBackground` only if clicking
opens the modal** — a card with nothing to open gets the dashed border alone
(`interactive: false` drives this from data, see `yield`). Cell = wrapper div
owning the group + size; button fills it; any external-link arrow is a
sibling above, never nested inside.

### A new thing that opens

One modal pattern exists (`ProjectGrid`): portal to body, backdrop
`z-40 bg-black/30`, content `z-50 max-w-xl h-[50vh]`, shared `layoutId` on
card/title/type (children too, or text rubber-bands), `noBounce`,
`initial={false}`, `useScrollbarCompensation` + `useFocusTrap` + Escape.
Don't write a second implementation — extend this one (the planned shared
project/award modal is the precedent).

### A new page

`Layout.astro` gives you the shell. Inside: the Panel/Divider stack — h1
`font-serif text-2xl`, eyebrows `text-accent font-mono text-xs tracking-wide`
in caps. `noindex` until it has publishable content, and keep it out of the
sitemap filter in `astro.config.mjs`. The exceptions (404's centred error
state, badges' demo page) are precedents only for _those_ jobs.

### A new interactive affordance (button, toggle, link)

Don't invent one — the set is closed by reuse: `CtaButton` (primary + shortcut),
`CalloutLink` (full-width band), `InlineLink` (in a sentence), the quiet
button pattern (`hover:bg-muted hover:border-accent/50` — Footer's theme
cycler). New sound? The synth in `public/hero-interactions.js` owns audio;
percussive noise-taps only, gated on user gesture, silent under
reduced-motion conventions there.

### New content (a project, award, job, post)

Data only — no component work. Add the entry in `src/lib/data/`, inside
`content.md`'s bands (the checker enforces them). The UI adapts; that is the
point of the split. A project with no link and no copy sets
`interactive: false` rather than shipping an empty modal.

## Hard rejects

Reflexes to suppress, beyond the Never table:

- Rounding a corner "just for this one", any shadow, any glow that isn't the
  edge-glow system.
- A second border treatment inside a bordered card (the vallow lesson).
- Wrapping everything in cards; nesting panels in panels.
- Decorative animation — pulsing dots, marquees, typing cursors, parallax.
  Motion here means: state feedback, or the modal morph. Nothing ambient
  except the edge glow. **One scoped exception: `/lab`**, a specimen sheet
  with the same standing as `/design`. There the loader's pulse and the
  stream's caret are the subject on display, not motion laid over something a
  reader is reading. The reject holds everywhere else — a specimen does not
  earn its way onto a content page by existing.
- A new hue. The themes own hue; components own none.
- Centering a section's prose. Text sits left; only marks and stages centre.
- "While I'm here" refactors of neighbouring code.

## When to stop and ask

New token, new type size, new z-layer, new spring, new island, new page-level
pattern, a fourth font, any repaint-the-site change, anything `deploy`.
Everything else in this file is pre-authorized: build it, verify pass 4, done.
