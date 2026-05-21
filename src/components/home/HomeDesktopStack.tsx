"use client";

import Convey from "@/components/Convey";
import Create from "@/components/Create";
import Curate from "@/components/Curate";
import Hero from "@/components/Hero";
import Work from "@/components/work";
import {
  blurPxToFilter,
  desktopCreateCurateGlassOpacity,
  desktopCreateExitBlurPx,
  desktopCurateEntranceBlurPx,
  desktopCurateLayerOpacity,
  desktopCurateWorkHandoffGlassOpacity,
  DESKTOP_CURATE_WORK_HANDOFF_START,
} from "@/lib/desktopHomeTransitions";
import {
  desktopConveyOpacity,
  desktopCreateOpacity,
  desktopHeroOpacity,
} from "@/lib/mobileHomeOpacity";
import { WORK_ENTER_PROGRESS } from "@/lib/workScrollBridge";
import { motion, type MotionValue, useTransform } from "framer-motion";
import type { CSSProperties } from "react";

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
  const curateWorkHandoffGlassOpacity = useTransform(
    scrollYProgress,
    desktopCurateWorkHandoffGlassOpacity,
  );
  const curateOpacity = useTransform(scrollYProgress, desktopCurateLayerOpacity);
  const curateBlur = useTransform(scrollYProgress, (progress) =>
    blurPxToFilter(desktopCurateEntranceBlurPx(progress)),
  );

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
      progress >= 0.56 ? "none" : progress > 0.34 ? "auto" : "none",
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
      <motion.div className="absolute inset-0 z-10 h-screen w-full">
        <Hero
          opacity={heroOpacity}
          blur={heroBlur}
          visibility={heroVisibility}
          pointerEvents={heroPointerEvents}
          isVideoActive
        />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute inset-0 z-20 h-screen w-full"
        style={{
          WebkitMaskImage: conveyRevealMask,
          maskImage: conveyRevealMask,
        }}
      >
        <Convey
          entranceOpacity={conveyOpacity}
          entranceBlur={conveyBlur}
          pointerEvents={conveyPointerEvents}
          scrollYProgress={scrollYProgress}
        />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute inset-0 z-[25] bg-[#EAEAEA]/35 backdrop-blur-[72px]"
        style={{
          opacity: glassSweepOpacity,
          WebkitMaskImage: glassSweepMask,
          maskImage: glassSweepMask,
        }}
        aria-hidden="true"
      />
      <motion.div className="pointer-events-none absolute inset-0 z-30 h-screen w-full">
        <Create
          entranceOpacity={createOpacity}
          entranceBlur={createBlur}
          pointerEvents={createPointerEvents}
          scrollYProgress={scrollYProgress}
        />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute inset-0 z-[35] h-screen w-full bg-[#EAEAEA]/28 backdrop-blur-[48px]"
        style={{ opacity: createCurateGlassOpacity }}
        aria-hidden="true"
      />
      <motion.div className="pointer-events-none absolute inset-0 z-40 h-screen w-full">
        <Curate
          opacity={curateOpacity}
          blur={curateBlur}
          pointerEvents={curatePointerEvents}
          visibility={curateVisibility}
          scrollYProgress={scrollYProgress}
        />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute inset-0 z-[43] h-screen w-full bg-[#EAEAEA]/14 backdrop-blur-[44px] saturate-[1.05]"
        style={{ opacity: curateWorkHandoffGlassOpacity }}
        aria-hidden="true"
      />
      <motion.div className="pointer-events-none absolute inset-0 z-[45] h-screen w-full">
        <Work scrollYProgress={scrollYProgress} pointerEvents={workPointerEvents} />
      </motion.div>
    </div>
  );
}
