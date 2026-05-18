"use client";

import { useEffect, useRef } from "react";
import { useState } from "react";
import ProjectMediaLightbox from "@/components/ProjectMediaLightbox";

interface GalleryItem {
  type: "image" | "video";
  src: string;
  className: string;
}

interface WorksSorenGalleryProps {
  items: readonly GalleryItem[];
}

export default function WorksSorenGallery({ items }: WorksSorenGalleryProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [lightboxItem, setLightboxItem] = useState<{
    type: "image" | "video";
    src: string;
    alt: string;
  } | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);
  const animationFrameRef = useRef(0);
  const snapTimeoutRef = useRef(0);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const scrollerElement = scroller;
    targetScrollRef.current = scroller.scrollTop;
    currentScrollRef.current = scroller.scrollTop;

    function render() {
      const scrollerElement = scrollerRef.current;

      if (!scrollerElement) {
        return;
      }

      currentScrollRef.current +=
        (targetScrollRef.current - currentScrollRef.current) * 0.085;
      scrollerElement.scrollTop = currentScrollRef.current;

      animationFrameRef.current = requestAnimationFrame(render);
    }

    function snapToNearestItem() {
      const maxScroll =
        scrollerElement.scrollHeight - scrollerElement.clientHeight;
      const viewportCenter =
        scrollerElement.scrollTop + scrollerElement.clientHeight / 2;
      const items = Array.from(
        scrollerElement.querySelectorAll<HTMLElement>("[data-gallery-item]"),
      );
      const nearestItem = items.reduce<HTMLElement | null>((nearest, item) => {
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

      if (!nearestItem) {
        return;
      }

      const nearestIndex = Number(nearestItem.dataset.galleryIndex ?? 0);
      setFocusedIndex(nearestIndex);
      targetScrollRef.current = Math.max(
        0,
        Math.min(
          maxScroll,
          nearestItem.offsetTop +
            nearestItem.offsetHeight / 2 -
            scrollerElement.clientHeight / 2,
        ),
      );
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
      snapTimeoutRef.current = window.setTimeout(snapToNearestItem, 160);
    }

    animationFrameRef.current = requestAnimationFrame(render);
    scrollerElement.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.clearTimeout(snapTimeoutRef.current);
      cancelAnimationFrame(animationFrameRef.current);
      scrollerElement.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <>
      <div
        ref={scrollerRef}
        className="h-full overflow-y-auto overscroll-contain px-1 py-[20vh]"
      >
        <div className="flex flex-col items-center gap-5">
          {items.map((item, index) => (
            <div
              key={`${item.type}-${item.src}`}
              data-gallery-item
              data-gallery-index={index}
              data-cursor-interactive="true"
              className={`relative cursor-pointer overflow-hidden ${item.className}`}
              onClick={() =>
                setLightboxItem({
                  type: item.type,
                  src: item.src,
                  alt:
                    item.type === "video"
                      ? "Soren Lyng Hansen video"
                      : `Soren Lyng Hansen gallery image ${index + 1}`,
                })
              }
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setLightboxItem({
                    type: item.type,
                    src: item.src,
                    alt:
                      item.type === "video"
                        ? "Soren Lyng Hansen video"
                        : `Soren Lyng Hansen gallery image ${index + 1}`,
                  });
                }
              }}
            >
              {item.type === "video" ? (
                <iframe
                  src={item.src}
                  title="Soren Lyng Hansen video"
                  className="pointer-events-none h-full w-full"
                  tabIndex={-1}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <img
                  src={item.src}
                  alt={`Soren Lyng Hansen gallery image ${index + 1}`}
                  className={`h-full w-full object-contain contrast-110 transition-[filter] duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    focusedIndex === index ? "grayscale-0" : "grayscale"
                  }`}
                  loading={index < 2 ? "eager" : "lazy"}
                  decoding="async"
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <ProjectMediaLightbox
        item={lightboxItem}
        onClose={() => setLightboxItem(null)}
      />
    </>
  );
}
