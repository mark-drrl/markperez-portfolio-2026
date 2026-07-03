/**
 * Capture Create→Curate→Work transition at multiple scroll progresses.
 * Run: node scripts/debug-transition-frames.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.PREVIEW_URL ?? "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), "scripts", "debug-output", "transition");

const STOPS = [0.27, 0.32, 0.35, 0.38, 0.42, 0.46, 0.52, 0.64];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });
  const page = await context.newPage();

  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(1000);

  for (const progress of STOPS) {
    await page.evaluate((p) => {
      window.__portfolioScrollDebug?.scrollToProgress(p);
    }, progress);
    await page.waitForTimeout(900);
    const label = String(Math.round(progress * 100)).padStart(3, "0");
    await page.screenshot({
      path: path.join(OUT_DIR, `p${label}.png`),
      fullPage: false,
    });
    console.log(`captured p${label}`);
  }

  await context.close();
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
