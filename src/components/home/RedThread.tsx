"use client";

import {
  desktopRedThreadDrawProgress,
  desktopRedThreadOpacity,
} from "@/lib/desktopHomeTransitions";
import { motion, type MotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

interface RedThreadProps {
  scrollYProgress: MotionValue<number>;
}

// Reduced-motion: render fully drawn at constant low opacity
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Red thread SVG that draws itself with scroll progress.
 * viewBox 0 0 1440 900, preserveAspectRatio="xMidYMid slice".
 * Organic path: enters top-center, sweeps left past Convey video rect,
 * crosses right through Create grid zone, loops around Curate center,
 * exits bottom toward Work.
 * Z-index: z-[33] — above Curate content (z-30), below Work (z-35).
 * Rendered AFTER the Curate layer in DOM order so it stays visible over Curate.
 * Desktop only (hidden md:contents parent handles breakpoint).
 */
export default function RedThread({ scrollYProgress }: RedThreadProps) {
  const pathRef = useRef<SVGPathElement>(null);

  // PathLength normalization via framer-motion (0→1 maps to drawn→not-drawn).
  // We drive strokeDashoffset ourselves for browser compat.
  const drawProgress = useTransform(scrollYProgress, desktopRedThreadDrawProgress);
  const threadOpacity = useTransform(scrollYProgress, desktopRedThreadOpacity);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const totalLength = path.getTotalLength();

    // Initial state
    path.style.strokeDasharray = `${totalLength}`;
    path.style.strokeDashoffset = `${totalLength}`;

    const unsubscribe = drawProgress.on("change", (progress) => {
      path.style.strokeDashoffset = `${totalLength * (1 - progress)}`;
    });

    // Reduced-motion: fully drawn immediately
    if (prefersReducedMotion) {
      path.style.strokeDashoffset = "0";
    }

    return unsubscribe;
  }, [drawProgress]);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[33]"
      style={{ opacity: threadOpacity }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/*
          Organic path narrative:
          - Starts top-center (~720, -20) — enters from above viewport
          - Sweeps left past Convey's video rect (left-center zone ~240, 280)
          - Curves back right through Create's 7-cell grid (right-center ~1100, 480)
          - Loops around Curate's center (~680, 640)
          - Exits bottom-center toward Work (~760, 940)
        */}
        <path
          ref={pathRef}
          d="M 720 -20
             C 680 80, 520 120, 380 200
             C 200 300, 140 320, 180 420
             C 220 510, 480 460, 680 480
             C 880 500, 1180 420, 1200 520
             C 1220 620, 1020 660, 820 680
             C 620 700, 440 720, 480 780
             C 520 840, 680 860, 760 940"
          stroke="#9F1F2E"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}
