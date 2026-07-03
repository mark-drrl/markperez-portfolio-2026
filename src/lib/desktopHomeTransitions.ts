/**
 * Desktop home scroll choreography (progress 0–1 on main scroll height).
 */

import {
  desktopCurateFrostBlurPx,
  desktopWorkHandoffFrostBlurPx,
} from "@/lib/curateFrostedBlur";

// ---------------------------------------------------------------------------
// Reduced-motion: collapses all translate curves to 0 (fades only).
// Evaluated once at module load — safe because React hydrates client-side.
// ---------------------------------------------------------------------------
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Keep in sync with `WORK_ENTER_PROGRESS` in `desktopWorkScroll.ts`. */
export const DESKTOP_WORK_ENTER_PROGRESS = 0.64;

export const DESKTOP_CREATE_FADE_OUT_END = 0.58;
export const DESKTOP_CURATE_REVEAL_END = 0.42;

export const DESKTOP_CREATE_CURATE_BLEND_START = 0.48;
export const DESKTOP_CREATE_CURATE_BLEND_END = 0.58;

/** Curate copy fades before grid handoff. */
export const DESKTOP_CURATE_TEXT_EXIT_START = 0.52;
export const DESKTOP_CURATE_TEXT_EXIT_END = 0.58;

/** Grid fully populated, then crossfade to Work (after last cell ~0.58). */
export const DESKTOP_CURATE_WORK_HANDOFF_START = 0.58;
/** Opacity crossfade — slightly longer than scroll lock for a softer blend. */
export const DESKTOP_CURATE_WORK_HANDOFF_END = 0.655;

/** Glass unblur continues slightly past opacity crossfade. */
export const DESKTOP_CURATE_WORK_UNBLUR_END = 0.72;

/** @deprecated Use DESKTOP_CURATE_FROST_BLUR_PX in `curateFrostedBlur.ts`. */
export const DESKTOP_CURATE_CELL_BLUR_PX = 38;

/** Work chrome — full strength by handoff end. */
export const DESKTOP_WORK_CHROME_START = 0.58;
export const DESKTOP_WORK_CHROME_END = DESKTOP_CURATE_WORK_HANDOFF_END;

/** Edge glass trails chrome slightly — MUST reach full before the work scroll lock at 0.64. */
export const DESKTOP_WORK_EDGE_START = 0.59;
export const DESKTOP_WORK_EDGE_END = 0.635;

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

export function blurPxToFilter(px: number) {
  return px <= 0.35 ? "blur(0px)" : `blur(${px.toFixed(1)}px)`;
}

/** Blurred plate behind the Curate grid while boxes fill. */
export function desktopCurateAmbienceOpacity(progress: number) {
  if (progress < 0.34) {
    return 0;
  }

  if (progress < DESKTOP_CURATE_REVEAL_END) {
    return linearMap(progress, 0.34, DESKTOP_CURATE_REVEAL_END, 0, 1);
  }

  if (progress < DESKTOP_CURATE_WORK_HANDOFF_START) {
    return 1;
  }

  if (progress >= DESKTOP_CURATE_WORK_HANDOFF_END) {
    return 0;
  }

  return (
    1 -
    smoothStep(
      linearMap(
        progress,
        DESKTOP_CURATE_WORK_HANDOFF_START,
        DESKTOP_CURATE_WORK_HANDOFF_END,
        0,
        1,
      ),
    )
  );
}

/** Shared 0→1 mix for Curate preview out / Work gallery in (no empty plate between). */
export function desktopCurateWorkHandoffMix(progress: number) {
  if (progress < DESKTOP_CURATE_WORK_HANDOFF_START) {
    return 0;
  }

  if (progress >= DESKTOP_CURATE_WORK_HANDOFF_END) {
    return 1;
  }

  return smoothStep(
    linearMap(
      progress,
      DESKTOP_CURATE_WORK_HANDOFF_START,
      DESKTOP_CURATE_WORK_HANDOFF_END,
      0,
      1,
    ),
  );
}

