"use client";

import DesktopWorkView from "@/components/work/DesktopWorkView";
import { workGalleryImages } from "@/constants/workGalleryImages";
import { getWorkGalleryHref } from "@/constants/workGalleryLinks";
import { getWorkGalleryProject } from "@/constants/workGalleryProjects";
import { GalleryImage } from "@/components/GalleryMedia";
import {
  getCenteredWorkGalleryIndex,
  maintainMobileWorkInfiniteScroll,
  MOBILE_CURATE_WORK_HANDOFF_INDEX,
  MOBILE_WORK_LOOP_COPIES,
  isMobileWorkViewport,
  scrollMobileWorkGalleryToIndex,
  syncMobileWorkToneFromIndex,
} from "@/lib/mobileWorkScroll";
import {
  dispatchHomeScrollSync,
  HOME_SCROLL_SYNC_EVENT,
  requestHomeScrollTop,
} from "@/lib/homeScroll";
import {
  registerWorkScrollMotionValues,
  resetHomeScrollPosition,
  unregisterWorkScrollMotionValues,
} from "@/lib/workScrollBridge";
import { preloadCaseStudyRoute } from "@/lib/caseStudyPreload";
import { isWorkDetailPath } from "@/lib/routeMode";
import Link from "next/link";
import { motion, type MotionValue, useMotionValue } from "framer-motion";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const workImages = workGalleryImages;

/**
 * Derives a WebP srcSet from a work gallery image path.
 * "/work/portfolio-3.jpg" → "/work/resized/portfolio-3-400w.webp 400w, ..."
 */
function workGallerySrcSet(src: string): string | undefined {
  const match = src.match(/\/work\/(portfolio-\d+)\.(jpg|png|webp)$/i);
  if (!match) return undefined;
  const base = match[1];
  return [
    `/work/resized/${base}-400w.webp 400w`,
    `/work/resized/${base}-800w.webp 800w`,
    `/work/resized/${base}-1600w.webp 1600w`,
  ].join(", ");
}

const mobileWorkLoopItems = Array.from(
  { length: MOBILE_WORK_LOOP_COPIES },
  (_, copy) =>
    workImages.map((src, index) => ({
      copy,
      index,
      src,
      key: `${copy}-${index}-${src}`,
    })),
).flat();

function getWorkHref(src: string) {
  return getWorkGalleryHref(src);
}

