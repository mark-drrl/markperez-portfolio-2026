/**
 * Capture the Creed case study at multiple scroll depths on desktop + mobile.
 * Run: node scripts/debug-creed-casestudy.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.PREVIEW_URL ?? "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), "scripts", "debug-output", "creed");

async function captureAt(page, label, fraction) {
  await page.evaluate((f) => {
    const max = document.body.scrollHeight - window.innerHeight;
    window.scrollTo(0, Math.round(max * f));
  }, fraction);
  await page.waitForTimeout(1100);
  await page.screenshot({ path: path.join(OUT_DIR, `${label}.png`) });
  console.log(`captured ${label}`);
}

async function run(name, viewport, deviceScaleFactor) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport, deviceScaleFactor });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto(`${BASE_URL}/works-creed`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  await page.waitForTimeout(1400);

  const stops = [0, 0.12, 0.24, 0.36, 0.5, 0.64, 0.78, 0.9, 1];
  for (let i = 0; i < stops.length; i += 1) {
    await captureAt(page, `${name}-${String(i).padStart(2, "0")}`, stops[i]);
  }

  if (errors.length) {
    console.log(`PAGE ERRORS (${name}):`, errors);
  }

  await context.close();
  await browser.close();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await run("desktop", { width: 1440, height: 900 }, 1.5);
  await run("mobile", { width: 390, height: 844 }, 2);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
