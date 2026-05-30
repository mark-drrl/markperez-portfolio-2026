/**
 * Desktop home scroll choreography (progress 0–1 on main scroll height).
 */

import {
  desktopCurateFrostBlurPx,
  desktopWorkHandoffFrostBlurPx,
} from "@/lib/curateFrostedBlur";

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

/** Edge glass trails chrome slightly, settles before scroll lock. */
export const DESKTOP_WORK_EDGE_START = 0.59;
export const DESKTOP_WORK_EDGE_END = 0.68;

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

export function desktopCreateCurateGlassOpacity(progress: number) {
  if (progress <= DESKTOP_CREATE_CURATE_BLEND_START) {
    return 0;
  }

  if (progress >= DESKTOP_CREATE_CURATE_BLEND_END) {
    return 0;
  }

  const peak =
    (DESKTOP_CREATE_CURATE_BLEND_START + DESKTOP_CREATE_CURATE_BLEND_END) / 2;

  if (progress <= peak) {
    return linearMap(
      progress,
      DESKTOP_CREATE_CURATE_BLEND_START,
      peak,
      0,
      0.55,
    );
  }

  return linearMap(progress, peak, DESKTOP_CREATE_CURATE_BLEND_END, 0.55, 0);
}

export function desktopCreateExitBlurPx(progress: number) {
  if (progress < 0.48 || progress >= DESKTOP_CREATE_FADE_OUT_END) {
    return 0;
  }

  return linearMap(progress, 0.48, DESKTOP_CREATE_FADE_OUT_END, 0, 14);
}

/** Section blur only while Curate is entering — not during box fill or handoff. */
export function desktopCurateEntranceBlurPx(progress: number) {
  if (progress < 0.34) {
    return 24;
  }

  if (progress < DESKTOP_CURATE_REVEAL_END) {
    return linearMap(progress, 0.34, DESKTOP_CURATE_REVEAL_END, 24, 0);
  }

  return 0;
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

/** Blur on images inside shells only (not the gray boxes). */
export function desktopCurateCellImageBlurPx(
  _cellFillAmount: number,
  scrollProgress?: number,
) {
  if (scrollProgress === undefined) {
    return DESKTOP_CURATE_CELL_BLUR_PX;
  }

  return desktopCurateFrostBlurPx(scrollProgress);
}

/** Frost is per-cell — no extra preview wrapper blur (keeps gray shells sharp). */
export function desktopCuratePreviewGlassBlurPx(_progress: number) {
  return 0;
}

/** @deprecated Use desktopCuratePreviewGlassBlurPx */
export function desktopCurateWorkGlassBlurPx(progress: number) {
  return desktopCuratePreviewGlassBlurPx(progress);
}

export function desktopCuratePreviewHandoffBlurPx(progress: number) {
  return desktopCuratePreviewGlassBlurPx(progress);
}

export function desktopCuratePreviewLayerBlurPx(progress: number) {
  if (progress < 0.33 || progress >= DESKTOP_CURATE_WORK_HANDOFF_START) {
    return 0;
  }

  if (progress < DESKTOP_CURATE_REVEAL_END) {
    return 10;
  }

  if (progress < DESKTOP_CREATE_CURATE_BLEND_START) {
    return 6;
  }

  return linearMap(
    progress,
    DESKTOP_CREATE_CURATE_BLEND_START,
    DESKTOP_CURATE_TEXT_EXIT_START,
    6,
    0,
  );
}

/** No full-screen wash — crossfade only (prevents white flash). */
export function desktopCurateHandoffWashOpacity(_progress: number) {
  return 0;
}

/** Frosted glass peaks mid handoff — off once Work is locked. */
export function desktopCurateWorkHandoffGlassOpacity(progress: number) {
  if (progress < DESKTOP_CURATE_WORK_HANDOFF_START) {
    return 0;
  }

  if (progress >= DESKTOP_WORK_ENTER_PROGRESS) {
    return 0;
  }

  const span = DESKTOP_WORK_ENTER_PROGRESS - DESKTOP_CURATE_WORK_HANDOFF_START;
  const t = (progress - DESKTOP_CURATE_WORK_HANDOFF_START) / span;

  return 0.38 * Math.sin(t * Math.PI);
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

/** Gallery is full strength inside the Work layer; layer opacity handles the crossfade. */
export function desktopWorkGalleryOpacity(progress: number) {
  return progress >= DESKTOP_CURATE_WORK_HANDOFF_START ? 1 : 0;
}

/** Work sharp by scroll lock — no lingering blur on the gallery. */
export function desktopWorkGalleryHandoffBlurPx(progress: number) {
  if (progress < DESKTOP_CURATE_WORK_HANDOFF_START) {
    return 0;
  }

  if (progress >= DESKTOP_WORK_ENTER_PROGRESS) {
    return 0;
  }

  const amount = smoothStep(
    linearMap(
      progress,
      DESKTOP_CURATE_WORK_HANDOFF_START,
      DESKTOP_WORK_ENTER_PROGRESS,
      0,
      1,
    ),
  );

  return desktopWorkHandoffFrostBlurPx(progress);
}

export function desktopGalleryHandoffBlurPx(progress: number) {
  return desktopWorkGalleryHandoffBlurPx(progress);
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

export function desktopWorkEdgeVignetteOpacity(progress: number) {
  if (progress < DESKTOP_WORK_EDGE_START) {
    return 0;
  }

  if (progress >= DESKTOP_WORK_EDGE_END) {
    return 1;
  }

  return smoothStep(
    linearMap(
      progress,
      DESKTOP_WORK_EDGE_START,
      DESKTOP_WORK_EDGE_END,
      0,
      1,
    ),
  );
}

/** Curate shell stays until Work gallery covers it. */
export function desktopCurateLayerOpacity(progress: number) {
  if (progress < 0.34) {
    return 0;
  }

  if (progress < 0.42) {
    return (progress - 0.34) / 0.08;
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

export function desktopGalleryVisualCoverage(progress: number) {
  const preview = desktopCuratePreviewOpacity(progress);
  const work = desktopWorkLayerOpacity(progress);

  return clamp01(preview + work * (1 - preview));
}

export const DESKTOP_CURATE_TEXT_FADE_START = DESKTOP_CURATE_TEXT_EXIT_START;
export const DESKTOP_CURATE_TEXT_FADE_END = DESKTOP_CURATE_TEXT_EXIT_END;
