"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { CASE_EASE } from "./caseStudyStyles";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Animation delay in seconds. */
  delay?: number;
  /** Vertical travel in px. */
  y?: number;
  /** Disable the blur-in (cheaper for large blocks). */
  noBlur?: boolean;
}

/** Fade + translate-up reveal as the element scrolls into view (once). */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 30,
  noBlur = false,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: noBlur ? "blur(0px)" : "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 0.95, ease: CASE_EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
