/**
 * Desktop home scroll choreography (progress 0–1 on main scroll height).
 */

export const DESKTOP_CREATE_FADE_OUT_END = 0.58;
export const DESKTOP_CURATE_REVEAL_END = 0.42;

export const DESKTOP_CREATE_CURATE_BLEND_START = 0.48;
export const DESKTOP_CREATE_CURATE_BLEND_END = 0.58;

/** Curate preview ↔ Work gallery crossfade */
export const DESKTOP_CURATE_WORK_HANDOFF_START = 0.56;
export const DESKTOP_CURATE_WORK_HANDOFF_END = 0.64;

/** Curate heading/subtitle — ease out as Work chrome eases in */
export const DESKTOP_CURATE_TEXT_FADE_START = 0.6;
export const DESKTOP_CURATE_TEXT_FADE_END = 0.72;

/** Work nav/footer — ramps in during handoff, full from 0.64 onward. */
export const DESKTOP_WORK_CHROME_START = 0.56;
export const DESKTOP_WORK_CHROME_END = 0.64;

/** Top/bottom glass vignettes on Work */
export const DESKTOP_WORK_EDGE_START = 0.6;
export const DESKTOP_WORK_EDGE_END = 0.72;

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

/** Shared bell-curve blur on Work gallery during Curate ↔ Work handoff. */
export function desktopGalleryHandoffBlurPx(progress: number) {
  if (
    progress < DESKTOP_CURATE_WORK_HANDOFF_START ||
    progress >= DESKTOP_CURATE_WORK_HANDOFF_END
  ) {
    return 0;
  }

  const amount =
    (progress - DESKTOP_CURATE_WORK_HANDOFF_START) /
    (DESKTOP_CURATE_WORK_HANDOFF_END - DESKTOP_CURATE_WORK_HANDOFF_START);

  return 5 * Math.sin(amount * Math.PI);
}

