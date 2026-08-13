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

| Owner                                  | Value today                            | Note                                   |
| -------------------------------------- | -------------------------------------- | -------------------------------------- |
| `ui/Panel` `sm`                        | `px-4 py-5 sm:px-6 md:px-8 md:py-6`    | 20/24px vertical — both off-major      |
| `ui/Panel` `md`                        | `px-5 py-6 sm:px-8 md:px-12 md:py-8`   | py-6 = 24px off-major; md:py-8 = 32 ✓  |
| `ui/Panel` `lg`                        | `px-6 py-7 sm:px-10 md:px-14 md:py-10` | 28/40px vertical — both off-major      |
| `ui/SectionDivider` grid + grid-broken | `height: 20px`                         | → 16px: 1 cell (PRD decision 5)        |
| `ui/SectionDivider` dashed             | `h-4` = 16px                           | ✓ keep — 1 cell                        |
| `ui/CalloutLink` band                  | `py-2` + ~20px text ≈ 36px             | → 32px total: 2 cells (PRD decision 5) |
| `--footer-height`                      | 128px                                  | ✓ keep                                 |
| Page-level `mb-3`/`mt-3` (12px)        | `pages/*.astro`, section components    | commonest single offender (×11 files)  |
| Section gaps `gap-3` (12px)            | 13 files                               | second commonest                       |

## Phase 3 — type rhythm (8px baseline)

Every `leading-*` in use is relative, so no text sits on the baseline today.
Computed line-heights at the legal sizes:

| Pair in use                                   | Count                | Computed                      | Snap to                             |
| --------------------------------------------- | -------------------- | ----------------------------- | ----------------------------------- |
| `leading-relaxed` (1.625) on `text-base` 16px | 34 uses total        | 26px                          | 24 or 32 — by eye                   |
| `leading-relaxed` on `text-sm` 14px           | (within count above) | 22.75px                       | 24                                  |
| `leading-[1.8]` (blog prose)                  | 5                    | 28.8px on 16px                | 32 (blog reads airier)              |
| `leading-[1.9]`                               | 1                    | 30.4px                        | 32                                  |
| `leading-normal` (1.5)                        | 7                    | 24px on 16px ✓ / 21px on 14px | per-size audit                      |
| `leading-snug` (1.375)                        | 4                    | 22px on 16px                  | 24                                  |
| `leading-tight` (1.25)                        | 3                    | 20px on 16px / 25px on 20px   | 24                                  |
| `leading-none`                                | 12                   | = font-size                   | fine where it sits in a snapped box |

Direction (final picks by rendered comparison, PRD Phase 3): serif 16/24,
18/24, 20/32, 24/32; sans 14/24 (relabeling the UI voice onto the baseline);
mono micro sizes keep `leading-none` inside snapped containers. Prose margins
(`mb-3`, `my-5`, `space-y-*` odd steps) move to 8px steps in the same pass.

## Phase 4 — furniture (grid-sized, not registered)

| Owner                      | Value today                            | Note                                     |
| -------------------------- | -------------------------------------- | ---------------------------------------- |
| `.toast` padding           | `0.75rem 1rem` (12/16px)               | 12 → 8 or 16                             |
| `.toaster` width / offsets | 352px / 16px                           | ✓ 22 cells / 1 cell — keep               |
| `ProjectGrid` modal chrome | `h-7` 28, `h-9` 36, `h-11` 44          | all three off the 8-grid                 |
| `AwardsGrid` plate chrome  | `h-9` 36, `py-2.5` 10, 18px translates | off-grid hover geometry                  |
| `CtaButton` / `Badge`      | `py-0.5`, `px-1.5`                     | control heights land off-grid            |
| `.divider-grid` texture    | `4px` cells                            | quarter-cell texture — arguably ✓ (16/4) |

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
