"use client";

import { useEffect, useRef, useState } from "react";
import ProjectMediaLightbox from "@/components/ProjectMediaLightbox";

interface GalleryItem {
  type: "image" | "video";
  src: string;
  className: string;
}

interface WorksLsbGalleryProps {
  imageItems: readonly GalleryItem[];
  reelItems: readonly GalleryItem[];
}

function emitPlayerState(video: HTMLVideoElement | null, isActive: boolean) {
  window.dispatchEvent(
    new CustomEvent("lsb-player-state", {
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

export default function WorksLsbGallery({
  imageItems,
  reelItems,
}: WorksLsbGalleryProps) {
  const [activeTab, setActiveTab] = useState<"images" | "reels">("images");
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
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const items = activeTab === "images" ? imageItems : reelItems;

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    targetScrollRef.current = 0;
    currentScrollRef.current = 0;
    scroller.scrollTop = 0;
    setFocusedIndex(0);
  }, [activeTab]);

  useEffect(() => {
    if (lightboxItem) {
      videoRefs.current.forEach((video) => {
        if (!video) {
          return;
        }

        video.muted = true;
        video.pause();
      });
      emitPlayerState(null, false);
      return;
    }

    videoRefs.current.forEach((video, index) => {
      if (!video) {
        return;
      }

      video.muted = activeTab !== "reels" || index !== focusedIndex;
      void video.play().catch(() => {
        video.muted = true;
      });
    });

    emitPlayerState(
      activeTab === "reels" ? videoRefs.current[focusedIndex] ?? null : null,
      activeTab === "reels",
    );
  }, [activeTab, focusedIndex, lightboxItem]);

  useEffect(() => {
    function handlePlayerToggle() {
      if (activeTab !== "reels" || lightboxItem) {
        return;
      }

      const video = videoRefs.current[focusedIndex];

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

    window.addEventListener("lsb-player-toggle", handlePlayerToggle);

    return () => {
      window.removeEventListener("lsb-player-toggle", handlePlayerToggle);
    };
  }, [activeTab, focusedIndex, lightboxItem]);

  useEffect(() => {
    function handlePlayerSeek(event: Event) {
      if (activeTab !== "reels" || lightboxItem) {
        return;
      }

      const customEvent = event as CustomEvent<{ progress: number }>;
      const video = videoRefs.current[focusedIndex];

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

    window.addEventListener("lsb-player-seek", handlePlayerSeek);

    return () => {
      window.removeEventListener("lsb-player-seek", handlePlayerSeek);
    };
  }, [activeTab, focusedIndex, lightboxItem]);

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
      const nearestItem = galleryItems.reduce<HTMLElement | null>(
        (nearest, item) => {
          if (!nearest) {
            return item;
          }

          const nearestCenter = nearest.offsetTop + nearest.offsetHeight / 2;
          const itemCenter = item.offsetTop + item.offsetHeight / 2;

          return Math.abs(itemCenter - viewportCenter) <
            Math.abs(nearestCenter - viewportCenter)
            ? item
            : nearest;
        },
        null,
      );

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
    <div className="relative h-full">
      <div className="absolute inset-x-0 top-[7vh] z-50 flex justify-center gap-8 text-[9px] uppercase tracking-[0.28em] text-black/42 [font-family:'JetBrains_Mono','JetBrainsMono','SF_Mono',Consolas,monospace]">
        {[
          ["images", "IMAGES"],
          ["reels", "REELS"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id as "images" | "reels")}
            className={`transition-colors hover:text-[#9F1F2E] ${
              activeTab === id ? "text-[#9F1F2E]" : ""
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        ref={scrollerRef}
        className="h-full overflow-y-auto overscroll-contain px-1 py-[20vh]"
      >
        <div
          className={`flex flex-col items-center ${
            activeTab === "reels" ? "gap-4" : "gap-6"
          }`}
        >
          {items.map((item, index) => (
            <div
              key={`${activeTab}-${item.src}`}
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
                      ? `LSB Yacht Charter reel ${index + 1}`
                      : `LSB Yacht Charter gallery image ${index + 1}`,
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
                        ? `LSB Yacht Charter reel ${index + 1}`
                        : `LSB Yacht Charter gallery image ${index + 1}`,
                  });
                }
              }}
            >
              {item.type === "video" ? (
                <video
                  ref={(element) => {
                    videoRefs.current[index] = element;
                  }}
                  src={item.src}
                  className={`pointer-events-none h-full w-full object-contain contrast-110 transition-[filter] duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    focusedIndex === index ? "grayscale-0" : "grayscale"
                  }`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  onLoadedMetadata={(event) => {
                    if (activeTab === "reels" && focusedIndex === index) {
                      emitPlayerState(event.currentTarget, true);
                    }
                  }}
                  onPlay={(event) => {
                    if (activeTab === "reels" && focusedIndex === index) {
                      emitPlayerState(event.currentTarget, true);
                    }
                  }}
                  onPause={(event) => {
                    if (activeTab === "reels" && focusedIndex === index) {
                      emitPlayerState(event.currentTarget, true);
                    }
                  }}
                  onTimeUpdate={(event) => {
                    if (activeTab === "reels" && focusedIndex === index) {
                      emitPlayerState(event.currentTarget, true);
                    }
                  }}
                />
              ) : (
                <img
                  src={item.src}
                  alt={`LSB Yacht Charter gallery image ${index + 1}`}
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
