/**
 * One-off: downscale/compress oversized blog screenshots.
 * Retina captures (3000px+) are far larger than a blog ever displays;
 * the lightbox caps at 85vh anyway. 1840px wide stays crisp on 2x screens.
 * Run: node scripts/optimize-blog-images.mjs
 */
import sharp from "sharp";
import { statSync } from "node:fs";

const MAX_WIDTH = 1840;
const targets = ["public/blog/vallow-nvim.png"];

for (const file of targets) {
  const before = statSync(file).size;
  const buf = await sharp(file)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .png({ compressionLevel: 9, quality: 82 })
    .toBuffer();
  await sharp(buf).toFile(file);
  const after = statSync(file).size;
  console.log(
    `${file}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`,
  );
}
