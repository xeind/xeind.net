/**
 * Drafting-mark prototypes for the "precise" theme: dimension lines,
 * registration crosshairs, title block, grid references, scale bar,
 * center-marked divider. Static markup, zero JS.
 *
 * Under Blueprint the line marks are drawn freehand. Each one renders
 * twice: the ruled copy (`.mark-ruled`, plain hairline boxes) and the freehand
 * copy (`.mark-freehand`, SVG paths whose waver is baked into the path data
 * at build time by lib/freehand). Two global.css rules show one copy per theme, so a
 * theme switch needs no reload and the waver costs nothing to paint. An SVG
 * filter did this first and WebKit re-ran it on every scroll repaint.
 *
 * The filter also thinned each line in patches. That wear is gone: its grain
 * was per-pixel, which a dash pattern can't copy without breaking the line,
 * and per-segment opacity would multiply the paths.
 */

import { freehand, type Point } from "@/lib/freehand";

// The freehand copies are drawn at each mark's width on a desktop sheet,
// measured at 1280px: max-w-sm is 384, the grid region inside it 364 once the
// 20px row-label column is out, the content column 896. Right- and
// centre-anchored parts sit in nested frames at x="100%" or "50%", so a
// narrower sheet moves them with the box; long lines are drawn at the design
// width and clipped to the box.
const DIMENSION_WIDTH = 384;
const REGION_WIDTH = 364;
const DIVIDER_WIDTH = 896;

// One seed per mark keeps every build identical and no two marks alike.
const DIMENSION_SEED = 11;
const REGION_SEED = 23;
const SCALE_SEED = 37;
const DIVIDER_SEED = 41;

/** Architectural dimension line: end caps, diagonal ticks, centered label.
 * Marks are absolutely anchored so caps, ticks, and line share exact
 * intersections instead of drifting as flex siblings. */
function DimensionLine({ label }: { label: string }) {
  // Cap: 12px tall, centred on the 16px box. Tick: 8px at 45°, centred where
  // the cap meets the line, so ±2.83 each way.
  const cap = (x: number, originX: number) =>
    freehand(
      [
        [x, 2],
        [x, 14],
      ],
      DIMENSION_SEED,
      [originX, 0],
    );
  const tick = (originX: number) =>
    freehand(
      [
        [-2.83, 5.17],
        [2.83, 10.83],
      ],
      DIMENSION_SEED,
      [originX, 0],
    );

  return (
    <div
      className="text-accent/50 relative flex h-4 w-full items-center justify-center"
      aria-hidden="true"
    >
      <div className="mark-ruled absolute inset-0">
        {/* Dimension line */}
        <div className="bg-accent/25 absolute inset-x-0 top-1/2 h-px" />
        {/* End caps (extension lines) */}
        <div className="absolute top-1/2 left-0 h-3 w-px -translate-y-1/2 bg-current" />
        <div className="absolute top-1/2 right-0 h-3 w-px -translate-y-1/2 bg-current" />
        {/* 45deg ticks centered on each cap/line intersection */}
        <div className="absolute top-1/2 left-0 h-px w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
        <div className="absolute top-1/2 right-0 h-px w-2 translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
      </div>
      <svg className="mark-freehand absolute inset-0 h-full w-full overflow-visible" fill="none">
        <svg width="100%" height="100%">
          <path
            d={freehand(
              [
                [0, 8.5],
                [DIMENSION_WIDTH, 8.5],
              ],
              DIMENSION_SEED,
            )}
            className="text-accent/25"
            stroke="currentColor"
          />
        </svg>
        <path d={cap(0.5, 0) + tick(0)} stroke="currentColor" />
        <svg x="100%" overflow="visible">
          <path d={cap(-0.5, DIMENSION_WIDTH) + tick(DIMENSION_WIDTH)} stroke="currentColor" />
        </svg>
      </svg>
      {/* Label sits on the line, masking it */}
      <span className="bg-card text-foreground/50 relative z-10 px-2 font-mono text-[0.625rem] tracking-wide">
        {label}
      </span>
    </div>
  );
}

/** Engineering-drawing title block */
function TitleBlock() {
  const rows = [
    ["project", "xeind.net"],
    ["sheet", "01 / 07"],
    ["scale", "1 : 1"],
    ["rev", "f2e18e0"],
    ["date", "2026.07.07"],
  ];

  return (
    <div className="border-accent/30 inline-block border">
      {rows.map(([key, value], i) => (
        <div
          key={key}
          className={`grid grid-cols-[5rem_10rem] font-mono text-[0.625rem] ${
            i > 0 ? "border-accent/20 border-t" : ""
          }`}
        >
          <span className="text-foreground/40 border-accent/20 border-r px-2 py-1 tracking-wide uppercase">
            {key}
          </span>
          <span className="text-foreground/70 px-2 py-1">{value}</span>
        </div>
      ))}
    </div>
  );
}

/** Freehand ink for the grid-reference region, in the region's border-box
 * coordinates: 128px tall, REGION_WIDTH wide on a desktop sheet. */
