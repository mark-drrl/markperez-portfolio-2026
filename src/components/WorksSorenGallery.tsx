"use client";

import { useRef, useState } from "react";
import ProjectMediaLightbox from "@/components/ProjectMediaLightbox";
import { GalleryImage } from "@/components/GalleryMedia";
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

interface WorksSorenGalleryProps {
  items: readonly GalleryItem[];
  /** Override flex gap between gallery items (default `gap-5`). */
  itemGapClassName?: string;
  /** Extra classes merged onto the scroll container. */
  scrollerClassName?: string;
  projectName?: string;
  imageClassName?: string;
}

export default function WorksSorenGallery({
  items,
  itemGapClassName = "",
  scrollerClassName = "",
  projectName = "Soren Lyng Hansen",
  imageClassName,
}: WorksSorenGalleryProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [lightboxItem, setLightboxItem] = useState<{
    type: "image" | "video";
    src: string;
    alt: string;
  } | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useGalleryScroll(scrollerRef, setFocusedIndex);

  return (
    <>
      <div
        ref={scrollerRef}
        className={`${galleryScrollerClassName} ${scrollerClassName}`.trim()}
      >
        <div
          data-gallery-track
          className={`${galleryTrackClassName} ${itemGapClassName}`.trim()}
        >
          {items.map((item, index) => {
            const isAspectTile =
              item.type === "video" || isGalleryAspectItem(item.className);
            const itemClassName = isAspectTile
              ? item.className
              : normalizeGalleryItemClass(item.className, index, items.length);
            const resolvedImageClassName =
              imageClassName ??
              (isAspectTile
                ? "h-full w-full object-contain"
                : galleryNaturalImageClassName);

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
                      ? `${projectName} video`
                      : `${projectName} gallery image ${index + 1}`,
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
                        ? `${projectName} video`
                        : `${projectName} gallery image ${index + 1}`,
                  });
                }
              }}
            >
              {item.type === "video" ? (
                <iframe
                  src={item.src}
                  title={`${projectName} video`}
                  className="pointer-events-none h-full w-full"
                  tabIndex={-1}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <GalleryImage
                  src={item.src}
                  alt={`${projectName} gallery image ${index + 1}`}
                  isFocused={focusedIndex === index}
                  loading={index < 2 ? "eager" : "lazy"}
                  className={resolvedImageClassName}
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
    </>
  );
}
