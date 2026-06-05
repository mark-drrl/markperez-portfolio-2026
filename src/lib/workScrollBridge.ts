import {
  dampVirtualScroll,
  DESKTOP_GALLERY_HANDOFF_OFFSET,
  GALLERY_SCROLL_ENABLE_DELAY_MS,
  getDesktopWorkScrollPhase,
  shouldPrepareHandoffAnchor,
  shouldResetHandoffAnchor,
  shouldRunVirtualScrollSmoothing,
  VIRTUAL_SCROLL_VELOCITY_DECAY,
  VIRTUAL_SCROLL_VELOCITY_GAIN,
  WORK_ENTER_PROGRESS,
  WORK_EXIT_PROGRESS,
  WORK_HANDOFF_START,
  WORK_UNLOCK_PROGRESS,
  WHEEL_TO_VIRTUAL,
} from "@/lib/desktopWorkScroll";
import { getDefaultMobileVirtualOffset } from "@/lib/mobileWorkScroll";
import type { MotionValue } from "framer-motion";
import type Lenis from "lenis";

export {
  DESKTOP_GALLERY_HANDOFF_OFFSET,
  WORK_ENTER_PROGRESS,
  WORK_EXIT_PROGRESS,
  WORK_HANDOFF_START,
} from "@/lib/desktopWorkScroll";

type VirtualScrollData = {
  deltaY: number;
  event: WheelEvent | TouchEvent;
};

export const workScrollBridge = {
  scrollYProgress: null as MotionValue<number> | null,
  virtualScroll: null as MotionValue<number> | null,
  lenis: null as Lenis | null,
  isLocked: false,
  lockScrollY: 0,
  targetVirtualScroll: 0,
  displayVirtualScroll: 0,
  lastFrameTime: 0,
  blockWorkEngagement: false,
  /** Set once per Curate → Work approach; cleared when leaving the handoff band upward. */
  handoffPrepared: false,
  virtualScrollVelocity: 0,
  /** `performance.now()` timestamp when gallery wheel input is allowed. */
  galleryScrollEnabledAt: 0,
  /** Set when returning from a project page — engage lock once Lenis is ready. */
  pendingWorkGalleryLanding: false,
};

export function isWorkGalleryScrollActive() {
  return workScrollBridge.isLocked;
}

export function isWorkGalleryVirtualScrollReady() {
  if (!workScrollBridge.isLocked) {
    return false;
  }

  return performance.now() >= workScrollBridge.galleryScrollEnabledAt;
}

function isDesktopViewport() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 768px)").matches
  );
}

/** Lenis + lock floor — avoids motion-value lag mis-routing wheel events. */
function getEffectiveScrollProgress() {
  if (workScrollBridge.isLocked) {
    return WORK_ENTER_PROGRESS;
  }

  const lenis = workScrollBridge.lenis;

  if (lenis && isDesktopViewport()) {
    const main = document.querySelector("main");

    if (main) {
      const maxScroll = main.scrollHeight - window.innerHeight;

      if (maxScroll > 0) {
        return Math.min(1, Math.max(0, lenis.scroll / maxScroll));
      }
    }
  }

  return workScrollBridge.scrollYProgress?.get() ?? 0;
}

function getWorkAnchorScrollY() {
  const main = document.querySelector("main");

  if (!main) {
    return workScrollBridge.lenis?.scroll ?? window.scrollY;
  }

  const scrollableDistance = main.scrollHeight - window.innerHeight;

  return WORK_ENTER_PROGRESS * scrollableDistance;
}

function syncVirtualScrollValues(value: number) {
  workScrollBridge.targetVirtualScroll = value;
  workScrollBridge.displayVirtualScroll = value;
  workScrollBridge.virtualScroll?.set(value);
}

function prepareHandoffAnchor() {
  if (
    workScrollBridge.handoffPrepared &&
    workScrollBridge.targetVirtualScroll > 0
  ) {
    return;
  }

  syncVirtualScrollValues(DESKTOP_GALLERY_HANDOFF_OFFSET);
  workScrollBridge.handoffPrepared = true;
}

