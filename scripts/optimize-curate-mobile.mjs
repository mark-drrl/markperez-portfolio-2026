import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outDir = path.join(root, "public/work/mobile");

fs.mkdirSync(outDir, { recursive: true });

const sources = [
  ["public/work/portfolio-1.jpg", "curate-1.webp"],
  ["public/work/portfolio-2.png", "curate-2.webp"],
  ["public/work/portfolio-3.jpg", "curate-3.webp"],
];

for (const [src, dest] of sources) {
  const input = path.join(root, src);
  const output = path.join(outDir, dest);

  await sharp(input)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(output);

  const { size } = fs.statSync(output);
  console.log(`${dest} — ${(size / 1024).toFixed(1)} KB`);
}
