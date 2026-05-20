export const MOBILE_WORK_IMAGE_COUNT = 10;

/** Matches Curate mobile middle cell at section end (index 1 in the 3-up stack). */
export const MOBILE_CURATE_WORK_HANDOFF_INDEX = 1;

const MOBILE_WORK_CELL_VH = 56;
const MOBILE_WORK_CELL_GAP_VH = 0.5;

export function getMobileWorkScrollStride() {
  if (typeof window === "undefined") {
    return 560;
  }

  return (
    window.innerHeight * ((MOBILE_WORK_CELL_VH + MOBILE_WORK_CELL_GAP_VH) / 100)
  );
}

export function getMobileWorkCycleLength() {
  return MOBILE_WORK_IMAGE_COUNT * getMobileWorkScrollStride();
}

/** Offset where the handoff image sits in the center slot (aligned with Curate). */
export function getMobileWorkAnchorOffset() {
  return (
    (MOBILE_WORK_IMAGE_COUNT + MOBILE_CURATE_WORK_HANDOFF_INDEX) *
    getMobileWorkScrollStride()
  );
}

function getMobileWorkAnchorBase() {
  return MOBILE_WORK_IMAGE_COUNT * getMobileWorkScrollStride();
}

export function isMobileWorkViewport() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(max-width: 767px)").matches;
}

/** Keep offset near the middle copy so the strip can loop up/down. */
export function rebaseMobileVirtualOffset(offset: number) {
  const cycle = getMobileWorkCycleLength();
  const anchor = getMobileWorkAnchorOffset();
  let next = offset;

  if (next < anchor - cycle * 0.5) {
    next += cycle;
  } else if (next > anchor + cycle * 0.5) {
    next -= cycle;
  }

  return next;
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
  return isMobileWorkViewport() ? getMobileWorkAnchorOffset() : 0;
}
