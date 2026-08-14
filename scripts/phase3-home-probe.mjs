/* Boundary probe for the home page: reports the document-top offset (mod 8)
 * and height (mod 8) of every section-level box, so a 1px drift anywhere in
 * the stack points at its owner. Dev server up, run from the repo root:
 *
 *   node scripts/phase3-home-probe.mjs [route] [--width=1440]
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
  const rows = [];
  const label = (el) =>
    `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}.${String(el.className).slice(0, 70)}`;
  const probe = (el, depth) => {
    const cs = getComputedStyle(el);
    if (cs.position === "absolute" || cs.position === "fixed") return;
    const r = el.getBoundingClientRect();
    if (r.height === 0) return;
    const top = r.top + scrollY;
    const mt = (v) => {
      const m = Math.abs(v / 8 - Math.round(v / 8)) * 8;
      return m > 0.05 ? `OFF ${m.toFixed(1)}` : "ok";
    };
    if (mt(top) !== "ok" || mt(r.height) !== "ok")
      rows.push(
        `${"  ".repeat(depth)}top ${top.toFixed(1)} [${mt(top)}] h ${r.height.toFixed(1)} [${mt(r.height)}] ${label(el)}`,
      );
    if (depth < 8) for (const c of el.children) probe(c, depth + 1);
  };
  probe(document.querySelector("main") || document.body, 0);
  return rows.join("\n");
});

console.log(report);
await browser.close();
