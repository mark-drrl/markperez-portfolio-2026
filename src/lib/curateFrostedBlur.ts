/**
 * Desktop Curate “frosted glass” look — moderate blur + film grain (reference plate).
 * Timing constants mirror `desktopHomeTransitions.ts`.
 */

/** Matches Figma Curate BLUR layer (node 15:52). */
export const DESKTOP_CURATE_FROST_BLUR_PX = 16.45;

/** Fine grain overlay strength while frosted. */
export const DESKTOP_CURATE_FROST_GRAIN_OPACITY = 0.5;

const CURATE_WORK_HANDOFF_START = 0.58;
const CURATE_WORK_UNBLUR_END = 0.72;
const WORK_ENTER_PROGRESS = 0.64;

export const FROSTED_GRAIN_TEXTURE =
  'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 48 48\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\' x=\'0\' y=\'0\' width=\'100%25\' height=\'100%25\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'3.4\' numOctaves=\'5\' seed=\'21\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'48\' height=\'48\' fill=\'black\' filter=\'url(%23noise)\' opacity=\'0.95\'/%3E%3C/svg%3E")';

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothStep(amount: number) {
  const t = clamp01(amount);

  return t * t * (3 - 2 * t);
}

function linearMap(
  progress: number,
  start: number,
  end: number,
  outStart: number,
  outEnd: number,
) {
  if (progress <= start) {
    return outStart;
  }

  if (progress >= end) {
    return outEnd;
  }

  const amount = (progress - start) / (end - start);

  return outStart + (outEnd - outStart) * amount;
}

/** 1 = full frost on Curate, 0 = sharp (handoff complete). */
export function desktopCurateFrostStrength(progress: number) {
  if (progress < CURATE_WORK_HANDOFF_START) {
    return 1;
  }

  if (progress >= CURATE_WORK_UNBLUR_END) {
    return 0;
  }

  return (
    1 -
    smoothStep(
      linearMap(
        progress,
        CURATE_WORK_HANDOFF_START,
        CURATE_WORK_UNBLUR_END,
        0,
        1,
      ),
    )
  );
}

/** Work gallery frost only during crossfade — sharp at scroll lock. */
export function desktopWorkHandoffFrostStrength(progress: number) {
  if (progress < CURATE_WORK_HANDOFF_START) {
    return 0;
  }

  if (progress >= WORK_ENTER_PROGRESS) {
    return 0;
  }

  return (
    1 -
    smoothStep(
      linearMap(
        progress,
        CURATE_WORK_HANDOFF_START,
        WORK_ENTER_PROGRESS,
        0,
        1,
      ),
    )
  );
}

export function desktopCurateFrostBlurPx(progress: number) {
  return DESKTOP_CURATE_FROST_BLUR_PX * desktopCurateFrostStrength(progress);
}

export function desktopWorkHandoffFrostBlurPx(progress: number) {
  return DESKTOP_CURATE_FROST_BLUR_PX * desktopWorkHandoffFrostStrength(progress);
}

export function curateFrostedImageFilter(blurPx: number) {
  if (blurPx <= 0.35) {
    return "blur(0px)";
  }

  return `blur(${blurPx.toFixed(1)}px) contrast(1.06) brightness(0.97)`;
}

export function desktopCurateFrostGrainOpacity(
  progress: number,
  cellFillAmount = 1,
) {
  const fill = clamp01(cellFillAmount);

  if (fill <= 0.02) {
    return 0;
  }

  return (
    DESKTOP_CURATE_FROST_GRAIN_OPACITY *
    desktopCurateFrostStrength(progress) *
    Math.min(1, fill / 0.12)
  );
}
