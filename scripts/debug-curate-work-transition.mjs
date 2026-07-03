/**
 * Capture Curate → Work transition frames.
 * Run: node scripts/debug-curate-work-transition.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.PREVIEW_URL ?? "http://localhost:3001";
const OUT_DIR = path.join(process.cwd(), "scripts", "debug-output", "curate-work");

const STEPS = [
  ["p052", 0.52],
  ["p054", 0.54],
  ["p056", 0.56],
  ["p058", 0.58],
  ["p060", 0.6],
  ["p062", 0.62],
  ["p064", 0.64],
  ["p066", 0.66],
  ["p068", 0.68],
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(800);

  for (const [name, progress] of STEPS) {
    await page.evaluate((p) => {
      window.__portfolioScrollDebug?.scrollToProgress(p);
    }, progress);
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(OUT_DIR, `${name}.png`),
      fullPage: false,
    });
    const metrics = await page.evaluate((p) => {
      const d = window.__portfolioScrollDebug?.getState?.();
      return {
        progress: p,
        locked: d?.isLocked,
        phase: d?.phase,
      };
    }, progress);
    console.log(name, metrics);
  }

  await browser.close();
  console.log(`Screenshots → ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
