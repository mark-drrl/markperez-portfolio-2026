export const NAV_ACCENT = "#9F1F2E";

/** 0 = light background, 1 = dark background behind the nav */
export function toneToIdleColor(tone: number) {
  const t = Math.min(1, Math.max(0, tone));
  const mix = (from: number, to: number) =>
    Math.round(from + (to - from) * t);

  return `rgb(${mix(0x4f, 0xec)} ${mix(0x4f, 0xec)} ${mix(0x4f, 0xec)})`;
}

export function luminanceToNavTone(luminance: number) {
  if (luminance < 0.4) {
    return 1;
  }

  if (luminance > 0.62) {
    return 0;
  }

  return (0.62 - luminance) / 0.22;
}

/** 0 = light backdrop (dark text), 1 = dark backdrop (light text) */
export function cellRevealTone(
  scrollProgress: number,
  start: number,
  end: number,
  strength = 0.9,
) {
  if (end <= start) {
    return 0;
  }

  const reveal = Math.min(
    Math.max((scrollProgress - start) / (end - start), 0),
    1,
  );

  return reveal * strength;
}
