"use client";

import HomeDesktopStack from "@/components/home/HomeDesktopStack";
import HomeMobileStack from "@/components/home/HomeMobileStack";
import FluidDistortion from "@/components/FluidDistortion";
import ProceduralGrain from "@/components/ProceduralGrain";
import { useHomeScrollProgress } from "@/hooks/useHomeScrollProgress";
import { useMobileViewportHeight } from "@/hooks/useMobileViewportHeight";
import {
  HOME_SCROLL_SYNC_EVENT,
  HOME_WORK_SCROLL_PROGRESS,
  dispatchHomeScrollSync,
  getHomeScrollProgress,
  scrollHomeToProgress,
  scrollHomeToTop,
  scrollHomeToWorksGallery,
  shouldLandOnWorkGallery,
} from "@/lib/homeScroll";
import { MOBILE_WORK_SCROLL_PROGRESS } from "@/lib/mobileHomeOpacity";
import Lenis from "lenis";
import { restoreNativeDocumentScroll } from "@/lib/restoreDocumentScroll";
import {
  desktopCurateLayerOpacity,
  desktopCuratePreviewOpacity,
  desktopWorkChromeOpacity,
} from "@/lib/desktopHomeTransitions";
import {
  handleWorkLenisVirtualScroll,
  isWorkGalleryScrollActive,
  syncWorkScrollEngagement,
  tickWorkVirtualScrollSmoothing,
  unlockWorkScroll,
  workScrollBridge,
} from "@/lib/workScrollBridge";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

function LastPage({ onClose }: { onClose: () => void }) {
  return (
    <section className="flex h-full w-full flex-col items-center justify-center bg-[#EAEAEA] p-12 text-center text-black">
      <p className="font-neue text-[10px] tracking-[0.25em] text-black/40">FINAL ACT</p>
      <h2 className="font-editorial mt-4 text-5xl italic text-[#9A3A3A] md:text-7xl">
        Last page
      </h2>
      <button
        type="button"
        onClick={onClose}
        className="mt-8 text-[10px] tracking-[0.25em] text-black/50 transition-colors hover:text-black"
      >
        CLOSE
      </button>
    </section>
  );
}

function workThresholdForViewport() {
  if (typeof window === "undefined") {
    return HOME_WORK_SCROLL_PROGRESS;
  }

  return window.matchMedia("(min-width: 768px)").matches
    ? HOME_WORK_SCROLL_PROGRESS
    : MOBILE_WORK_SCROLL_PROGRESS;
}

