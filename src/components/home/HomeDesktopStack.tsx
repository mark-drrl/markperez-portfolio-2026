"use client";

import CardField from "@/components/home/CardField";
import Hero from "@/components/Hero";
import RedThread from "@/components/home/RedThread";
import Work from "@/components/work";
import {
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

  // --- Velocity skew ---
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
        {/* Hero — z implicit (first in stack) */}
        <div className="absolute inset-0 h-full w-full">
          <Hero
            opacity={heroOpacity}
            blur={heroBlur}
            visibility={heroVisibility}
            pointerEvents={heroPointerEvents}
            isVideoActive
          />
        </div>

        {/* CardField — FAR cards at z-[31], title at z-[32], NEAR cards at z-[34] */}
        <CardField scrollYProgress={scrollYProgress} />

        {/* Red thread — z-[33], sits between FAR and NEAR card layers */}
        <RedThread scrollYProgress={scrollYProgress} />

        {/* Work — z-[35], pointer-events managed internally */}
        <div className="pointer-events-none absolute inset-0 z-[35] h-full w-full">
          <Work scrollYProgress={scrollYProgress} pointerEvents={workPointerEvents} />
        </div>
      </motion.div>
    </div>
  );
}
