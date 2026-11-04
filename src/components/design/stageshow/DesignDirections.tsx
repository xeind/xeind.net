import type { CSSProperties, ReactNode } from "react";
import ClientStage from "./ClientStage";
import { Stage } from "./kit/stage";
import type { Act } from "./kit/act";
import { Window } from "./kit/window";
import { Segmented } from "./kit/controls/Segmented";
import { Count } from "./kit/motion/Count";
import { css as easeCss } from "./kit/ease";
import s from "./DesignDirections.module.css";

/* One page, redrawn in place. Every element below exists in every direction;
   a direction only moves it, restyles it, or fades it out. Nothing is swapped
   and nothing is cut. Geometry lives in the tables, typography rides along as
   numbers so the browser can tween it, and discrete things (dashed borders,
   fonts) are handled in the stylesheet. */

const DIRS = ["Current", "Sheet", "Editorial", "Catalogue", "Instrument"] as const;
const TARGETS = ["dir-0", "dir-1", "dir-2", "dir-3", "dir-4"];

type Layout = "wide" | "compact";
type Face = "sans" | "serif" | "mono";

interface Look {
  x: number;
  y: number;
  w?: number;
  h?: number;
  fs?: number;
  lh?: number;
  ff?: Face;
  fw?: number;
  fg?: string;
  bg?: string;
  o?: number;
  ls?: string;
  /** Border drawn by the stylesheet: dashed layer, solid layer, bottom rule, none. */
  box?: "dashed" | "solid" | "bottom" | "full" | "none";
}

type Table = (Look | undefined)[];

const FACE: Record<Face, string> = {
  sans: "var(--ss-font)",
  serif: "var(--font-serif)",
  mono: "var(--ss-mono)",
};
const INK = "var(--ss-text-strong)";
const TXT = "var(--ss-text)";
const FAINT = "var(--ss-text-faint)";
const ACC = "var(--ss-accent)";

/* Fill the directions an element is absent from: it keeps the nearest drawn
   position and fades, so it never slides while it leaves. */
function fill(t: Table): Look[] {
  const out: Look[] = [];
  for (let i = 0; i < 5; i++) {
    if (t[i]) {
      out.push({ o: 1, ...t[i]! });
      continue;
    }
    let src: Look | undefined;
    for (let j = i - 1; j >= 0 && !src; j--) src = t[j];
    for (let j = i + 1; j < 5 && !src; j++) src = t[j];
    out.push({ ...src!, o: 0 });
  }
  return out;
}

function style(l: Look): CSSProperties {
  return {
    transform: `translate(${l.x}px, ${l.y}px)`,
    width: l.w,
    height: l.h,
    fontSize: l.fs,
    lineHeight: l.lh ? `${l.lh}px` : undefined,
    fontFamily: l.ff ? FACE[l.ff] : undefined,
    fontWeight: l.fw,
    color: l.fg,
    backgroundColor: l.bg,
    letterSpacing: l.ls,
    opacity: l.o,
  };
}

/* ---------- Content: real strings from src/lib/data ---------- */

const NAME = "Xein Deniel";
const TAGLINE = "Designing interfaces that feel effortless";
const PROJECTS = [
  { title: "Vallow", kind: "Personal", year: "2026" },
  { title: "Nightingale", kind: "Personal", year: "2025" },
  { title: "ATAX", kind: "Personal", year: "2024" },
  { title: "Pioneer Dev", kind: "Client", year: "2026" },
];
const FILLERS = 7;

/* ---------- Geometry ---------- */

interface Row {
  box: Look[];
  sec: Look[];
  key: Look[];
  title: Look[];
  kind: Look[];
  year: Look[];
  bar: Look[];
  leader: Look[];
}
interface Filler {
  box: Look[];
  b1: Look[];
  b2: Look[];
  b3: Look[];
}
interface Action {
  box: Look[];
  lab: Look[];
  key: Look[];
}
interface Geometry {
  page: { w: number; h: number };
  name: Look[];
  tag: Look[];
  head: Look[];
  rule: Look[];
  actions: Action[];
  rows: Row[];
  fillers: Filler[];
  frame: Look[];
  titleBlock: Look[];
  dim: Look[];
  secHead: Look[];
  colHead: Look[][];
  nameCell: Look[];
  liveCell: Look[];
  liveLab: Look[];
  liveVal: Look[];
  actCell: Look[];
  hints: Look[];
}

