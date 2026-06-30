/**
 * Rasterize LSB PDFs to WebP page previews for the case study lookbook.
 * Run: npm run generate:lsb-pdf
 */
import fs from "node:fs";
import path from "node:path";
import { createCanvas } from "@napi-rs/canvas";
import sharp from "sharp";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const root = process.cwd();
const RENDER_WIDTH = 1400;
const WEBP_QUALITY = 82;
const WARN_PAGE_BYTES = 600 * 1024;

const documents = [
  {
    id: "company-profile",
    title: "Company Profile",
    subtitle: "LSB Yacht Charter",
    sourcePdf: "COMPANYPROFILE_LATEST.pdf",
    pdfAlias: "company-profile.pdf",
    featured: true,
    aspect: "aspect-[16/10]",
  },
  {
    id: "benetti-gallus",
    title: "Benetti 115 Gallus",
    subtitle: "Yacht brochure",
    sourcePdf: "01 - LSB Benetti 115 Gallus.pdf",
    pdfAlias: "benetti-115-gallus.pdf",
    aspect: "aspect-[3/4]",
  },
  {
    id: "sunseeker-why-not",
    title: "Sunseeker 82 Why Not",
    subtitle: "Yacht brochure",
    sourcePdf: "02 - LSB Sunseeker 82 Why Not.pdf",
    pdfAlias: "sunseeker-82-why-not.pdf",
    aspect: "aspect-[3/4]",
  },
  {
    id: "azimut-viktoria",
    title: "Azimut 75 Viktoria",
    subtitle: "Yacht brochure",
    sourcePdf: "03 - LSB Azimut 75 Viktoria.pdf",
    pdfAlias: "azimut-75-viktoria.pdf",
    aspect: "aspect-[3/4]",
  },
];

async function renderPage(page, width) {
  const viewport = page.getViewport({ scale: 1 });
  const scale = width / viewport.width;
  const scaledViewport = page.getViewport({ scale });
  const canvas = createCanvas(
    Math.ceil(scaledViewport.width),
    Math.ceil(scaledViewport.height),
  );
  const context = canvas.getContext("2d");

  await page.render({
    canvasContext: context,
    viewport: scaledViewport,
  }).promise;

  return canvas.toBuffer("image/png");
}

async function generateDocument(doc) {
  const lsbDir = path.join(root, "public/lsb");
  const pdfDir = path.join(lsbDir, "pdf");
  const outDir = path.join(lsbDir, "pdf-previews", doc.id);
  const sourcePath = path.join(lsbDir, doc.sourcePdf);
  const aliasPath = path.join(pdfDir, doc.pdfAlias);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing PDF: ${sourcePath}`);
  }

  fs.mkdirSync(pdfDir, { recursive: true });
  fs.mkdirSync(outDir, { recursive: true });

  if (!fs.existsSync(aliasPath)) {
    fs.copyFileSync(sourcePath, aliasPath);
    console.log(`Copied → ${path.relative(root, aliasPath)}`);
  }

  const data = new Uint8Array(fs.readFileSync(sourcePath));
  const pdf = await getDocument({ data, useSystemFonts: true }).promise;
  const pageCount = pdf.numPages;
  let totalBytes = 0;

  console.log(`\n${doc.title} (${pageCount} pages)`);

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const pngBuffer = await renderPage(page, RENDER_WIDTH);
    const pageName = `page-${String(pageNumber).padStart(3, "0")}.webp`;
    const outPath = path.join(outDir, pageName);

    await sharp(pngBuffer).webp({ quality: WEBP_QUALITY }).toFile(outPath);

    const { size } = fs.statSync(outPath);
    totalBytes += size;

    if (size > WARN_PAGE_BYTES) {
      console.warn(
        `  ⚠ ${pageName} — ${(size / 1024).toFixed(0)} KB (consider lowering quality)`,
      );
    } else if (pageNumber === 1 || pageNumber === pageCount || pageNumber % 10 === 0) {
      console.log(`  ${pageName} — ${(size / 1024).toFixed(0)} KB`);
    }
  }

  const coverPath = path.join(outDir, "cover.webp");
  fs.copyFileSync(path.join(outDir, "page-001.webp"), coverPath);

  const meta = {
    id: doc.id,
    title: doc.title,
    subtitle: doc.subtitle,
    pdfSrc: `/lsb/pdf/${doc.pdfAlias}`,
    previewDir: `/lsb/pdf-previews/${doc.id}`,
    coverSrc: `/lsb/pdf-previews/${doc.id}/cover.webp`,
    pageCount,
    aspect: doc.aspect,
    featured: doc.featured ?? false,
  };

  fs.writeFileSync(
    path.join(outDir, "meta.json"),
    `${JSON.stringify(meta, null, 2)}\n`,
  );

  console.log(
    `  Done — ${pageCount} pages, ${(totalBytes / 1024 / 1024).toFixed(1)} MB total`,
  );

  return meta;
}

async function main() {
  const results = [];

  for (const doc of documents) {
    results.push(await generateDocument(doc));
  }

  const manifestPath = path.join(root, "public/lsb/pdf-previews/manifest.json");
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, `${JSON.stringify(results, null, 2)}\n`);
  console.log(`\nManifest → ${path.relative(root, manifestPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
