/**
 * Poster frame generator for portfolio-2026 case study videos.
 * Extracts a frame at 0.5s from each video that renders in CaseStudyFilm or
 * CaseStudyReels, saves as JPEG (quality ~75, max 1280px wide) next to the video.
 *
 * Poster files are named "<video-basename>-poster.jpg".
 *
 * Run: node scripts/generate-video-posters.mjs
 */

import { spawnSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { resolve, dirname, extname, basename } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const FFMPEG = (await import("ffmpeg-static")).default;
const SCRATCHPAD = "/tmp/poster-frames";

mkdirSync(SCRATCHPAD, { recursive: true });

/** public/-relative paths for all videos that render in CaseStudyFilm or CaseStudyReels */
const VIDEO_SRCS = [
  // CaseStudyFilm (local kind)
  "/nautique/nautique-3.mp4",
  "/sashimi/REEL 1_SASHIMI.mp4",

  // CaseStudyReels (LSB)
  "/lsb/VALENTINES.mp4",
  "/lsb/COMMERCIAL_IVwVO.mp4",
  "/lsb/lsb-7.mp4",
  "/lsb/lsb-8.mp4",
  "/lsb/lsb-9.mp4",
  "/lsb/lsb-10.mp4",

  // CaseStudyReels (Wake Dubai)
  "/wakedubai/wd-1.mp4",
  "/wakedubai/wd-2.mp4",
  "/wakedubai/wd-3.mp4",
  "/wakedubai/wd-4.mp4",
  "/wakedubai/wd-5.mp4",
  "/wakedubai/wd-6.mp4",
];

function pub(src) {
  return resolve(ROOT, "public", src.replace(/^\//, ""));
}

function posterDest(videoAbsPath) {
  const ext = extname(videoAbsPath);
  return videoAbsPath.replace(ext, "-poster.jpg");
}

const results = [];

for (const src of VIDEO_SRCS) {
  const inputAbs = pub(src);
  const outputAbs = posterDest(inputAbs);

  if (!existsSync(inputAbs)) {
    results.push({ src, status: "SKIPPED (not found)" });
    continue;
  }

  if (existsSync(outputAbs)) {
    console.log(`→ ${src} — poster already exists, skipping`);
    results.push({ src, status: "SKIPPED (already exists)", dest: outputAbs });
    continue;
  }

  const tmpPng = resolve(SCRATCHPAD, basename(inputAbs) + ".png");

  // Extract frame at 0.5s (or first keyframe if video < 0.5s)
  const ffmpegResult = spawnSync(
    FFMPEG,
    [
      "-y",
      "-ss", "0.5",
      "-i", inputAbs,
      "-vframes", "1",
      "-vf", "scale='min(1280,iw)':-2",
      "-f", "image2",
      tmpPng,
    ],
    { timeout: 30000, stdio: ["ignore", "pipe", "pipe"] }
  );

  if (ffmpegResult.status !== 0 || !existsSync(tmpPng)) {
    // Try first frame if 0.5s failed
    const fallbackResult = spawnSync(
      FFMPEG,
      ["-y", "-i", inputAbs, "-vframes", "1", "-vf", "scale='min(1280,iw)':-2", "-f", "image2", tmpPng],
      { timeout: 30000, stdio: ["ignore", "pipe", "pipe"] }
    );
    if (fallbackResult.status !== 0 || !existsSync(tmpPng)) {
      const err = ffmpegResult.stderr?.toString().slice(-200) || "unknown";
      results.push({ src, status: `FAILED: ${err}` });
      continue;
    }
  }

  try {
    await sharp(tmpPng)
      .jpeg({ quality: 75 })
      .toFile(outputAbs);
    console.log(`✓ ${src} → ${basename(outputAbs)}`);
    results.push({ src, dest: outputAbs, status: "OK" });
  } catch (err) {
    results.push({ src, status: `SHARP FAILED: ${err.message}` });
  }
}

console.log("\n=== POSTER GENERATION RESULTS ===");
for (const r of results) {
  console.log(`${r.status.startsWith("OK") ? "✓" : "✗"} ${r.src} → ${r.status}`);
}
