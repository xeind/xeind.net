/* Phase 3 verification: on a blog post, every text element's computed
 * line-height must be a multiple of 8, and every block that occupies
 * vertical space (figures, grids, code blocks, margins) should land on
 * the 8px half-cell. Run from the repo root with the dev server up:
 *
 *   node scripts/phase3-measure.mjs [route] [--width=1440]
 */
import puppeteer from "puppeteer-core";

const route = process.argv[2] || "/blog/tmux-to-herdr";
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
  const off = (v) => Math.abs(v / 8 - Math.round(v / 8)) > 0.02;
  const rows = [];
  const article = document.querySelector("article") || document.body;

  // 1. Line-heights off the 8px baseline
  const seen = new Set();
  for (const el of article.querySelectorAll("*")) {
    if (!el.textContent?.trim()) continue;
    const cs = getComputedStyle(el);
    if (cs.position === "absolute" || cs.position === "fixed") continue; // out of flow
    const lh = parseFloat(cs.lineHeight);
    if (Number.isNaN(lh)) continue;
    const key = `${el.tagName}.${el.className}`.slice(0, 90);
    if (off(lh) && !seen.has(key)) {
      seen.add(key);
      rows.push(`LH ${lh.toFixed(2)}  ${key}`);
    }
  }

  // 2. Space-consuming blocks whose outer height (incl. margins) is off-grid
  for (const el of article.querySelectorAll(
    "figure, .blog-grid, pre, img, video, blockquote, table, hr",
  )) {
    const cs = getComputedStyle(el);
    if (el.closest(".blog-grid")) continue; // cells live inside a snapped box
    // 1px hairline borders are ratified out of scope (line weight is not
    // spacing) — measure the box they wrap, not the strokes.
    const h =
      el.getBoundingClientRect().height +
      parseFloat(cs.marginTop) +
      parseFloat(cs.marginBottom) -
      parseFloat(cs.borderTopWidth) -
      parseFloat(cs.borderBottomWidth);
    if (off(h)) {
      const key = `${el.tagName}.${el.className}`.slice(0, 80);
      rows.push(`BOX ${h.toFixed(2)}  ${key}`);
    }
  }
  return rows;
});

console.log(report.length ? report.join("\n") : "all clean");
await browser.close();
