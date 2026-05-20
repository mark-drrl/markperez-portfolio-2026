import { type RefObject, useEffect, useRef } from "react";

export function useGalleryScroll(
  scrollerRef: RefObject<HTMLDivElement | null>,
  setFocusedIndex: (index: number) => void,
  resetKey?: string | number,
) {
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);
  const animationFrameRef = useRef(0);
  const snapTimeoutRef = useRef(0);
  const lastTouchYRef = useRef(0);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const scrollerElement = scroller;
    const mobileQuery = window.matchMedia("(max-width: 767px)");

    function isMobile() {
      return mobileQuery.matches;
    }

    function findNearestItem() {
      const viewportCenter =
        scrollerElement.scrollTop + scrollerElement.clientHeight / 2;
      const galleryItems = Array.from(
        scrollerElement.querySelectorAll<HTMLElement>("[data-gallery-item]"),
      );

      return galleryItems.reduce<HTMLElement | null>((nearest, item) => {
        if (!nearest) {
          return item;
        }

        const nearestCenter = nearest.offsetTop + nearest.offsetHeight / 2;
        const itemCenter = item.offsetTop + item.offsetHeight / 2;

        return Math.abs(itemCenter - viewportCenter) <
          Math.abs(nearestCenter - viewportCenter)
          ? item
          : nearest;
      }, null);
    }

    function getSnapScrollTop(item: HTMLElement) {
      const maxScroll =
        scrollerElement.scrollHeight - scrollerElement.clientHeight;

      return Math.max(
        0,
        Math.min(
          maxScroll,
          item.offsetTop +
            item.offsetHeight / 2 -
            scrollerElement.clientHeight / 2,
        ),
      );
    }

    function updateFocusedFromViewport() {
      const nearestItem = findNearestItem();

      if (!nearestItem) {
        return;
      }

      setFocusedIndex(Number(nearestItem.dataset.galleryIndex ?? 0));
    }

    function snapToNearestItem(smooth = false) {
      const nearestItem = findNearestItem();

      if (!nearestItem) {
        return;
      }

      const nearestIndex = Number(nearestItem.dataset.galleryIndex ?? 0);
      const snapTop = getSnapScrollTop(nearestItem);

      setFocusedIndex(nearestIndex);

      if (isMobile()) {
        scrollerElement.scrollTo({
          top: snapTop,
          behavior: smooth ? "smooth" : "auto",
        });
        return;
      }

      targetScrollRef.current = snapTop;
    }

    function handleMobileScroll() {
      updateFocusedFromViewport();
      window.clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = window.setTimeout(() => snapToNearestItem(true), 140);
    }

    if (isMobile()) {
      const initialSnapFrame = window.requestAnimationFrame(() => {
        snapToNearestItem(false);
      });

      scrollerElement.addEventListener("scroll", handleMobileScroll, {
        passive: true,
      });

      return () => {
        window.cancelAnimationFrame(initialSnapFrame);
        window.clearTimeout(snapTimeoutRef.current);
        scrollerElement.removeEventListener("scroll", handleMobileScroll);
      };
    }

    targetScrollRef.current = scrollerElement.scrollTop;
    currentScrollRef.current = scrollerElement.scrollTop;

    function render() {
      const currentScroller = scrollerRef.current;

      if (!currentScroller) {
        return;
      }

      currentScrollRef.current +=
        (targetScrollRef.current - currentScrollRef.current) * 0.085;
      currentScroller.scrollTop = currentScrollRef.current;
      animationFrameRef.current = requestAnimationFrame(render);
    }

    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      scrollerElement.blur();
      const maxScroll =
        scrollerElement.scrollHeight - scrollerElement.clientHeight;
      targetScrollRef.current = Math.max(
        0,
        Math.min(maxScroll, targetScrollRef.current + event.deltaY * 0.78),
      );

      window.clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = window.setTimeout(() => snapToNearestItem(false), 160);
    }

    function handleTouchStart(event: TouchEvent) {
      const touch = event.touches[0];

      if (!touch) {
        return;
      }

      lastTouchYRef.current = touch.clientY;
    }

    function handleTouchMove(event: TouchEvent) {
      const touch = event.touches[0];

      if (!touch) {
        return;
      }

      event.preventDefault();
      const maxScroll =
        scrollerElement.scrollHeight - scrollerElement.clientHeight;
      const deltaY = lastTouchYRef.current - touch.clientY;
      lastTouchYRef.current = touch.clientY;
      targetScrollRef.current = Math.max(
        0,
        Math.min(maxScroll, targetScrollRef.current + deltaY * 1.35),
      );

      window.clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = window.setTimeout(() => snapToNearestItem(false), 180);
    }

    animationFrameRef.current = requestAnimationFrame(render);
    scrollerElement.addEventListener("wheel", handleWheel, { passive: false });
    scrollerElement.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    scrollerElement.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    return () => {
      window.clearTimeout(snapTimeoutRef.current);
      cancelAnimationFrame(animationFrameRef.current);
      scrollerElement.removeEventListener("wheel", handleWheel);
      scrollerElement.removeEventListener("touchstart", handleTouchStart);
      scrollerElement.removeEventListener("touchmove", handleTouchMove);
    };
  }, [scrollerRef, setFocusedIndex, resetKey]);
}

export function galleryMediaClassName(
  focusedIndex: number,
  index: number,
) {
  return `h-full w-full object-contain contrast-110 transition-[filter] duration-[2200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
    focusedIndex === index ? "grayscale-0" : "grayscale"
  }`;
}

export const galleryScrollerClassName =
  "h-full overflow-y-auto overscroll-contain px-1 py-[20vh] max-md:snap-y max-md:snap-proximity max-md:scroll-smooth";

export const galleryItemClassName =
  "relative max-md:!w-full max-md:snap-center max-md:snap-always cursor-pointer overflow-hidden";
