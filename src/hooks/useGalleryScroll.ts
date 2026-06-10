import { type RefObject, useEffect, useRef } from "react";

export const galleryTrackSelector = "[data-gallery-track]";

const GALLERY_WHEEL_GAIN = 0.9;
const GALLERY_SCROLL_SMOOTHING = 15;
const GALLERY_WHEEL_IMMEDIATE = 0.9;
const GALLERY_SNAP_DEBOUNCE_MS = 90;
const GALLERY_SNAP_DURATION_MS = 520;
/** Ignore layout-driven re-snaps while the user is actively scrolling. */
const GALLERY_SCROLL_IDLE_MS = 260;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function easeOutQuart(t: number) {
  return 1 - (1 - t) ** 4;
}

export function useGalleryScroll(
  scrollerRef: RefObject<HTMLDivElement | null>,
  setFocusedIndex: (index: number) => void,
  resetKey?: string | number,
) {
  const snapTimeoutRef = useRef(0);
  const focusFrameRef = useRef(0);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const scrollerElement = scroller;
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    let isInitializing = true;
    let resizeObserver: ResizeObserver | null = null;
    let resizeTimeoutRef = 0;
    let rafId = 0;
    let snapRafId = 0;
    let lastFrameTime = performance.now();
    let lastWheelTime = 0;
    let targetScroll = scrollerElement.scrollTop;
    let displayScroll = scrollerElement.scrollTop;
    let isSnapAnimating = false;
    let focusedItemIndex = 0;
    let hasUserScrolled = false;
    let lastPaddingTop = 0;
    let lastPaddingBottom = 0;

    function getTrack() {
      return scrollerElement.querySelector<HTMLElement>(galleryTrackSelector);
    }

    function getGalleryItems() {
      return Array.from(
        scrollerElement.querySelectorAll<HTMLElement>("[data-gallery-item]"),
      );
    }

    function isMobile() {
      return mobileQuery.matches;
    }

    function isScrollActive() {
      return performance.now() - lastWheelTime < GALLERY_SCROLL_IDLE_MS;
    }

    function getMaxScroll() {
      return Math.max(
        0,
        scrollerElement.scrollHeight - scrollerElement.clientHeight,
      );
    }

    function updateGalleryTrackPadding() {
      const track = getTrack();
      const items = getGalleryItems();

      if (!track || items.length === 0) {
        return;
      }

      const viewportHeight = scrollerElement.clientHeight;
      const firstHeight = items[0].getBoundingClientRect().height;
      const lastHeight = items[items.length - 1].getBoundingClientRect().height;

      const nextPaddingTop = Math.max(0, viewportHeight / 2 - firstHeight / 2);
      const nextPaddingBottom = Math.max(
        0,
        viewportHeight / 2 - lastHeight / 2,
      );
      const paddingTopDelta = nextPaddingTop - lastPaddingTop;
      const shouldCompensateScroll =
        paddingTopDelta !== 0 &&
        (hasUserScrolled || scrollerElement.scrollTop > 0 || lastPaddingTop > 0);

      lastPaddingTop = nextPaddingTop;
      lastPaddingBottom = nextPaddingBottom;

      track.style.paddingTop = `${nextPaddingTop}px`;
      track.style.paddingBottom = `${nextPaddingBottom}px`;

      // Padding-top changes shift content without moving scrollTop — compensate
      // so the viewport stays on the same item while images finish loading.
      if (shouldCompensateScroll) {
        const adjustedScroll = clamp(
          scrollerElement.scrollTop + paddingTopDelta,
          0,
          getMaxScroll(),
        );

        scrollerElement.scrollTop = adjustedScroll;
        displayScroll = adjustedScroll;
        targetScroll = adjustedScroll;
      }
    }

    function getItemCenterInContent(item: HTMLElement) {
      const scrollerRect = scrollerElement.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();

      return (
        itemRect.top -
        scrollerRect.top +
        scrollerElement.scrollTop +
        itemRect.height / 2
      );
    }

    function getViewportCenterInContent(scrollTop = scrollerElement.scrollTop) {
      return scrollTop + scrollerElement.clientHeight / 2;
    }

    function findSnapTargetIndex(scrollTop = targetScroll) {
      const items = getGalleryItems();

      if (items.length <= 1) {
        return 0;
      }

      const viewportCenter = getViewportCenterInContent(scrollTop);

      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      items.forEach((item, index) => {
        const distance = Math.abs(getItemCenterInContent(item) - viewportCenter);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      return bestIndex;
    }

    function findSnapTarget(scrollTop = targetScroll) {
      const items = getGalleryItems();
      const index = findSnapTargetIndex(scrollTop);

      return items[index] ?? null;
    }

    function getSnapScrollTopForItem(item: HTMLElement) {
      const itemCenter = getItemCenterInContent(item);

      return clamp(
        itemCenter - scrollerElement.clientHeight / 2,
        0,
        getMaxScroll(),
      );
    }

    function updateFocusedFromViewport(scrollTop = displayScroll) {
      const index = findSnapTargetIndex(scrollTop);

      focusedItemIndex = index;
      setFocusedIndex(index);
    }

    function applyScrollPosition(nextScroll: number) {
      const clamped = clamp(nextScroll, 0, getMaxScroll());

      displayScroll = clamped;
      targetScroll = clamped;
      scrollerElement.scrollTop = clamped;
      updateFocusedFromViewport(clamped);
    }

    function cancelSnapAnimation() {
      if (snapRafId) {
        window.cancelAnimationFrame(snapRafId);
        snapRafId = 0;
      }

      isSnapAnimating = false;
    }

    function settleOnItem(item: HTMLElement, index: number) {
      updateGalleryTrackPadding();

      const settledScroll = getSnapScrollTopForItem(item);

      applyScrollPosition(settledScroll);
      focusedItemIndex = index;
      setFocusedIndex(index);
    }

    function animateSnapTo(item: HTMLElement) {
      cancelSnapAnimation();
      updateGalleryTrackPadding();

      targetScroll = clamp(targetScroll, 0, getMaxScroll());
      displayScroll = clamp(
        displayScroll + (targetScroll - displayScroll) * 0.88,
        0,
        getMaxScroll(),
      );
      scrollerElement.scrollTop = displayScroll;

      const index = Number(item.dataset.galleryIndex ?? 0);
      const startScroll = displayScroll;
      const endScroll = getSnapScrollTopForItem(item);
      const startTime = performance.now();

      if (Math.abs(endScroll - startScroll) < 1) {
        settleOnItem(item, index);
        return;
      }

      isSnapAnimating = true;
      focusedItemIndex = index;
      setFocusedIndex(index);

      function snapFrame(now: number) {
        const progress = clamp((now - startTime) / GALLERY_SNAP_DURATION_MS, 0, 1);
        const eased = easeOutQuart(progress);
        const nextScroll = startScroll + (endScroll - startScroll) * eased;

        displayScroll = nextScroll;
        targetScroll = nextScroll;
        scrollerElement.scrollTop = nextScroll;

        if (progress < 1) {
          snapRafId = window.requestAnimationFrame(snapFrame);
          return;
        }

        settleOnItem(item, index);
        isSnapAnimating = false;
        snapRafId = 0;
      }

      snapRafId = window.requestAnimationFrame(snapFrame);
    }

    function snapToNearestItem() {
      if (isMobile() || isScrollActive()) {
        scheduleSnap();
        return;
      }

      const snapTarget = findSnapTarget(targetScroll);

      if (!snapTarget) {
        return;
      }

      animateSnapTo(snapTarget);
    }

    function scheduleSnap() {
      window.clearTimeout(snapTimeoutRef.current);

      if (isMobile()) {
        return;
      }

      snapTimeoutRef.current = window.setTimeout(() => {
        if (isScrollActive()) {
          scheduleSnap();
          return;
        }

        snapToNearestItem();
      }, GALLERY_SNAP_DEBOUNCE_MS);
    }

    function snapToFirstItem() {
      if (hasUserScrolled) {
        return;
      }

      const items = getGalleryItems();
      const firstItem = items[0];

      updateGalleryTrackPadding();

      if (!firstItem) {
        updateFocusedFromViewport(0);
        return;
      }

      cancelSnapAnimation();
      settleOnItem(firstItem, 0);
    }

    function snapToFocusedItem() {
      if (isScrollActive() || isSnapAnimating) {
        return;
      }

      const items = getGalleryItems();
      const index = findSnapTargetIndex(displayScroll);
      const item = items[index] ?? items[focusedItemIndex] ?? items[0];

      if (!item) {
        return;
      }

      cancelSnapAnimation();
      settleOnItem(item, index);
    }

    function tick(now: number) {
      const deltaTime = Math.min((now - lastFrameTime) / 1000, 0.05);

      lastFrameTime = now;

      if (!isMobile() && !isSnapAnimating && !isInitializing) {
        const follow = 1 - Math.exp(-GALLERY_SCROLL_SMOOTHING * deltaTime);

        displayScroll += (targetScroll - displayScroll) * follow;

        if (Math.abs(displayScroll - scrollerElement.scrollTop) > 0.05) {
          scrollerElement.scrollTop = displayScroll;
          updateFocusedFromViewport(displayScroll);
        }
      }

      rafId = window.requestAnimationFrame(tick);
    }

    function handleWheel(event: WheelEvent) {
      if (isMobile()) {
        return;
      }

      if (isInitializing) {
        isInitializing = false;
      }

      const maxScroll = getMaxScroll();

      if (maxScroll <= 0) {
        return;
      }

      event.preventDefault();

      hasUserScrolled = true;
      lastWheelTime = performance.now();
      cancelSnapAnimation();

      const delta = event.deltaY * GALLERY_WHEEL_GAIN;

      targetScroll = clamp(targetScroll + delta, 0, maxScroll);
      displayScroll = clamp(
        displayScroll + delta * GALLERY_WHEEL_IMMEDIATE,
        0,
        maxScroll,
      );
      scrollerElement.scrollTop = displayScroll;
      updateFocusedFromViewport(targetScroll);

      scheduleSnap();
    }

    function scheduleFocusUpdate() {
      if (focusFrameRef.current) {
        return;
      }

      focusFrameRef.current = window.requestAnimationFrame(() => {
        focusFrameRef.current = 0;
        updateFocusedFromViewport();
      });
    }

    function handleNativeScroll() {
      if (isInitializing || isSnapAnimating) {
        return;
      }

      if (isMobile()) {
        scheduleFocusUpdate();
      }
    }

    function scheduleInitialSnap() {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          snapToFirstItem();
        });
      });
    }

    function finishInitializing() {
      window.setTimeout(() => {
        isInitializing = false;

        if (!hasUserScrolled) {
          targetScroll = scrollerElement.scrollTop;
          displayScroll = scrollerElement.scrollTop;
        }
      }, 160);
    }

    function syncFocusAfterLayout() {
      updateGalleryTrackPadding();
      updateFocusedFromViewport(hasUserScrolled ? targetScroll : displayScroll);
    }

    function handleLayoutChange() {
      window.clearTimeout(resizeTimeoutRef);

      resizeTimeoutRef = window.setTimeout(() => {
        if (hasUserScrolled) {
          syncFocusAfterLayout();
          return;
        }

        updateGalleryTrackPadding();

        if (isScrollActive() || isSnapAnimating || isInitializing) {
          return;
        }

        snapToFocusedItem();
      }, 120);
    }

    scheduleInitialSnap();
    rafId = window.requestAnimationFrame(tick);

    const images = Array.from(scrollerElement.querySelectorAll("img"));
    let pendingImages = images.length;
    let hasFinishedInit = false;

    function handleImageReady() {
      pendingImages -= 1;

      if (pendingImages <= 0 && !hasFinishedInit) {
        hasFinishedInit = true;

        if (hasUserScrolled) {
          syncFocusAfterLayout();
        } else {
          snapToFirstItem();
        }

        finishInitializing();
      }
    }

    if (pendingImages > 0) {
      for (const image of images) {
        if (image.complete) {
          handleImageReady();
        } else {
          image.addEventListener("load", handleImageReady, { once: true });
          image.addEventListener("error", handleImageReady, { once: true });
        }
      }
    } else {
      finishInitializing();
    }

    function handleWindowLoad() {
      if (!hasUserScrolled) {
        snapToFirstItem();
      }
    }

    window.addEventListener("load", handleWindowLoad);
    window.addEventListener("resize", handleLayoutChange);

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        handleLayoutChange();
      });

      const track = getTrack();

      if (track) {
        resizeObserver.observe(track);
      }

      for (const item of getGalleryItems()) {
        resizeObserver.observe(item);
      }
    }

    function handleScrollerWheel(event: WheelEvent) {
      handleWheel(event);
      event.stopPropagation();
    }

    scrollerElement.addEventListener("wheel", handleScrollerWheel, {
      passive: false,
    });
    document.addEventListener("wheel", handleWheel, { passive: false });
    scrollerElement.addEventListener("scroll", handleNativeScroll, {
      passive: true,
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.cancelAnimationFrame(snapRafId);
      window.cancelAnimationFrame(focusFrameRef.current);
      window.clearTimeout(snapTimeoutRef.current);
      window.clearTimeout(resizeTimeoutRef);
      window.removeEventListener("load", handleWindowLoad);
      window.removeEventListener("resize", handleLayoutChange);
      resizeObserver?.disconnect();
      scrollerElement.removeEventListener("wheel", handleScrollerWheel);
      document.removeEventListener("wheel", handleWheel);
      scrollerElement.removeEventListener("scroll", handleNativeScroll);
    };
  }, [scrollerRef, setFocusedIndex, resetKey]);
}

export const galleryScrollerClassName =
  "h-full overflow-y-auto overscroll-contain px-1 max-md:snap-y max-md:snap-mandatory";

export const galleryItemClassName =
  "relative max-md:!w-full max-md:snap-center cursor-pointer overflow-hidden";

export const galleryTrackClassName = "flex flex-col items-center gap-5";