/** Apply gallery wheel delta (shared by Lenis virtualScroll + native fallback). */
export function applyGalleryWheelDelta(
  deltaY: number,
  event?: WheelEvent | TouchEvent,
) {
  if (!isDesktopViewport() || !workScrollBridge.virtualScroll) {
    return false;
  }

  const phase = getDesktopWorkScrollPhase(
    getEffectiveScrollProgress(),
    workScrollBridge.isLocked,
  );

  if (phase !== "gallery") {
    return false;
  }

  if (!workScrollBridge.isLocked) {
    engageWorkScroll();
  }

  if (event?.cancelable) {
    event.preventDefault();
  }

  pinLenisToWorkAnchor();

  if (!isWorkGalleryVirtualScrollReady()) {
    workScrollBridge.virtualScrollVelocity = 0;
    return true;
  }

  const wheelImpulse = deltaY * WHEEL_TO_VIRTUAL;

  workScrollBridge.virtualScrollVelocity += wheelImpulse * VIRTUAL_SCROLL_VELOCITY_GAIN;
  workScrollBridge.targetVirtualScroll =
    workScrollBridge.targetVirtualScroll + wheelImpulse;

  pinLenisToWorkAnchor();

  return true;
}

function pinLenisToWorkAnchor() {
  const lenis = workScrollBridge.lenis;

  if (!lenis || !workScrollBridge.isLocked) {
    return;
  }

  const drift = Math.abs(lenis.scroll - workScrollBridge.lockScrollY);

  if (drift > 2) {
    lenis.scrollTo(workScrollBridge.lockScrollY, {
      immediate: true,
      force: true,
    });
  }
}

/** Lock main scroll at the Work section — does not reset gallery position. */
export function engageWorkScroll() {
  const lenis = workScrollBridge.lenis;

  if (!lenis || workScrollBridge.isLocked) {
    return;
  }

  workScrollBridge.isLocked = true;
  workScrollBridge.lockScrollY = getWorkAnchorScrollY();
  workScrollBridge.galleryScrollEnabledAt =
    performance.now() + GALLERY_SCROLL_ENABLE_DELAY_MS;
  workScrollBridge.virtualScrollVelocity = 0;
  pinLenisToWorkAnchor();
}

export function unlockWorkScroll() {
  workScrollBridge.isLocked = false;
  workScrollBridge.lockScrollY = 0;
  workScrollBridge.virtualScrollVelocity = 0;
  workScrollBridge.galleryScrollEnabledAt = 0;
}

export function registerWorkScrollMotionValues(
  scrollYProgress: MotionValue<number>,
  virtualScroll: MotionValue<number>,
) {
  workScrollBridge.scrollYProgress = scrollYProgress;
  workScrollBridge.virtualScroll = virtualScroll;

  if (isDesktopViewport()) {
    const mobileOffsetLeak = workScrollBridge.targetVirtualScroll > 500;

    if (mobileOffsetLeak) {
      syncVirtualScrollValues(DESKTOP_GALLERY_HANDOFF_OFFSET);
    } else {
      virtualScroll.set(workScrollBridge.displayVirtualScroll);
    }
  } else {
    virtualScroll.set(workScrollBridge.displayVirtualScroll);
  }
}

export function unregisterWorkScrollMotionValues() {
  workScrollBridge.scrollYProgress = null;
  workScrollBridge.virtualScroll = null;
  unlockWorkScroll();
}

export function resetWorkVirtualScroll() {
  syncVirtualScrollValues(
    isDesktopViewport()
      ? DESKTOP_GALLERY_HANDOFF_OFFSET
      : getDefaultMobileVirtualOffset(),
  );
}

/** Lock at Work anchor after `/#works` return (gallery scroll, not Curate handoff). */
export function engageWorkGalleryLanding() {
  workScrollBridge.blockWorkEngagement = false;
  workScrollBridge.handoffPrepared = true;
  workScrollBridge.pendingWorkGalleryLanding = true;
  workScrollBridge.virtualScrollVelocity = 0;

  if (workScrollBridge.lenis) {
    engageWorkScroll();
    workScrollBridge.pendingWorkGalleryLanding = false;
  }
}

export function resetHomeScrollPosition() {
  unlockWorkScroll();
  resetWorkVirtualScroll();
  workScrollBridge.blockWorkEngagement = true;
  workScrollBridge.handoffPrepared = false;
  workScrollBridge.pendingWorkGalleryLanding = false;

  const lenis = workScrollBridge.lenis;

  if (lenis) {
    lenis.scrollTo(0, { immediate: true, force: true });
  }

  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.dispatchEvent(new Event("scroll"));
  }
}

