/**
 * Log transition opacities without a browser (pure math from desktopHomeTransitions).
 * Run: node scripts/debug-transitions-log.mjs
 */
import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);

// Load compiled transitions via tsx if available; otherwise inline require won't work.
// Use dynamic import through Next's transpilation — simplest: spawn tsx.
const { execSync } = await import("node:child_process");

const script = `
import {
  desktopCreateCurateGlassOpacity,
  desktopCurateHandoffWashOpacity,
  desktopCurateLayerOpacity,
  desktopCuratePreviewOpacity,
  desktopGalleryVisualCoverage,
  desktopWorkChromeOpacity,
  desktopWorkGalleryOpacity,
} from "./src/lib/desktopHomeTransitions.ts";

const steps = [0.5, 0.52, 0.54, 0.56, 0.58, 0.59, 0.6, 0.61, 0.62, 0.63, 0.64, 0.66];
const rows = steps.map((progress) => {
  const wash = desktopCurateHandoffWashOpacity(progress);
  const preview = desktopCuratePreviewOpacity(progress);
  const work = desktopWorkGalleryOpacity(progress);
  const gap = 1 - desktopGalleryVisualCoverage(progress);
  return {
    progress,
    curateLayer: desktopCurateLayerOpacity(progress),
    preview,
    handoffWash: wash,
    createCurateGlass: desktopCreateCurateGlassOpacity(progress),
    work,
    workChrome: desktopWorkChromeOpacity(progress),
    gap,
    whiteRisk: wash * gap,
  };
});
console.log(JSON.stringify(rows, null, 2));
`;

const out = execSync(`npx --yes tsx -e ${JSON.stringify(script)}`, {
  cwd: path.join(import.meta.dirname, ".."),
  encoding: "utf8",
  stdio: ["pipe", "pipe", "pipe"],
});

const rows = JSON.parse(out);
const peak = rows.reduce((a, b) => (b.whiteRisk > a.whiteRisk ? b : a), rows[0]);

console.log("Curate → Work transition opacity log\n");
for (const r of rows) {
  const flag = r.whiteRisk > 0.12 ? " ⚠️ WHITE-RISK" : r.handoffWash > 0.3 ? " ⚠️ WASH" : "";
  console.log(
    `p=${r.progress.toFixed(2)}  wash=${r.handoffWash.toFixed(3)}  preview=${r.preview.toFixed(3)}  work=${r.work.toFixed(3)}  gap=${r.gap.toFixed(3)}  glass=${r.createCurateGlass.toFixed(3)}${flag}`,
  );
}

console.log(
  `\nPeak white-risk: progress=${peak.progress} whiteRisk=${peak.whiteRisk.toFixed(3)} (wash=${peak.handoffWash.toFixed(3)} × gap=${peak.gap.toFixed(3)})`,
);

await writeFile(
  path.join(import.meta.dirname, "debug-output", "transition-opacity-log.json"),
  JSON.stringify({ rows, peak }, null, 2),
);

console.log("\nWrote scripts/debug-output/transition-opacity-log.json");
