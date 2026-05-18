"use client";

import { useEffect, useRef, useState } from "react";
import ProjectMediaLightbox from "@/components/ProjectMediaLightbox";

interface GalleryItem {
  type: "image" | "video";
  src: string;
  className: string;
}

interface WorksNautiqueGalleryProps {
  items: readonly GalleryItem[];
}

function emitPlayerState(video: HTMLVideoElement | null, isActive: boolean) {
  window.dispatchEvent(
    new CustomEvent("nautique-player-state", {
      detail: {
        isActive,
        isPlaying: isActive && video ? !video.paused : false,
        currentTime: isActive && video ? video.currentTime : 0,
        duration:
          isActive && video && Number.isFinite(video.duration) ? video.duration : 0,
        progress:
          isActive && video && Number.isFinite(video.duration) && video.duration > 0
            ? video.currentTime / video.duration
            : 0,
      },
    }),
  );
}

export default function WorksNautiqueGallery({ items }: WorksNautiqueGalleryProps) {
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
  const lastTouchYRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoIndex = items.findIndex((item) => item.type === "video");
  const isVideoFocused = focusedIndex === videoIndex;

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (lightboxItem) {
      video.muted = true;
      video.pause();
      emitPlayerState(null, false);
      return;
    }

    video.muted = !isVideoFocused;

    if (isVideoFocused) {
      void video.play().catch(() => {
        video.muted = true;
      });
    }

    emitPlayerState(video, isVideoFocused);
  }, [isVideoFocused, lightboxItem]);

  useEffect(() => {
    function handlePlayerToggle() {
      if (!isVideoFocused || lightboxItem) {
        return;
      }

      const video = videoRef.current;

      if (!video) {
        return;
      }

      if (video.paused) {
        video.muted = false;
        void video.play();
      } else {
        video.pause();
      }

      emitPlayerState(video, true);
    }

    function handlePlayerSeek(event: Event) {
      if (!isVideoFocused || lightboxItem) {
        return;
      }

      const video = videoRef.current;
      const customEvent = event as CustomEvent<{ progress: number }>;

      if (
        !video ||
        !Number.isFinite(video.duration) ||
        video.duration <= 0
      ) {
        return;
      }

      video.currentTime = video.duration * customEvent.detail.progress;
      emitPlayerState(video, true);
    }

    window.addEventListener("nautique-player-toggle", handlePlayerToggle);
    window.addEventListener("nautique-player-seek", handlePlayerSeek);

    return () => {
      window.removeEventListener("nautique-player-toggle", handlePlayerToggle);
      window.removeEventListener("nautique-player-seek", handlePlayerSeek);
    };
  }, [isVideoFocused, lightboxItem]);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const scrollerElement = scroller;
    targetScrollRef.current = scroller.scrollTop;
    currentScrollRef.current = scroller.scrollTop;

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

    function snapToNearestItem() {
      const maxScroll =
        scrollerElement.scrollHeight - scrollerElement.clientHeight;
      const viewportCenter =
        scrollerElement.scrollTop + scrollerElement.clientHeight / 2;
      const galleryItems = Array.from(
        scrollerElement.querySelectorAll<HTMLElement>("[data-gallery-item]"),
      );
      const nearestItem = galleryItems.reduce<HTMLElement | null>((nearest, item) => {
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
      const maxScroll =
        scrollerElement.scrollHeight - scrollerElement.clientHeight;
      targetScrollRef.current = Math.max(
        0,
        Math.min(maxScroll, targetScrollRef.current + event.deltaY * 0.78),
      );

      window.clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = window.setTimeout(snapToNearestItem, 160);
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
      snapTimeoutRef.current = window.setTimeout(snapToNearestItem, 180);
    }

    animationFrameRef.current = requestAnimationFrame(render);
    const initialSnapFrame = window.requestAnimationFrame(() => {
      snapToNearestItem();
      currentScrollRef.current = targetScrollRef.current;
      scrollerElement.scrollTop = targetScrollRef.current;
    });
    scrollerElement.addEventListener("wheel", handleWheel, { passive: false });
    scrollerElement.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    scrollerElement.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    return () => {
      window.clearTimeout(snapTimeoutRef.current);
      window.cancelAnimationFrame(initialSnapFrame);
      cancelAnimationFrame(animationFrameRef.current);
      scrollerElement.removeEventListener("wheel", handleWheel);
      scrollerElement.removeEventListener("touchstart", handleTouchStart);
      scrollerElement.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  function handleVideoTimeUpdate() {
    const video = videoRef.current;
    emitPlayerState(video, isVideoFocused);
  }

  return (
    <div className="relative h-full">
      <div
        ref={scrollerRef}
        className="h-full overflow-y-auto overscroll-contain px-1 pb-[50vh] pt-[20vh]"
      >
        <div className="flex flex-col items-center gap-5">
          {items.map((item, index) => (
            <div
              key={`${item.type}-${item.src}`}
              data-gallery-item
              data-gallery-index={index}
              data-cursor-interactive="true"
              className={`relative max-md:!w-full cursor-pointer overflow-hidden ${item.className}`}
              onClick={() =>
                setLightboxItem({
                  type: item.type,
                  src: item.src,
                  alt:
                    item.type === "video"
                      ? "Nautique video"
                      : `Nautique gallery image ${index + 1}`,
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
                        ? "Nautique video"
                        : `Nautique gallery image ${index + 1}`,
                  });
                }
              }}
            >
              {item.type === "video" ? (
                <video
                  ref={videoRef}
                  src={item.src}
                  className={`pointer-events-none h-full w-full object-contain contrast-110 transition-[filter] duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    focusedIndex === index ? "grayscale-0" : "grayscale"
                  }`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  onLoadedMetadata={handleVideoTimeUpdate}
                  onPlay={handleVideoTimeUpdate}
                  onPause={handleVideoTimeUpdate}
                  onTimeUpdate={handleVideoTimeUpdate}
                />
              ) : (
                <img
                  src={item.src}
                  alt={`Nautique gallery image ${index + 1}`}
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
    </div>
  );
}
