/**
 * Video optimizer for portfolio-2026.
 * Re-encodes videos with H.264 crf28 (or crf24 for hero), max 1600px width,
 * movflags +faststart. Audio stripped for pure ambient loops; kept for reels/films
 * that users may watch with sound.
 *
 * - Overwrites in place (originals remain in git history).
 * - If the re-encoded file is LARGER than the original, the original is kept.
 * - Uses ffmpeg-static; no system ffmpeg required.
 */

import { spawnSync } from "child_process";
import { statSync, renameSync, unlinkSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const FFMPEG = (await import("ffmpeg-static")).default;

/** Resolve a public/ relative path to an absolute path */
function pub(rel) {
  return resolve(ROOT, "public", rel);
}

/**
 * @typedef {Object} VideoJob
 * @property {string} path - Relative to public/
 * @property {number} crf - CRF value (lower = higher quality, bigger file)
 * @property {boolean} stripAudio - Whether to drop the audio stream
 */

/** Videos to process in priority order */
const JOBS = [
  // Homepage ambient loops — strip audio, moderate crf
  { path: "GRADIENT.mp4",            crf: 28, stripAudio: true  },
  { path: "hero-loop.mp4",           crf: 24, stripAudio: false }, // hero: high quality, keep audio just in case

  // WakeDubai reels (biggest — 13–45 MB each)
  { path: "wakedubai/wd-1.mp4",      crf: 28, stripAudio: false },
  { path: "wakedubai/wd-2.mp4",      crf: 28, stripAudio: false },
  { path: "wakedubai/wd-3.mp4",      crf: 28, stripAudio: false },
  { path: "wakedubai/wd-4.mp4",      crf: 28, stripAudio: false },
  { path: "wakedubai/wd-5.mp4",      crf: 28, stripAudio: false },
  { path: "wakedubai/wd-6.mp4",      crf: 28, stripAudio: false },
  { path: "wakedubai/wd-7.mp4",      crf: 28, stripAudio: false },

  // LSB reels (15–21 MB each)
  { path: "lsb/lsb-7.mp4",          crf: 28, stripAudio: false },
  { path: "lsb/lsb-8.mp4",          crf: 28, stripAudio: false },
  { path: "lsb/lsb-9.mp4",          crf: 28, stripAudio: false },
  { path: "lsb/lsb-10.mp4",         crf: 28, stripAudio: false },
  { path: "lsb/COMMERCIAL_IVwVO.mp4",crf: 28, stripAudio: false },

  // Nautique film
  { path: "nautique/nautique-3.mp4", crf: 28, stripAudio: false },

  // Sashimi / Phase5 reel
  { path: "sashimi/REEL 1_SASHIMI.mp4", crf: 28, stripAudio: false },
];

const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes per file

function sizeOf(absPath) {
  try {
    return statSync(absPath).size;
  } catch {
    return 0;
  }
}

function fmt(bytes) {
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

const results = [];

for (const job of JOBS) {
  const input = pub(job.path);

  if (!existsSync(input)) {
    results.push({ path: job.path, status: "SKIPPED (not found)" });
    continue;
  }

  const beforeBytes = sizeOf(input);
  const tmp = input + ".tmp.mp4";

  const args = [
    "-y",
    "-i", input,
    "-c:v", "libx264",
    "-crf", String(job.crf),
    "-preset", "veryfast",
    "-vf", "scale='min(1600,iw)':-2",
    "-movflags", "+faststart",
    ...(job.stripAudio ? ["-an"] : ["-c:a", "aac", "-b:a", "128k"]),
    tmp,
  ];

  console.log(`\n→ ${job.path} (${fmt(beforeBytes)}) crf=${job.crf} audio=${job.stripAudio ? "strip" : "keep"}`);

  const result = spawnSync(FFMPEG, args, {
    timeout: TIMEOUT_MS,
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0 || result.error) {
    const errMsg = result.error?.message || result.stderr?.toString().slice(-200) || "unknown";
    console.error(`  FAILED: ${errMsg}`);
    if (existsSync(tmp)) unlinkSync(tmp);
    results.push({ path: job.path, before: fmt(beforeBytes), status: "FAILED", error: errMsg });
    continue;
  }

  const afterBytes = sizeOf(tmp);

  if (afterBytes === 0 || afterBytes >= beforeBytes) {
    console.log(`  NOT SMALLER (${fmt(beforeBytes)} → ${fmt(afterBytes)}) — keeping original`);
    if (existsSync(tmp)) unlinkSync(tmp);
    results.push({ path: job.path, before: fmt(beforeBytes), after: fmt(afterBytes), status: "KEPT ORIGINAL (not smaller)" });
    continue;
  }

  renameSync(tmp, input);
  const savings = fmt(beforeBytes - afterBytes);
  console.log(`  ✓ ${fmt(beforeBytes)} → ${fmt(afterBytes)} (saved ${savings})`);
  results.push({ path: job.path, before: fmt(beforeBytes), after: fmt(afterBytes), saved: savings, status: "OK" });
}

console.log("\n\n=== VIDEO OPTIMIZATION RESULTS ===");
console.log("| File | Before | After | Saved | Status |");
console.log("|------|--------|-------|-------|--------|");
for (const r of results) {
  const before = r.before || "-";
  const after = r.after || "-";
  const saved = r.saved || "-";
  console.log(`| ${r.path} | ${before} | ${after} | ${saved} | ${r.status} |`);
}
