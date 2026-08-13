/* Screenshot rig for the grid-alignment rewrite (docs/prd-grid-alignment.md).
 *
 *   node scripts/grid-shots.mjs [--out=shots/baseline] [--grid]
 *     [--themes=light,dark,nightingale,blueprint] [--widths=1280,1440,1437]
 *     [--pages=/,/blog,...] [--base=http://localhost:3180]
 *
 * Uses puppeteer-core (already in node_modules via lighthouse) and the
 * system Chrome — no added dependency. Dev server must be running. --grid
 * appends ?grid so the dev-only ruler overlay draws on every shot. Output
 * lands in shots/ (gitignored): <page>--<theme>--<width>.png, full page.
 */
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
};

const base = arg("base", "http://localhost:3180");
const out = arg("out", "shots/baseline");
const withGrid = process.argv.includes("--grid");
const themes = arg("themes", "light,dark,nightingale,blueprint").split(",");
const widths = arg("widths", "1280,1440,1437").split(",").map(Number);
const pages = arg("pages", "/,/blog,/blog/tmux-to-herdr,/design,/lab,/404,/badges").split(",");

const slug = (p) => (p === "/" ? "home" : p.replaceAll("/", "-").replace(/^-/, ""));

await mkdir(out, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

let count = 0;
for (const theme of themes) {
  const page = await browser.newPage();
  // The theme script in <head> reads localStorage before first paint.
  await page.evaluateOnNewDocument((t) => {
    localStorage.setItem("theme", t);
  }, theme);
  for (const width of widths) {
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    for (const route of pages) {
      const url = new URL(route, base);
      if (withGrid) url.searchParams.set("grid", "");
      await page.goto(url.href, { waitUntil: "networkidle0", timeout: 30000 });
      const file = path.join(out, `${slug(route)}--${theme}--${width}.png`);
      await page.screenshot({ path: file, fullPage: true });
      count += 1;
      process.stdout.write(`${file}\n`);
    }
  }
  await page.close();
}

await browser.close();
console.log(`${count} shots -> ${out}`);
