"use client";

import { workGalleryImages, workGallerySrcSet } from "@/constants/workGalleryImages";
import { getWorkGalleryHref } from "@/constants/workGalleryLinks";
import { getWorkGalleryProject } from "@/constants/workGalleryProjects";
import {
  computeColumnTranslateVh,
  workColumns,
} from "@/lib/workColumnLayout";
import { preloadCaseStudyRoute } from "@/lib/caseStudyPreload";
import { isWorkDetailPath } from "@/lib/routeMode";
import { type MotionValue, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { type ReactNode, useCallback, useEffect, useRef } from "react";

const workImages = workGalleryImages;


const galleryImageClass = (linksEnabled: boolean) =>
  `h-full w-full object-cover grayscale transition-[filter] duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
    linksEnabled
      ? "contrast-125 brightness-[0.96] group-hover/tile:grayscale-0 group-hover/tile:contrast-110 group-hover/tile:brightness-105 group-focus-visible/tile:grayscale-0 group-focus-visible/tile:contrast-110 group-focus-visible/tile:brightness-105"
      : ""
  }`;

function WorkImageLink({
  src,
  children,
  linksEnabled,
  ariaLabel,
}: {
  src: string;
  children: ReactNode;
  linksEnabled: boolean;
  ariaLabel?: string;
}) {
  const href = getWorkGalleryHref(src);
  const warmedRef = useRef(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  const handlePointerEnter = useCallback(() => {
    // Route preload (existing)
    if (href && !warmedRef.current && isWorkDetailPath(href)) {
      warmedRef.current = true;
      void preloadCaseStudyRoute(href);
    }

    // Dispatch tile-hover event for RedThread
    if (linksEnabled && linkRef.current) {
      const rect = linkRef.current.getBoundingClientRect();
      window.dispatchEvent(
        new CustomEvent("work-tile-hover", {
          detail: { active: true, x: rect.left, y: rect.top, w: rect.width, h: rect.height },
        }),
      );
    }
  }, [href, linksEnabled]);

  const handlePointerLeave = useCallback(() => {
    if (linksEnabled) {
      window.dispatchEvent(
        new CustomEvent("work-tile-hover", { detail: { active: false } }),
      );
    }
  }, [linksEnabled]);

  if (linksEnabled && href) {
    return (
      <Link
        ref={linkRef}
        href={href}
        prefetch={false}
        className="group/tile block h-full w-full outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#9F1F2E]"
        data-work-gallery-link
        aria-label={ariaLabel}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        {children}
      </Link>
    );
  }

  return <div className="h-full w-full">{children}</div>;
}

function GalleryHoverTitle({
  title,
  discipline,
  year,
  linksEnabled,
}: {
  title: string;
  discipline: string;
  year: string;
  linksEnabled: boolean;
}) {
  if (!linksEnabled) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex items-end justify-start bg-black/0 p-6 transition-[background-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/tile:bg-black/18 group-focus-visible/tile:bg-black/18 md:p-8">
      <div className="translate-y-3 opacity-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/tile:translate-y-0 group-hover/tile:opacity-100 group-focus-visible/tile:translate-y-0 group-focus-visible/tile:opacity-100">
        <p className="font-editorial max-w-[78%] text-left text-[clamp(1.15rem,2.2vw,1.85rem)] leading-[0.92] tracking-[0.04em] text-white">
          {title}
        </p>
        <p className="font-neue mt-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70">
          {discipline} — {year}
        </p>
      </div>
    </div>
  );
}

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