function RegionFreehand() {
  const line = (points: Point[], origin: Point = [0, 0]) => freehand(points, REGION_SEED, origin);
  // The ruled hairlines sit in the padding box, 1px in from the border edge:
  // a vertical at left: n/4 of the padding box is n/4·(W − 2) + 1, its centre
  // half a pixel on. In a frame at x = n/4 of the border box that is
  // 1.5 − n/2 from the frame.
  const quarter = (n: number) =>
    line(
      [
        [1.5 - n / 2, 1],
        [1.5 - n / 2, 127],
      ],
      [(n / 4) * REGION_WIDTH, 0],
    );
  // The 16px tile of .bg-grid-pattern, from the padding box's corner: 23
  // columns reach 352, the last that fits 362; 8 rows reach 113 of 126.
  const tile = [
    ...Array.from({ length: 23 }, (_, i) =>
      line([
        [1.5 + i * 16, 1],
        [1.5 + i * 16, 127],
      ]),
    ),
    ...Array.from({ length: 8 }, (_, i) =>
      line([
        [1, 1.5 + i * 16],
        [REGION_WIDTH - 1, 1.5 + i * 16],
      ]),
    ),
  ].join("");

  return (
    <>
      {/* The tile, at .bg-grid-pattern's token, mask and opacity-50 */}
      <svg className="mark-freehand text-border pointer-events-none absolute inset-px h-[calc(100%-2px)] w-[calc(100%-2px)] [mask-image:linear-gradient(to_top,black_60%,transparent_100%)] opacity-50">
        <path d={tile} transform="translate(-1 -1)" stroke="currentColor" fill="none" />
      </svg>
      <svg className="mark-freehand absolute inset-0 h-full w-full overflow-visible" fill="none">
        {/* Border and midline, drawn at the design width and clipped to the
            box. The clip frame reaches 4px past the top and bottom so it
            trims only the ends, not the waver. */}
        <svg y="-4" width="100%" height="136">
          <path
            d={
              line(
                [
                  [0, 4.5],
                  [REGION_WIDTH, 4.5],
                ],
                [0, -4],
              ) +
              line(
                [
                  [0, 131.5],
                  [REGION_WIDTH, 131.5],
                ],
                [0, -4],
              )
            }
            className="text-accent/40"
            stroke="currentColor"
          />
          <path
            d={line(
              [
                [1, 68.5],
                [REGION_WIDTH - 1, 68.5],
              ],
              [0, -4],
            )}
            className="text-accent/35"
            stroke="currentColor"
          />
        </svg>
        <path
          d={line([
            [0.5, 0],
            [0.5, 128],
          ])}
          className="text-accent/40"
          stroke="currentColor"
        />
        <svg x="100%" overflow="visible">
          <path
            d={line(
              [
                [-0.5, 0],
                [-0.5, 128],
              ],
              [REGION_WIDTH, 0],
            )}
            className="text-accent/40"
            stroke="currentColor"
          />
        </svg>
        {[1, 2, 3].map((n) => (
          <svg key={n} x={`${n * 25}%`} overflow="visible">
            <path d={quarter(n)} className="text-accent/35" stroke="currentColor" />
          </svg>
        ))}
      </svg>
    </>
  );
}

