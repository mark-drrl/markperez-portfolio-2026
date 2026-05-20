"use client";

import {
  dispatchHomeScrollSync,
  requestHomeScrollTop,
} from "@/lib/homeScroll";
import { resetHomeScrollPosition } from "@/lib/workScrollBridge";
import { motion, type MotionValue } from "framer-motion";

interface MarkPerezBrandProps {
  opacity?: MotionValue<number>;
  className?: string;
  /** Light sections (Convey / Create / Curate); dark = Work gallery header */
  variant?: "onLight" | "onDark";
  onActivate?: () => void;
}

export default function MarkPerezBrand({
  opacity,
  className = "",
  variant = "onLight",
  onActivate,
}: MarkPerezBrandProps) {
  const isOnDark = variant === "onDark";

  function handleClick() {
    onActivate?.();
    requestHomeScrollTop();

    if (window.location.pathname === "/") {
      window.history.replaceState(null, "", "/");
      resetHomeScrollPosition();
      window.requestAnimationFrame(() => {
        dispatchHomeScrollSync();
      });
      return;
    }

    window.location.href = "/";
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      data-cursor-interactive="true"
      className={`group pointer-events-auto cursor-pointer text-left font-neue text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 ${isOnDark ? "text-white" : "text-neutral-500"} ${className}`}
      style={opacity ? { opacity } : undefined}
    >
      <span className="transition-colors duration-300 md:group-hover:text-white">
        MARK{" "}
      </span>
      <span className="text-[#9F1F2E] transition-colors duration-300 md:group-hover:text-white">
        PEREZ
      </span>
    </motion.button>
  );
}
