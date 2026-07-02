import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const mobileOutDir = path.join(root, "public/work/mobile");

fs.mkdirSync(mobileOutDir, { recursive: true });

// Desktop Curate cells no longer have their own assets — they now use the same
// workGalleryImages (portfolio-N) as the Work gallery, which are already served
// via /work/resized/ WebP variants. See src/constants/curateImages.ts.

// Mobile Curate stack — 3 slots, distinct from workGalleryImages.
// Target ≈1200px wide (matching existing mobile convention).
const mobileSources = [
  // Slot 0 — Supreme boat among trees
  // (supreme-1.jpg is pixel-identical to work/portfolio-10.jpg — do not use)
  { src: "public/supreme/supreme-6.jpg", dest: "curate-1.webp", quality: 72 },
  // Slot 1 — CREED aerial dune with lone figure
  // (g3.jpg is pixel-identical to work/portfolio-11.jpg — do not use)
  { src: "public/creed/g1.png", dest: "curate-2.webp", quality: 78 },
  // Slot 2 — Lifestyle editorial portrait
  { src: "public/lifestyle/A7403986.jpg", dest: "curate-3.webp", quality: 78 },
];

console.log("=== Mobile Curate slots (1200px) ===");
for (const { src, dest, quality } of mobileSources) {
  const input = path.join(root, src);
  const output = path.join(mobileOutDir, dest);

  await sharp(input)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality })
    .toFile(output);

  const { size } = fs.statSync(output);
  console.log(`${dest} — ${(size / 1024).toFixed(1)} KB  (source: ${src})`);
}
