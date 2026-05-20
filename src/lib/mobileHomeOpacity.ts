/** Piecewise-linear scroll opacity — soft crossfades for mobile home. */
export function interpolateScrollOpacity(
  progress: number,
  input: readonly number[],
  output: readonly number[],
) {
  if (progress <= input[0]) {
    return output[0];
  }

  const lastIndex = input.length - 1;

  if (progress >= input[lastIndex]) {
    return output[lastIndex];
  }

  for (let index = 0; index < lastIndex; index += 1) {
    const start = input[index];
    const end = input[index + 1];

    if (progress >= start && progress <= end) {
      const amount = (progress - start) / (end - start);
      return output[index] + (output[index + 1] - output[index]) * amount;
    }
  }

  return output[lastIndex];
}

export type MobileHomeSection = "hero" | "convey" | "create" | "curate";

/** Same query as useMobileHomeLite — keep in sync. */
export const MOBILE_HOME_MEDIA_QUERY = "(max-width: 767px), (pointer: coarse)";

import type { HomeScrollMode } from "@/hooks/useHomeScrollMode";

/** @deprecated Use HomeScrollMode from useHomeScrollMode — kept for media-query checks only */
export function isMobileHomeScrollViewport() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(MOBILE_HOME_MEDIA_QUERY).matches;
}

/**
 * Pick opacity curve from explicit scroll mode (from useHomeScrollMode).
 *
 * WHY CONVEY KEEPS VANISHING: desktopConveyOpacity hits 0 at ~18% scroll while
 * desktopCreateOpacity is 1 from ~14%. If mode is wrong, Create (z-30, solid bg)
 * covers Convey (opacity 0). Never call this with matchMedia — bind to homeScrollMode.
 */
export function pickHomeSectionOpacity(
  progress: number,
  mode: HomeScrollMode,
  mobile: (value: number) => number,
  desktop: (value: number) => number,
) {
  return mode === "mobile" ? mobile(progress) : desktop(progress);
}

/** Desktop curves — Convey visible only ~1–18% scroll (do not use on mobile tree). */
export const DESKTOP_CONVEY_VISIBLE_UNTIL = 0.18;

/** Total scroll height for the mobile home stack (shorter than desktop). */
export const MOBILE_HOME_SCROLL_VH = 2100;

/** Scroll progress where Work takes over on mobile. */
export const MOBILE_WORK_SCROLL_PROGRESS = 0.78;

/** Scroll spans per section on mobile (progress 0–1). */
export const MOBILE_SECTION_SPAN: Record<
  MobileHomeSection,
  { start: number; end: number }
> = {
  hero: { start: 0, end: 0.12 },
  convey: { start: 0.1, end: 0.38 },
  create: { start: 0.34, end: 0.5 },
  curate: { start: 0.46, end: 0.76 },
};

/** Crossfade width at section boundaries — overlaps prevent blank gaps. */
export const MOBILE_EDGE_FADE = 0.068;

/** Scroll range for scroll-linked animations inside a section. */
export function mobileSectionScrollRange(section: MobileHomeSection) {
  return MOBILE_SECTION_SPAN[section];
}

/** 0–1 progress through a section's scroll band. */
export function mobileSectionLocalProgress(
  progress: number,
  section: MobileHomeSection,
) {
  const { start, end } = MOBILE_SECTION_SPAN[section];

  if (progress <= start) {
    return 0;
  }

  if (progress >= end) {
    return 1;
  }

  return (progress - start) / (end - start);
}

/** Map local 0–1 times to global scroll keys within a section. */
export function mobileSectionScrollKeys(
  section: MobileHomeSection,
  localInput: readonly number[],
  localOutput?: readonly number[],
) {
  const { start, end } = MOBILE_SECTION_SPAN[section];
  const span = end - start;

  return localInput.map((local) => start + local * span);
}

