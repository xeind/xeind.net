/**
 * Generates the PNG favicons/app icons from public/icon.svg.
 * Run after changing the logo: node scripts/generate-icons.mjs
 *
 * icon.svg is non-square and colors itself via prefers-color-scheme, which
 * rasterizers resolve to the light (dark-gray) fills — so this composes a
 * square tile with an explicit background and explicit logo color instead
 * of rasterizing the file as-is.
 */
import { readFileSync } from "node:fs";
import sharp from "sharp";

const BG = "#262626";
const LOGO_FILL = "#EBE5D8";

const source = readFileSync("public/icon.svg", "utf8");

// Strip the <style> block (media-query fills) and the classes that used it,
// leaving bare polygons we can fill explicitly.
const polygons = source
  .replace(/<style>[\s\S]*?<\/style>/, "")
  .replace(/class="(primary|secondary)"/g, "")
  .match(/<polygon[\s\S]*?\/>/g)
  .join("\n");

// Logo viewBox is 7083.94 x 7553 (taller than wide). Scale it to ~62% of
// the tile height — inside the ~80% maskable safe zone — and center it.
const TILE = 1024;
const logoHeight = Math.round(TILE * 0.62);
const logoWidth = Math.round(logoHeight * (7083.94 / 7553));
const x = Math.round((TILE - logoWidth) / 2);
const y = Math.round((TILE - logoHeight) / 2);

const tile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE} ${TILE}">
  <rect width="${TILE}" height="${TILE}" fill="${BG}"/>
  <svg x="${x}" y="${y}" width="${logoWidth}" height="${logoHeight}" viewBox="0 0 7083.94 7553" fill="${LOGO_FILL}">
    ${polygons}
  </svg>
</svg>`;

const targets = [
  ["public/apple-touch-icon.png", 180],
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
];

for (const [file, size] of targets) {
  await sharp(Buffer.from(tile), { density: 300 })
    .resize(size, size)
    .png()
    .toFile(file);
  console.log(`${file} (${size}x${size})`);
}
