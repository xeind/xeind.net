/**
 * Generates PNG favicons/app icons from the logo in public/icon.svg.
 * Run after changing the logo: node scripts/generate-icons.mjs
 *
 * icon.svg is the bare logo (transparent background), composed here into:
 *  - square dark tiles for apple-touch-icon + manifest icons
 *  - transparent 32x32 tab favicons: dark logo for light scheme, light
 *    logo for dark scheme (prefers-color-scheme links in Layout.astro)
 */
import { readFileSync } from "node:fs";
import sharp from "sharp";

const source = readFileSync("public/icon.svg", "utf8");
const polygons = source.match(/<polygon[\s\S]*?\/>/g).join("\n");

// Logo viewBox is 7083.94 x 7553 (taller than wide).
const LOGO_RATIO = 7083.94 / 7553;

function tile({ bg, fill, scale }) {
  const TILE = 1024;
  const logoHeight = Math.round(TILE * scale);
  const logoWidth = Math.round(logoHeight * LOGO_RATIO);
  const x = Math.round((TILE - logoWidth) / 2);
  const y = Math.round((TILE - logoHeight) / 2);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE} ${TILE}">
  ${bg ? `<rect width="${TILE}" height="${TILE}" fill="${bg}"/>` : ""}
  <svg x="${x}" y="${y}" width="${logoWidth}" height="${logoHeight}" viewBox="0 0 7083.94 7553" fill="${fill}">
    ${polygons}
  </svg>
</svg>`;
}

// Square, dark — home screen / launcher icons (62% logo fits the ~80%
// maskable safe zone).
const appTile = tile({ bg: "#262626", fill: "#EBE5D8", scale: 0.62 });

// Transparent, per-scheme — browser tab favicons: the logo fills the
// canvas; the browser chrome provides the backdrop.
const tabLight = tile({ bg: null, fill: "#333333", scale: 0.96 });
const tabDark = tile({ bg: null, fill: "#EBE5D8", scale: 0.96 });

const targets = [
  [appTile, "public/apple-touch-icon.png", 180],
  [appTile, "public/icon-192.png", 192],
  [appTile, "public/icon-512.png", 512],
  [tabDark, "public/xd-32x32-dark.png", 32],
  [tabLight, "public/xd-32x32-light.png", 32],
];

for (const [svg, file, size] of targets) {
  await sharp(Buffer.from(svg), { density: 300 })
    .resize(size, size)
    .png()
    .toFile(file);
  console.log(`${file} (${size}x${size})`);
}
