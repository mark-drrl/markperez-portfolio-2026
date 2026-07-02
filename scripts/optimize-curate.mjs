import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const desktopOutDir = path.join(root, "public/work/curate");
const mobileOutDir = path.join(root, "public/work/mobile");

fs.mkdirSync(desktopOutDir, { recursive: true });
fs.mkdirSync(mobileOutDir, { recursive: true });

// Desktop Curate cells — 7 picks, one per cell, all distinct from workGalleryImages.
// Rendered at ~1/3 viewport width (≈540px on 1600px screen) × ~60vh.
// Target ≈1600px wide for Retina quality; grayscale in-browser so contrast > color.
const desktopSources = [
  // Cell 0 — left col, top — LSB yacht charter
  { src: "public/lsb/6Q8A8318.jpg", dest: "curate-desktop-0.webp", quality: 80 },
  // Cell 1 — left col, bottom — ATM lifestyle portrait
  { src: "public/atm/A7401526.jpg", dest: "curate-desktop-1.webp", quality: 80 },
  // Cell 2 — mid col, upper — Soren editorial portrait
  { src: "public/soren/soren-1.jpg", dest: "curate-desktop-2.webp", quality: 80 },
  // Cell 3 — mid col, top-offset — Centurion Boats portrait
  { src: "public/centurion-v1/A7405363.jpg", dest: "curate-desktop-3.webp", quality: 75 },
  // Cell 4 — mid col, lower — Nautique detail collage
  // (nautique-1.jpg is pixel-identical to work/portfolio-6.jpg — do not use)
  { src: "public/nautique/nautique-4.png", dest: "curate-desktop-4.webp", quality: 80 },
  // Cell 5 — right col, top — Wake Dubai editorial portrait
  { src: "public/wakedubai/A7406243-Edit.jpg", dest: "curate-desktop-5.webp", quality: 80 },
  // Cell 6 — right col, mid — Interior design landscape
  { src: "public/interior/int-2.jpg", dest: "curate-desktop-6.webp", quality: 80 },
];

// Mobile Curate stack — 3 slots, distinct from desktop picks and from each other.
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

console.log("=== Desktop Curate cells (1600px) ===");
for (const { src, dest, quality } of desktopSources) {
  const input = path.join(root, src);
  const output = path.join(desktopOutDir, dest);

  await sharp(input)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality })
    .toFile(output);

  const { size } = fs.statSync(output);
  console.log(`${dest} — ${(size / 1024).toFixed(1)} KB  (source: ${src})`);
}

console.log("\n=== Mobile Curate slots (1200px) ===");
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
