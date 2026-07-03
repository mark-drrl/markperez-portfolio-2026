/**
 * Capture the Work section to verify edge blur. Run: node scripts/debug-work-blur.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.PREVIEW_URL ?? "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), "scripts", "debug-output");

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(1200);

  await page.evaluate(() => {
    window.__portfolioScrollDebug?.scrollToProgress(0.64);
  });
  await page.waitForTimeout(2500);

  const out = path.join(OUT_DIR, "work-blur.png");
  await page.screenshot({ path: out, fullPage: false });
  console.log(`Saved ${out}`);

  await context.close();
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