/** Stagger scroll windows for grid cells / images across a section. */
export function mobileStaggeredRange(
  section: MobileHomeSection,
  index: number,
  count: number,
  localBandStart = 0.06,
  localBandEnd = 0.88,
) {
  const { start, end } = MOBILE_SECTION_SPAN[section];
  const span = end - start;
  const band = localBandEnd - localBandStart;
  const slot = band / Math.max(count, 1);
  const localStart = localBandStart + slot * index;
  const localEnd = Math.min(localStart + slot * 0.92, localBandEnd);

  return {
    start: start + localStart * span,
    end: start + localEnd * span,
  };
}

/** Radial reveal mask (desktop-style ripple, tuned for mobile). */
export function mobileRippleMask(
  revealProgress: number,
  origin = "50% 50%",
) {
  const amount = Math.min(1, Math.max(0, revealProgress));

  if (amount >= 0.995) {
    return "linear-gradient(black, black)";
  }

  const wave = amount * 128;
  const inner = Math.max(wave - 20, 0);
  const feather = wave + 18;

  return `radial-gradient(circle at ${origin}, black 0%, black ${inner}%, rgba(0,0,0,0.68) ${wave}%, transparent ${feather}%, transparent 100%)`;
}

/** Blur amount for text/edges from local section progress (0 at center, peaks at edges). */
export function mobileEdgeBlurPx(
  localProgress: number,
  maxBlur = 14,
  edgePortion = 0.18,
) {
  if (localProgress < edgePortion) {
    return Math.round((1 - localProgress / edgePortion) * maxBlur);
  }

  if (localProgress > 1 - edgePortion) {
    return Math.round(((localProgress - (1 - edgePortion)) / edgePortion) * maxBlur);
  }

  return 0;
}

function smoothFade(amount: number) {
  const t = Math.min(1, Math.max(0, amount));

  return t * t * (3 - 2 * t);
}

/** Which section has the highest layer opacity (for pointer / video gating). */
export function mobileActiveSection(
  progress: number,
): MobileHomeSection | null {
  const sections: MobileHomeSection[] = ["hero", "convey", "create", "curate"];
  let best: MobileHomeSection | null = null;
  let bestOpacity = 0;

  for (const section of sections) {
    const opacity = mobileSectionLayerOpacity(progress, section);

    if (opacity > bestOpacity) {
      bestOpacity = opacity;
      best = section;
    }
  }

  return bestOpacity > 0.02 ? best : null;
}

/**
 * Layer opacity with overlapping edge fades so adjacent sections crossfade
 * instead of both hitting zero at the same scroll point.
 */
export function mobileSectionLayerOpacity(
  progress: number,
  section: MobileHomeSection,
): number {
  const { start, end } = MOBILE_SECTION_SPAN[section];
  const half = MOBILE_EDGE_FADE / 2;

  if (progress <= start - half || progress >= end + half) {
    return 0;
  }

  if (progress < start + half) {
    // First section should be fully visible at scroll 0 (no white fade-in).
    if (start === 0) {
      return 1;
    }

    return smoothFade((progress - (start - half)) / MOBILE_EDGE_FADE);
  }

  if (progress > end - half) {
    return smoothFade((end + half - progress) / MOBILE_EDGE_FADE);
  }

  return 1;
}

function mobileBlur(progress: number, input: readonly number[], output: readonly number[]) {
  const pixels = interpolateScrollOpacity(progress, input, output);
  return pixels <= 0.5 ? "blur(0px)" : `blur(${Math.round(pixels)}px)`;
}

export function mobileHeroOpacity(progress: number) {
  return mobileSectionLayerOpacity(progress, "hero");
}

export function mobileHeroBlur(progress: number) {
  const { end } = MOBILE_SECTION_SPAN.hero;
  return mobileBlur(progress, [0, 0.04, 0.08, end], [0, 6, 8, 0]);
}

export function mobileConveyOpacity(progress: number) {
  return mobileSectionLayerOpacity(progress, "convey");
}

export function mobileConveyBlur(progress: number) {
  const { start, end } = MOBILE_SECTION_SPAN.convey;
  return mobileBlur(progress, [0, start, start + 0.04, end], [0, 6, 0, 0, 6]);
}

