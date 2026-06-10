"use client";

import DesktopWorkView from "@/components/work/DesktopWorkView";
import { workGalleryImages } from "@/constants/workGalleryImages";
import { getWorkGalleryHref } from "@/constants/workGalleryLinks";
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

function WorkImageLink({ src, children }: { src: string; children: ReactNode }) {
  const href = getWorkHref(src);

  if (href) {
    return (
      <Link href={href} prefetch={false} className="block h-full w-full" data-no-magnetic>
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
        {mobileWorkLoopItems.map((item) => (
          <div
            key={item.key}
            data-work-gallery-item
            data-gallery-index={item.index}
            data-loop-copy={item.copy}
            className="h-[56dvh] w-full max-w-full shrink-0 overflow-hidden bg-neutral-300"
          >
            <WorkImageLink src={item.src}>
              <GalleryImage
                src={item.src}
                alt=""
                isFocused={focusedIndex === item.index}
                className="object-cover"
              />
            </WorkImageLink>
          </div>
        ))}
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
