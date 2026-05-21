"use client";

import { workGalleryImages } from "@/constants/workGalleryImages";
import {
  computeColumnTranslateVh,
  workColumns,
} from "@/lib/workColumnLayout";
import { type MotionValue, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { type ReactNode, useCallback, useEffect, useRef } from "react";

const workImages = workGalleryImages;

function getWorkHref(src: string) {
  if (src === "/work/portfolio-1.jpg") return "/works-centurionv1";
  if (src === "/work/portfolio-2.png") return "/works-lifestyle";
  if (src === "/work/portfolio-3.jpg") return "/works-soren";
  if (src === "/work/portfolio-4.jpg") return "/works-lsb";
  if (src === "/work/portfolio-5.jpg") return "/works-wakedubai";
  if (src === "/work/portfolio-6.jpg") return "/works-nautique";
  if (src === "/work/portfolio-7.jpg") return "/works-interior";
  if (src === "/work/portfolio-8.jpg") return "/works-atm";
  if (src === "/work/portfolio-9.jpg") return "/works-phase5page";
  if (src === "/work/portfolio-10.jpg") return "/works-supreme";
  return null;
}

function WorkImageLink({
  src,
  children,
  linksEnabled,
}: {
  src: string;
  children: ReactNode;
  linksEnabled: boolean;
}) {
  const href = getWorkHref(src);

  if (linksEnabled && href) {
    return (
      <Link
        href={href}
        prefetch={false}
        className="block h-full w-full"
        data-work-gallery-link
      >
        {children}
      </Link>
    );
  }

  return <div className="h-full w-full">{children}</div>;
}

function GalleryImage({
  src,
  linksEnabled,
}: {
  src: string;
  linksEnabled: boolean;
}) {
  return (
    <WorkImageLink src={src} linksEnabled={linksEnabled}>
      <div className="group relative h-full w-full">
        <img
          src={src}
          alt=""
          className={`h-full w-full object-cover grayscale transition-[filter] duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            linksEnabled
              ? "contrast-125 brightness-[0.96] group-hover:grayscale-0 group-hover:contrast-110 group-hover:brightness-105"
              : ""
          }`}
          loading="lazy"
          decoding="async"
        />
      </div>
    </WorkImageLink>
  );
}

interface WorkColumnGalleryProps {
  virtualScroll: MotionValue<number>;
  /** When false, images are preview-only (no navigation). */
  linksEnabled?: boolean;
  className?: string;
}

/** Desktop three-column Work gallery. */
export default function WorkColumnGallery({
  virtualScroll,
  linksEnabled = false,
  className = "",
}: WorkColumnGalleryProps) {
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);

  const applyColumnTransforms = useCallback((virtualOffset: number) => {
    workColumns.forEach((column, columnIndex) => {
      const columnElement = columnRefs.current[columnIndex];

      if (!columnElement) {
        return;
      }

      const translateVh = computeColumnTranslateVh(virtualOffset, column);
      columnElement.style.transform = `translate3d(0, ${translateVh}vh, 0)`;
    });
  }, []);

  useMotionValueEvent(virtualScroll, "change", applyColumnTransforms);

  useEffect(() => {
    applyColumnTransforms(virtualScroll.get());
  }, [virtualScroll, applyColumnTransforms]);

  return (
    <div className={`hidden h-full w-full md:block ${className}`}>
      {workColumns.map((column, columnIndex) => {
        const loopedTiles = [...column.tiles, ...column.tiles, ...column.tiles];

        return (
          <div
            key={`column-${columnIndex}`}
            ref={(element) => {
              columnRefs.current[columnIndex] = element;
            }}
            className="absolute top-0 h-full will-change-transform [transition:none]"
            style={{
              left: column.left,
              width: column.width,
              transform: `translate3d(0, ${computeColumnTranslateVh(virtualScroll.get(), column)}vh, 0)`,
            }}
          >
            <div className="flex flex-col gap-[0.5vh]">
              {loopedTiles.map((tile, tileIndex) => (
                <div
                  key={`${tile.image}-${tileIndex}`}
                  className="w-full overflow-hidden bg-neutral-300"
                  style={{ height: `${tile.height}vh` }}
                >
                  <GalleryImage
                    src={workImages[tile.image]}
                    linksEnabled={linksEnabled}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
