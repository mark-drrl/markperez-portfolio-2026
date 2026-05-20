"use client";

import { useEffect, useRef, useState } from "react";
import ProjectMediaLightbox from "@/components/ProjectMediaLightbox";
import {
  galleryItemClassName,
  galleryMediaClassName,
  useGalleryScroll,
} from "@/hooks/useGalleryScroll";

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
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useGalleryScroll(scrollerRef, setFocusedIndex);
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

  function handleVideoTimeUpdate() {
    const video = videoRef.current;
    emitPlayerState(video, isVideoFocused);
  }

  return (
    <div className="relative h-full">
      <div
        ref={scrollerRef}
        className="h-full overflow-y-auto overscroll-contain px-1 pb-[50vh] pt-[20vh] max-md:snap-y max-md:snap-proximity max-md:scroll-smooth"
      >
        <div className="flex flex-col items-center gap-5">
          {items.map((item, index) => (
            <div
              key={`${item.type}-${item.src}`}
              data-gallery-item
              data-gallery-index={index}
              data-cursor-interactive="true"
              className={`${galleryItemClassName} ${item.className}`}
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
                  className={`pointer-events-none ${galleryMediaClassName(focusedIndex, index)}`}
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
                  className={galleryMediaClassName(focusedIndex, index)}
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
