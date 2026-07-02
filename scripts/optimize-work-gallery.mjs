/**
 * Work gallery image optimizer for portfolio-2026.
 * Generates WebP versions at 800w and 1600w into public/work/resized/
 * for all 11 portfolio images used in WorkColumnGallery and WorkMobileGallery.
 *
 * Run: node scripts/optimize-work-gallery.mjs
 */

import sharp from "sharp";
import { existsSync, mkdirSync } from "fs";
import { resolve, dirname, basename, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const WORK_DIR = resolve(ROOT, "public", "work");
const OUT_DIR = resolve(WORK_DIR, "resized");

mkdirSync(OUT_DIR, { recursive: true });

// 400w for small mobile tiles (~412px at 1x), 800w for larger tiles, 1600w for desktop HiDPI
const WIDTHS = [400, 800, 1600];

const IMAGES = [
  "portfolio-1.jpg",
  "portfolio-2.png",
  "portfolio-3.jpg",
  "portfolio-4.jpg",
  "portfolio-5.jpg",
  "portfolio-6.jpg",
  "portfolio-7.jpg",
  "portfolio-8.jpg",
  "portfolio-9.jpg",
  "portfolio-10.jpg",
  "portfolio-11.jpg",
];

const results = [];

for (const filename of IMAGES) {
  const input = resolve(WORK_DIR, filename);
  if (!existsSync(input)) {
    results.push({ file: filename, status: "SKIPPED (not found)" });
    continue;
  }

  const base = basename(filename, extname(filename));
  const fileResults = [];

  for (const width of WIDTHS) {
    const outFile = resolve(OUT_DIR, `${base}-${width}w.webp`);

    try {
      const meta = await sharp(input).metadata();

      if (meta.width && meta.width < width) {
        // Don't upscale — copy at original size
        await sharp(input).webp({ quality: 82 }).toFile(outFile);
        fileResults.push(`${width}w (original size ${meta.width}px)`);
      } else {
        await sharp(input)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(outFile);
        fileResults.push(`${width}w OK`);
      }
    } catch (err) {
      fileResults.push(`${width}w FAILED: ${err.message}`);
    }
  }

  console.log(`✓ ${filename}: ${fileResults.join(", ")}`);
  results.push({ file: filename, status: fileResults.join("; ") });
}

console.log("\n=== WORK GALLERY RESIZE COMPLETE ===");
console.log(`Output dir: ${OUT_DIR}`);
for (const r of results) {
  console.log(`  ${r.file}: ${r.status}`);
}
