"use client";

import WorkColumnGallery from "@/components/WorkColumnGallery";
import MarkPerezBrand from "@/components/MarkPerezBrand";
import WorkSocialLinks from "@/components/WorkSocialLinks";
import Link from "next/link";
import { workPageSocialLinks } from "@/constants/workPageSocialLinks";
import { workGalleryImages } from "@/constants/workGalleryImages";
import {
  figmaCurateTransitionBlurStyle,
  FIGMA_WORK_EDGE_BOTTOM_HEIGHT_VH,
  FIGMA_WORK_EDGE_TOP_HEIGHT_VH,
} from "@/lib/figmaBlurStyles";
import {
  DESKTOP_WORK_CHROME_START,
  desktopCurateWorkHandoffGlassOpacity,
  desktopWorkChromeOpacity,
  desktopWorkEdgeVignetteOpacity,
  desktopWorkBackdropOpacity,
  desktopWorkGalleryOpacity,
  desktopWorkLayerOpacity,
} from "@/lib/desktopHomeTransitions";
import { workColumns } from "@/lib/workColumnLayout";
import { workHeaderNavTone } from "@/lib/workSocialTone";
import {
  dispatchHomeScrollSync,
  requestHomeScrollTop,
} from "@/lib/homeScroll";
import {
  applyGalleryWheelDelta,
  isWorkGalleryScrollActive,
  registerWorkScrollMotionValues,
  resetHomeScrollPosition,
  unregisterWorkScrollMotionValues,
  unlockWorkScroll,
  WORK_ENTER_PROGRESS,
} from "@/lib/workScrollBridge";
import {
  motion,
  type MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

const socialButtons = workPageSocialLinks;

interface DesktopWorkViewProps {
  scrollYProgress: MotionValue<number>;
  pointerEvents: MotionValue<"none" | "auto">;
}

/**
 * Desktop Work — gallery virtual scroll, glass edge vignettes, chrome on top.
 */
export default function DesktopWorkView({
  scrollYProgress,
  pointerEvents,
}: DesktopWorkViewProps) {
  const virtualScroll = useMotionValue(0);
  const galleryWheelRef = useRef<HTMLDivElement>(null);
  const [linksEnabled, setLinksEnabled] = useState(false);
  const [dubaiTime, setDubaiTime] = useState("");

  const layerOpacity = useTransform(scrollYProgress, desktopWorkLayerOpacity);
  const backdropOpacity = useTransform(
    scrollYProgress,
    desktopWorkBackdropOpacity,
  );
  const galleryOpacity = useTransform(scrollYProgress, desktopWorkGalleryOpacity);
  const handoffGlassOpacity = useTransform(
    scrollYProgress,
    desktopCurateWorkHandoffGlassOpacity,
  );
  const chromeOpacity = useTransform(scrollYProgress, desktopWorkChromeOpacity);
  const edgeOpacity = useTransform(
    scrollYProgress,
    desktopWorkEdgeVignetteOpacity,
  );

  const galleryPointerEvents = useTransform(scrollYProgress, (progress) =>
    progress >= WORK_ENTER_PROGRESS - 0.01 ? "auto" : "none",
  );

  const socialNavTone = useTransform(virtualScroll, (offset) =>
    workHeaderNavTone(offset, {
      isMobile: false,
      imageCount: workGalleryImages.length,
      leftColumn: workColumns[0],
    }),
  );

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    setLinksEnabled(
      progress >= DESKTOP_WORK_CHROME_START - 0.02 ||
        isWorkGalleryScrollActive(),
    );
  });

  useEffect(() => {
    registerWorkScrollMotionValues(scrollYProgress, virtualScroll);
    const progress = scrollYProgress.get();

    setLinksEnabled(
      progress >= DESKTOP_WORK_CHROME_START - 0.02 ||
        isWorkGalleryScrollActive(),
    );

    return () => {
      unregisterWorkScrollMotionValues();
    };
  }, [scrollYProgress, virtualScroll]);

  useEffect(() => {
    const gallery = galleryWheelRef.current;

    if (!gallery) {
      return;
    }

    function onWheel(event: WheelEvent) {
      applyGalleryWheelDelta(event.deltaY, event);
    }

    gallery.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      gallery.removeEventListener("wheel", onWheel);
    };
  }, []);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Dubai",
      timeZoneName: "short",
    });

    function updateTime() {
      setDubaiTime(formatter.format(new Date()));
    }

    updateTime();
    const intervalId = window.setInterval(updateTime, 30_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <motion.section
      className="absolute inset-0 h-full w-full overflow-hidden bg-transparent"
      style={{ opacity: layerOpacity, pointerEvents }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[#EAEAEA]"
        style={{ opacity: backdropOpacity }}
        aria-hidden
      />
      <motion.div
        ref={galleryWheelRef}
        className="absolute inset-0 z-0 overflow-hidden"
        style={{
          opacity: galleryOpacity,
          pointerEvents: galleryPointerEvents,
        }}
      >
        <WorkColumnGallery
          virtualScroll={virtualScroll}
          linksEnabled={linksEnabled}
        />
        {/* Edge blurs sit inside the same layer as the gallery so backdrop-filter can see the images */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0"
          style={{
            opacity: edgeOpacity,
            height: `${FIGMA_WORK_EDGE_TOP_HEIGHT_VH}vh`,
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 45%, transparent 80%)",
            WebkitBackdropFilter: "blur(44px) saturate(1.9) brightness(1.06)",
            backdropFilter: "blur(44px) saturate(1.9) brightness(1.06)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, rgba(0,0,0,0.94) 22%, rgba(0,0,0,0.78) 40%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.22) 80%, rgba(0,0,0,0.06) 92%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, black 0%, rgba(0,0,0,0.94) 22%, rgba(0,0,0,0.78) 40%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.22) 80%, rgba(0,0,0,0.06) 92%, transparent 100%)",
          }}
          aria-hidden
        />
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{
            opacity: edgeOpacity,
            height: `${FIGMA_WORK_EDGE_BOTTOM_HEIGHT_VH}vh`,
            background:
              "linear-gradient(to top, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 45%, transparent 80%)",
            WebkitBackdropFilter: "blur(44px) saturate(1.9) brightness(1.06)",
            backdropFilter: "blur(44px) saturate(1.9) brightness(1.06)",
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, rgba(0,0,0,0.94) 22%, rgba(0,0,0,0.78) 40%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.22) 80%, rgba(0,0,0,0.06) 92%, transparent 100%)",
            maskImage:
              "linear-gradient(to top, black 0%, rgba(0,0,0,0.94) 22%, rgba(0,0,0,0.78) 40%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.22) 80%, rgba(0,0,0,0.06) 92%, transparent 100%)",
          }}
          aria-hidden
        />
        <motion.div
          className="pointer-events-none absolute inset-0 mix-blend-soft-light"
          style={{ opacity: handoffGlassOpacity, ...figmaCurateTransitionBlurStyle }}
          aria-hidden
        />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 bottom-0 z-30"
        style={{ opacity: chromeOpacity }}
      >
        <div className="pointer-events-none absolute inset-x-8 top-8 grid grid-cols-[minmax(0,0.42fr)_minmax(0,1.88fr)_minmax(0,0.7fr)] items-start gap-8 text-[10px] uppercase tracking-[0.2em] text-white">
          <div className="font-semibold leading-relaxed">
            <MarkPerezBrand variant="onDark" onActivate={unlockWorkScroll} />
            <WorkSocialLinks links={socialButtons} toneSource={socialNavTone} />
          </div>
          <p className="font-neue max-w-[520px] font-semibold leading-relaxed tracking-[0.08em]">
            Full-stack Creative Specialist bridging high-end cinematography,
            AI-driven art direction, and social media strategy.
          </p>
          <p className="font-neue text-right font-semibold leading-relaxed">
            DUBAI, UAE <span className="text-[#9F1F2E]">{"//"}</span>
            <br />
            MANILA, PHILIPPINES
            <br />
            <span className="font-normal text-white" suppressHydrationWarning>
              {dubaiTime || "\u00a0"}
            </span>
          </p>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 px-8 pb-8 pt-0">
          <button
            type="button"
            onClick={() => {
              requestHomeScrollTop();

              if (window.location.pathname === "/") {
                window.history.replaceState(null, "", "/");
                resetHomeScrollPosition();
                window.requestAnimationFrame(() => dispatchHomeScrollSync());
              } else {
                window.location.href = "/";
              }
            }}
            className="pointer-events-auto text-[10px] font-semibold tracking-[0.15em] text-white transition-colors hover:text-[#9F1F2E]"
          >
            BACK TO HOME
          </button>
          {/* CTA — bottom-center, clear of back-to-home (left) and works heading (right) */}
          <div className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-center">
            <p className="font-neue text-[10px] font-semibold tracking-[0.15em] text-[#9F1F2E]">
              OPEN FOR WORK
            </p>
            <Link
              href="/contact"
              className="font-neue text-[10px] font-semibold tracking-[0.15em] text-white transition-colors hover:text-[#9F1F2E]"
            >
              GET IN TOUCH →
            </Link>
          </div>
          <div className="text-right">
            <p className="font-editorial text-5xl leading-none tracking-[-0.02em] text-[#9F1F2E]">
              works
            </p>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
