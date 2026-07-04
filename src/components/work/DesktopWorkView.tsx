"use client";

import MarkPerezBrand from "@/components/MarkPerezBrand";
import WorkSocialLinks from "@/components/WorkSocialLinks";
import Link from "next/link";
import { workPageSocialLinks } from "@/constants/workPageSocialLinks";
import { workGalleryImages } from "@/constants/workGalleryImages";
import {
  DESKTOP_WORK_CHROME_START,
  desktopWorkChromeOpacity,
  desktopWorkLayerOpacity,
  desktopWorkBackdropOpacity,
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
 * Desktop Work — chrome (top grid, back-to-home, CTA, works heading) only.
 * The 3-column gallery has been removed — CardField IS the gallery in works mode.
 * The scroll bridge is still registered here so virtualScroll propagates to CardField.
 */
export default function DesktopWorkView({
  scrollYProgress,
  pointerEvents,
}: DesktopWorkViewProps) {
  const virtualScroll = useMotionValue(0);
  const galleryWheelRef = useRef<HTMLDivElement>(null);
  const [linksEnabled, setLinksEnabled] = useState(false);
  const [dubaiTime, setDubaiTime] = useState("");
  // Item 4c: hovered project for bottom-right label swap
  const [hoveredProject, setHoveredProject] = useState<{
    title: string;
    discipline: string;
    year: string;
  } | null>(null);

  const layerOpacity = useTransform(scrollYProgress, desktopWorkLayerOpacity);
  const backdropOpacity = useTransform(
    scrollYProgress,
    desktopWorkBackdropOpacity,
  );
  const chromeOpacity = useTransform(scrollYProgress, desktopWorkChromeOpacity);

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

  // Wheel events on the backdrop drive gallery virtualScroll (used by CardField via bridge)
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

  // Item 4c: listen for work-tile-hover events to swap bottom-right label
  useEffect(() => {
    function onTileHover(e: Event) {
      const detail = (e as CustomEvent).detail as {
        active: boolean;
        title?: string;
        discipline?: string;
        year?: string;
      };
      if (detail.active && detail.title) {
        setHoveredProject({
          title: detail.title,
          discipline: detail.discipline ?? "",
          year: detail.year ?? "",
        });
      } else {
        setHoveredProject(null);
      }
    }

    window.addEventListener("work-tile-hover", onTileHover);
    return () => window.removeEventListener("work-tile-hover", onTileHover);
  }, []);

  return (
    <motion.section
      className="absolute inset-0 h-full w-full overflow-hidden bg-transparent"
      style={{ opacity: layerOpacity, pointerEvents }}
    >
      {/* Translucent #EAEAEA backdrop so chrome text is legible over CardField cards */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[#EAEAEA]/0"
        style={{ opacity: backdropOpacity }}
        aria-hidden
      />

      {/* Full-screen wheel capture — passes events to bridge → CardField via virtualScroll */}
      <motion.div
        ref={galleryWheelRef}
        className="absolute inset-0 z-0"
        style={{
          pointerEvents: linksEnabled ? "auto" : "none",
        }}
      />

      {/* Chrome — z-[30], sits above CardField cards (cards are z-[31]/z-[34]) */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 bottom-0 z-30"
        style={{ opacity: chromeOpacity }}
      >
        {/* Top description grid */}
        <div className="pointer-events-none absolute inset-x-8 top-8 z-[2] grid grid-cols-[minmax(0,0.42fr)_minmax(0,1.88fr)_minmax(0,0.7fr)] items-start gap-8 text-[10px] uppercase tracking-[0.2em] text-[#151515]/75">
          <div className="font-semibold leading-relaxed">
            <MarkPerezBrand variant="onLight" onActivate={unlockWorkScroll} />
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
            <span className="font-normal text-[#151515]/75" suppressHydrationWarning>
              {dubaiTime || " "}
            </span>
          </p>
        </div>

        {/* Bottom bar: BACK TO HOME (left), OPEN FOR WORK / GET IN TOUCH (center), works heading (right) */}
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
            className="pointer-events-auto text-[10px] font-semibold tracking-[0.15em] text-[#151515]/75 transition-colors hover:text-[#9F1F2E]"
          >
            BACK TO HOME
          </button>
          {/* CTA — bottom-center */}
          <div className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-center">
            <p className="font-neue text-[10px] font-semibold tracking-[0.15em] text-[#9F1F2E]">
              OPEN FOR WORK
            </p>
            <Link
              href="/contact"
              className="font-neue text-[10px] font-semibold tracking-[0.15em] text-[#151515]/75 transition-colors hover:text-[#9F1F2E]"
            >
              GET IN TOUCH →
            </Link>
          </div>
          {/* Item 4c+4d: bottom-right label — "works" or hovered project name + glow */}
          <div className="relative text-right">
            {/* Radial glow halo — fades in with hoveredProject (Item 4d) */}
            <div
              className="pointer-events-none absolute -inset-x-6 -inset-y-4 transition-opacity duration-200"
              style={{
                opacity: hoveredProject ? 1 : 0,
                background: "radial-gradient(closest-side, rgba(21,21,21,0.10), transparent)",
                filter: "blur(12px)",
              }}
              aria-hidden="true"
            />
            {/* Default "works" label */}
            <p
              className="font-editorial text-5xl leading-none tracking-[-0.02em] text-[#9F1F2E] transition-opacity duration-200"
              style={{ opacity: hoveredProject ? 0 : 1 }}
              aria-hidden={hoveredProject ? "true" : undefined}
            >
              works
            </p>
            {/* Hovered project label */}
            <div
              className="absolute inset-0 flex flex-col items-end justify-end transition-opacity duration-200"
              style={{ opacity: hoveredProject ? 1 : 0 }}
              aria-hidden={hoveredProject ? undefined : "true"}
            >
              <p className="font-editorial text-5xl leading-none tracking-[-0.02em] text-[#9F1F2E]">
                {hoveredProject?.title ?? ""}
              </p>
              <p className="font-neue mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#151515]/60">
                {hoveredProject ? `${hoveredProject.discipline} — ${hoveredProject.year}` : ""}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