const mono = (fs: number, lh: number, extra: Partial<Look> = {}): Partial<Look> => ({
  ff: "mono",
  fs,
  lh,
  ...extra,
});

function wideGeometry(): Geometry {
  const rows: Row[] = PROJECTS.map((_, i) => {
    const cx = 64 + (i % 2) * 400;
    const cy = 280 + Math.floor(i / 2) * 104;
    return {
      box: fill([
        { x: cx, y: cy, w: 368, h: 88, box: "dashed" },
        { x: 32, y: 160 + i * 40, w: 832, h: 32, box: "bottom" },
        { x: 128, y: 280 + i * 48, w: 640, h: 40, box: "none" },
        { x: 32, y: 112 + i * 32, w: 832, h: 32, box: "bottom" },
        { x: 24 + i * 216, y: 136, w: 200, h: 240, bg: "var(--ss-surface)", box: "full" },
      ]),
      sec: fill([undefined, { x: 0, y: 8, ...mono(11, 16, { fg: FAINT }) }]),
      key: fill([undefined, undefined, undefined, undefined, { x: 12, y: 12 }]),
      title: fill([
        { x: 16, y: 16, ff: "serif", fs: 18, lh: 24, fg: INK },
        { x: 56, y: 4, ...mono(12, 24, { fg: INK }) },
        { x: 0, y: 0, ff: "serif", fs: 24, lh: 40, fg: INK },
        { x: 200, y: 4, ff: "sans", fs: 13, lh: 24, fw: 500, fg: INK },
        { x: 12, y: 72, ...mono(14, 24, { fg: INK, fw: 600 }) },
      ]),
      kind: fill([
        { x: 288, y: 20, ...mono(11, 16, { fg: FAINT }) },
        { x: 232, y: 8, ...mono(11, 16, { fg: FAINT }) },
        undefined,
        { x: 80, y: 4, ff: "sans", fs: 12, lh: 24, fg: FAINT },
        { x: 12, y: 52, ...mono(10, 16, { fg: FAINT }) },
      ]),
      year: fill([
        undefined,
        { x: 712, y: 4, ...mono(12, 24, { fg: INK }) },
        { x: 604, y: 0, ff: "serif", fs: 16, lh: 40, fg: FAINT },
        { x: 0, y: 4, ...mono(12, 24, { fg: TXT }) },
        { x: 12, y: 184, ...mono(32, 40, { fg: FAINT }) },
      ]),
      bar: fill([
        { x: 16, y: 52, w: 200, h: 8 },
        { x: 360, y: 12, w: 200, h: 8 },
        undefined,
        { x: 408, y: 12, w: 220, h: 8 },
        { x: 12, y: 108, w: 140, h: 8 },
      ]),
      leader: fill([undefined, { x: 616, y: 0, w: 216, h: 32 }]),
    };
  });

  const fillers: Filler[] = Array.from({ length: FILLERS }, (_, j) => ({
    box: fill([
      undefined,
      j < 2 ? { x: 32, y: 160 + (4 + j) * 40, w: 832, h: 32, box: "none" } : undefined,
      undefined,
      { x: 32, y: 112 + (4 + j) * 32, w: 832, h: 32, box: "bottom" },
    ]),
    b1: fill([undefined, { x: 56, y: 12, w: 56, h: 8 }, undefined, { x: 0, y: 12, w: 56, h: 8 }]),
    b2: fill([undefined, { x: 232, y: 12, w: 48, h: 8 }, undefined, { x: 80, y: 12, w: 48, h: 8 }]),
    b3: fill([
      undefined,
      { x: 360, y: 12, w: 200, h: 8 },
      undefined,
      { x: 200, y: 12, w: 120, h: 8 },
    ]),
  }));

  const actions: Action[] = [
    {
      box: fill([
        { x: 64, y: 144, w: 224, h: 40, box: "dashed", ff: "serif", fs: 14, lh: 40, fg: INK },
        { x: 592, y: 32, w: 136, h: 24, box: "solid", ...mono(11, 24, { fg: INK }) },
        { x: 128, y: 192, w: 120, h: 24, box: "none", ff: "serif", fs: 16, lh: 24, fg: INK },
        { x: 640, y: 24, w: 96, h: 24, box: "none", ff: "sans", fs: 12, lh: 24, fg: TXT },
        { x: 696, y: 40, w: 152, h: 24, box: "none", ...mono(12, 24, { fg: INK }) },
      ]),
      lab: fill([
        { x: 52, y: 0 },
        { x: 12, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ]),
      key: fill([{ x: 144, y: 12 }, { x: 100, y: 4 }, undefined, undefined, { x: 128, y: 4 }]),
    },
    {
      box: fill([
        { x: 304, y: 144, w: 224, h: 40, box: "dashed", ff: "serif", fs: 14, lh: 40, fg: INK },
        { x: 736, y: 32, w: 128, h: 24, box: "solid", ...mono(11, 24, { fg: INK }) },
        { x: 264, y: 192, w: 136, h: 24, box: "none", ff: "serif", fs: 16, lh: 24, fg: INK },
        { x: 752, y: 24, w: 112, h: 24, box: "none", ff: "sans", fs: 12, lh: 24, fg: TXT },
        { x: 696, y: 72, w: 152, h: 24, box: "none", ...mono(12, 24, { fg: INK }) },
      ]),
      lab: fill([
        { x: 46, y: 0 },
        { x: 12, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ]),
      key: fill([{ x: 154, y: 12 }, { x: 104, y: 4 }, undefined, undefined, { x: 128, y: 4 }]),
    },
  ];

  return {
    page: { w: 896, h: 490 },
    name: fill([
      { x: 64, y: 48, ff: "serif", fs: 32, lh: 40, fg: INK },
      { x: 32, y: 32, ...mono(20, 24, { fg: INK, fw: 600 }) },
      { x: 128, y: 40, ff: "serif", fs: 72, lh: 72, fg: INK, ls: "-0.02em" },
      { x: 32, y: 24, ff: "sans", fs: 16, lh: 24, fw: 600, fg: INK },
      { x: 40, y: 36, ...mono(16, 24, { fg: INK, fw: 600 }) },
    ]),
    tag: fill([
      { x: 64, y: 96, ff: "sans", fs: 16, lh: 24, fg: TXT },
      { x: 32, y: 64, ...mono(12, 16, { fg: FAINT }) },
      { x: 128, y: 128, ff: "serif", fs: 20, lh: 32, fg: TXT },
      { x: 32, y: 48, ff: "sans", fs: 12, lh: 16, fg: FAINT },
      { x: 40, y: 68, ...mono(12, 16, { fg: FAINT }) },
    ]),
    head: fill([
      { x: 64, y: 232, ff: "serif", fs: 24, lh: 32, fg: INK },
      { x: 64, y: 120, ...mono(12, 16, { fg: INK, fw: 600 }) },
      { x: 128, y: 240, ff: "serif", fs: 16, lh: 24, fg: FAINT },
    ]),
    rule: fill([
      { x: 0, y: 208, w: 896, h: 1 },
      { x: 32, y: 144, w: 832, h: 1 },
      undefined,
      { x: 32, y: 80, w: 832, h: 1 },
    ]),
    actions,
    rows,
    fillers,
    frame: fill([undefined, { x: 16, y: 16, w: 864, h: 458 }]),
    titleBlock: fill([undefined, { x: 640, y: 434, w: 224, h: 24 }]),
    dim: fill([undefined, { x: 32, y: 96, w: 832, h: 16 }]),
    secHead: fill([undefined, { x: 32, y: 120 }]),
    colHead: [
      fill([undefined, undefined, undefined, { x: 32, y: 84 }]),
      fill([undefined, undefined, undefined, { x: 112, y: 84 }]),
      fill([undefined, undefined, undefined, { x: 232, y: 84 }]),
    ],
    nameCell: fill([undefined, undefined, undefined, undefined, { x: 24, y: 24, w: 416, h: 96 }]),
    liveCell: fill([undefined, undefined, undefined, undefined, { x: 456, y: 24, w: 200, h: 96 }]),
    liveLab: fill([undefined, undefined, undefined, undefined, { x: 472, y: 36 }]),
    liveVal: fill([undefined, undefined, undefined, undefined, { x: 472, y: 60 }]),
    actCell: fill([undefined, undefined, undefined, undefined, { x: 672, y: 24, w: 200, h: 96 }]),
    hints: fill([undefined, undefined, undefined, undefined, { x: 24, y: 400 }]),
  };
}

function compactGeometry(): Geometry {
  const rows: Row[] = PROJECTS.map((_, i) => ({
    box: fill([
      { x: 24, y: 232 + i * 64, w: 310, h: 56, box: "dashed" },
      { x: 20, y: 168 + i * 40, w: 318, h: 32, box: "bottom" },
      { x: 24, y: 256 + i * 56, w: 310, h: 48, box: "none" },
      { x: 16, y: 136 + i * 32, w: 326, h: 32, box: "bottom" },
      {
        x: 16 + (i % 2) * 170,
        y: 192 + Math.floor(i / 2) * 144,
        w: 156,
        h: 128,
        bg: "var(--ss-surface)",
        box: "full",
      },
    ]),
    sec: fill([undefined, { x: 0, y: 8, ...mono(10, 16, { fg: FAINT }) }]),
    key: fill([undefined, undefined, undefined, undefined, { x: 10, y: 10 }]),
    title: fill([
      { x: 16, y: 8, ff: "serif", fs: 16, lh: 24, fg: INK },
      { x: 36, y: 4, ...mono(12, 24, { fg: INK }) },
      { x: 0, y: 0, ff: "serif", fs: 22, lh: 48, fg: INK },
      { x: 112, y: 4, ff: "sans", fs: 12, lh: 24, fw: 500, fg: INK },
      { x: 10, y: 58, ...mono(13, 24, { fg: INK, fw: 600 }) },
    ]),
    kind: fill([
      { x: 232, y: 12, ...mono(10, 16, { fg: FAINT }) },
      undefined,
      undefined,
      { x: 48, y: 4, ff: "sans", fs: 11, lh: 24, fg: FAINT },
      { x: 10, y: 38, ...mono(10, 16, { fg: FAINT }) },
    ]),
    year: fill([
      undefined,
      { x: 220, y: 4, ...mono(11, 24, { fg: INK }) },
      { x: 264, y: 0, ff: "serif", fs: 14, lh: 48, fg: FAINT },
      { x: 0, y: 4, ...mono(11, 24, { fg: TXT }) },
      { x: 10, y: 86, ...mono(28, 36, { fg: FAINT }) },
    ]),
    bar: fill([
      { x: 16, y: 36, w: 140, h: 8 },
      undefined,
      undefined,
      { x: 236, y: 12, w: 80, h: 8 },
    ]),
    leader: fill([undefined, { x: 150, y: 0, w: 168, h: 32 }]),
  }));

  const fillers: Filler[] = Array.from({ length: FILLERS }, (_, j) => ({
    box: fill([
      undefined,
      j < 2 ? { x: 20, y: 168 + (4 + j) * 40, w: 318, h: 32, box: "none" } : undefined,
      undefined,
      { x: 16, y: 136 + (4 + j) * 32, w: 326, h: 32, box: "bottom" },
    ]),
    b1: fill([undefined, { x: 36, y: 12, w: 64, h: 8 }, undefined, { x: 0, y: 12, w: 32, h: 8 }]),
    b2: fill([undefined, { x: 120, y: 12, w: 48, h: 8 }, undefined, { x: 48, y: 12, w: 40, h: 8 }]),
    b3: fill([
      undefined,
      { x: 180, y: 12, w: 100, h: 8 },
      undefined,
      { x: 112, y: 12, w: 100, h: 8 },
    ]),
  }));

  const actions: Action[] = [
    {
      box: fill([
        { x: 24, y: 104, w: 148, h: 40, box: "dashed", ff: "serif", fs: 13, lh: 40, fg: INK },
        { x: 20, y: 72, w: 148, h: 24, box: "solid", ...mono(11, 24, { fg: INK }) },
        { x: 24, y: 152, w: 112, h: 24, box: "none", ff: "serif", fs: 14, lh: 24, fg: INK },
        { x: 16, y: 64, w: 80, h: 24, box: "none", ff: "sans", fs: 11, lh: 24, fg: TXT },
        { x: 198, y: 112, w: 132, h: 24, box: "none", ...mono(11, 24, { fg: INK }) },
      ]),
      lab: fill([
        { x: 22, y: 0 },
        { x: 12, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ]),
      key: fill([{ x: 104, y: 12 }, { x: 100, y: 4 }, undefined, undefined, { x: 108, y: 4 }]),
    },
    {
      box: fill([
        { x: 186, y: 104, w: 148, h: 40, box: "dashed", ff: "serif", fs: 13, lh: 40, fg: INK },
        { x: 176, y: 72, w: 148, h: 24, box: "solid", ...mono(11, 24, { fg: INK }) },
        { x: 144, y: 152, w: 136, h: 24, box: "none", ff: "serif", fs: 14, lh: 24, fg: INK },
        { x: 104, y: 64, w: 96, h: 24, box: "none", ff: "sans", fs: 11, lh: 24, fg: TXT },
        { x: 198, y: 140, w: 132, h: 24, box: "none", ...mono(11, 24, { fg: INK }) },
      ]),
      lab: fill([
        { x: 18, y: 0 },
        { x: 12, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ]),
      key: fill([{ x: 112, y: 12 }, { x: 104, y: 4 }, undefined, undefined, { x: 108, y: 4 }]),
    },
  ];

  return {
    page: { w: 358, h: 514 },
    name: fill([
      { x: 24, y: 24, ff: "serif", fs: 24, lh: 32, fg: INK },
      { x: 20, y: 20, ...mono(16, 24, { fg: INK, fw: 600 }) },
      { x: 24, y: 32, ff: "serif", fs: 48, lh: 48, fg: INK, ls: "-0.02em" },
      { x: 16, y: 16, ff: "sans", fs: 14, lh: 24, fw: 600, fg: INK },
      { x: 28, y: 28, ...mono(14, 24, { fg: INK, fw: 600 }) },
    ]),
    tag: fill([
      { x: 24, y: 64, ff: "sans", fs: 14, lh: 24, fg: TXT },
      { x: 20, y: 44, ...mono(10, 16, { fg: FAINT }) },
      { x: 24, y: 96, ff: "serif", fs: 16, lh: 24, fg: TXT },
      { x: 16, y: 40, ff: "sans", fs: 11, lh: 16, fg: FAINT },
      { x: 28, y: 56, ...mono(10, 16, { fg: FAINT }) },
    ]),
    head: fill([
      { x: 24, y: 192, ff: "serif", fs: 20, lh: 32, fg: INK },
      { x: 44, y: 132, ...mono(11, 16, { fg: INK, fw: 600 }) },
      { x: 24, y: 216, ff: "serif", fs: 14, lh: 24, fg: FAINT },
    ]),
    rule: fill([
      { x: 0, y: 168, w: 358, h: 1 },
      { x: 20, y: 156, w: 318, h: 1 },
      undefined,
      { x: 16, y: 104, w: 326, h: 1 },
    ]),
    actions,
    rows,
    fillers,
    frame: fill([undefined, { x: 8, y: 8, w: 342, h: 498 }]),
    titleBlock: fill([undefined, { x: 114, y: 474, w: 224, h: 24 }]),
    dim: fill([undefined, { x: 20, y: 108, w: 318, h: 16 }]),
    secHead: fill([undefined, { x: 20, y: 132 }]),
    colHead: [
      fill([undefined, undefined, undefined, { x: 16, y: 108 }]),
      fill([undefined, undefined, undefined, { x: 64, y: 108 }]),
      fill([undefined, undefined, undefined, { x: 128, y: 108 }]),
    ],
    nameCell: fill([undefined, undefined, undefined, undefined, { x: 16, y: 16, w: 326, h: 72 }]),
    liveCell: fill([undefined, undefined, undefined, undefined, { x: 16, y: 104, w: 156, h: 72 }]),
    liveLab: fill([undefined, undefined, undefined, undefined, { x: 28, y: 112 }]),
    liveVal: fill([undefined, undefined, undefined, undefined, { x: 28, y: 130 }]),
    actCell: fill([undefined, undefined, undefined, undefined, { x: 186, y: 104, w: 156, h: 72 }]),
    hints: fill([undefined, undefined, undefined, undefined, { x: 16, y: 480 }]),
  };
}

const GEOMETRY: Record<Layout, Geometry> = { wide: wideGeometry(), compact: compactGeometry() };

/* ---------- Scene ---------- */

interface State {
  dir: number;
  /** The direction just left, so an element that arrives can be placed before it fades in. */
  prev: number;
  perf: number;
}
const initial: State = { dir: 0, prev: 0, perf: 0 };
// The sheet tells the story on its own: a drawn frame, a title block, leaders.
const poster: State = { dir: 1, prev: 0, perf: 0 };

const REST = { wide: { x: 868, y: 516 }, compact: { x: 336, y: 540 } };

async function script(a: Act<State>) {
  let prev = 0;
  await a.wait(500);
  for (const dir of [1, 2, 3, 4, 0]) {
    await a.move({ at: TARGETS[dir], x: 0.85, y: 0.6 });
    await a.wait(150);
    await a.click();
    // The press leads; the page follows on the same beat.
    await a.set(dir === 4 ? { dir, prev, perf: 98 } : { dir, prev });
    prev = dir;
    void a.move(REST);
    await a.wait(dir === 0 ? 1400 : 1700);
  }
  // The live cell has been invisible for over a second: reset its figure unseen.
  await a.snap({ perf: 0, prev: 0 });
}

const ease = easeCss("camera");

function Kbd({ children, style: st }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span className={s.kbd} style={st}>
      {children}
    </span>
  );
}

function Scene({ state, layout }: { state: State; layout: Layout }) {
  const g = GEOMETRY[layout];
  const d = state.dir;
  // An element arriving from hidden is placed first and then fades in, so it
  // never visibly travels. One already showing glides as usual.
  const arriving = (l: Look[]) => (l[d].o === 1 && l[state.prev].o === 0 ? "" : undefined);
  const at = (l: Look[]) => ({ style: style(l[d]), "data-o": l[d].o, "data-new": arriving(l) });
  const boxed = (l: Look[]) => ({ ...at(l), "data-box": l[d].box ?? "none" });

  return (
    <div
      className={s.page}
      data-dir={d}
      data-layout={layout}
      style={{ ["--ease" as string]: ease } as CSSProperties}
    >
      <div className={s.paper} />

      {/* Instrument: the cells the page settles into */}
      <div className={`${s.el} ${s.box} ${s.cell}`} {...boxed(g.nameCell)} />
      <div className={`${s.el} ${s.box} ${s.cell}`} {...boxed(g.liveCell)} />
      <div className={`${s.el} ${s.box} ${s.cell}`} {...boxed(g.actCell)} />

      {/* Specification sheet: frame, dimension line, title block */}
      <div className={`${s.el} ${s.frame}`} {...at(g.frame)} />
      <div className={`${s.el} ${s.dim}`} {...at(g.dim)}>
        <span>{layout === "wide" ? "896 / 56 cells" : "56 cells"}</span>
      </div>
      <div className={`${s.el} ${s.titleBlock}`} {...at(g.titleBlock)}>
        <span className={s.tbName}>xeind.net</span>
        <span className={s.tbMeta}>SHEET 1/1</span>
      </div>

      {/* Shared: the rule, the name, the tagline, the heading */}
      <div className={`${s.el} ${s.rule}`} {...at(g.rule)} />
      <div data-snap="" className={`${s.el} ${s.text}`} {...at(g.name)}>
        {NAME}
      </div>
      <div data-snap="" className={`${s.el} ${s.text}`} {...at(g.tag)}>
        {TAGLINE}
      </div>
      <div
        data-snap=""
        className={`${s.el} ${s.text}`}
        {...at(g.secHead)}
        style={{
          ...style(g.secHead[d]),
          ...style({ ...g.secHead[d], ...mono(11, 16, { fg: ACC }) }),
        }}
      >
        §1
      </div>
      <div data-snap="" className={`${s.el} ${s.text}`} {...at(g.head)}>
        Projects
      </div>

      {/* Shared: the two actions */}
      {["View Resume", "Schedule Call"].map((label, i) => (
        <div key={label} className={`${s.el} ${s.box} ${s.action}`} {...boxed(g.actions[i].box)}>
          <span
            data-snap=""
            className={`${s.el} ${s.text}`}
            style={{
              transform: `translate(${g.actions[i].lab[d].x}px, ${g.actions[i].lab[d].y}px)`,
            }}
          >
            {label}
          </span>
          <span
            className={`${s.el} ${s.keyslot}`}
            style={{
              transform: `translate(${g.actions[i].key[d].x}px, ${g.actions[i].key[d].y}px)`,
              opacity: g.actions[i].key[d].o,
            }}
            data-o={g.actions[i].key[d].o}
            data-new={arriving(g.actions[i].key)}
          >
            <Kbd>{i === 0 ? "R" : "C"}</Kbd>
          </span>
        </div>
      ))}

      {/* Catalogue column heads */}
      {["YEAR", "KIND", "TITLE"].map((label, i) => (
        <div
          key={label}
          data-snap=""
          className={`${s.el} ${s.text}`}
          {...at(g.colHead[i])}
          style={style({ ...g.colHead[i][d], ...mono(10, 24, { fg: FAINT }) })}
        >
          {label}
        </div>
      ))}

      {/* Shared: the four projects, as cards, lines, rows or cells */}
      {PROJECTS.map((p, i) => {
        const r = g.rows[i];
        return (
          <div
            key={p.title}
            className={`${s.el} ${s.box} ${s.row}`}
            {...boxed(r.box)}
            data-sel={d === 4 && i === 0 ? "" : undefined}
          >
            <div className={`${s.el} ${s.leader}`} {...at(r.leader)} />
            <div data-snap="" className={`${s.el} ${s.text}`} {...at(r.sec)}>
              §1.{i + 1}
            </div>
            <div className={`${s.el} ${s.keyslot}`} {...at(r.key)}>
              <Kbd>{i + 1}</Kbd>
            </div>
            <div data-snap="" className={`${s.el} ${s.text}`} {...at(r.title)}>
              {p.title}
            </div>
            <div data-snap="" className={`${s.el} ${s.text}`} {...at(r.kind)}>
              {p.kind}
            </div>
            <div data-snap="" className={`${s.el} ${s.text} ${s.year}`} {...at(r.year)}>
              {p.year}
            </div>
            <div className={`${s.el} ${s.bar}`} {...at(r.bar)} />
          </div>
        );
      })}

      {/* Catalogue and sheet: the rest of the index, as placeholder rows */}
      {g.fillers.map((f, j) => (
        <div key={j} className={`${s.el} ${s.box} ${s.row}`} {...boxed(f.box)}>
          <div className={`${s.el} ${s.bar}`} {...at(f.b1)} />
          <div className={`${s.el} ${s.bar}`} {...at(f.b2)} />
          <div className={`${s.el} ${s.bar}`} {...at(f.b3)} />
        </div>
      ))}

      {/* Instrument: the one live value, and the keys that drive the page */}
      <div
        data-snap=""
        className={`${s.el} ${s.text}`}
        {...at(g.liveLab)}
        style={style({ ...g.liveLab[d], ...mono(10, 16, { fg: FAINT }) })}
      >
        Lighthouse
      </div>
      <div
        className={`${s.el} ${s.live}`}
        {...at(g.liveVal)}
        style={style({ ...g.liveVal[d], ...mono(40, 48, { fg: ACC }) })}
      >
        <Count value={state.perf} />
      </div>
      <div className={`${s.el} ${s.hints}`} {...at(g.hints)}>
        <Kbd>1–4</Kbd>
        <span>open</span>
        <Kbd>⌘K</Kbd>
        <span>search</span>
      </div>
    </div>
  );
}

function Demo() {
  return (
    <Stage<State>
      width={896}
      height={528}
      compact={{ below: 600, width: 358, height: 552 }}
      theme="light"
      initial={initial}
      poster={poster}
      script={script}
      cursor={{ at: REST }}
      className={s.stage}
    >
      {(state, _rect, layout) => (
        <Window
          url={layout === "wide" ? "xeind.net" : undefined}
          lights="grey"
          className={s.window}
          toolbar={
            <div className={s.seg} data-layout={layout}>
              <Segmented items={[...DIRS]} value={state.dir} targets={TARGETS} cursor="pointer" />
            </div>
          }
        >
          <Scene state={state} layout={layout} />
        </Window>
      )}
    </Stage>
  );
}

export default function DesignDirections() {
  return (
    <div data-ss-directions="">
      <ClientStage width={896} height={528}>
        <Demo />
      </ClientStage>
    </div>
  );
}
