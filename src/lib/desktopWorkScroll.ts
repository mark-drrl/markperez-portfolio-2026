/**
 * Desktop Work gallery scroll — phase model and handoff anchor.
 * Main page scroll (Lenis) and gallery virtual scroll are intentionally separate.
 */

export const WORK_ENTER_PROGRESS = 0.64;
/** Only leave Work scroll-lock when clearly back in Curate (not trackpad bounce). */
export const WORK_UNLOCK_PROGRESS = 0.58;
export const WORK_EXIT_PROGRESS = WORK_UNLOCK_PROGRESS;
export const WORK_HANDOFF_START = 0.56;

/** Gallery offset at Curate → Work handoff (column translate anchor). */
export const DESKTOP_GALLERY_HANDOFF_OFFSET = 0;

/** Pause gallery wheel after Work entry so the handoff can be read. */
export const GALLERY_SCROLL_ENABLE_DELAY_MS = 900;

/** Wheel → target virtual pixels (lower = heavier, more deliberate). */
export const WHEEL_TO_VIRTUAL = 0.42;
/** Exponential follow strength (lower = heavier lag). */
export const VIRTUAL_SCROLL_SMOOTHING = 4;
/** Momentum decay per frame (~60fps). */
export const VIRTUAL_SCROLL_VELOCITY_DECAY = 0.86;
export const VIRTUAL_SCROLL_VELOCITY_GAIN = 0.06;

export type DesktopWorkScrollPhase = "idle" | "handoff" | "gallery";

export function getDesktopWorkScrollPhase(
  progress: number,
  isGalleryLocked: boolean,
): DesktopWorkScrollPhase {
  if (isGalleryLocked || progress >= WORK_ENTER_PROGRESS) {
    return "gallery";
  }

  if (progress >= WORK_HANDOFF_START) {
    return "handoff";
  }

  return "idle";
}

export function shouldRunVirtualScrollSmoothing(
  phase: DesktopWorkScrollPhase,
  isGalleryLocked: boolean,
) {
  return phase === "gallery" || phase === "handoff" || isGalleryLocked;
}

export function shouldPrepareHandoffAnchor(
  progress: number,
  handoffPrepared: boolean,
) {
  return (
    progress >= WORK_HANDOFF_START &&
    progress < WORK_ENTER_PROGRESS &&
    !handoffPrepared
  );
}

export function shouldResetHandoffAnchor(progress: number) {
  return progress < WORK_HANDOFF_START - 0.02;
}

export function dampVirtualScroll(
  current: number,
  target: number,
  deltaTime: number,
) {
  const lambda = VIRTUAL_SCROLL_SMOOTHING;

  return current + (target - current) * (1 - Math.exp(-lambda * deltaTime));
}
