"use client";

import Convey from "@/components/Convey";
import Create from "@/components/Create";
import Curate from "@/components/Curate";
import Hero from "@/components/Hero";
import RedThread from "@/components/home/RedThread";
import Work from "@/components/work";
import {
  blurPxToFilter,
  desktopCreateCurateGlassOpacity,
  desktopCreateExitBlurPx,
  desktopConveyTranslateVh,
  desktopCreateTranslateVh,
  desktopCurateTranslateVh,
  desktopQuietBeatOpacity,
  DESKTOP_CURATE_WORK_HANDOFF_START,
  desktopCurateEntranceBlurPx,
  desktopCurateLayerOpacity,
} from "@/lib/desktopHomeTransitions";
import {
  desktopConveyOpacity,
  desktopCreateOpacity,
  desktopHeroOpacity,
} from "@/lib/mobileHomeOpacity";
import { WORK_ENTER_PROGRESS } from "@/lib/workScrollBridge";
import {
  motion,
  type MotionValue,
  useTransform,
  useVelocity,
  useSpring,
} from "framer-motion";
import type { CSSProperties } from "react";

// Reduced-motion: disable velocity skew
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface HomeDesktopStackProps {
  scrollYProgress: MotionValue<number>;
}

/** Desktop-only sticky stack. Hidden below `md:`. */
export default function HomeDesktopStack({
  scrollYProgress,
}: HomeDesktopStackProps) {
  const heroOpacity = useTransform(scrollYProgress, desktopHeroOpacity);
  const heroBlur = useTransform(
    scrollYProgress,
    [0, 0.004, 0.038, 0.052, 1],
    ["blur(0px)", "blur(0px)", "blur(18px)", "blur(42px)", "blur(42px)"],
  );
  const conveyOpacity = useTransform(scrollYProgress, desktopConveyOpacity);
  const conveyBlur = useTransform(
    scrollYProgress,
    [0, 0.004, 0.024, 0.052, 0.158, 0.18, 1],
    [
      "blur(34px)",
      "blur(34px)",
      "blur(12px)",
      "blur(0px)",
      "blur(0px)",
      "blur(40px)",
      "blur(40px)",
    ],
  );
  const heroToConveySweep = useTransform(
    scrollYProgress,
    [0, 0.004, 0.052, 1],
    [0, 0, 100, 100],
  );
  const conveyRevealMask = useTransform(heroToConveySweep, (value) => {
    if (value >= 99) {
      return "none";
    }

    const solidEnd = Math.max(0, value - 8);
    const softMid = value + 10;
    const featherEnd = value + 28;

    return `linear-gradient(to top, black 0%, black ${solidEnd}%, rgba(0,0,0,0.72) ${softMid}%, transparent ${featherEnd}%, transparent 100%)`;
  });
  const glassSweepMask = useTransform(heroToConveySweep, (value) => {
    const leadingEdge = value - 42;
    const fullStart = value - 8;
    const fullEnd = value + 18;
    const trailingEdge = value + 62;

    return `linear-gradient(to top, transparent 0%, transparent ${leadingEdge}%, rgba(0,0,0,0.45) ${value - 24}%, black ${fullStart}%, black ${fullEnd}%, rgba(0,0,0,0.45) ${value + 38}%, transparent ${trailingEdge}%, transparent 100%)`;
  });
  const glassSweepOpacity = useTransform(
    scrollYProgress,
    [0, 0.003, 0.014, 0.044, 0.052, 1],
    [0, 0, 1, 1, 0, 0],
  );
  const createOpacity = useTransform(scrollYProgress, desktopCreateOpacity);
  const createBlur = useTransform(scrollYProgress, (progress) => {
    if (progress < 0.18) {
      if (progress <= 0.14) {
        return "blur(4px)";
      }

      const amount = (progress - 0.14) / 0.04;

      return `blur(${(4 * (1 - amount)).toFixed(1)}px)`;
    }

    return blurPxToFilter(desktopCreateExitBlurPx(progress));
  });
  const createCurateGlassOpacity = useTransform(
    scrollYProgress,
    desktopCreateCurateGlassOpacity,
  );
  const curateOpacity = useTransform(scrollYProgress, desktopCurateLayerOpacity);
  const curateBlur = useTransform(scrollYProgress, (progress) =>
    blurPxToFilter(desktopCurateEntranceBlurPx(progress)),
  );

  // --- Translate-Y curves (WS1) ---
  const conveyTranslateY = useTransform(
    scrollYProgress,
    (p) => `${desktopConveyTranslateVh(p)}vh`,
  );
  const createTranslateY = useTransform(
    scrollYProgress,
    (p) => `${desktopCreateTranslateVh(p)}vh`,
  );
  const curateTranslateY = useTransform(
    scrollYProgress,
    (p) => `${desktopCurateTranslateVh(p)}vh`,
  );

  // --- Quiet beat opacity (WS4) ---
  const quietBeatOpacity = useTransform(scrollYProgress, desktopQuietBeatOpacity);

  // --- Velocity skew (WS3) ---
  const scrollVelocity = useVelocity(scrollYProgress);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
    mass: 0.3,
  });
  const sectionSkewY = useTransform(smoothVelocity, (v) => {
    if (prefersReducedMotion) return "skewY(0deg)";
    // Clamp to ±0.8deg
    const deg = Math.min(0.8, Math.max(-0.8, v * 0.006));
    return `skewY(${deg.toFixed(3)}deg)`;
  });

  const conveyPointerEvents = useTransform(
    conveyOpacity,
    (opacity): CSSProperties["pointerEvents"] =>
      opacity > 0.9 ? "auto" : "none",
  );
  const createPointerEvents = useTransform(
    createOpacity,
    (opacity): CSSProperties["pointerEvents"] =>
      opacity > 0.9 ? "auto" : "none",
  );
  const curatePointerEvents = useTransform(
    scrollYProgress,
    (progress): CSSProperties["pointerEvents"] =>
      progress >= DESKTOP_CURATE_WORK_HANDOFF_START
        ? "none"
        : progress > 0.34
          ? "auto"
          : "none",
  );

  const heroVisibility = useTransform(
    scrollYProgress,
    (latest): CSSProperties["visibility"] =>
      latest <= 0.06 ? "visible" : "hidden",
  );
  const heroPointerEvents = useTransform(
    scrollYProgress,
    (latest): CSSProperties["pointerEvents"] =>
      latest > 0.052 ? "none" : "auto",
  );
  const curateVisibility = useTransform(
    scrollYProgress,
    (latest): CSSProperties["visibility"] =>
      latest > 0.34 && latest < WORK_ENTER_PROGRESS + 0.05
        ? "visible"
        : "hidden",
  );

  const workPointerEvents = useTransform(scrollYProgress, (progress) =>
    progress >= WORK_ENTER_PROGRESS - 0.01 ? "auto" : "none",
  );

  return (
    <div className="hidden md:contents">
      {/* Faint drafting-grid lines on the light field — desktop only, behind all sections */}
      <div
        className="pointer-events-none absolute inset-0 z-0 hidden md:block"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, rgba(21,21,21,0.045) 0px, rgba(21,21,21,0.045) 1px, transparent 1px, transparent 8vw), repeating-linear-gradient(to bottom, rgba(21,21,21,0.045) 0px, rgba(21,21,21,0.045) 1px, transparent 1px, transparent 8vh)",
        }}
        aria-hidden
      />
      {/* Section layer wrapper — receives velocity skew. Does NOT wrap fixed chrome. */}
      <motion.div
        className="absolute inset-0 z-10 h-screen w-full"
        style={{ transform: sectionSkewY }}
      >
        {/* Hero */}
        <div className="absolute inset-0 h-full w-full">
          <Hero
            opacity={heroOpacity}
            blur={heroBlur}
            visibility={heroVisibility}
            pointerEvents={heroPointerEvents}
            isVideoActive
          />
        </div>

        {/* Convey */}
        <motion.div
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{
            WebkitMaskImage: conveyRevealMask,
            maskImage: conveyRevealMask,
            y: conveyTranslateY,
          }}
        >
          <Convey
            entranceOpacity={conveyOpacity}
            entranceBlur={conveyBlur}
            pointerEvents={conveyPointerEvents}
            scrollYProgress={scrollYProgress}
          />
        </motion.div>

        {/* Hero→Convey glass sweep */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-[15] bg-[#EAEAEA]/35 backdrop-blur-[72px]"
          style={{
            opacity: glassSweepOpacity,
            WebkitMaskImage: glassSweepMask,
            maskImage: glassSweepMask,
          }}
          aria-hidden="true"
        />

        {/* Create */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 h-full w-full"
          style={{ y: createTranslateY }}
        >
          <Create
            entranceOpacity={createOpacity}
            entranceBlur={createBlur}
            pointerEvents={createPointerEvents}
            scrollYProgress={scrollYProgress}
          />
        </motion.div>

        {/* Create→Curate glass */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-[25] h-full w-full bg-[#EAEAEA]/28 backdrop-blur-[48px]"
          style={{ opacity: createCurateGlassOpacity }}
          aria-hidden="true"
        />

        {/* Curate */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-30 h-full w-full"
          style={{ y: curateTranslateY }}
        >
          <Curate
            opacity={curateOpacity}
            blur={curateBlur}
            pointerEvents={curatePointerEvents}
            visibility={curateVisibility}
            scrollYProgress={scrollYProgress}
          />
        </motion.div>

        {/* Red thread — z-[33], above Curate (z-30), below Work (z-35); rendered after Curate so DOM order matches stacking intent */}
        <RedThread scrollYProgress={scrollYProgress} />

        {/* Quiet beat — Curate→Work overlap (WS4). z-[32] so it sits above Curate bg. */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-[36] flex items-center justify-center"
          style={{ opacity: quietBeatOpacity }}
          aria-hidden="true"
        >
          <p
            className="font-editorial text-center italic text-[#1a1a18]"
            style={{ fontSize: "clamp(20px, 1.8vw, 30px)" }}
          >
            Direction at every step.
          </p>
        </motion.div>

        {/* Work — pointer-events managed internally by DesktopWorkView via workPointerEvents */}
        <div className="pointer-events-none absolute inset-0 z-[35] h-full w-full">
          <Work scrollYProgress={scrollYProgress} pointerEvents={workPointerEvents} />
        </div>
      </motion.div>
    </div>
  );
}
