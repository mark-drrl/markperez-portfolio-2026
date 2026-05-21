/**
 * Desktop home scroll choreography — single source of truth for section crossfades.
 * Progress 0–1 maps to main scroll height (Work locks at WORK_HANDOFF_END).
 */

export const DESKTOP_CREATE_FADE_OUT_START = 0.52;
export const DESKTOP_CREATE_FADE_OUT_END = 0.58;
export const DESKTOP_CURATE_VISIBLE_START = 0.34;
export const DESKTOP_CURATE_REVEAL_END = 0.42;

/** Create → Curate glass + blur overlap */
export const DESKTOP_CREATE_CURATE_BLEND_START = 0.48;
export const DESKTOP_CREATE_CURATE_BLEND_END = 0.58;

/** Curate preview ↔ Work gallery crossfade */
export const DESKTOP_CURATE_WORK_HANDOFF_START = 0.58;
export const DESKTOP_CURATE_WORK_HANDOFF_END = 0.64;

/** Work chrome (nav/footer) enters after gallery is mostly visible */
export const DESKTOP_WORK_CHROME_START = 0.6;
export const DESKTOP_WORK_CHROME_END = 0.66;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
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

export function desktopCreateCurateGlassOpacity(progress: number) {
  if (progress <= DESKTOP_CREATE_CURATE_BLEND_START) {
    return 0;
  }

  if (progress >= DESKTOP_CREATE_CURATE_BLEND_END) {
    return 0;
  }

  const peak = (DESKTOP_CREATE_CURATE_BLEND_START + DESKTOP_CREATE_CURATE_BLEND_END) / 2;

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

/** Section-level blur while Create exits and Curate images finish rippling in. */
export function desktopCreateExitBlurPx(progress: number) {
  if (progress < 0.48 || progress >= DESKTOP_CREATE_FADE_OUT_END) {
    return 0;
  }

  return linearMap(progress, 0.48, DESKTOP_CREATE_FADE_OUT_END, 0, 14);
}

export function desktopCurateEntranceBlurPx(progress: number) {
  if (progress < DESKTOP_CURATE_VISIBLE_START) {
    return 24;
  }

  if (progress < DESKTOP_CURATE_REVEAL_END) {
    return linearMap(
      progress,
      DESKTOP_CURATE_VISIBLE_START,
      DESKTOP_CURATE_REVEAL_END,
      24,
      0,
    );
  }

  if (progress < DESKTOP_CREATE_CURATE_BLEND_START) {
    return 0;
  }

  if (progress < DESKTOP_CREATE_CURATE_BLEND_END) {
    return linearMap(
      progress,
      DESKTOP_CREATE_CURATE_BLEND_START,
      DESKTOP_CREATE_CURATE_BLEND_END,
      0,
      10,
    );
  }

  return 0;
}

export function desktopCuratePreviewOpacity(progress: number) {
  let reveal = 0;

  if (progress >= DESKTOP_CURATE_REVEAL_END) {
    reveal = 1;
  } else if (progress >= 0.33) {
    reveal = (progress - 0.33) / (DESKTOP_CURATE_REVEAL_END - 0.33);
  }

  if (progress <= DESKTOP_CURATE_WORK_HANDOFF_START) {
    return reveal;
  }

  if (progress >= DESKTOP_CURATE_WORK_HANDOFF_END) {
    return 0;
  }

  const handoffAmount =
    (progress - DESKTOP_CURATE_WORK_HANDOFF_START) /
    (DESKTOP_CURATE_WORK_HANDOFF_END - DESKTOP_CURATE_WORK_HANDOFF_START);

  return reveal * (1 - handoffAmount);
}

export function desktopCuratePreviewHandoffBlurPx(progress: number) {
  if (progress < 0.5) {
    return 0;
  }

  if (progress < DESKTOP_CURATE_WORK_HANDOFF_START) {
    return linearMap(progress, 0.5, DESKTOP_CURATE_WORK_HANDOFF_START, 0, 6);
  }

  if (progress < DESKTOP_CURATE_WORK_HANDOFF_END) {
    return linearMap(
      progress,
      DESKTOP_CURATE_WORK_HANDOFF_START,
      DESKTOP_CURATE_WORK_HANDOFF_END,
      6,
      18,
    );
  }

  return 0;
}

export function desktopCurateHandoffWashOpacity(progress: number) {
  if (progress < 0.5) {
    return 0;
  }

  if (progress < DESKTOP_CURATE_WORK_HANDOFF_START) {
    return linearMap(progress, 0.5, DESKTOP_CURATE_WORK_HANDOFF_START, 0, 0.85);
  }

  if (progress < DESKTOP_CURATE_WORK_HANDOFF_END) {
    return linearMap(
      progress,
      DESKTOP_CURATE_WORK_HANDOFF_START,
      DESKTOP_CURATE_WORK_HANDOFF_END,
      0.85,
      0,
    );
  }

  return 0;
}

export function desktopWorkGalleryOpacity(progress: number) {
  return linearMap(
    progress,
    DESKTOP_CURATE_WORK_HANDOFF_START,
    DESKTOP_CURATE_WORK_HANDOFF_END,
    0,
    1,
  );
}

export function desktopWorkGalleryHandoffBlurPx(progress: number) {
  if (progress < DESKTOP_CURATE_WORK_HANDOFF_START) {
    return 0;
  }

  if (progress < DESKTOP_CURATE_WORK_HANDOFF_END) {
    const mid =
      DESKTOP_CURATE_WORK_HANDOFF_START +
      (DESKTOP_CURATE_WORK_HANDOFF_END - DESKTOP_CURATE_WORK_HANDOFF_START) * 0.45;

    if (progress < mid) {
      return linearMap(
        progress,
        DESKTOP_CURATE_WORK_HANDOFF_START,
        mid,
        0,
        16,
      );
    }

    return linearMap(
      progress,
      mid,
      DESKTOP_CURATE_WORK_HANDOFF_END,
      16,
      0,
    );
  }

  return 0;
}

export function desktopWorkChromeOpacity(progress: number) {
  return linearMap(
    progress,
    DESKTOP_WORK_CHROME_START,
    DESKTOP_WORK_CHROME_END,
    0,
    1,
  );
}

export function desktopWorkSectionPresence(progress: number) {
  if (progress < DESKTOP_CURATE_WORK_HANDOFF_START - 0.02) {
    return 0;
  }

  if (progress >= DESKTOP_CURATE_WORK_HANDOFF_END) {
    return 1;
  }

  return linearMap(
    progress,
    DESKTOP_CURATE_WORK_HANDOFF_START - 0.02,
    DESKTOP_CURATE_WORK_HANDOFF_START + 0.02,
    0,
    1,
  );
}

export function blurPxToFilter(px: number) {
  return px <= 0.35 ? "blur(0px)" : `blur(${px.toFixed(1)}px)`;
}

/** Ensures Curate preview + Work gallery never both hit zero during handoff. */
export function desktopGalleryVisualCoverage(progress: number) {
  const preview = desktopCuratePreviewOpacity(progress);
  const work = desktopWorkGalleryOpacity(progress);

  return clamp01(preview + work * (1 - preview));
}