export function mobileCreateOpacity(progress: number) {
  return mobileSectionLayerOpacity(progress, "create");
}

const MOBILE_LAYER_Z: Record<MobileHomeSection, number> = {
  hero: 10,
  convey: 20,
  create: 30,
  curate: 40,
};

/**
 * Stack order on mobile. Convey must stay above Create while Convey has opacity,
 * or Create's full-screen bg hides it even when Convey opacity is correct.
 */
export function mobileSectionLayerZIndex(
  progress: number,
  section: MobileHomeSection,
  mode: HomeScrollMode,
) {
  if (mode !== "mobile") {
    return MOBILE_LAYER_Z[section];
  }

  const conveyOpacity = mobileConveyOpacity(progress);

  if (section === "convey" && conveyOpacity > 0.02) {
    return 50;
  }

  if (section === "create" && conveyOpacity > 0.08) {
    return MOBILE_LAYER_Z.create;
  }

  const opacities: Record<MobileHomeSection, number> = {
    hero: mobileHeroOpacity(progress),
    convey: conveyOpacity,
    create: mobileCreateOpacity(progress),
    curate: mobileCurateOpacity(progress),
  };
  const topOpacity = Math.max(...Object.values(opacities));

  if (opacities[section] >= topOpacity - 0.001 && topOpacity > 0.1) {
    return 45;
  }

  return MOBILE_LAYER_Z[section];
}

export function mobileCreateBlur(progress: number) {
  const { start, end } = MOBILE_SECTION_SPAN.create;
  return mobileBlur(progress, [0, start, start + 0.06, end], [0, 6, 0, 0, 6]);
}

export function mobileCurateOpacity(progress: number) {
  return mobileSectionLayerOpacity(progress, "curate");
}

export function mobileCurateBlur(progress: number) {
  const { start, end } = MOBILE_SECTION_SPAN.curate;
  return mobileBlur(progress, [0, start, start + 0.06, end], [0, 6, 0, 0, 6]);
}

/** Text follows the section layer with a soft ramp during crossfades. */
export function mobileSectionTextOpacity(sectionOpacity: number) {
  if (sectionOpacity <= 0.04) {
    return 0;
  }

  if (sectionOpacity >= 0.55) {
    return 1;
  }

  return smoothFade((sectionOpacity - 0.04) / 0.51);
}

/** Inner content (video, grids) ramps with the section layer. */
export function mobileSectionContentOpacity(sectionOpacity: number) {
  if (sectionOpacity <= 0.03) {
    return 0;
  }

  if (sectionOpacity >= 0.5) {
    return 1;
  }

  return smoothFade((sectionOpacity - 0.03) / 0.47);
}

/** Blur backgrounds during edge fades only. */
export function mobileBackgroundBlurFilter(
  sectionOpacity: number,
  progress: number,
  blurForProgress: (value: number) => string,
) {
  if (sectionOpacity >= 0.96) {
    return "blur(0px)";
  }

  return blurForProgress(progress);
}

export function desktopHeroOpacity(progress: number) {
  return interpolateScrollOpacity(
    progress,
    [0, 0.004, 0.038, 0.052, 1],
    [1, 1, 1, 0, 0],
  );
}

export function desktopConveyOpacity(progress: number) {
  return interpolateScrollOpacity(
    progress,
    [0, 0.004, 0.01, 0.14, 0.18, 1],
    [0, 0, 1, 1, 0, 0],
  );
}

export function desktopCreateOpacity(progress: number) {
  return interpolateScrollOpacity(
    progress,
    [0, 0.14, 0.18, 0.52, 0.58, 1],
    [0, 0, 1, 1, 0, 0],
  );
}

export function desktopCurateOpacity(progress: number) {
  return interpolateScrollOpacity(
    progress,
    [0, 0.34, 0.42, 1],
    [0, 0, 1, 1],
  );
}
