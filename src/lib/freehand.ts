/**
 * Freehand pencil lines, baked into SVG path data at build time. Used by the
 * precision-mark specimens on /design (design/PrecisionMarks) and by the
 * blog's margin-note leaders (blog/MarginNote.astro). The waver is
 * deterministic, so every build draws the same lines; design-system.md §5
 * ("Pencil marks") describes it.
 */
export type Point = [number, number];

// A pencil line sways about 1.25px either side of true, the reach of the old
// filter's displacement (scale 2.5, so ±1.25).
const WAVER_AMPLITUDE = 1.25;
// One bend every ~16px, the old filter's 0.06 base frequency. A second octave
// at half the cell and half the weight, as its numOctaves={2} had, keeps the
// slow bends from reading as a clean sine.
const WAVER_CELL = 16;
// A point every 4px: a quarter cell, so the smoothstepped bends stay round
// instead of showing as straight facets.
const WAVER_STEP = 4;

// Integer hash of a lattice point, in [0, 1). Integer arithmetic gives the same
// value on every machine, so a build on Cloudflare draws the same lines as one
// on a laptop.
function latticeValue(ix: number, iy: number, seed: number): number {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Value noise: a hash per lattice point, smoothstepped between neighbours, in
// [-1, 1]. After the selection overlay's 1D noise, lifted to two dimensions.
function valueNoise(x: number, y: number, cell: number, seed: number): number {
  const tx = x / cell;
  const ty = y / cell;
  const ix = Math.floor(tx);
  const iy = Math.floor(ty);
  const sx = (tx - ix) * (tx - ix) * (3 - 2 * (tx - ix));
  const sy = (ty - iy) * (ty - iy) * (3 - 2 * (ty - iy));
  const top =
    latticeValue(ix, iy, seed) + (latticeValue(ix + 1, iy, seed) - latticeValue(ix, iy, seed)) * sx;
  const bottom =
    latticeValue(ix, iy + 1, seed) +
    (latticeValue(ix + 1, iy + 1, seed) - latticeValue(ix, iy + 1, seed)) * sx;
  return (top + (bottom - top) * sy - 0.5) * 2;
}

// One displacement field per mark, as the filter had one per filtered box:
// every line in a mark is pushed by the same field, so lines that meet still
// meet after the waver. x and y read separate seeds, the filter's R and G.
function waver(x: number, y: number, seed: number): Point {
  const octaves = (s: number) =>
    ((valueNoise(x, y, WAVER_CELL, s) + valueNoise(x, y, WAVER_CELL / 2, s + 7) / 2) / 1.5) *
    WAVER_AMPLITUDE;
  return [octaves(seed), octaves(seed + 1)];
}

// Coordinates in whole tenths of a pixel, past what the waver needs, written
// without a leading zero (0.3 is ".3"). A minus sign separates two numbers on
// its own, so only a positive one takes a space.
function tenths(t: number): string {
  const whole = Math.floor(Math.abs(t) / 10);
  const fraction = Math.abs(t) % 10;
  return `${t < 0 ? "-" : " "}${whole || !fraction ? whole : ""}${fraction ? `.${fraction}` : ""}`;
}

/** Path data for a freehand polyline through `points`, sampled every 4px and
 * displaced by the mark's field. `origin` places the points in the mark's own
 * coordinates when they are drawn in a nested, right- or centre-anchored
 * frame, so a cap reads the same field as the line it ends.
 *
 * One absolute move, then relative steps: the freehand copies are ~1,900
 * points, and absolute pairs cost /design its Lighthouse 100 (FCP 1.2s →
 * 1.4s under `npm run preview`). Each step is the difference of two points
 * already snapped to tenths, so the error never accumulates along a line. */
export function freehand(points: Point[], seed: number, origin: Point = [0, 0]): string {
  let data = "";
  let last: Point | null = null;
  const plot = (x: number, y: number) => {
    const [dx, dy] = waver(x + origin[0], y + origin[1], seed);
    const point: Point = [Math.round((x + dx) * 10), Math.round((y + dy) * 10)];
    data += last
      ? tenths(point[0] - last[0]) + tenths(point[1] - last[1])
      : `M${tenths(point[0])}${tenths(point[1])}l`;
    last = point;
  };
  plot(...points[0]);
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / WAVER_STEP));
    for (let s = 1; s <= steps; s++) {
      plot(x0 + ((x1 - x0) * s) / steps, y0 + ((y1 - y0) * s) / steps);
    }
  }
  return data;
}
