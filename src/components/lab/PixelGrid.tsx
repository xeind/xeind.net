import { useMemo } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * The square loader, in four patterns at any grid size. Shared by LoadingState
 * and TaskRows, so the loader and the running rows cannot drift apart. Not a
 * `ui/` primitive — nothing outside /lab has anything that runs.
 *
 * Opacity only, no color and no movement. The whole vocabulary is which cell
 * is lit and when, which is why four readable patterns fit in it:
 *
 *   drive  — a `>` wavefront travelling right. The default: it has a
 *            direction, so it reads as work being pushed through.
 *   scan   — a column sweeping left to right, whole columns at a time.
 *            Flatter than drive, and calmer for a row that sits in a list.
 *   bloom  — rings out from the centre. No direction at all, which suits
 *            waiting on something that has not started moving yet.
 *   orbit  — one lit cell walking the square, ring by ring, winding inward.
 *            It used to be the perimeter alone. That reads as a ring at 3,
 *            where the perimeter is 8 of 9 cells, and as a thin loop around 16
 *            dead ones at 6 — which broke the rule below. Spiralling in covers
 *            every cell at every size and keeps the one travelling cell.
 *
 * Every pattern is a function of the grid size, so 3 and 6 are the same four
 * ideas at two resolutions rather than two sets of hand-tuned numbers. At 6 the
 * sweep is longer and each pattern gets proportionally slower, which is the
 * honest behaviour: more cells to cross.
 *
 * Each cycle is its own sweep plus a hold, so a second front enters before the
 * first has left and the motion never rests. The holds are set so a 3×3 keeps
 * exactly the timings it had before the size became a variable. These
 * durations are past the 0.3s house band (docs/animation.md §2) on purpose —
 * the motion is the message here, not a transition.
 *
 * Every pattern now lights every cell, so a cell's dim state is only its
 * resting point in the cycle. Reduced motion freezes all of them there.
 */

export type PixelPattern = "drive" | "scan" | "bloom" | "orbit";

// Per-cell step, and the pause after a sweep completes before the next begins.
const TIMING: Record<PixelPattern, { step: number; hold: number }> = {
  drive: { step: 90, hold: 380 },
  scan: { step: 130, hold: 390 },
  bloom: { step: 150, hold: 550 },
  // Orbit's hold pays back the step the centre cell added when the pattern
  // became a spiral, so the 3×3 lap is still the 950ms it has always been.
  orbit: { step: 110, hold: 70 },
};

/**
 * The k-th ring in from the edge of an n×n grid, clockwise from its top-left.
 * An odd grid ends on a 1×1 ring, which is the single centre cell.
 */
function ring(n: number, k: number): number[] {
  const side = n - 2 * k;
  const at = (r: number, c: number) => (k + r) * n + (k + c);
  if (side === 1) return [at(0, 0)];

  const top = Array.from({ length: side }, (_, c) => at(0, c));
  const right = Array.from({ length: side - 2 }, (_, r) => at(r + 1, side - 1));
  const bottom = Array.from({ length: side }, (_, c) => at(side - 1, side - 1 - c));
  const left = Array.from({ length: side - 2 }, (_, r) => at(side - 2 - r, 0));
  return [...top, ...right, ...bottom, ...left];
}

/** Every cell, outermost ring first, winding inward. */
function spiral(n: number): number[] {
  return Array.from({ length: Math.ceil(n / 2) }, (_, k) => ring(n, k)).flat();
}

function buildPattern(pattern: PixelPattern, n: number) {
  const { step, hold } = TIMING[pattern];
  const mid = (n - 1) / 2; // half-integer when n is even; every formula tolerates it
  const cells = Array.from({ length: n * n }, (_, i) => i);
  const row = (i: number) => Math.floor(i / n);
  const col = (i: number) => i % n;

  let delays: number[];

  if (pattern === "orbit") {
    const order = spiral(n);
    delays = cells.map((i) => order.indexOf(i) * step);
  } else if (pattern === "drive") {
    // Distance from the left edge plus distance from the middle row.
    delays = cells.map((i) => Math.round(col(i) + Math.abs(row(i) - mid)) * step);
  } else if (pattern === "scan") {
    delays = cells.map((i) => col(i) * step);
  } else {
    // Chebyshev distance from the centre, floored so an even grid still lands
    // on whole rings instead of half-steps.
    delays = cells.map(
      (i) => Math.floor(Math.max(Math.abs(row(i) - mid), Math.abs(col(i) - mid))) * step,
    );
  }

  const sweep = Math.max(...delays);
  return { delays, cycle: sweep + hold };
}

/**
 * Cell and gutter shrink as the grid grows, so every resolution occupies the
 * same ~16px footprint. A 6×6 at the 3×3's cell size would be a 34px block
 * sitting next to 16px ones, and the row would read as four loaders and one
 * panel. Resolution is the variable here; size on the page is not.
 */
export function metrics(size: number) {
  const cell = Math.max(2, Math.round(12 / size));
  const gap = Math.max(1, Math.round(6 / size));
  return { cell, gap, extent: size * cell + (size - 1) * gap };
}

interface PixelGridProps {
  pattern?: PixelPattern;
  /** Cells per side. 3 is the inline loader; 6 is the fine-grained specimen. */
  size?: number;
  className?: string;
}

export default function PixelGrid({ pattern = "drive", size = 3, className = "" }: PixelGridProps) {
  const prefersReducedMotion = useReducedMotion();
  const { delays, cycle } = useMemo(() => buildPattern(pattern, size), [pattern, size]);
  const { cell, gap } = metrics(size);

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 ${className}`}
      style={{ gridTemplateColumns: `repeat(${size}, ${cell}px)`, gap }}
    >
      {delays.map((delay, i) => (
        <span
          key={i}
          className="lab-pixel bg-accent"
          style={{
            width: cell,
            height: cell,
            opacity: 0.2,
            animation: prefersReducedMotion
              ? undefined
              : `lab-pixel-on ${cycle}ms ease-in-out ${delay}ms infinite`,
          }}
        />
      ))}
    </span>
  );
}
