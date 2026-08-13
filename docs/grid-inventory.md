# Grid inventory — Phase 0 survey

The work queue for Phases 2–4 of `docs/prd-grid-alignment.md`. Snapshot taken
2026-08-13 on branch `grid-alignment`. Re-run the raw tally any time with
`node scripts/grid-inventory.mjs` — it lists every Tailwind spacing utility in
`src/` whose pixel value is off the 8px half-cell grid, with the files using
it. At snapshot time: **65 distinct off-grid values**.

The grid: 8px half-cell for line-heights and small paddings; 16px major cell
for structural boundaries (panel edges, dividers, section padding). "On the
8-grid" is not enough for structural values — they must hit 16.

## Phase 2 — structural (must hit the 16px major grid)

Resolved 2026-08-13. The owner picked the airy candidate from rendered
side-by-sides (baseline | tight | airy at 1440, Kozo + Blueprint).

| Owner                                  | Was                                    | Now                                     |
| -------------------------------------- | -------------------------------------- | --------------------------------------- |
| `ui/Panel` `sm`                        | `px-4 py-5 sm:px-6 md:px-8 md:py-6`    | `px-4 py-8 sm:px-8 md:py-8` (no caller) |
| `ui/Panel` `md`                        | `px-5 py-6 sm:px-8 md:px-12 md:py-8`   | `px-4 py-8 sm:px-8 md:px-12 md:py-8`    |
| `ui/Panel` `lg`                        | `px-6 py-7 sm:px-10 md:px-14 md:py-10` | `px-8 py-8 sm:px-12 md:px-16 md:py-12`  |
| `ui/SectionDivider` grid + grid-broken | `height: 20px`                         | 16px — 1 cell (PRD decision 5)          |
| `ui/SectionDivider` dashed             | `h-4` = 16px                           | ✓ kept — 1 cell                         |
| `ui/CalloutLink` band                  | `py-2` + ~20px text ≈ 36px             | `h-8` = 32px — 2 cells (PRD decision 5) |
| `--footer-height`                      | 128px                                  | ✓ kept                                  |
| Page-level `mb-3`/`mt-3` (12px)        | `pages/*.astro`, section components    | → `mb-4`/`mt-4` (16px)                  |
| Section gaps `gap-3` (12px)            | section/hero block rows                | → `gap-4` (16px)                        |

Deferred out of this phase: `gap-3` inside buttons (`CtaButton`, hero CTAs)
goes with control heights in Phase 4; `mb-3`/`gap-3` in blog MDX and
`PullQuoteCard` are prose margins, Phase 3; `design/`/`lab/` specimens stay
out of scope.

## Phase 3 — type rhythm (8px baseline)

Resolved 2026-08-13. The owner picked the airy candidate from rendered
side-by-sides (phase2-final | tight | airy at 1440, Kozo + Blueprint —
`shots/phase3-compare.html`). Verified by measurement, not eye:
`scripts/phase3-measure.mjs` walks a post and reports every computed
line-height and every flow-box height (margins in, 1px hairlines out) that
misses the 8px half-cell. All five posts measure clean; the only residue is
hairline strokes and collapsed table borders, ratified below.

| Owner                                      | Was                                      | Now                                          |
| ------------------------------------------ | ---------------------------------------- | -------------------------------------------- |
| Sans/serif `text-sm`, 13px UI voice        | `leading-relaxed` ≈ 22.75px              | `leading-6` = 24px, everywhere               |
| Blog serif prose 16px                      | `leading-[1.8]`/`[1.9]`, Pretext 28.8    | 32px (`leading-8`; PretextBlock default 32)  |
| Non-blog serif base (index excerpts, modal)| `leading-relaxed` = 28px                 | `leading-8` = 32px (airy)                    |
| Headings                                   | browser `normal`                         | 24/32 + 20/32 `leading-8`, 18/24 `leading-6` |
| MDX paragraph/list margins                 | `mb-5` (20px)                            | `mb-6` (24px)                                |
| MDX h2 margin, quote-card label            | `mb-3` (12px)                            | `mb-4` (16px)                                |
| MdxHr / blog-index divider                 | `my-5`, stale `-mx-5`                    | `my-6`, `-mx-4` (matches Phase 2 `px-4`)     |
| MDX blockquote                             | `py-1 pl-5`                              | `py-2 pl-6`                                  |
| MdxLi                                      | `gap-3`, bullet `mt-[0.72em]`            | `gap-4`, `mt-[0.875em]` (centres on 32px)    |
| `PullQuoteCard`                            | `p-5 sm:p-6`, micro type off-baseline    | `p-6`; label/author/role `leading-4`; quote mark `text-[3.5rem]` (56 keeps the header row on the half-cell); `gap-4` |
| `DiffBlock`                                | `p-3`, `leading-relaxed` (11px ≈ 19.25)  | `p-4`, `leading-4` = 16px                    |
| `pre.astro-code` (+ /design specimens)     | `line-height: 1.75` ≈ 22.75px            | `1.5rem` = 24px                              |
| `[slug].astro` series box                  | `p-5`, `space-y-1.5`                     | `p-6`, `space-y-2`                           |
| MDX table                                  | cells at browser `normal`                | `leading-6` cells, `leading-4` mono headers  |
| Single blog figures                        | intrinsic ratio → fractional height      | aspect-ratio 566/(8k−2): snapped at the max-w-xl cap, ≤4px object-cover crop elsewhere |
| `.blog-grid` collages                      | `aspect-ratio` → fractional height       | fixed heights ≥1024px (520/696/584/696), ratios keep governing below the cap |
| Mono micro (`leading-none`)                | = font-size                              | ✓ kept inside snapped boxes                  |

