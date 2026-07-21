/**
 * Prepares screenshots for a blog post per the rules in
 * src/content/blog/CLAUDE.md: convert to WebP, downscale anything wider
 * than 1840px (the lightbox caps at 90vh anyway, so retina captures gain
 * nothing past that). Non-destructive to files already .webp <= 1840px.
 *
 * Usage: node scripts/optimize-blog-images.mjs <slug|path>
 *   <slug>  resolves to src/content/blog/<slug>/
 *   <path>  any folder, used as-is
 */
import { readdirSync, statSync, unlinkSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import sharp from "sharp";

const MAX_WIDTH = 1840;
const QUALITY = 82;
const RASTER_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/optimize-blog-images.mjs <slug|path>");
  process.exit(1);
}

const candidateDirs = [resolve("src/content/blog", input), resolve(input)];
const dir = candidateDirs.find((d) => {
  try {
    return statSync(d).isDirectory();
  } catch {
    return false;
  }
});
if (!dir) {
  console.error(`No such folder: ${input}`);
  process.exit(1);
}

const files = readdirSync(dir).filter((f) => RASTER_EXTENSIONS.has(extname(f).toLowerCase()));

if (files.length === 0) {
  console.log(`No png/jpg/webp files in ${dir}`);
  process.exit(0);
}

for (const file of files) {
  const srcPath = join(dir, file);
  const ext = extname(file).toLowerCase();
  const base = file.slice(0, -ext.length);
  const destPath = join(dir, `${base}.webp`);
  const beforeSize = statSync(srcPath).size;

  const image = sharp(srcPath);
  const meta = await image.metadata();
  const needsResize = meta.width && meta.width > MAX_WIDTH;
  const isNoOpWebp = ext === ".webp" && !needsResize;

  if (isNoOpWebp) {
    console.log(`skip  ${file} (already webp, ${meta.width}px)`);
    continue;
  }

  let pipeline = image.webp({ quality: QUALITY });
  if (needsResize) pipeline = pipeline.resize({ width: MAX_WIDTH });

  await pipeline.toFile(destPath + (ext === ".webp" ? ".tmp" : ""));
  if (ext === ".webp") {
    // Same source and dest path — write to a temp file, then swap in.
    unlinkSync(srcPath);
    await sharp(destPath + ".tmp").toFile(destPath);
    unlinkSync(destPath + ".tmp");
  } else {
    unlinkSync(srcPath);
  }

  const afterSize = statSync(destPath).size;
  const resizeNote = needsResize ? `, resized to ${MAX_WIDTH}px` : "";
  console.log(
    `${file} -> ${base}.webp  ${(beforeSize / 1024).toFixed(0)}kB -> ${(afterSize / 1024).toFixed(0)}kB${resizeNote}`,
  );
}
