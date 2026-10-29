/* Scroll restoration probe: does a reload, or a back navigation, put the
 * reader where they were, the way the browser does on a page with no router?
 *
 * ClientRouter turns the browser's own restoration off
 * (history.scrollRestoration = "manual") and replays a position it saves on
 * scrollend. This runs the same cases on a route and on a router-free
 * control page served from here, and fails if the route lands anywhere the
 * control would not. Dev server up, run from the repo root:
 *
 *   node scripts/scroll-restoration-probe.mjs [route] [--origin=http://localhost:3180]
 *
 * Point --origin at `npm run preview` (3181) to check the production build,
 * where the router ships bundled.
 */
import { createServer } from "node:http";
import puppeteer from "puppeteer-core";

const route = process.argv.slice(2).find((a) => !a.startsWith("--")) || "/";
const origin =
  (process.argv.find((a) => a.startsWith("--origin=")) || "").split("=")[1] ||
  "http://localhost:3180";
const site = new URL(route, origin).href;

// The control: one tall page and a second page to go back from.
const control = createServer((req, res) => {
  res.setHeader("content-type", "text/html");
  res.end(
    req.url === "/other"
      ? "<!doctype html><title>other</title><p>other</p>"
      : '<!doctype html><title>control</title><body style="margin:0"><div style="height:6000px"></div><a id="away" href="/other">away</a>',
  );
});
await new Promise((resolve) => control.listen(0, resolve));
const controlUrl = `http://localhost:${control.address().port}/`;

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const scrollY = (page) => page.evaluate(() => Math.round(window.scrollY));

async function open(url) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle0" });
  return page;
}

// "Where they were" is the position as the page goes away, not one read a few
// ms earlier: a wheel or smooth scroll is still moving then. pagehide writes
// it to sessionStorage, which outlives the reload.
async function reloadFrom(page) {
  await page.evaluate(() =>
    addEventListener("pagehide", () =>
      sessionStorage.setItem("probe-left-at", String(Math.round(scrollY))),
    ),
  );
  await page.reload({ waitUntil: "networkidle0" });
  await sleep(800);
  const before = await page.evaluate(() => Number(sessionStorage.getItem("probe-left-at")));
  return [before, await scrollY(page)];
}

// A reload case: scroll a fresh tab with `act`, reload, report
// [position on leaving, position after the reload].
const reloadCase = (act) => async (url) => {
  const page = await open(url);
  await act(page);
  const result = await reloadFrom(page);
  await page.close();
  return result;
};

const toFraction = (page, f) =>
  page.evaluate((f) => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), f);

const cases = {
  "reload at rest": reloadCase(async (page) => {
    await toFraction(page, 0.45);
    await sleep(800);
  }),
  "reload right after a jump": reloadCase(async (page) => {
    await toFraction(page, 0.7);
    await sleep(5);
  }),
  "reload right after a wheel": reloadCase(async (page) => {
    await page.mouse.move(700, 450);
    await page.mouse.wheel({ deltaY: 700 });
    await sleep(20);
  }),
  "reload at the bottom": reloadCase(async (page) => {
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await sleep(800);
  }),
  "leave and come back": async (url) => {
    const page = await open(url);
    await page.evaluate(() =>
      scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.6),
    );
    await sleep(800);
    const before = await scrollY(page);
    // The first same-origin link that leaves the page; on the site that is a
    // ClientRouter navigation, on the control a plain one.
    await page.evaluate(() => {
      const away = [...document.querySelectorAll("a[href^='/']")].find(
        (a) => new URL(a.href).pathname !== location.pathname,
      );
      away.click();
    });
    await sleep(1500);
    await page.goBack();
    await sleep(1500);
    const after = await scrollY(page);
    await page.close();
    return [before, after];
  },
};

let failed = 0;
console.log(`route ${site}\n`);
for (const [name, run] of Object.entries(cases)) {
  const [siteBefore, siteAfter] = await run(site);
  const [controlBefore, controlAfter] = await run(controlUrl);
  // The control decides what correct is: it keeps its place, so must the site.
  const controlKeeps = Math.abs(controlAfter - controlBefore) <= 1;
  const siteKeeps = Math.abs(siteAfter - siteBefore) <= 1;
  const ok = siteKeeps === controlKeeps;
  if (!ok) failed++;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${name.padEnd(26)} site ${siteBefore} -> ${siteAfter}   control ${controlBefore} -> ${controlAfter}`,
  );
}

await browser.close();
control.close();
process.exit(failed ? 1 : 0);
