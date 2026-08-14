/* One-shot tally for the Phase-0 grid inventory (docs/prd-grid-alignment.md).
 * Lists every Tailwind spacing/size utility in src/ whose pixel value is off
 * the 8px half-cell grid, grouped by utility, with the files that use it.
 * Not wired into check:design — Phase 5 owns enforcement; this is the survey.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const roots = ["src/components", "src/pages", "src/layouts"];
const exts = new Set([".tsx", ".astro"]);

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (exts.has(path.extname(p))) files.push(p);
  }
};
roots.forEach(walk);

// prefix-<n> where n is Tailwind's 0.25rem scale, plus arbitrary [Npx] values.
const PREFIX =
  "(?:-?m[trblxy]?|p[trblxy]?|gap(?:-[xy])?|space-[xy]|h|min-h|max-h|w|top|bottom|left|right|inset(?:-[xy])?|leading|translate-[xy]|size)";
const scaleRe = new RegExp(`(?<![\\w-])(${PREFIX})-(\\d+(?:\\.\\d+)?)(?![\\w.\\]-])`, "g");
const pxRe = new RegExp(`(?<![\\w-])(${PREFIX})-\\[(\\d+(?:\\.\\d+)?)px\\]`, "g");

const offGrid = new Map(); // "util-n (px)" -> Set of files
const record = (key, file) => {
  if (!offGrid.has(key)) offGrid.set(key, new Set());
  offGrid.get(key).add(file.replace(/^src\//, ""));
};

for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(scaleRe)) {
    const px = Number(m[2]) * 4;
    if (px % 8 !== 0) record(`${m[1]}-${m[2]} (${px}px)`, file);
  }
  for (const m of text.matchAll(pxRe)) {
    const px = Number(m[2]);
    if (px % 8 !== 0 && px !== 1 && px !== 2) record(`${m[1]}-[${m[2]}px]`, file);
  }
}

const sorted = [...offGrid.entries()].sort((a, b) => b[1].size - a[1].size);
for (const [key, where] of sorted) {
  console.log(`${key}  ×${where.size}`);
  for (const f of [...where].sort()) console.log(`    ${f}`);
}
console.log(`\n${sorted.length} distinct off-grid values`);
