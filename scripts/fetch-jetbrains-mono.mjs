/**
 * Downloads latin-subset woff2 files for JetBrains Mono 400/700 from the
 * Google Fonts CDN. One-shot setup script: node scripts/fetch-jetbrains-mono.mjs
 */
import { writeFileSync } from "node:fs";

// Chrome UA so the CSS API returns unicode-range-split woff2 sources.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const cssUrl = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap";

const css = await (await fetch(cssUrl, { headers: { "User-Agent": UA } })).text();

// Each @font-face block: capture weight + url, keep only the `latin` subset
// (the block whose comment is exactly `/* latin */`).
const blocks = css.split("/*").slice(1);
const wanted = {};
for (const block of blocks) {
  const subset = block.slice(0, block.indexOf("*/")).trim();
  if (subset !== "latin") continue;
  const weight = block.match(/font-weight:\s*(\d+)/)?.[1];
  const url = block.match(/src:\s*url\((https:[^)]+\.woff2)\)/)?.[1];
  if (weight && url) wanted[weight] = url;
}

if (!wanted["400"] || !wanted["700"]) {
  throw new Error(`missing weights, found: ${Object.keys(wanted).join(",")}`);
}

const targets = [
  ["400", "public/fonts/JetBrainsMono-Regular.woff2"],
  ["700", "public/fonts/JetBrainsMono-Bold.woff2"],
];

for (const [weight, file] of targets) {
  const buf = Buffer.from(await (await fetch(wanted[weight])).arrayBuffer());
  writeFileSync(file, buf);
  console.log(`${file} — ${(buf.length / 1024).toFixed(1)} KB`);
}
