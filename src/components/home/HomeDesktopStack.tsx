"use client";

import Convey from "@/components/Convey";
import Create from "@/components/Create";
import Curate from "@/components/Curate";
import Hero from "@/components/Hero";
import Work from "@/components/work";
import {
  desktopConveyOpacity,
  desktopCreateOpacity,
  desktopCurateOpacity,
  desktopHeroOpacity,
} from "@/lib/mobileHomeOpacity";
import { WORK_ENTER_PROGRESS } from "@/lib/workScrollBridge";
import { motion, type MotionValue, useTransform } from "framer-motion";
import type { CSSProperties } from "react";

interface HomeDesktopStackProps {
  scrollYProgress: MotionValue<number>;
}

/** Desktop-only sticky stack. Hidden below `md:` — unchanged scroll choreography. */
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
  const createBlur = useTransform(
    scrollYProgress,
    [0, 0.14, 0.18, 0.48, 0.52, 0.56, 0.58, 1],
    [
      "blur(4px)",
      "blur(4px)",
      "blur(0px)",
      "blur(0px)",
      "blur(0px)",
      "blur(6px)",
      "blur(10px)",
      "blur(10px)",
    ],
  );
  const curateOpacity = useTransform(scrollYProgress, desktopCurateOpacity);
  const curateBlur = useTransform(
    scrollYProgress,
    [0, 0.34, 0.42, 0.52, 0.58, 1],
    ["blur(24px)", "blur(24px)", "blur(0px)", "blur(0px)", "blur(0px)", "blur(0px)"],
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
      latest > 0.34 ? "visible" : "hidden",
  );

  const workOpacity = useTransform(scrollYProgress, (progress) => {
    if (progress <= 0.58) {
      return 0;
    }

    if (progress >= 0.64) {
      return 1;
    }

    return (progress - 0.58) / 0.06;
  });
  /** Handoff blur on the gallery only — must clear by WORK_ENTER (locked progress never exceeds 0.64). */
  const workGalleryHandoffBlur = useTransform(
    scrollYProgress,
    [0, 0.58, 0.62, 0.64, 1],
    ["blur(0px)", "blur(18px)", "blur(8px)", "blur(0px)", "blur(0px)"],
  );
  const workPointerEvents = useTransform(scrollYProgress, (progress) =>
    progress >= WORK_ENTER_PROGRESS ? "auto" : "none",
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
      <motion.div className="pointer-events-none absolute inset-0 z-40 h-screen w-full">
        <Curate
          opacity={curateOpacity}
          blur={curateBlur}
          pointerEvents={curatePointerEvents}
          visibility={curateVisibility}
          scrollYProgress={scrollYProgress}
        />
      </motion.div>
      <motion.div className="pointer-events-none absolute inset-0 z-[45] h-screen w-full">
        <Work
          opacity={workOpacity}
          galleryHandoffBlur={workGalleryHandoffBlur}
          pointerEvents={workPointerEvents}
          scrollYProgress={scrollYProgress}
        />
      </motion.div>
    </div>
  );
}
