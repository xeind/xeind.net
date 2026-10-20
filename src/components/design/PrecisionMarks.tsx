/**
 * Drafting-mark prototypes for the "precise" theme: dimension lines,
 * registration crosshairs, title block, grid references, scale bar,
 * center-marked divider. Static markup, zero JS.
 */

/** Architectural dimension line: end caps, diagonal ticks, centered label.
 * Marks are absolutely anchored so caps, ticks, and line share exact
 * intersections instead of drifting as flex siblings. */
function DimensionLine({ label }: { label: string }) {
  return (
    <div
      className="text-accent/50 relative flex h-4 w-full items-center justify-center"
      aria-hidden="true"
    >
      {/* The ink in its own layer, so the graphite filter roughens the lines
          and leaves the label sharp. */}
      <div className="graphite-stroke absolute inset-0">
        {/* Dimension line */}
        <div className="bg-accent/25 absolute inset-x-0 top-1/2 h-px" />
        {/* End caps (extension lines) */}
        <div className="absolute top-1/2 left-0 h-3 w-px -translate-y-1/2 bg-current" />
        <div className="absolute top-1/2 right-0 h-3 w-px -translate-y-1/2 bg-current" />
        {/* 45deg ticks centered on each cap/line intersection */}
        <div className="absolute top-1/2 left-0 h-px w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
        <div className="absolute top-1/2 right-0 h-px w-2 translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
      </div>
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
        {/* Region */}
        <div className="graphite-stroke border-accent/40 relative h-32 border">
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
      </div>
    </div>
  );
}

/** Scale bar: alternating filled segments over a 4px base unit */
function ScaleBar() {
  return (
    <div className="flex items-center gap-3 font-mono text-[0.625rem]" aria-hidden="true">
      <div className="graphite-stroke border-accent/40 flex h-1.5 border">
        <div className="bg-accent/40 w-4" />
        <div className="w-4" />
        <div className="bg-accent/40 w-4" />
        <div className="w-4" />
      </div>
      <span className="text-foreground/50">0 · 16 · 32 · 48 · 64px</span>
    </div>
  );
}

/** Hairline divider with end ticks and a center mark */
function CenterMarkDivider() {
  return (
    <div className="graphite-stroke text-accent/50 relative h-3 w-full" aria-hidden="true">
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
  );
}

/** The pencil filter, after imdaryl.com's #graphite. Slow noise bends each line
 * by up to 1.25px so it wavers, and fine noise thins its alpha in patches, the
 * way graphite skips on paper. global.css applies it to `.graphite-stroke`
 * under blueprint only.
 *
 * The region is generous on purpose: it is a fraction of the filtered box, and
 * the ScaleBar is 6px tall, so the usual -10%/120% leaves a 0.6px margin and
 * clips the displaced ink. -50%/200% vertically gives every mark room. */
function GraphiteFilter() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <filter
        id="graphite-filter"
        x="-5%"
        y="-50%"
        width="110%"
        height="200%"
        colorInterpolationFilters="sRGB"
      >
        {/* Slow noise for the waver: one bend every ~16px. imdaryl.com uses
            one 0.7 noise for both jobs, which on light ink over cobalt frays
            a 1px line into fuzz instead of bending it. */}
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.06"
          numOctaves={2}
          seed={7}
          result="drift"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="drift"
          scale="2.5"
          xChannelSelector="R"
          yChannelSelector="G"
          result="wavered"
        />
        {/* Fine noise for the skips, floored at 0.45 alpha so the line thins
            in places but never breaks into dots. */}
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves={1}
          seed={3}
          result="grain"
        />
        <feColorMatrix
          in="grain"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 0.45"
          result="wear"
        />
        <feComposite in="wavered" in2="wear" operator="in" />
      </filter>
    </svg>
  );
}

export default function PrecisionMarks() {
  return (
    <div className="space-y-6">
      <GraphiteFilter />
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