export default function Home() {
  const pathname = usePathname();
  const [isLastPageOpen, setIsLastPageOpen] = useState(false);
  const [isInWorkSection, setIsInWorkSection] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const inWorkRef = useRef(false);
  // Magnetic element ref — page.tsx still owns the magnetic pull effect for
  // the home page (which has work-gallery-aware suppression logic). The cursor
  // DOT visual is owned by SiteCursor in layout.tsx.
  const activeMagneticElementRef = useRef<HTMLElement | null>(null);
  const scrollYProgress = useHomeScrollProgress(containerRef);
  useMobileViewportHeight(pathname === "/");

  const syncHomeScrollFromProgress = useCallback((progress: number) => {
    const enterThreshold = workThresholdForViewport();
    const exitThreshold = enterThreshold - 0.05;
    let inWork = inWorkRef.current;

    if (!inWork && progress >= enterThreshold) {
      inWork = true;
    } else if (inWork && progress < exitThreshold) {
      inWork = false;
    }

    if (inWork !== inWorkRef.current) {
      inWorkRef.current = inWork;
      setIsInWorkSection(inWork);

      // Keep URL in sync so browser back from a works-* page returns here, not the hero.
      if (typeof window !== "undefined") {
        if (inWork && window.location.hash !== "#works") {
          window.history.replaceState(
            null,
            "",
            `${window.location.pathname}${window.location.search}#works`,
          );
        } else if (!inWork && window.location.hash === "#works") {
          window.history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search,
          );
        }
      }
    }
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    syncHomeScrollFromProgress(latest);
  });

  useLayoutEffect(() => {
    if (pathname !== "/") {
      return;
    }

    window.history.scrollRestoration = "manual";

    const main = containerRef.current;

    if (shouldLandOnWorkGallery()) {
      const progress = scrollHomeToWorksGallery(main);
      syncHomeScrollFromProgress(progress);
      dispatchHomeScrollSync();
      return;
    }

    const progress = scrollHomeToTop(main);
    syncHomeScrollFromProgress(progress);
  }, [pathname, syncHomeScrollFromProgress]);

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    function handleHomeScrollSync() {
      const main = containerRef.current;

      if (shouldLandOnWorkGallery()) {
        syncHomeScrollFromProgress(scrollHomeToWorksGallery(main));
        dispatchHomeScrollSync();
        return;
      }

      syncHomeScrollFromProgress(scrollHomeToTop(main));
    }

    function handlePageShow(event: PageTransitionEvent) {
      if (!event.persisted) {
        return;
      }

      handleHomeScrollSync();
    }

    window.addEventListener(HOME_SCROLL_SYNC_EVENT, handleHomeScrollSync);
    window.addEventListener("pageshow", handlePageShow);

    const rafId = window.requestAnimationFrame(() => {
      handleHomeScrollSync();
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener(HOME_SCROLL_SYNC_EVENT, handleHomeScrollSync);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [pathname, syncHomeScrollFromProgress]);

  const grainOpacity = useTransform(
    scrollYProgress,
    [0, 0.58, 0.64, 1],
    [0.25, 0.25, 0, 0],
  );
  useEffect(() => {
    if (pathname !== "/") {
      const lenis = workScrollBridge.lenis;

      if (lenis) {
        lenis.destroy();
      }

      workScrollBridge.lenis = null;
      unlockWorkScroll();
      restoreNativeDocumentScroll();
      return;
    }

    const desktopQuery = window.matchMedia("(min-width: 768px)");

    function teardown() {
      workScrollBridge.lenis = null;
      unlockWorkScroll();
      restoreNativeDocumentScroll();
    }

    if (!desktopQuery.matches) {
      teardown();
      return;
    }

    const lenis = new Lenis({
      lerp: 0.068,
      smoothWheel: true,
      virtualScroll: handleWorkLenisVirtualScroll,
    });
    let animationFrameId = 0;

    workScrollBridge.lenis = lenis;

    if (shouldLandOnWorkGallery()) {
      scrollHomeToWorksGallery(containerRef.current);
      syncHomeScrollFromProgress(getHomeScrollProgress(containerRef.current));
    }

    function raf(time: number) {
      lenis.raf(time);

      const main = containerRef.current;

      if (main) {
        scrollYProgress.set(getHomeScrollProgress(main));
      }

      syncWorkScrollEngagement();
      tickWorkVirtualScrollSmoothing(time);

      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    if (process.env.NODE_ENV === "development") {
      (
        window as Window & {
          __portfolioScrollDebug?: {
            getState: () => Record<string, unknown>;
            getTransitionAt: (progress: number) => Record<string, number>;
            scrollToProgress: (progress: number) => number;
          };
        }
      ).__portfolioScrollDebug = {
        getState: () => ({
          motionProgress: scrollYProgress.get(),
          homeProgress: getHomeScrollProgress(containerRef.current),
          bridge: {
            isLocked: workScrollBridge.isLocked,
            targetVirtualScroll: workScrollBridge.targetVirtualScroll,
            displayVirtualScroll: workScrollBridge.displayVirtualScroll,
            handoffPrepared: workScrollBridge.handoffPrepared,
            lenisScroll: workScrollBridge.lenis?.scroll ?? null,
          },
        }),
        getTransitionAt: (progress: number) => ({
          progress,
          curateLayer: desktopCurateLayerOpacity(progress),
          curatePreview: desktopCuratePreviewOpacity(progress),
          workChrome: desktopWorkChromeOpacity(progress),
        }),
        scrollToProgress: (progress: number) =>
          scrollHomeToProgress(progress, containerRef.current),
      };
    }

    const onBreakpointChange = () => {
      if (!desktopQuery.matches) {
        teardown();
        lenis.destroy();
      }
    };

    desktopQuery.addEventListener("change", onBreakpointChange);

    return () => {
      desktopQuery.removeEventListener("change", onBreakpointChange);
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      teardown();
    };
  }, [pathname]);

  // ── Magnetic pull effect (home-only, work-gallery-aware) ──────────────────
  // The cursor DOT visual lives in SiteCursor (layout.tsx). This effect only
  // applies the element-level magnetic transform — no cursor positioning here.
  useEffect(() => {
    const isFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (pathname !== "/" || !isFine) {
      document
        .querySelectorAll<HTMLElement>(
          '[data-cursor-interactive="true"], a[href], button',
        )
        .forEach((element) => {
          element.style.transform = "";
        });
      return;
    }

    const clickableSelector =
      'a[href], button, input, textarea, select, summary, [role="button"], [data-cursor-interactive="true"]';

    function resetMagneticElement() {
      const activeElement = activeMagneticElementRef.current;

      if (activeElement) {
        activeElement.style.transform = "";
        activeElement.style.transition =
          "transform 420ms cubic-bezier(0.16, 1, 0.3, 1)";
      }

      activeMagneticElementRef.current = null;
    }

    function handlePointerMove(event: PointerEvent) {
      const target = event.target;
      const clickableElement =
        target instanceof Element
          ? target.closest<HTMLElement>(clickableSelector)
          : null;

      if (isWorkGalleryScrollActive()) {
        const workGalleryTarget =
          target instanceof Element
            ? target.closest<HTMLElement>("[data-work-gallery-link]")
            : null;

        if (!workGalleryTarget) {
          resetMagneticElement();
          return;
        }
      }

      if (
        !clickableElement ||
        (clickableElement.closest("[data-no-magnetic]") &&
          !clickableElement.closest("[data-work-gallery-link]"))
      ) {
        resetMagneticElement();
        return;
      }

      if (activeMagneticElementRef.current !== clickableElement) {
        resetMagneticElement();
        activeMagneticElementRef.current = clickableElement;
      }

      const rect = clickableElement.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / Math.max(rect.width, 1);
      const relativeY = (event.clientY - rect.top) / Math.max(rect.height, 1);
      const normalizedX = relativeX * 2 - 1;
      const normalizedY = relativeY * 2 - 1;
      const pullX = normalizedX * 4;
      const pullY = normalizedY * 3;
      const rotateY = normalizedX * 5;
      const rotateX = normalizedY * -4;

      clickableElement.style.transition =
        "transform 180ms cubic-bezier(0.16, 1, 0.3, 1)";
      clickableElement.style.transform = `translate3d(${pullX}px, ${pullY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    function handlePointerLeave() {
      resetMagneticElement();
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      resetMagneticElement();
    };
  }, [pathname]);

  return (
    <main
      ref={containerRef}
      className="relative h-[2100vh] bg-[#EAEAEA] md:h-[3600vh]"
    >
      <span
        id="works"
        className="pointer-events-none absolute top-[78%] h-px w-px md:top-[64%]"
        aria-hidden="true"
      />
      <div className="sticky top-0 h-[var(--app-vh,100svh)] w-full overflow-hidden bg-[#EAEAEA] md:h-screen">
        <HomeMobileStack scrollYProgress={scrollYProgress} />
        <HomeDesktopStack scrollYProgress={scrollYProgress} />
      </div>
      <div className="hidden md:contents">
        {!isInWorkSection ? (
          <>
            <ProceduralGrain opacity={grainOpacity} />
            <FluidDistortion progress={scrollYProgress} />
          </>
        ) : null}
      </div>
      <AnimatePresence>
        {isLastPageOpen && (
          <motion.div
            initial={{ opacity: 0, filter: "blur(30px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(30px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 h-screen w-full bg-[#EAEAEA]"
          >
            <LastPage onClose={() => setIsLastPageOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