export function desktopCuratePreviewOpacity(progress: number) {
  let reveal = 0;

  if (progress >= DESKTOP_CURATE_REVEAL_END) {
    reveal = 1;
  } else if (progress >= 0.33) {
    reveal = (progress - 0.33) / (DESKTOP_CURATE_REVEAL_END - 0.33);
  }

  if (progress < DESKTOP_CURATE_WORK_HANDOFF_START) {
    return reveal;
  }

  if (progress >= DESKTOP_CURATE_WORK_HANDOFF_END) {
    return 0;
  }

  return reveal * (1 - desktopCurateWorkHandoffMix(progress));
}

/** Gray grid shells — sharp, visible before images ripple in. */
export function desktopCurateGridShellOpacity(progress: number) {
  if (progress < 0.34) {
    return 0;
  }

  if (progress < 0.37) {
    return (progress - 0.34) / 0.03;
  }

  if (progress >= DESKTOP_CURATE_WORK_HANDOFF_END) {
    return 0;
  }

  return 1;
}

export function desktopCurateTextOpacity(progress: number) {
  if (progress < DESKTOP_CURATE_TEXT_EXIT_START) {
    return 1;
  }

  if (progress >= DESKTOP_CURATE_TEXT_EXIT_END) {
    return 0;
  }

  return (
    1 -
    smoothStep(
      linearMap(
        progress,
        DESKTOP_CURATE_TEXT_EXIT_START,
        DESKTOP_CURATE_TEXT_EXIT_END,
        0,
        1,
      ),
    )
  );
}

export function desktopCurateSubtitleOpacity(progress: number) {
  let visible = 0;

  if (progress >= 0.45) {
    visible = 1;
  } else if (progress >= 0.39) {
    visible = (progress - 0.39) / 0.06;
  }

  return visible * desktopCurateTextOpacity(progress);
}

export function desktopWorkChromeOpacity(progress: number) {
  if (progress < DESKTOP_WORK_CHROME_START) {
    return 0;
  }

  if (progress >= DESKTOP_WORK_CHROME_END) {
    return 1;
  }

  return smoothStep(
    linearMap(
      progress,
      DESKTOP_WORK_CHROME_START,
      DESKTOP_WORK_CHROME_END,
      0,
      1,
    ),
  );
}

/** Curate shell stays until Work gallery covers it. Ramps fast to fully cover Create (no text bleed). */
export function desktopCurateLayerOpacity(progress: number) {
  if (progress < 0.34) {
    return 0;
  }

  if (progress < 0.375) {
    return (progress - 0.34) / 0.035;
  }

  if (progress >= DESKTOP_CURATE_WORK_HANDOFF_END) {
    return 0;
  }

  return 1;
}

/** Fades the whole Work stack in over Curate — never an empty #EAEAEA sheet. */
export function desktopWorkLayerOpacity(progress: number) {
  if (progress >= DESKTOP_CURATE_WORK_HANDOFF_END) {
    return 1;
  }

  return desktopCurateWorkHandoffMix(progress);
}

export function desktopWorkBackdropOpacity(progress: number) {
  return desktopWorkLayerOpacity(progress);
}

/**
 * Red thread draw progress (0 = no line, 1 = fully drawn).
 * At p=0 a short segment is visible hanging into the hero (draw ≈ 0.18),
 * completing at p ≈ 0.58 (before Curate→Work handoff).
 * Formula: 0.18 + 0.82 * min(p/0.58, 1)
 */
export function desktopRedThreadDrawProgress(progress: number): number {
  return 0.18 + 0.82 * Math.min(progress / 0.58, 1);
}

/**
 * Red thread opacity: visible from progress 0 at 0.65 (no fade-in delay);
 * at 0.62–0.66 eases down to 0.45 and holds at 0.45 for the rest
 * (thread stays alive in Work gallery, peeking between tiles at z-[33]).
 */
export function desktopRedThreadOpacity(progress: number): number {
  if (prefersReducedMotion) return 0.35; // Fully drawn, low opacity
  if (progress < 0.62) return 0.65;
  if (progress < 0.66) return linearMap(progress, 0.62, 0.66, 0.65, 0.45);
  return 0.45;
}
