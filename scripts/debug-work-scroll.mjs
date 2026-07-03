/**
 * Scroll home → Work, record video + state log.
 * Run: node scripts/debug-work-scroll.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.PREVIEW_URL ?? "http://localhost:3001";
const OUT_DIR = path.join(process.cwd(), "scripts", "debug-output");

async function readDebugState(page) {
  return page.evaluate(() => {
    const debug = window.__portfolioScrollDebug;
    const desktopColumns = [
      ...document.querySelectorAll(".hidden.h-full.w-full.md\\:block [class*='will-change-transform']"),
    ]
      .filter((el) => el.style.left?.includes("100% - 1vh"))
      .map((el) => ({
        left: el.style.left,
        transform: el.style.transform,
      }));

    const workChromeVisible = Boolean(
      document.body.textContent?.includes("CLICK ON AN IMAGE"),
    );

    return {
      debug: debug?.getState?.() ?? null,
      desktopColumns,
      workChromeVisible,
    };
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: OUT_DIR, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();

  const log = [];
  const snap = async (name) => {
    const state = await readDebugState(page);
    log.push({ step: name, ...state });
    await page.screenshot({
      path: path.join(OUT_DIR, `${name}.png`),
      fullPage: false,
    });
    console.log(`\n=== ${name} ===`);
    console.log(JSON.stringify(state, null, 2));
  };

  console.log(`Opening ${BASE_URL}...`);
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(1200);
  await snap("01-initial");

  // Jump to Work via dev debug API
  await page.evaluate(() => {
    window.__portfolioScrollDebug?.scrollToProgress(0.64);
  });
  await page.waitForTimeout(2000);
  await snap("02-at-work-064");

  const beforeWheel = await readDebugState(page);

  // Wheel over gallery center
  await page.mouse.move(720, 450);
  for (let i = 0; i < 30; i++) {
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1500);
  await snap("03-after-gallery-wheel");

  const afterWheel = await readDebugState(page);

  const transformsChanged =
    JSON.stringify(beforeWheel.desktopColumns) !==
    JSON.stringify(afterWheel.desktopColumns);

  log.push({
    step: "summary",
    transformsChanged,
    virtualBefore: beforeWheel.debug?.bridge?.targetVirtualScroll,
    virtualAfter: afterWheel.debug?.bridge?.targetVirtualScroll,
    lockedAfter: afterWheel.debug?.bridge?.isLocked,
  });

  await writeFile(
    path.join(OUT_DIR, "scroll-log.json"),
    JSON.stringify(log, null, 2),
  );

  await context.close();
  await browser.close();

  console.log(`\nTransforms changed after wheel: ${transformsChanged}`);
  console.log(`Done. Video + screenshots in ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