export function syncWorkScrollEngagement() {
  if (!isDesktopViewport()) {
    return;
  }

  if (
    workScrollBridge.pendingWorkGalleryLanding &&
    workScrollBridge.lenis &&
    !workScrollBridge.isLocked
  ) {
    engageWorkScroll();
    workScrollBridge.pendingWorkGalleryLanding = false;
  }

  const progress = getEffectiveScrollProgress();

  if (workScrollBridge.blockWorkEngagement) {
    if (progress < WORK_EXIT_PROGRESS) {
      workScrollBridge.blockWorkEngagement = false;
    } else {
      unlockWorkScroll();
      return;
    }
  }

  if (shouldResetHandoffAnchor(progress)) {
    workScrollBridge.handoffPrepared = false;
  }

  if (shouldPrepareHandoffAnchor(progress, workScrollBridge.handoffPrepared)) {
    prepareHandoffAnchor();
  } else if (
    progress >= WORK_ENTER_PROGRESS &&
    !workScrollBridge.handoffPrepared
  ) {
    prepareHandoffAnchor();
  }

  const phase = getDesktopWorkScrollPhase(
    progress,
    workScrollBridge.isLocked,
  );

  if (phase === "gallery" || workScrollBridge.isLocked) {
    if (!workScrollBridge.isLocked) {
      engageWorkScroll();
    } else {
      pinLenisToWorkAnchor();
    }

    return;
  }

  if (workScrollBridge.isLocked && progress < WORK_UNLOCK_PROGRESS) {
    unlockWorkScroll();
  }
}

export function tickWorkVirtualScrollSmoothing(time: number) {
  const virtualScroll = workScrollBridge.virtualScroll;

  if (!virtualScroll || !isDesktopViewport()) {
    workScrollBridge.lastFrameTime = time;
    return;
  }

  const progress = getEffectiveScrollProgress();
  const phase = getDesktopWorkScrollPhase(
    progress,
    workScrollBridge.isLocked,
  );

  if (!shouldRunVirtualScrollSmoothing(phase, workScrollBridge.isLocked)) {
    workScrollBridge.lastFrameTime = time;
    return;
  }

  const lastTime = workScrollBridge.lastFrameTime || time;
  const deltaTime = Math.min(0.05, Math.max(0.001, (time - lastTime) / 1000));
  workScrollBridge.lastFrameTime = time;

  if (
    isWorkGalleryVirtualScrollReady() &&
    Math.abs(workScrollBridge.virtualScrollVelocity) > 0.05
  ) {
    workScrollBridge.virtualScrollVelocity *= VIRTUAL_SCROLL_VELOCITY_DECAY;
    workScrollBridge.targetVirtualScroll =
      workScrollBridge.targetVirtualScroll +
      workScrollBridge.virtualScrollVelocity;

    if (Math.abs(workScrollBridge.virtualScrollVelocity) < 0.08) {
      workScrollBridge.virtualScrollVelocity = 0;
    }
  }

  const target = workScrollBridge.targetVirtualScroll;
  const current = workScrollBridge.displayVirtualScroll;

  if (Math.abs(target - current) < 0.25) {
    workScrollBridge.displayVirtualScroll = target;
  } else {
    workScrollBridge.displayVirtualScroll = dampVirtualScroll(
      current,
      target,
      deltaTime,
    );
  }

  virtualScroll.set(workScrollBridge.displayVirtualScroll);
}

export function handleWorkLenisVirtualScroll(data: VirtualScrollData): boolean {
  if (!isDesktopViewport()) {
    return true;
  }

  const progress = getEffectiveScrollProgress();

  if (workScrollBridge.blockWorkEngagement && progress >= WORK_EXIT_PROGRESS) {
    unlockWorkScroll();
    return true;
  }

  if (!workScrollBridge.lenis || !workScrollBridge.virtualScroll) {
    return true;
  }

  if (
    applyGalleryWheelDelta(
      data.deltaY,
      data.event instanceof WheelEvent ? data.event : undefined,
    )
  ) {
    return false;
  }

  return true;
}
