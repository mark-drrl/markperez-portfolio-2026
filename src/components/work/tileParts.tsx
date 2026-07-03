"use client";

/**
 * Shared tile primitives — used by WorkColumnGallery (mobile / any remaining usage)
 * and CardField (desktop works-mode cards).
 *
 * Behavior is intentionally unchanged from the originals in WorkColumnGallery.tsx:
 *   - Focus ring via focus-visible
 *   - aria-label forwarded
 *   - data-work-gallery-link attribute
 *   - Route preload on pointer-enter
 *   - work-tile-hover CustomEvent for RedThread tuck
 */

import { preloadCaseStudyRoute } from "@/lib/caseStudyPreload";
import { getWorkGalleryHref } from "@/constants/workGalleryLinks";
import { isWorkDetailPath } from "@/lib/routeMode";
import Link from "next/link";
import { type ReactNode, useCallback, useRef } from "react";

// ---------------------------------------------------------------------------
// WorkImageLink
// ---------------------------------------------------------------------------

export function WorkImageLink({
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
    // Route preload
    if (href && !warmedRef.current && isWorkDetailPath(href)) {
      warmedRef.current = true;
      void preloadCaseStudyRoute(href);
    }

    // Dispatch tile-hover event for RedThread tuck
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

// ---------------------------------------------------------------------------
// GalleryHoverTitle
// ---------------------------------------------------------------------------

export function GalleryHoverTitle({
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