/** Glass sweep between Curate and Work — low tint so images stay visible. */
export function desktopCurateWorkHandoffGlassOpacity(progress: number) {
  if (progress < DESKTOP_CURATE_WORK_HANDOFF_START) {
    return 0;
  }

  if (progress >= DESKTOP_CURATE_WORK_HANDOFF_END) {
    return 0;
  }

  const amount =
    (progress - DESKTOP_CURATE_WORK_HANDOFF_START) /
    (DESKTOP_CURATE_WORK_HANDOFF_END - DESKTOP_CURATE_WORK_HANDOFF_START);

  return 0.32 * Math.sin(amount * Math.PI);
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

export function desktopCurateEntranceBlurPx(progress: number) {
  if (progress < 0.34) {
    return 24;
  }

  if (progress < DESKTOP_CURATE_REVEAL_END) {
    return linearMap(progress, 0.34, DESKTOP_CURATE_REVEAL_END, 24, 0);
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

/** Curate ripple cells only — Work gallery takes over during handoff (single source of truth). */
export function desktopCuratePreviewOpacity(progress: number) {
  if (progress >= DESKTOP_CURATE_WORK_HANDOFF_START) {
    return 0;
  }

  if (progress >= DESKTOP_CURATE_REVEAL_END) {
    return 1;
  }

  if (progress >= 0.33) {
    return (progress - 0.33) / (DESKTOP_CURATE_REVEAL_END - 0.33);
  }

  return 0;
}

/** Bokeh on preview grid while cells ripple in (before handoff band). */
export function desktopCuratePreviewRevealBlurPx(progress: number) {
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
    DESKTOP_CREATE_CURATE_BLEND_END,
    6,
    0,
  );
}

export function desktopCuratePreviewLayerBlurPx(progress: number) {
  return desktopCuratePreviewRevealBlurPx(progress);
}

/** In-Curate glass wash during approach to Work handoff band. */
export function desktopCurateHandoffWashOpacity(progress: number) {
  if (progress < 0.52) {
    return 0;
  }

  if (progress < DESKTOP_CURATE_WORK_HANDOFF_START) {
    return linearMap(
      progress,
      0.52,
      DESKTOP_CURATE_WORK_HANDOFF_START,
      0,
      0.55,
    );
  }

  if (progress < DESKTOP_CURATE_WORK_HANDOFF_END) {
    return linearMap(
      progress,
      DESKTOP_CURATE_WORK_HANDOFF_START,
      DESKTOP_CURATE_WORK_HANDOFF_END,
      0.55,
      0,
    );
  }

  return 0;
}

export function desktopCurateTextOpacity(progress: number) {
  if (progress < DESKTOP_CURATE_TEXT_FADE_START) {
    return 1;
  }

  if (progress >= DESKTOP_CURATE_TEXT_FADE_END) {
    return 0;
  }

  return (
    1 -
    smoothStep(
      linearMap(
        progress,
        DESKTOP_CURATE_TEXT_FADE_START,
        DESKTOP_CURATE_TEXT_FADE_END,
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

  if (progress < DESKTOP_CURATE_TEXT_FADE_START) {
    return visible;
  }

  if (progress >= DESKTOP_CURATE_TEXT_FADE_END) {
    return 0;
  }

  return (
    visible *
    (1 -
      smoothStep(
        linearMap(
          progress,
          DESKTOP_CURATE_TEXT_FADE_START,
          DESKTOP_CURATE_TEXT_FADE_END,
          0,
          1,
        ),
      ))
  );
}

export function desktopWorkGalleryOpacity(progress: number) {
  const fadeStart = DESKTOP_CURATE_WORK_HANDOFF_START;
  const fadeEnd = 0.62;

  if (progress < fadeStart) {
    return 0;
  }

  if (progress >= fadeEnd) {
    return 1;
  }

  return smoothStep(linearMap(progress, fadeStart, fadeEnd, 0, 1));
}

/** Optical blur comes from the stack glass layer — not the gallery filter. */
export function desktopWorkGalleryHandoffBlurPx(_progress: number) {
  return 0;
}

export function desktopWorkChromeOpacity(progress: number) {
  if (progress >= DESKTOP_CURATE_WORK_HANDOFF_END) {
    return 1;
  }

  if (progress < DESKTOP_WORK_CHROME_START) {
    return 0;
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
  if (progress >= DESKTOP_CURATE_WORK_HANDOFF_END) {
    return 1;
  }

  if (progress < DESKTOP_WORK_EDGE_START) {
    return 0;
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

/** Fade Curate shell out during handoff so gray fill cannot wash the gallery. */
export function desktopCurateLayerOpacity(progress: number) {
  const base =
    progress < 0.34
      ? 0
      : progress < 0.42
        ? (progress - 0.34) / 0.08
        : 1;

  if (progress < DESKTOP_CURATE_WORK_HANDOFF_START) {
    return base;
  }

  if (progress >= DESKTOP_CURATE_WORK_HANDOFF_END) {
    return 0;
  }

  return (
    base *
    (1 -
      smoothStep(
        linearMap(
          progress,
          DESKTOP_CURATE_WORK_HANDOFF_START,
          DESKTOP_CURATE_WORK_HANDOFF_END,
          0,
          1,
        ),
      ))
  );
}

export function desktopWorkLayerOpacity(progress: number) {
  if (progress < DESKTOP_CURATE_WORK_HANDOFF_START - 0.01) {
    return 0;
  }

  return 1;
}

/** Work backdrop — transparent during crossfade to avoid white/gray under gallery. */
export function desktopWorkBackdropOpacity(progress: number) {
  if (progress >= DESKTOP_CURATE_WORK_HANDOFF_END) {
    return 1;
  }

  if (progress < 0.6) {
    return 0;
  }

  return smoothStep(linearMap(progress, 0.6, DESKTOP_CURATE_WORK_HANDOFF_END, 0, 1));
}

export function desktopGalleryVisualCoverage(progress: number) {
  const preview = desktopCuratePreviewOpacity(progress);
  const work = desktopWorkGalleryOpacity(progress);

  return clamp01(preview + work * (1 - preview));
}
