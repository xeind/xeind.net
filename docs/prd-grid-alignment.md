# PRD — Grid Registration Rewrite

Everything on the site paces to the 16px drafting grid. Look at the Blueprint
theme and the lines land on real edges: panel boundaries, dividers, padding
steps. Floating furniture (the toaster) is grid-_sized_ — its box is a whole
number of cells — but not grid-_registered_, since it is viewport-fixed and the
grid scrolls with the document.

`global.css` used to claim this ("Unified Grid System … all spacing must be
multiples of 16px") without honouring it. This PRD made the claim true, and
Phase 5 rewrote the comment to describe what the code now does.

## Decisions (settled — do not reopen without a new call)

1. **8px baseline, 16px major cell.** Line-heights and small paddings use the
   half-cell (8px); structural boundaries (panel edges, dividers, section
   padding) must hit the full 16px line. Strict 16-only is too coarse for
   16px body type.
2. **The grid stays document-anchored.** Fixed elements (toaster, footer)
   cannot stay on the drawn lines while scrolling; they are grid-sized
   instead. `background-attachment: fixed` is rejected — it would break
   alignment for everything that scrolls.
3. **Vertical phasing.** Each phase lands complete across every page and all
   four themes, passes the gate, and gets its own commit before the next phase
   starts. No horizontal slices ("all the paddings everywhere, then all the
   line-heights everywhere" — yes; "finish the homepage, then blog" — no).
4. **Work happens on a branch.** `main` deploys in ~2 minutes; a phase merges
   only after its gate passes and the rendered comparison is approved.
5. **Band-like elements are sized in whole cells** (owner's call, 2026-08-13):
   `SectionDivider` = 1 cell (16px) — settling the 16-vs-32 question;
   `CalloutLink` band = 2 cells (32px) total height. Other bands and controls
   get their cell count decided the same way as Phase 2/4 reaches them, and
   the ledger lives in `docs/grid-inventory.md`.

## Phase gate (identical for every phase)

A phase is done when all of these hold:

- [ ] `npm run check && npm run lint && npm run format:check && npm run check:design && npm run build`
- [ ] Debug ruler overlay (Phase 0) shows the phase's targets on-grid at
      1280px, 1440px, and one odd width (e.g. 1437px)
- [ ] All four themes checked; Kozo first — it is the one that breaks
- [ ] Every page: `/`, `/blog`, one post, `/design`, `/lab`, `/404`, `/badges`
- [ ] Narrow (<1024px, no gutters) and wide (past the cap)
- [ ] Rendered before/after screenshots compared side by side — pacing changes
      are judged from pixels, not descriptions (repo rule)
- [ ] Reduced motion unaffected

---

## Phase 0 — Ruler and inventory (no visual change ships)

Build the instrument before touching the patient.

- **Debug grid ruler**: a dev-only overlay (query param `?grid` or key toggle,
  stripped from production builds) that draws the 16px grid and 8px half-grid
  over the whole document, phase-locked to the same origin the Blueprint
  gutter grid will use. Without this, every later check is eyeballing.
- **Inventory**: a written list of every off-grid value — Panel paddings,
  divider heights, type line-heights, hero/footer dimensions, section margins,
  image heights. Grep plus the ruler. This list becomes the work queue for
  Phases 2–4.
- Capture baseline screenshots (all themes × key pages) for later comparison.

**Exit:** ruler works, inventory reviewed, baselines stored. Nothing user-
visible changed.

## Phase 1 — Grid phase (registration, not spacing)

Make the drawn grids and the sheet agree on where the lines are.

- The gutter grid paints from the viewport's top-left; the sheet is centered.
  Set `background-position: center top` (or `calc()`-anchored equivalent) on
  `[data-theme="blueprint"] .paper-background` so tiles are symmetric around
  the sheet's center. `max-w-5xl` = 1024px = 64 cells, so both sheet edges
  then land on lines by construction.
- Decide the odd-viewport-width half-pixel policy (accept, or round via
  `round()`/one-line script) and write it down next to the value.
- Do the same phase-audit for `.bg-grid-pattern` (footer) and `.bg-hero-grid`:
  each must originate from an edge that Phase 2 will place on the grid.
- Account for the 1px line thickness: a "line on the edge" means the 1px
  stroke coincides with the hairline, not sits beside it.

**Exit:** with the ruler on, the sheet's left/right edges and the gutter grid
coincide at all three test widths, all themes (grid visible only in
Blueprint, but positions must not shift elsewhere).

## Phase 2 — Structural spacing (the skeleton)

Snap every box the grid can be checked against. Current offenders, from the
code:

| Thing                          | Now               | Target                         |
| ------------------------------ | ----------------- | ------------------------------ |
| `Panel` padding `sm`           | 16/20 … 32/24px   | multiples of 16                |
| `Panel` padding `md`           | 20/24 … 48/32px   | multiples of 16                |
| `Panel` padding `lg`           | 24/28 … 56/40px   | multiples of 16                |
| `SectionDivider` grid variants | 20px tall         | 16px (or 32px — decide by eye) |
| `SectionDivider` dashed        | 16px ✓            | keep                           |
| `--footer-height`              | 128px ✓ (8 cells) | keep                           |

Plus everything the Phase 0 inventory found: section margins, header height,
hero block heights, CTA button heights, badge heights where they set layout.
Vertical padding is the priority — horizontal alignment inside the sheet
matters only where the grid is visible or the ruler makes misses obvious.

This is the phase that changes the site's pacing. Expect it to need the most
side-by-side judgment; do not average it with Phase 3.

**Exit:** every Panel edge and divider sits on a 16px line on every page.

## Phase 3 — Type rhythm (the flesh)

Quantize the legal type scale's line-heights to the 8px baseline so text
blocks sum to whole half-cells and the structural edges from Phase 2 stay
put no matter how long the prose runs.

- Serif: 16/24, 18/24, 20/24 or 20/32, 24/32 — exact picks by rendered
  comparison, not arithmetic alone.
- Sans (`text-sm`) and mono micro sizes: same treatment; most already sit on
  20px line-height (2.5 half-cells — off-grid, needs the call: 16 or 24).
- Prose vertical margins (`space-y`, heading margins in MDX) in 8px steps.
- Images and other aspect-driven heights: snap via fixed heights, `aspect-*`
  boxes on cell ratios, or a rounding wrapper — chosen per case from the
  Phase 0 inventory. An unsnapped image re-breaks everything below it.

**Exit:** on a text-heavy page (a blog post), the ruler shows baselines on
half-cells top to bottom, and section boundaries still hit full cells.

## Phase 4 — Floating and interactive furniture (grid-sized, not registered)

- **Toaster**: width `22rem` = 22 cells ✓ and offsets `1rem` = 1 cell ✓ stay.
  Snap toast padding (now 12px/16px) to 8px steps and give the toast box a
  height that lands on a whole cell with the Phase 3 line-heights.
- Modals (project grid, lightbox): panel dimensions and internal padding in
  cell multiples.
- Anything else fixed or overlaid from the inventory (edge-glow shell rails,
  corner diamonds' anchor points) — verify sizes, don't re-register them.

**Exit:** every floating box measures a whole number of cells with the ruler
held against it, even though it floats free of the drawn grid.

## Phase 5 — Enforcement and docs (make it stay true) — **shipped 2026-08-16**

- `check:design`'s `spacing` rule now reads every spacing utility, not just
  `gap`/`space-y`: a legal step is an even Tailwind one, plus `-1` (4px)
  between inline things and `-px` for a hairline. Arbitrary values pass at a
  half-cell or one pixel either side of one. `design/` and `lab/` specimen
  components are exempt; their host pages are not.
- The old `GAPS`/`STACKS` sets are gone — they passed `gap-3`, `gap-5`,
  `space-y-1.5` and `space-y-3`, none of which sit on the half-cell.
- 36 off-grid values were retuned rather than grandfathered. Two earned
  allowlist lines instead, both geometry: a square centred on a point needs
  half its own size back, and a 10px icon in `p-1.5` inside a border is a 24px
  control.
- The spacing guidance in `docs/design-system.md` §5 and the `global.css`
  comments were rewritten; dead `.bg-hero-grid` removed.
- The ruler stays, already ship-gated behind `import.meta.env.DEV` in
  `Layout.astro`. `?grid` and its cache-busting trap are documented in §5.

**Exit:** met — a `py-5` in a component fails `check:design`, and the fixture
proving it is in the checker's self-test.

---

## Out of scope

- Any color, theme, or token-name change.
- New components or abstractions — this rewrite only retunes numbers on what
  exists.
- Registering fixed elements to the document grid (decision 2).

## Risks

- **Kozo contrast**: none of this touches color, but padding changes move
  hairlines closer together; check Kozo at every gate anyway.
- **Content length**: nothing on this site truncates (`docs/content.md`), so
  tighter paddings can change where long descriptions wrap. Check the longest
  entries in `src/lib/data/`, not the shortest.
- **20px → 16px divider** may read cramped; 32px may read airy. That is a
  rendered-comparison call, per the repo's five-commit serif lesson.
