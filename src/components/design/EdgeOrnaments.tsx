/**
 * Prototypes for ruler-tick / segmented-dash edge ornaments (motion.dev
 * inspired). Static markup — tick geometry is generated at build time from a
 * seeded PRNG so output is deterministic.
 */

function seededRandom(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = seededRandom(1337);

/** Horizontal ticks for vertical rails: y position + length, tiling every 200px */
const RAIL_TICKS = Array.from({ length: 22 }, (_, i) => ({
  y: Math.round(((i * 200) / 22 + rand() * 5) * 100) / 100,
  w: 8 + Math.round(rand() * 15),
}));

/** Vertical ticks for the horizontal ruler: x position + height, tiling every 200px */
const RULER_TICKS = Array.from({ length: 24 }, (_, i) => ({
  x: Math.round(((i * 200) / 24 + rand() * 4) * 100) / 100,
  h: 5 + Math.round(rand() * 11),
}));

/** Irregular flex weights for the segmented dashed line */
const DASH_SEGMENTS = [2.89, 1.63, 1.86, 2.31];

/** Ruler ticks running vertically; anchor = which edge the ticks grow from */
function TickRail({ anchor, id }: { anchor: "left" | "right"; id: string }) {
  return (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <pattern id={id} width="32" height="200" patternUnits="userSpaceOnUse">
        {RAIL_TICKS.map((tick, i) => (
          <rect
            key={i}
            x={anchor === "left" ? 0 : 32 - tick.w}
            y={tick.y}
            width={tick.w}
            height="1"
            fill="currentColor"
          />
        ))}
      </pattern>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Vertical dashed line broken into irregular segments (dash phase restarts) */
function SegmentedDash() {
  return (
    <div className="flex h-full w-px flex-col" aria-hidden="true">
      {DASH_SEGMENTS.map((flex, i) => (
        <div
          key={i}
          className="w-px"
          style={{
            flex,
            backgroundImage:
              "repeating-linear-gradient(to bottom, currentColor 0px, currentColor 4px, transparent 4px, transparent 8px)",
          }}
        />
      ))}
    </div>
  );
}

/** Horizontal divider with ruler ticks hanging below a hairline */
function RulerDivider({ id }: { id: string }) {
  return (
    <div className="text-accent/40 relative h-5 w-full" aria-hidden="true">
      <div className="bg-accent/20 absolute top-0 right-0 left-0 h-px" />
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <pattern id={id} width="200" height="20" patternUnits="userSpaceOnUse">
          {RULER_TICKS.map((tick, i) => (
            <rect
              key={i}
              x={tick.x}
              y={0}
              width="1"
              height={tick.h}
              fill="currentColor"
            />
          ))}
        </pattern>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}

export default function EdgeOrnaments() {
  return (
    <div className="space-y-6">
      {/* 1 — Frame rails */}
      <div>
        <p className="text-foreground/50 mb-3 font-mono text-xs">
          Frame rails — ticks bleed outward from the main column borders (left
          edge: segmented dash · right edge: solid hairline)
        </p>
        <div className="relative mx-auto h-56 w-full max-w-sm">
          {/* Column edges */}
          <div className="text-accent/50 absolute top-0 bottom-0 left-0">
            <SegmentedDash />
          </div>
          <div className="bg-accent/20 absolute top-0 bottom-0 right-0 w-px" />

          {/* Outward tick rails */}
          <div
            className="text-accent/30 absolute top-0 bottom-0 left-0 w-8 -translate-x-full"
            aria-hidden="true"
          >
            <TickRail anchor="right" id="edge-rail-left" />
          </div>
          <div
            className="text-accent/30 absolute top-0 bottom-0 right-0 w-8 translate-x-full"
            aria-hidden="true"
          >
            <TickRail anchor="left" id="edge-rail-right" />
          </div>

          <div className="flex h-full items-center justify-center">
            <span className="text-foreground/40 font-mono text-[0.6875rem]">
              main column
            </span>
          </div>
        </div>
      </div>

      <div className="border-accent/20 border-t border-dashed" />

      {/* 2 — Ruler divider */}
      <div>
        <p className="text-foreground/50 mb-3 font-mono text-xs">
          Ruler divider — SectionDivider variant candidate
        </p>
        <RulerDivider id="edge-ruler-a" />
      </div>

      <div className="border-accent/20 border-t border-dashed" />

      {/* 3 — Hero edge strips */}
      <div>
        <p className="text-foreground/50 mb-3 font-mono text-xs">
          Hero edge strips — short inward ticks, fading downward
        </p>
        <div className="border-accent/20 relative mx-auto h-40 w-full max-w-md border-x">
          <div
            className="text-accent/30 absolute top-0 bottom-0 left-0 w-8 [mask-image:linear-gradient(to_bottom,black,transparent)]"
            aria-hidden="true"
          >
            <TickRail anchor="left" id="edge-hero-left" />
          </div>
          <div
            className="text-accent/30 absolute top-0 bottom-0 right-0 w-8 [mask-image:linear-gradient(to_bottom,black,transparent)]"
            aria-hidden="true"
          >
            <TickRail anchor="right" id="edge-hero-right" />
          </div>
          <div className="flex h-full items-center justify-center">
            <span className="text-foreground/40 font-mono text-[0.6875rem]">
              hero panel
            </span>
          </div>
        </div>
      </div>

      <div className="border-accent/20 border-t border-dashed" />

      {/* 4 — Timeline spine */}
      <div>
        <p className="text-foreground/50 mb-3 font-mono text-xs">
          Timeline spine — segmented dash as the ExperienceTimeline line
        </p>
        <div className="flex gap-5">
          <div className="text-accent/50 relative h-36">
            <SegmentedDash />
            <span className="bg-card border-accent/50 absolute top-6 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45 border" />
            <span className="bg-card border-accent/50 absolute top-20 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45 border" />
          </div>
          <div className="flex flex-col gap-8 py-4">
            <div>
              <p className="text-foreground/70 font-mono text-sm">
                Timeline entry
              </p>
              <p className="text-foreground/40 font-mono text-[0.6875rem]">
                2026 — Present
              </p>
            </div>
            <div>
              <p className="text-foreground/70 font-mono text-sm">
                Earlier entry
              </p>
              <p className="text-foreground/40 font-mono text-[0.6875rem]">
                2024 — 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