Ratified residue: 1px/2px hairline borders (figure mats absorb theirs via the
8k−2 image box; tables and diff rows keep theirs — line weight is not
spacing). Deferred to Phase 4: `Badge` `leading-tight`, toast `--leading-*`
tokens, button interiors. `design/`/`lab/` specimens stay out of scope
(`GridIterations`, `ApprovalCard`).

### Round 2 — owner review (2026-08-13, same session)

The owner held the ruler against the live site and found the misses the first
pass ratified away. This round zeroed them; `scripts/phase3-home-probe.mjs`
walks any page and reports every flow box whose top or height misses the 8px
half-cell. `/`, `/blog`, `/tools`, and all five posts now measure **zero**
flow offenders (inline links, centered ornaments, and by-design −1 border
anchors excluded).

- Hero: name `leading-8` + address/tagline `leading-6` + `gap-2` make the
  text column 64px — the logo's own height. CTA buttons (`HeroActionLink`,
  `CtaButton`) are 40px controls: 24px label line + `py-2`; shortcut chips
  `px-2 py-1 leading-4` = 24px.
- `Badge` `min-h-6` (24px, border-box, pulled forward from Phase 4).
- `CalloutLink`: bottom border draws at `bottom:-1` so the stroke sits ON the
  32px grid line (band gets `z-10` to stay above the next panel); the bottom
  corner diamonds translate the same pixel.
- `AwardsGrid` caption: `p-4`, issuer `leading-4 mb-2`, title `leading-6`,
  footer `py-2`, caption rule `-mt-px`.
- **Hairline-absorption patterns** (the ratified residue is now actually
  absorbed, not just excused): bare flow rules take `-mt-px` when the element
  above supplies the gap, or `mt-[calc(…−1px)]` when they own it (margin
  collapse eats a plain calc next to a larger neighbour — the pixel must be
  a true negative or come off the un-collapsed side). Bordered blocks:
  `pre.astro-code` `margin-block:-1px` (`[data-has-header]` keeps
  `margin-top:0` — its top hairline lives on the header row), `DiffBlock`
  `-my-px` + run edges carry `margin:-1px`, tables `-mt-px` + cells
  `pt-2 pb-[7px]` (row pitch 40 with the collapsed border), `PullQuoteCard`
  `py-[23px]`, series box `-mb-px mt-[calc(2rem−1px)]`, `ApprovalCard`
  `-my-px`.
- Line-box inflators found by measurement: inline `code` gets
  `line-height:1` (mono metrics pushed 32px serif lines to 33), `Cite`
  drops `align-super` for `relative -top-[0.5em] leading-none` (super
  stretched lines to ~37), reference/series numbers drop `mt-px` for
  `leading-6`, flexed nav links sit in `h-6` rows (blockified `pb-px` +
  underline made 26px rows).
- Lab specimens: micro mono → `leading-4`; replay button `h-6`.
  `/404` snaps internally (`leading-16`, `h-10` button) but is vertically
  centered, so its offset from the document grid is inherent.
- Still open for Phase 4: `ApprovalCard`/`TaskRows` interior chrome leaves
  the last two `/lab` panels 1–3px off; `/design` keeps ~1px of deep
  specimen residue (`GridIterations`).

## Phase 4 — furniture (grid-sized, not registered)

| Owner                      | Value today                            | Note                                     |
| -------------------------- | -------------------------------------- | ---------------------------------------- |
| `.toast` padding           | `0.75rem 1rem` (12/16px)               | 12 → 8 or 16                             |
| `.toaster` width / offsets | 352px / 16px                           | ✓ 22 cells / 1 cell — keep               |
| `ProjectGrid` modal chrome | `h-7` 28, `h-9` 36, `h-11` 44          | all three off the 8-grid                 |
| `AwardsGrid` plate chrome  | `h-9` 36, `py-2.5` 10, 18px translates | off-grid hover geometry                  |
| `CtaButton` / `Badge`      | `py-0.5`, `px-1.5`, `gap-3`            | control heights + interior gaps off-grid |
| `lab/ApprovalCard`         | `p-4 sm:p-6` (24px)                    | specimen card interior, found in Phase 2 |
| `.divider-grid` texture    | `4px` cells                            | quarter-cell texture — arguably ✓ (16/4) |

## Phase 1 findings (2026-08-13)

- `.bg-hero-grid` is used by nothing — dead CSS. Left in place (surgical
  rule); Phase 5 can remove it with the doc rewrite.
- `.bg-grid-pattern` is not "the footer grid" its comment claims: it is a
  16px tile texture inside cards (`ProjectGrid`, `AwardsGrid`, `design/`).
  Box-anchored is correct for a tile texture — a card's internal grid should
  register to its own frame, not the page. No change; comment fixed in
  Phase 5.
- Registration lesson, encoded in the `background-position` comments: CSS
  `center` maps a tile's midpoint to the center, so a naive `center top`
  leaves every line half a cell off the sheet edge. The phase is
  `calc(50% + half-a-tile)`.

## Deliberately out of scope

- `1px`/`2px` hairlines and dash patterns (`--divider-dash-*` 8px ✓) — line
  weight is not spacing.
- `design/` and `lab/` specimen components: they follow whatever the
  primitives decide; fix the primitive, re-shoot the specimen.
- `.blog-grid` fractional template rows (`2fr 1fr` etc.) — aspect-driven;
  handled by the Phase 3 image-snapping decision, not by retuning ratios.

## Baselines

`shots/baseline/` (gitignored), captured by
`node scripts/grid-shots.mjs --out=shots/baseline` with the dev server on
3180: 4 themes × 7 pages × 1440px, plus Blueprint at 1280/1440/1437.
Headless Chrome's classic scrollbar makes the layout viewport ~15px narrower
than the nominal width — the ruler and the real grid share the same layout
width, so alignment comparisons stay valid.