function WorkImageLink({
  src,
  children,
  ariaLabel,
}: {
  src: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const href = getWorkHref(src);
  const warmedRef = useRef(false);

  const handlePointerEnter = useCallback(() => {
    if (!href || warmedRef.current || !isWorkDetailPath(href)) {
      return;
    }

    warmedRef.current = true;
    void preloadCaseStudyRoute(href);
  }, [href]);

  if (href) {
    return (
      <Link
        href={href}
        prefetch={false}
        className="block h-full w-full"
        data-no-magnetic
        aria-label={ariaLabel}
        onPointerEnter={handlePointerEnter}
      >
        {children}
      </Link>
    );
  }

  return <div className="h-full w-full">{children}</div>;
}

interface WorkProps {
  scrollYProgress: MotionValue<number>;
  pointerEvents: MotionValue<"none" | "auto">;
  /** @deprecated Desktop motion is computed inside DesktopWorkView */
  sectionPresence?: MotionValue<number>;
  galleryOpacity?: MotionValue<number>;
  chromeOpacity?: MotionValue<number>;
  galleryHandoffBlur?: MotionValue<string>;
}

function WorkMobileGallery({
  virtualScroll,
  onScrollerReady,
}: {
  virtualScroll: MotionValue<number>;
  onScrollerReady: (scroller: HTMLDivElement | null) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isRebalancingRef = useRef(false);
  const [focusedIndex, setFocusedIndex] = useState(
    MOBILE_CURATE_WORK_HANDOFF_INDEX,
  );

  const updateFocusedFromScroll = useCallback(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const nearestIndex = getCenteredWorkGalleryIndex(scroller);

    setFocusedIndex((current) =>
      current === nearestIndex ? current : nearestIndex,
    );
    syncMobileWorkToneFromIndex(virtualScroll, nearestIndex);
  }, [virtualScroll]);

  const handleScrollerScroll = useCallback(() => {
    const scroller = scrollerRef.current;

    if (!scroller || isRebalancingRef.current) {
      return;
    }

    if (maintainMobileWorkInfiniteScroll(scroller)) {
      isRebalancingRef.current = true;
      window.requestAnimationFrame(() => {
        isRebalancingRef.current = false;
        updateFocusedFromScroll();
      });
      return;
    }

    updateFocusedFromScroll();
  }, [updateFocusedFromScroll]);

  useEffect(() => {
    if (!isMobileWorkViewport()) {
      onScrollerReady(null);
      return;
    }

    const scroller = scrollerRef.current;

    onScrollerReady(scroller);

    if (!scroller) {
      return;
    }

    scrollMobileWorkGalleryToIndex(scroller, MOBILE_CURATE_WORK_HANDOFF_INDEX);

    window.requestAnimationFrame(() => {
      handleScrollerScroll();
    });

    scroller.addEventListener("scroll", handleScrollerScroll, { passive: true });
    window.visualViewport?.addEventListener("resize", handleScrollerScroll);
    window.visualViewport?.addEventListener("scroll", handleScrollerScroll);
    window.addEventListener("resize", handleScrollerScroll);

    return () => {
      onScrollerReady(null);
      scroller.removeEventListener("scroll", handleScrollerScroll);
      window.visualViewport?.removeEventListener("resize", handleScrollerScroll);
      window.visualViewport?.removeEventListener("scroll", handleScrollerScroll);
      window.removeEventListener("resize", handleScrollerScroll);
    };
  }, [handleScrollerScroll, onScrollerReady]);

  return (
    <div
      ref={scrollerRef}
      className="pointer-events-auto absolute inset-0 z-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] [touch-action:pan-y] md:hidden"
    >
      <div className="flex flex-col items-center gap-[0.5vh] pt-[22dvh] pb-[22dvh]">
        {mobileWorkLoopItems.map((item) => {
          const project = getWorkGalleryProject(item.src);
          const ariaLabel = project
            ? `${project.title} — ${project.discipline}, ${project.year} (case study)`
            : undefined;
          return (
            <div
              key={item.key}
              data-work-gallery-item
              data-gallery-index={item.index}
              data-loop-copy={item.copy}
              className="relative h-[56dvh] w-full max-w-full shrink-0 overflow-hidden bg-neutral-300"
            >
              <WorkImageLink src={item.src} ariaLabel={ariaLabel}>
                <GalleryImage
                  src={item.src}
                  srcSet={workGallerySrcSet(item.src)}
                  sizes="(max-width: 480px) 100vw, (max-width: 767px) 90vw, 100vw"
                  alt=""
                  isFocused={focusedIndex === item.index}
                  className="object-cover"
                />
              </WorkImageLink>
              {project ? (
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-4 pt-12"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.28) 55%, transparent 100%)",
                  }}
                  aria-hidden
                >
                  <p className="font-editorial text-[1.25rem] leading-[0.92] tracking-[0.04em] text-white">
                    {project.title}
                  </p>
                  <p className="font-neue mt-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-white/70">
                    {project.year}
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Work section — desktop panel + mobile scroll gallery. */
export default function Work({
  scrollYProgress,
  pointerEvents,
}: WorkProps) {
  const mobileScrollerRef = useRef<HTMLDivElement | null>(null);
  const mobileVirtualScroll = useMotionValue(0);

  useEffect(() => {
    if (!isMobileWorkViewport()) {
      return;
    }

    registerWorkScrollMotionValues(scrollYProgress, mobileVirtualScroll);
    syncMobileWorkToneFromIndex(
      mobileVirtualScroll,
      MOBILE_CURATE_WORK_HANDOFF_INDEX,
    );

    return () => {
      unregisterWorkScrollMotionValues();
    };
  }, [scrollYProgress, mobileVirtualScroll]);

  const scrollMobileGalleryToHandoff = useCallback(() => {
    const scroller = mobileScrollerRef.current;

    if (!scroller) {
      return;
    }

    scrollMobileWorkGalleryToIndex(scroller, MOBILE_CURATE_WORK_HANDOFF_INDEX);
  }, []);

  useEffect(() => {
    if (!isMobileWorkViewport()) {
      return;
    }

    function handleHomeScrollSync() {
      if (window.location.pathname !== "/" || window.location.hash !== "#works") {
        return;
      }

      window.requestAnimationFrame(() => {
        scrollMobileGalleryToHandoff();
      });
    }

    handleHomeScrollSync();
    window.addEventListener(HOME_SCROLL_SYNC_EVENT, handleHomeScrollSync);

    return () => {
      window.removeEventListener(HOME_SCROLL_SYNC_EVENT, handleHomeScrollSync);
    };
  }, [scrollMobileGalleryToHandoff]);

  function handleBackToHome() {
    requestHomeScrollTop();

    if (window.location.pathname === "/") {
      window.history.replaceState(null, "", "/");
      resetHomeScrollPosition();
      window.requestAnimationFrame(() => dispatchHomeScrollSync());
      return;
    }

    window.location.href = "/";
  }

  return (
    <>
      <div className="absolute inset-0 hidden md:block">
        <DesktopWorkView
          scrollYProgress={scrollYProgress}
          pointerEvents={pointerEvents}
        />
      </div>

      <motion.section
        className="absolute inset-0 h-full w-full overflow-hidden bg-[#EAEAEA] md:hidden"
        style={{ pointerEvents }}
      >
        <WorkMobileGallery
          virtualScroll={mobileVirtualScroll}
          onScrollerReady={(scroller) => {
            mobileScrollerRef.current = scroller;
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-6 px-8 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-3">
          <button
            type="button"
            onClick={handleBackToHome}
            className="pointer-events-auto text-[10px] font-semibold tracking-[0.15em] text-black/70"
          >
            BACK TO HOME
          </button>
        </div>
      </motion.section>
    </>
  );
}
