import { workScrollBridge } from "@/lib/workScrollBridge";

export const MOBILE_WORK_IMAGE_COUNT = 10;

/** Matches Curate mobile middle cell at section end (index 1 in the 3-up stack). */
export const MOBILE_CURATE_WORK_HANDOFF_INDEX = 1;

const MOBILE_WORK_CELL_VH = 56;
const MOBILE_WORK_CELL_GAP_VH = 0.5;

export function getMobileWorkViewportHeight() {
  if (typeof window === "undefined") {
    return 800;
  }

  return window.visualViewport?.height ?? window.innerHeight;
}

export function getMobileWorkScrollStride() {
  return (
    getMobileWorkViewportHeight() *
    ((MOBILE_WORK_CELL_VH + MOBILE_WORK_CELL_GAP_VH) / 100)
  );
}

export function getMobileWorkAnchorBase() {
  return MOBILE_WORK_IMAGE_COUNT * getMobileWorkScrollStride();
}

export function isMobileWorkViewport() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(max-width: 767px)").matches;
}

export function getMobileFocusedImageIndex(offset: number) {
  const stride = getMobileWorkScrollStride();
  const relative = offset - getMobileWorkAnchorBase();

  return (
    ((Math.round(relative / stride) % MOBILE_WORK_IMAGE_COUNT) +
      MOBILE_WORK_IMAGE_COUNT) %
    MOBILE_WORK_IMAGE_COUNT
  );
}

export function getDefaultMobileVirtualOffset() {
  if (!isMobileWorkViewport()) {
    return 0;
  }

  return (
    getMobileWorkAnchorBase() +
    MOBILE_CURATE_WORK_HANDOFF_INDEX * getMobileWorkScrollStride()
  );
}

export function syncMobileWorkGalleryBridge(offset: number) {
  if (!isMobileWorkViewport()) {
    return;
  }

  workScrollBridge.targetVirtualScroll = offset;
  workScrollBridge.displayVirtualScroll = offset;
}

/** Index of the gallery item whose center is closest to the viewport center. */
export function getCenteredWorkGalleryIndex(scroller: HTMLElement) {
  const viewportCenter =
    (window.visualViewport?.height ?? window.innerHeight) / 2;
  const items = scroller.querySelectorAll<HTMLElement>("[data-work-gallery-item]");

  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  items.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.top + rect.height / 2;
    const distance = Math.abs(itemCenter - viewportCenter);
    const index = Number(item.dataset.galleryIndex ?? 0);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
}

export function syncMobileWorkToneFromIndex(
  virtualScroll: { set(value: number): void },
  index: number,
) {
  if (!isMobileWorkViewport()) {
    return;
  }

  const offset = getMobileWorkAnchorBase() + index * getMobileWorkScrollStride();
  syncMobileWorkGalleryBridge(offset);
  virtualScroll.set(offset);
}

export const MOBILE_WORK_LOOP_COPIES = 3;

/** Middle copy — stable target for infinite-loop rebasing. */
export const MOBILE_WORK_LOOP_MIDDLE_COPY = 1;

export function measureMobileWorkCycleHeight(scroller: HTMLElement) {
  const middleCopyStart = scroller.querySelector<HTMLElement>(
    `[data-loop-copy="${MOBILE_WORK_LOOP_MIDDLE_COPY}"][data-gallery-index="0"]`,
  );
  const lastCopyStart = scroller.querySelector<HTMLElement>(
    `[data-loop-copy="${MOBILE_WORK_LOOP_COPIES - 1}"][data-gallery-index="0"]`,
  );

  if (middleCopyStart && lastCopyStart) {
    return lastCopyStart.offsetTop - middleCopyStart.offsetTop;
  }

  const firstItem = scroller.querySelector<HTMLElement>("[data-work-gallery-item]");

  if (!firstItem) {
    return getMobileWorkScrollStride() * MOBILE_WORK_IMAGE_COUNT;
  }

  const secondItem = firstItem.nextElementSibling as HTMLElement | null;

  if (!secondItem) {
    return firstItem.offsetHeight;
  }

  return (
    (secondItem.offsetTop - firstItem.offsetTop) * MOBILE_WORK_IMAGE_COUNT
  );
}

/**
 * Jump scroll position between duplicated strips so native scroll loops forever.
 * Returns true when the scroll offset was adjusted.
 */
export function maintainMobileWorkInfiniteScroll(scroller: HTMLElement) {
  const cycle = measureMobileWorkCycleHeight(scroller);

  if (cycle <= 0) {
    return false;
  }

  const middleStart = cycle * MOBILE_WORK_LOOP_MIDDLE_COPY;
  const { scrollTop } = scroller;

  if (scrollTop < cycle * 0.4) {
    scroller.scrollTop += cycle;
    return true;
  }

  if (scrollTop > middleStart + cycle * 0.6) {
    scroller.scrollTop -= cycle;
    return true;
  }

  return false;
}

export function scrollMobileWorkGalleryToIndex(
  scroller: HTMLElement,
  index: number,
) {
  const item = scroller.querySelector<HTMLElement>(
    `[data-loop-copy="${MOBILE_WORK_LOOP_MIDDLE_COPY}"][data-gallery-index="${index}"]`,
  );

  item?.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
}
