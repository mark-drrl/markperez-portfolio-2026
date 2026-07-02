/**
 * Generate OG images for all case-study routes + default.
 * Output: public/og/{slug}.jpg  — 1200×630, center-cropped JPEG quality 80.
 * Usage: npm run generate:og
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outDir = path.join(root, "public/og");
fs.mkdirSync(outDir, { recursive: true });

const OG_W = 1200;
const OG_H = 630;
const QUALITY = 80;

/**
 * Case studies: slug → source image path (relative to project root / public/).
 * Hero src values come from src/constants/caseStudies/{slug}.ts.
 */
const caseStudies = [
  { slug: "lsb",         src: "public/lsb/lsb-1.jpg" },
  { slug: "wakedubai",   src: "public/wakedubai/wdp-1.jpg" },
  { slug: "creed",       src: "public/creed/hf_20260606_222605_2180e20d-97b0-40aa-92ec-9f9ad6a60b19 (1).png" },
  { slug: "centurionv1", src: "public/centurion-v1/centurionv1-1.jpg" },
  { slug: "atm",         src: "public/atm/A7401490.jpg" },
  { slug: "lifestyle",   src: "public/lifestyle/main.png" },
  { slug: "soren",       src: "public/soren/soren-1.jpg" },
  { slug: "nautique",    src: "public/nautique/nautique-1.jpg" },
  { slug: "phase5page",  src: "public/work/portfolio-9.jpg" },
  { slug: "interior",    src: "public/interior/int-1.png" },
  { slug: "supreme",     src: "public/supreme/supreme.jpg" },
];

/** Default OG — site hero image. */
const defaultSrc = "public/hero-image.jpg";

async function generateOG(srcRelative, destFilename) {
  const input = path.join(root, srcRelative);
  const output = path.join(outDir, destFilename);

  await sharp(input)
    .resize(OG_W, OG_H, { fit: "cover", position: "centre" })
    .jpeg({ quality: QUALITY })
    .toFile(output);

  const { size } = fs.statSync(output);
  console.log(`${destFilename}  ${(size / 1024).toFixed(1)} KB  (source: ${srcRelative})`);
}

console.log(`=== OG images ${OG_W}×${OG_H} JPEG q${QUALITY} → public/og/ ===\n`);

// Default
await generateOG(defaultSrc, "default.jpg");

// Per-case-study
for (const { slug, src } of caseStudies) {
  await generateOG(src, `${slug}.jpg`);
}

console.log("\nDone.");
