"use client";

import { workGalleryImages, workGallerySrcSet } from "@/constants/workGalleryImages";
import { getWorkGalleryProject } from "@/constants/workGalleryProjects";
import {
  computeColumnTranslateVh,
  workColumns,
} from "@/lib/workColumnLayout";
import { WorkImageLink, GalleryHoverTitle } from "@/components/work/tileParts";
import { type MotionValue, useMotionValueEvent } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

const workImages = workGalleryImages;


const galleryImageClass = (linksEnabled: boolean) =>
  `h-full w-full object-cover grayscale transition-[filter] duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
    linksEnabled
      ? "contrast-125 brightness-[0.96] group-hover/tile:grayscale-0 group-hover/tile:contrast-110 group-hover/tile:brightness-105 group-focus-visible/tile:grayscale-0 group-focus-visible/tile:contrast-110 group-focus-visible/tile:brightness-105"
      : ""
  }`;

function GalleryImage({
  src,
  linksEnabled,
}: {
  src: string;
  linksEnabled: boolean;
}) {
  const project = getWorkGalleryProject(src);

  const ariaLabel = project
    ? `${project.title} — ${project.discipline}, ${project.year} (case study)`
    : undefined;

  return (
    <WorkImageLink src={src} linksEnabled={linksEnabled} ariaLabel={ariaLabel}>
      <div className="relative h-full w-full overflow-hidden">
        <img
          src={src}
          srcSet={workGallerySrcSet(src)}
          sizes="(max-width: 767px) 100vw, 33vw"
          alt=""
          className={galleryImageClass(linksEnabled)}
          loading="lazy"
          decoding="async"
        />
        {project ? (
          <GalleryHoverTitle
            title={project.title}
            discipline={project.discipline}
            year={project.year}
            linksEnabled={linksEnabled}
          />
        ) : null}
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
            <div className="flex flex-col gap-[10vh]">
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
