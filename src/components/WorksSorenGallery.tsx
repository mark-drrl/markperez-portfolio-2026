"use client";

import { useRef, useState } from "react";
import ProjectMediaLightbox from "@/components/ProjectMediaLightbox";
import {
  galleryItemClassName,
  galleryMediaClassName,
  galleryScrollerClassName,
  useGalleryScroll,
} from "@/hooks/useGalleryScroll";

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

  useGalleryScroll(scrollerRef, setFocusedIndex);

  return (
    <>
      <div ref={scrollerRef} className={galleryScrollerClassName}>
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
    </>
  );
}
