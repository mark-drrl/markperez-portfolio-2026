"use client";

import WorkColumnGallery from "@/components/WorkColumnGallery";
import MarkPerezBrand from "@/components/MarkPerezBrand";
import WorkSocialLinks from "@/components/WorkSocialLinks";
import { workPageSocialLinks } from "@/constants/workPageSocialLinks";
import { workGalleryImages } from "@/constants/workGalleryImages";
import { curateFrostedImageFilter } from "@/lib/curateFrostedBlur";
import {
  DESKTOP_WORK_CHROME_START,
  desktopCurateWorkHandoffGlassOpacity,
  desktopWorkChromeOpacity,
  desktopWorkEdgeVignetteOpacity,
  desktopWorkBackdropOpacity,
  desktopWorkGalleryHandoffBlurPx,
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

const workEdgeGlassTopStyle = {
  background: "rgba(155, 155, 155, 0.02)",
  backgroundBlendMode: "soft-light" as const,
  filter: "blur(32px)",
  WebkitBackdropFilter: "blur(2px)",
  backdropFilter: "blur(2px)",
  WebkitMaskImage:
    "linear-gradient(to bottom, black 0%, black 25%, rgba(0,0,0,0.64) 60%, rgba(0,0,0,0.18) 88%, transparent 100%)",
  maskImage:
    "linear-gradient(to bottom, black 0%, black 25%, rgba(0,0,0,0.64) 60%, rgba(0,0,0,0.18) 88%, transparent 100%)",
};

const workEdgeGlassBottomStyle = {
  background: "rgba(155, 155, 155, 0.02)",
  backgroundBlendMode: "soft-light" as const,
  filter: "blur(32px)",
  WebkitBackdropFilter: "blur(2px)",
  backdropFilter: "blur(2px)",
  WebkitMaskImage:
    "linear-gradient(to top, black 0%, black 25%, rgba(0,0,0,0.66) 62%, rgba(0,0,0,0.18) 90%, transparent 100%)",
  maskImage:
    "linear-gradient(to top, black 0%, black 25%, rgba(0,0,0,0.66) 62%, rgba(0,0,0,0.18) 90%, transparent 100%)",
};

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
  const galleryBlur = useTransform(scrollYProgress, (progress) =>
    curateFrostedImageFilter(desktopWorkGalleryHandoffBlurPx(progress)),
  );
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
        className="absolute inset-0 z-0 overflow-hidden will-change-[filter,opacity]"
        style={{
          opacity: galleryOpacity,
          filter: galleryBlur,
          pointerEvents: galleryPointerEvents,
        }}
      >
        <WorkColumnGallery
          virtualScroll={virtualScroll}
          linksEnabled={linksEnabled}
        />
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[#EAEAEA]/16 backdrop-blur-[24px] saturate-[1.04]"
          style={{ opacity: handoffGlassOpacity }}
          aria-hidden
        />
      </motion.div>

      <motion.div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
        <motion.div
          className="absolute inset-x-0 top-0 h-44"
          style={{ opacity: edgeOpacity, ...workEdgeGlassTopStyle }}
        />
        <motion.div
          className="absolute inset-x-0 bottom-0 h-48"
          style={{ opacity: edgeOpacity, ...workEdgeGlassBottomStyle }}
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
            AI-driven art direction, social media strategy, and immersive web
            architecture.
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
          <div className="text-right">
            <p className="font-editorial text-5xl leading-none tracking-[-0.02em] text-[#9F1F2E]">
              works
            </p>
            <p className="font-neue mt-2 text-[10px] font-semibold tracking-[0.15em] text-white">
              CLICK ON AN IMAGE
            </p>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
