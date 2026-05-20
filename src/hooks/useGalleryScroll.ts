import { type RefObject, useEffect, useRef } from "react";

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

    function isMobile() {
      return mobileQuery.matches;
    }

    function findNearestItem() {
      const scrollerRect = scrollerElement.getBoundingClientRect();
      const viewportCenter = scrollerRect.top + scrollerRect.height / 2;
      const galleryItems = Array.from(
        scrollerElement.querySelectorAll<HTMLElement>("[data-gallery-item]"),
      );

      return galleryItems.reduce<HTMLElement | null>((nearest, item) => {
        if (!nearest) {
          return item;
        }

        const itemRect = item.getBoundingClientRect();
        const nearestRect = nearest.getBoundingClientRect();
        const itemCenter = itemRect.top + itemRect.height / 2;
        const nearestCenter = nearestRect.top + nearestRect.height / 2;

        return Math.abs(itemCenter - viewportCenter) <
          Math.abs(nearestCenter - viewportCenter)
          ? item
          : nearest;
      }, null);
    }

    function getSnapScrollTop(item: HTMLElement) {
      const maxScroll =
        scrollerElement.scrollHeight - scrollerElement.clientHeight;
      const scrollerRect = scrollerElement.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const itemCenterInScroller =
        itemRect.top - scrollerRect.top + scrollerElement.scrollTop + itemRect.height / 2;

      return Math.max(
        0,
        Math.min(
          maxScroll,
          itemCenterInScroller - scrollerElement.clientHeight / 2,
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

      if (isMobile() || !smooth) {
        return;
      }

      scrollerElement.scrollTo({
        top: snapTop,
        behavior: "smooth",
      });
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
      scheduleFocusUpdate();
      window.clearTimeout(snapTimeoutRef.current);

      if (isMobile()) {
        return;
      }

      snapTimeoutRef.current = window.setTimeout(() => snapToNearestItem(true), 140);
    }

    const initialFocusFrame = window.requestAnimationFrame(() => {
      updateFocusedFromViewport();
    });

    function handleDocumentWheel(event: WheelEvent) {
      if (isMobile()) {
        return;
      }

      const target = event.target;

      if (target instanceof Node && scrollerElement.contains(target)) {
        return;
      }

      const maxScroll =
        scrollerElement.scrollHeight - scrollerElement.clientHeight;

      if (maxScroll <= 0) {
        return;
      }

      event.preventDefault();
      scrollerElement.scrollTop = Math.max(
        0,
        Math.min(maxScroll, scrollerElement.scrollTop + event.deltaY),
      );
      handleNativeScroll();
    }

    scrollerElement.addEventListener("scroll", handleNativeScroll, {
      passive: true,
    });
    document.addEventListener("wheel", handleDocumentWheel, { passive: false });

    return () => {
      window.cancelAnimationFrame(initialFocusFrame);
      window.cancelAnimationFrame(focusFrameRef.current);
      window.clearTimeout(snapTimeoutRef.current);
      scrollerElement.removeEventListener("scroll", handleNativeScroll);
      document.removeEventListener("wheel", handleDocumentWheel);
    };
  }, [scrollerRef, setFocusedIndex, resetKey]);
}

export const galleryScrollerClassName =
  "h-full overflow-y-auto overscroll-contain px-1 py-[20vh] max-md:snap-y max-md:snap-mandatory";

export const galleryItemClassName =
  "relative max-md:!w-full max-md:snap-center cursor-pointer overflow-hidden";