/** Map/blueprint grid references along the edges of a region */
function GridReferences() {
  const cols = ["A", "B", "C", "D"];
  const rowLabels = ["1", "2"];

  return (
    <div className="flex" aria-hidden="true">
      {/* Row labels */}
      <div className="flex w-5 flex-col pt-5">
        {rowLabels.map((label) => (
          <div
            key={label}
            className="text-foreground/30 flex flex-1 items-center justify-center font-mono text-[0.625rem]"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="flex-1">
        {/* Column labels */}
        <div className="flex h-5">
          {cols.map((label) => (
            <div
              key={label}
              className="text-foreground/30 flex flex-1 items-center justify-center font-mono text-[0.625rem]"
            >
              {label}
            </div>
          ))}
        </div>
        {/* Region. The ruled copy carries the border itself, so its padding
            box, and every hairline in it, sits where the region's own did. */}
        <div className="relative h-32">
          <div className="mark-ruled border-accent/40 absolute inset-0 border">
            <div className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-50" />
            {/* Internal hairlines at cell boundaries */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-accent/35 absolute top-0 bottom-0 w-px"
                style={{ left: `${(i / 4) * 100}%` }}
              />
            ))}
            <div className="bg-accent/35 absolute top-1/2 right-0 left-0 h-px" />
          </div>
          <RegionFreehand />
        </div>
      </div>
    </div>
  );
}

/** Scale bar: alternating filled segments over a 4px base unit */
function ScaleBar() {
  // The ruled bar's border box: four 16px segments inside a 1px border, 66×6.
  const segment = (x: number) =>
    freehand(
      [
        [x, 1],
        [x + 16, 1],
        [x + 16, 5],
        [x, 5],
        [x, 1],
      ],
      SCALE_SEED,
    );

  return (
    <div className="flex items-center gap-3 font-mono text-[0.625rem]" aria-hidden="true">
      <div className="mark-ruled border-accent/40 flex h-1.5 border">
        <div className="bg-accent/40 w-4" />
        <div className="w-4" />
        <div className="bg-accent/40 w-4" />
        <div className="w-4" />
      </div>
      <svg
        className="mark-freehand h-1.5 w-[4.125rem] overflow-visible"
        viewBox="0 0 66 6"
        fill="none"
      >
        <path d={segment(1) + segment(33)} className="text-accent/40" fill="currentColor" />
        <path
          d={freehand(
            [
              [0.5, 0.5],
              [65.5, 0.5],
              [65.5, 5.5],
              [0.5, 5.5],
              [0.5, 0.5],
            ],
            SCALE_SEED,
          )}
          className="text-accent/40"
          stroke="currentColor"
        />
      </svg>
      <span className="text-foreground/50">0 · 16 · 32 · 48 · 64px</span>
    </div>
  );
}

/** Hairline divider with end ticks and a center mark */
function CenterMarkDivider() {
  const half = DIVIDER_WIDTH / 2;

  return (
    <div className="text-accent/50 relative h-3 w-full" aria-hidden="true">
      <div className="mark-ruled absolute inset-0">
        <div className="bg-accent/20 absolute top-1/2 right-0 left-0 h-px" />
        <div className="absolute top-0 bottom-0 left-0 w-px bg-current" />
        <div className="absolute top-0 right-0 bottom-0 w-px bg-current" />
        <svg
          width="9"
          height="9"
          viewBox="0 0 9 9"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <path d="M4.5 0v9M0 4.5h9" stroke="currentColor" strokeWidth="0.75" fill="none" />
        </svg>
      </div>
      <svg className="mark-freehand absolute inset-0 h-full w-full overflow-visible" fill="none">
        <svg width="100%" height="100%">
          <path
            d={freehand(
              [
                [0, 6.5],
                [DIVIDER_WIDTH, 6.5],
              ],
              DIVIDER_SEED,
            )}
            className="text-accent/20"
            stroke="currentColor"
          />
        </svg>
        <path
          d={freehand(
            [
              [0.5, 0],
              [0.5, 12],
            ],
            DIVIDER_SEED,
          )}
          stroke="currentColor"
        />
        <svg x="100%" overflow="visible">
          <path
            d={freehand(
              [
                [-0.5, 0],
                [-0.5, 12],
              ],
              DIVIDER_SEED,
              [DIVIDER_WIDTH, 0],
            )}
            stroke="currentColor"
          />
        </svg>
        {/* The 9px crosshair, centred on the box */}
        <svg x="50%" overflow="visible">
          <path
            d={
              freehand(
                [
                  [0, 1.5],
                  [0, 10.5],
                ],
                DIVIDER_SEED,
                [half, 0],
              ) +
              freehand(
                [
                  [-4.5, 6],
                  [4.5, 6],
                ],
                DIVIDER_SEED,
                [half, 0],
              )
            }
            stroke="currentColor"
            strokeWidth="0.75"
          />
        </svg>
      </svg>
    </div>
  );
}

export default function PrecisionMarks() {
  return (
    <div className="space-y-6">
      {/* 1 — Dimension line */}
      <div>
        <p className="text-foreground/50 mb-3 font-mono text-xs">
          Dimension line — annotate the hero or content column width
        </p>
        <div className="mx-auto w-full max-w-sm space-y-2">
          <div className="border-accent/25 bg-muted relative h-16 border border-dashed">
            <div className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-20" />
          </div>
          <DimensionLine label="max-w-5xl · 1024" />
        </div>
      </div>

      <div className="border-accent/20 border-t border-dashed" />

      {/* 2 — Title block */}
      <div>
        <p className="text-foreground/50 mb-3 font-mono text-xs">
          Title block — footer candidate, wired to commit hash + build date
        </p>
        <TitleBlock />
      </div>

      <div className="border-accent/20 border-t border-dashed" />

      {/* 4 — Grid references */}
      <div>
        <p className="text-foreground/50 mb-3 font-mono text-xs">
          Grid references — blueprint coordinates for hero or image plates
        </p>
        <div className="mx-auto w-full max-w-sm">
          <GridReferences />
        </div>
      </div>

      <div className="border-accent/20 border-t border-dashed" />

      {/* 5 — Scale bar */}
      <div>
        <p className="text-foreground/50 mb-3 font-mono text-xs">
          Scale bar — footer or design-page furniture
        </p>
        <ScaleBar />
      </div>

      <div className="border-accent/20 border-t border-dashed" />

      {/* 6 — Center-mark divider */}
      <div>
        <p className="text-foreground/50 mb-3 font-mono text-xs">
          Center-mark divider — SectionDivider variant candidate
        </p>
        <CenterMarkDivider />
      </div>
    </div>
  );
}
