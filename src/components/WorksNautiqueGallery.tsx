"use client";

import { useEffect, useRef, useState } from "react";
import ProjectMediaLightbox from "@/components/ProjectMediaLightbox";
import { GalleryImage, GalleryVideo } from "@/components/GalleryMedia";
import {
  galleryItemClassName,
  galleryScrollerClassName,
  galleryTrackClassName,
  useGalleryScroll,
} from "@/hooks/useGalleryScroll";
import {
  galleryNaturalImageClassName,
  isGalleryAspectItem,
  normalizeGalleryItemClass,
} from "@/lib/galleryItemClass";

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
      <div ref={scrollerRef} className={galleryScrollerClassName}>
        <div data-gallery-track className={galleryTrackClassName}>
          {items.map((item, index) => {
            const isAspectTile =
              item.type === "video" || isGalleryAspectItem(item.className);
            const itemClassName = isAspectTile
              ? item.className
              : normalizeGalleryItemClass(item.className, index, items.length);

            return (
            <div
              key={`${item.type}-${item.src}`}
              data-gallery-item
              data-gallery-index={index}
              data-cursor-interactive="true"
              className={`${galleryItemClassName} ${isAspectTile ? "" : "h-fit"} ${itemClassName}`}
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
                <GalleryVideo
                  videoRef={videoRef}
                  src={item.src}
                  isFocused={focusedIndex === index}
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
                <GalleryImage
                  src={item.src}
                  alt={`Nautique gallery image ${index + 1}`}
                  isFocused={focusedIndex === index}
                  loading={index < 2 ? "eager" : "lazy"}
                  className={galleryNaturalImageClassName}
                />
              )}
            </div>
            );
          })}
        </div>
      </div>
      <ProjectMediaLightbox
        item={lightboxItem}
        onClose={() => setLightboxItem(null)}
      />
    </div>
  );
}
