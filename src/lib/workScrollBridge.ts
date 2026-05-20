import type { MotionValue } from "framer-motion";
import type Lenis from "lenis";

const WORK_ENTER_PROGRESS = 0.64;
const WORK_EXIT_PROGRESS = 0.63;
const WHEEL_TO_VIRTUAL = 0.9;
const SMOOTH_SCROLL_LAMBDA = 11;

type VirtualScrollData = {
  deltaY: number;
  event: WheelEvent | TouchEvent;
};

function damp(
  current: number,
  target: number,
  lambda: number,
  deltaTime: number,
) {
  return current + (target - current) * (1 - Math.exp(-lambda * deltaTime));
}

export const workScrollBridge = {
  scrollYProgress: null as MotionValue<number> | null,
  virtualScroll: null as MotionValue<number> | null,
  lenis: null as Lenis | null,
  isLocked: false,
  lockScrollY: 0,
  targetVirtualScroll: 0,
  displayVirtualScroll: 0,
  lastFrameTime: 0,
  /** After "back to home", ignore work snap until scroll progress drops below exit band. */
  blockWorkEngagement: false,
};

export function isWorkGalleryScrollActive() {
  return workScrollBridge.isLocked;
}

function isDesktopViewport() {
  return window.matchMedia("(min-width: 768px)").matches;
}

function getScrollProgress() {
  return workScrollBridge.scrollYProgress?.get() ?? 0;
}

/** Pixel offset where Framer scroll progress hits the work section (0.64). */
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

/** Snap Lenis to the work anchor and clear inertial scroll. */
export function engageWorkScroll() {
  const lenis = workScrollBridge.lenis;

  if (!lenis || workScrollBridge.isLocked) {
    return;
  }

  workScrollBridge.isLocked = true;
  workScrollBridge.lockScrollY = getWorkAnchorScrollY();
  lenis.scrollTo(workScrollBridge.lockScrollY, { immediate: true, force: true });

  const currentVirtual = workScrollBridge.virtualScroll?.get() ?? 0;
  workScrollBridge.targetVirtualScroll = currentVirtual;
  workScrollBridge.displayVirtualScroll = currentVirtual;
}

export function unlockWorkScroll() {
  workScrollBridge.isLocked = false;
  workScrollBridge.lockScrollY = 0;
}

export function registerWorkScrollMotionValues(
  scrollYProgress: MotionValue<number>,
  virtualScroll: MotionValue<number>,
) {
  workScrollBridge.scrollYProgress = scrollYProgress;
  workScrollBridge.virtualScroll = virtualScroll;
}

export function unregisterWorkScrollMotionValues() {
  workScrollBridge.scrollYProgress = null;
  workScrollBridge.virtualScroll = null;
  unlockWorkScroll();
}

export function resetWorkVirtualScroll() {
  syncVirtualScrollValues(0);
}

/** Hero reset — clears work lock, virtual gallery offset, and Lenis/window scroll. */
export function resetHomeScrollPosition() {
  unlockWorkScroll();
  resetWorkVirtualScroll();
  workScrollBridge.blockWorkEngagement = true;

  const lenis = workScrollBridge.lenis;

  if (lenis) {
    lenis.scrollTo(0, { immediate: true, force: true });
  }

  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.dispatchEvent(new Event("scroll"));
  }
}

function pinLenisIfDrifted() {
  const lenis = workScrollBridge.lenis;

  if (!lenis || !workScrollBridge.isLocked) {
    return;
  }

  const drift = Math.abs(lenis.scroll - workScrollBridge.lockScrollY);

  if (drift > 4) {
    lenis.scrollTo(workScrollBridge.lockScrollY, { immediate: true, force: true });
  }
}

export function syncWorkScrollEngagement() {
  if (!isDesktopViewport()) {
    return;
  }

  const progress = getScrollProgress();

  if (workScrollBridge.blockWorkEngagement) {
    if (progress < WORK_EXIT_PROGRESS) {
      workScrollBridge.blockWorkEngagement = false;
    } else {
      unlockWorkScroll();
      return;
    }
  }

  if (progress >= WORK_ENTER_PROGRESS) {
    if (!workScrollBridge.isLocked) {
      engageWorkScroll();
    }

    return;
  }

  if (progress < WORK_EXIT_PROGRESS) {
    unlockWorkScroll();
  }
}

/** Luxurious eased column motion — runs in the same RAF as Lenis. */
export function tickWorkVirtualScrollSmoothing(time: number) {
  const virtualScroll = workScrollBridge.virtualScroll;

  if (!virtualScroll || !isDesktopViewport() || !workScrollBridge.isLocked) {
    workScrollBridge.lastFrameTime = time;
    return;
  }

  const lastTime = workScrollBridge.lastFrameTime || time;
  const deltaTime = Math.min(0.05, Math.max(0.001, (time - lastTime) / 1000));
  workScrollBridge.lastFrameTime = time;

  workScrollBridge.displayVirtualScroll = damp(
    workScrollBridge.displayVirtualScroll,
    workScrollBridge.targetVirtualScroll,
    SMOOTH_SCROLL_LAMBDA,
    deltaTime,
  );
  virtualScroll.set(workScrollBridge.displayVirtualScroll);
}

export function handleWorkLenisVirtualScroll(data: VirtualScrollData): boolean {
  if (!isDesktopViewport()) {
    return true;
  }

  const progress = getScrollProgress();
  const lenis = workScrollBridge.lenis;
  const virtualScroll = workScrollBridge.virtualScroll;

  if (workScrollBridge.blockWorkEngagement && progress >= WORK_EXIT_PROGRESS) {
    unlockWorkScroll();
    return true;
  }

  if (progress < WORK_EXIT_PROGRESS) {
    unlockWorkScroll();
    return true;
  }

  if (progress < WORK_ENTER_PROGRESS || !lenis || !virtualScroll) {
    return true;
  }

  const { deltaY, event } = data;

  if (deltaY < 0 && workScrollBridge.targetVirtualScroll <= 0) {
    unlockWorkScroll();
    return true;
  }

  if (!workScrollBridge.isLocked) {
    engageWorkScroll();
  }

  if (event.cancelable) {
    event.preventDefault();
  }

  workScrollBridge.targetVirtualScroll = Math.max(
    0,
    workScrollBridge.targetVirtualScroll + deltaY * WHEEL_TO_VIRTUAL,
  );
  pinLenisIfDrifted();

  return false;
}
