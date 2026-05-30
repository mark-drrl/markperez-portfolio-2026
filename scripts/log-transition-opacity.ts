import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import {
  desktopCreateCurateGlassOpacity,
  desktopCurateAmbienceOpacity,
  desktopCurateHandoffWashOpacity,
  desktopCurateLayerOpacity,
  desktopCuratePreviewOpacity,
  desktopGalleryVisualCoverage,
  desktopWorkChromeOpacity,
  desktopWorkEdgeVignetteOpacity,
  desktopWorkGalleryOpacity,
} from "../src/lib/desktopHomeTransitions";

const steps = [
  0.5, 0.52, 0.54, 0.56, 0.58, 0.59, 0.6, 0.61, 0.62, 0.63, 0.64, 0.66,
];

const rows = steps.map((progress) => {
  const wash = desktopCurateHandoffWashOpacity(progress);
  const preview = desktopCuratePreviewOpacity(progress);
  const work = desktopWorkGalleryOpacity(progress);
  const gap = 1 - desktopGalleryVisualCoverage(progress);

  return {
    progress,
    curateLayer: desktopCurateLayerOpacity(progress),
    ambience: desktopCurateAmbienceOpacity(progress),
    preview,
    handoffWash: wash,
    createCurateGlass: desktopCreateCurateGlassOpacity(progress),
    work,
    workChrome: desktopWorkChromeOpacity(progress),
    workEdge: desktopWorkEdgeVignetteOpacity(progress),
    gap,
    whiteRisk: wash * gap,
  };
});

const peak = rows.reduce((a, b) => (b.whiteRisk > a.whiteRisk ? b : a), rows[0]);

console.log("Curate → Work transition opacity log\n");

for (const r of rows) {
  const flag =
    r.whiteRisk > 0.12 ? " ⚠️ WHITE-RISK" : r.handoffWash > 0.3 ? " ⚠️ WASH" : "";

  console.log(
    `p=${r.progress.toFixed(2)}  wash=${r.handoffWash.toFixed(3)}  preview=${r.preview.toFixed(3)}  work=${r.work.toFixed(3)}  gap=${r.gap.toFixed(3)}  curateLayer=${r.curateLayer.toFixed(3)}${flag}`,
  );
}

console.log(
  `\nPeak white-risk: p=${peak.progress}  wash×gap=${peak.whiteRisk.toFixed(3)}`,
);

const outDir = path.join(import.meta.dirname, "debug-output");
mkdirSync(outDir, { recursive: true });
writeFileSync(
  path.join(outDir, "transition-opacity-log.json"),
  JSON.stringify({ rows, peak }, null, 2),
);
