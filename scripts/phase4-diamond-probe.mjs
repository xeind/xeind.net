/* Diamond-vs-hairline probe. Every stroke on this site sits on the pixel AFTER
 * its boundary (docs/design-system.md §6), so a box that spans [top, bottom]
 * and [left, right] is ruled at top+0.5, bottom+0.5, left+0.5 and right+0.5 —
 * and a corner diamond has to centre on those. This walks the frame and every
 * Panel and reports the delta. Anything non-zero is a visible 1px miss.
 * Dev server up, run from the repo root:
 *
 *   node scripts/phase4-diamond-probe.mjs [route] [--width=1440]
 */
import puppeteer from "puppeteer-core";

const route = process.argv[2] || "/";
const width = Number(
  (process.argv.find((a) => a.startsWith("--width=")) || "").split("=")[1] || 1440,
);

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage();
await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
await page.goto(new URL(route, "http://localhost:3180").href, { waitUntil: "networkidle0" });

const report = await page.evaluate(() => {
  const out = [];
  const f = (v) => v.toFixed(2).padStart(9);
  let misses = 0;

  // Where the four strokes of a box are drawn, given the after-the-boundary
  // rule. main's rails are overlays on these same lines, so a Panel and the
  // frame that contains it resolve to the same two columns.
  //
  // round() before the +0.5, because this has to name the centre of the PIXEL
  // the stroke paints, not the layout boundary. The two differ: a browser
  // snaps a painted edge to a whole CSS pixel, so a box edge at 200.5 inks
  // [201,202) whose centre is 201.5, while the unrounded expression says 201.
  // Without the round this reported clean at exactly the widths that were half
  // a pixel out.
  const px = (v) => Math.round(v) + 0.5;
  const strokes = (r) => ({
    l: px(r.left),
    r: px(r.right),
    t: px(r.top + scrollY),
    b: px(r.bottom + scrollY),
  });

  const centre = (el) => {
    const q = el.getBoundingClientRect();
    return { x: (q.left + q.right) / 2, y: (q.top + q.bottom) / 2 + scrollY };
  };

  const check = (label, el, box) => {
    const s = strokes(box);
    const c = centre(el);
    const dx = Math.min(Math.abs(c.x - s.l), Math.abs(c.x - s.r));
    const dy = Math.min(Math.abs(c.y - s.t), Math.abs(c.y - s.b));
    const bad = dx > 0.05 || dy > 0.05;
    if (bad) misses++;
    out.push(
      `${label}  centre ${f(c.x)},${f(c.y)}  dx ${f(dx)} dy ${f(dy)}${bad ? "  <-- MISS" : ""}`,
    );
  };

  const main = document.querySelector("main");
  const mr = main.getBoundingClientRect();
  const cs = getComputedStyle(main);
  const bx = parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
  out.push(
    `main box  x[${f(mr.left)}..${f(mr.right)}]  content ${f(mr.width - bx)}  borders ${bx}`,
  );
  if (bx)
    out.push("  ! main has a border again — it draws inside the box and pulls the right rail in");
  out.push("");

  out.push("-- frame --");
  const rails = [...main.querySelectorAll(":scope > div.absolute.w-px")];
  rails.forEach((rail, i) => {
    const q = rail.getBoundingClientRect();
    const s = strokes(mr);
    const c = Math.round(q.left); // the column it inks, same snapping as above
    const d = Math.min(Math.abs(c - (s.l - 0.5)), Math.abs(c - (s.r - 0.5)));
    if (d > 0.05) misses++;
    out.push(`rail ${i}  column ${f(q.left)}  d ${f(d)}${d > 0.05 ? "  <-- MISS" : ""}`);
  });
  for (const d of main.querySelectorAll(":scope > .edge-glow-node")) check("frame diamond", d, mr);

  out.push("");
  out.push("-- panels --");
  const panels = [...main.querySelectorAll(".relative")].filter((el) =>
    el.querySelector(":scope > .edge-glow-node"),
  );
  panels.forEach((p, i) => {
    const r = p.getBoundingClientRect();
    out.push(`panel ${i}  y[${f(r.top + scrollY)}..${f(r.bottom + scrollY)}] h ${f(r.height)}`);
    for (const d of p.querySelectorAll(":scope > .edge-glow-node")) check("   diamond", d, r);
  });

  out.push("");
  out.push(misses ? `${misses} MISSES` : "clean — every diamond centres on its stroke");
  return out.join("\n");
});

console.log(report);
await browser.close();
