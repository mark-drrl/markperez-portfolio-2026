/**
 * Log Curate→Work transition opacities + test gallery wheel both directions.
 * Run: node scripts/debug-curate-work-scroll.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.PREVIEW_URL ?? "http://localhost:3001";
const OUT_DIR = path.join(process.cwd(), "scripts", "debug-output", "curate-work");

const PROGRESS_STEPS = [
  0.5, 0.52, 0.54, 0.56, 0.58, 0.59, 0.6, 0.61, 0.62, 0.63, 0.64, 0.66,
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const log = [];

  console.log(`Opening ${BASE_URL}...`);
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForTimeout(2500);
  await page.waitForTimeout(1000);

  for (const progress of PROGRESS_STEPS) {
    await page.evaluate((p) => {
      window.__portfolioScrollDebug?.scrollToProgress(p);
    }, progress);
    await page.waitForTimeout(400);

    const snapshot = await page.evaluate((p) => {
      const transition =
        window.__portfolioScrollDebug?.getTransitionAt?.(p) ?? null;
      const state = window.__portfolioScrollDebug?.getState?.() ?? null;
      return { transition, state };
    }, progress);

    const tag = `p${String(Math.round(progress * 1000)).padStart(4, "0")}`;
    const entry = { step: tag, progress, ...snapshot };
    log.push(entry);

    await page.screenshot({ path: path.join(OUT_DIR, `${tag}.png`) });

    const t = snapshot.transition;
    const wash = t?.handoffWash ?? 0;
    const gap = 1 - (t?.visualCoverage ?? 0);
    const flag =
      wash > 0.25 && gap > 0.15 ? " ⚠️ WHITE-RISK" : wash > 0.35 ? " ⚠️ WASH" : "";

    console.log(
      `${tag}  wash=${wash.toFixed(3)}  preview=${t?.curatePreview?.toFixed(3)}  work=${t?.workGallery?.toFixed(3)}  gap=${gap.toFixed(3)}  chrome=${t?.workChrome?.toFixed(3)}${flag}`,
    );
  }

  // Work gallery wheel test at lock
  await page.evaluate(() => {
    window.__portfolioScrollDebug?.scrollToProgress(0.64);
  });
  await page.waitForTimeout(1200);

  await page.mouse.move(720, 450);

  const before = await page.evaluate(() => window.__portfolioScrollDebug?.getState?.());

  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, -180);
    await page.waitForTimeout(100);
  }

  const afterUp = await page.evaluate(() => window.__portfolioScrollDebug?.getState?.());

  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, 180);
    await page.waitForTimeout(100);
  }

  const afterDown = await page.evaluate(() => window.__portfolioScrollDebug?.getState?.());

  log.push({
    step: "gallery-wheel",
    before,
    afterUp,
    afterDown,
    upDelta:
      (afterUp?.bridge?.targetVirtualScroll ?? 0) -
      (before?.bridge?.targetVirtualScroll ?? 0),
    downDelta:
      (afterDown?.bridge?.targetVirtualScroll ?? 0) -
      (afterUp?.bridge?.targetVirtualScroll ?? 0),
  });

  console.log("\n=== Gallery wheel (at 0.64) ===");
  console.log(
    JSON.stringify(log[log.length - 1], null, 2),
  );

  const whiteRisk = log
    .filter((e) => e.transition)
    .sort(
      (a, b) =>
        (b.transition.handoffWash ?? 0) * (1 - (b.transition.visualCoverage ?? 1)) -
        (a.transition.handoffWash ?? 0) * (1 - (a.transition.visualCoverage ?? 1)),
    )[0];

  if (whiteRisk?.transition) {
    console.log(
      `\nPeak white-risk band: progress ${whiteRisk.progress} (wash=${whiteRisk.transition.handoffWash?.toFixed(3)}, coverage gap=${(1 - whiteRisk.transition.visualCoverage).toFixed(3)})`,
    );
  }

  await writeFile(path.join(OUT_DIR, "transition-log.json"), JSON.stringify(log, null, 2));
  await browser.close();
  console.log(`\nLog + screenshots → ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
