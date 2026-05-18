"use client";

import { motion, type MotionValue } from "framer-motion";
import Link from "next/link";
import { useState, type CSSProperties } from "react";

const systemText =
  '"PP Neue Montreal", "PPNeueMontreal", "Neue Montreal", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';
const monoText =
  '"JetBrains Mono", "JetBrainsMono", "SF Mono", Consolas, monospace';

interface HeroProps {
  opacity: MotionValue<number>;
  blur: MotionValue<string>;
  visibility: MotionValue<CSSProperties["visibility"]>;
  pointerEvents: MotionValue<CSSProperties["pointerEvents"]>;
}

export default function Hero({
  opacity,
  blur,
  visibility,
  pointerEvents,
}: HeroProps) {
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  function scrollToProgress(progress: number) {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    window.scrollTo({
      top: maxScroll * progress,
      behavior: "smooth",
    });
  }

  return (
    <motion.section
      className="relative h-screen w-full overflow-hidden bg-[#efeeeb]"
      style={{ opacity, filter: blur, visibility, pointerEvents }}
    >
      <video
        className="absolute left-[30%] top-0 h-full w-[185%] max-w-none -translate-x-1/2 object-cover md:left-1/2 md:w-[115.48%]"
        src="/hero-loop.mp4"
        poster="/hero-image.jpg"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[24%] bg-[#efeeeb]/5 backdrop-blur-[6px] [mask-image:linear-gradient(to_top,black_0%,black_45%,transparent_100%)]"
        aria-hidden="true"
      />
      <motion.div className="absolute inset-0 z-10">
        <motion.div
          className="relative h-full w-full"
          initial={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          transition={{
            duration: 2.5,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <nav
            aria-label="Primary"
            className="pointer-events-auto absolute left-1/2 top-[3.77%] z-[90] -translate-x-1/2 whitespace-nowrap text-center text-[clamp(10px,0.794vw,12px)] leading-normal tracking-[0.2em]"
            style={{ fontFamily: monoText }}
          >
            <Link
              href="/about"
              onMouseEnter={() => setHoveredNav("about")}
              onMouseLeave={() => setHoveredNav(null)}
              className="cursor-pointer transition-colors duration-300"
              style={{
                color: hoveredNav === "about" ? "#9F1F2E" : "#8e8e8e",
              }}
            >
              ABOUT
            </Link>{" "}
            <button
              type="button"
              onClick={() => scrollToProgress(0.66)}
              onMouseEnter={() => setHoveredNav("work")}
              onMouseLeave={() => setHoveredNav(null)}
              className="cursor-pointer transition-colors duration-300"
              style={{
                color: hoveredNav === "work" ? "#9F1F2E" : "#8e8e8e",
              }}
            >
              WORK
            </button>{" "}
            <Link
              href="/contact"
              onMouseEnter={() => setHoveredNav("contact")}
              onMouseLeave={() => setHoveredNav(null)}
              className="cursor-pointer transition-colors duration-300"
              style={{
                color: hoveredNav === "contact" ? "#9F1F2E" : "#8e8e8e",
              }}
            >
              CONTACT
            </Link>
          </nav>

          <div className="absolute left-1/2 top-[19.76%] -translate-x-1/2 text-center">
            <h1
              className="font-editorial whitespace-nowrap leading-normal tracking-[-0.02em] text-[#4d4d4d]"
            >
              <span className="text-[clamp(29px,2.183vw,33px)]">
                convey. <span className="italic">create.</span>
              </span>
              <span className="text-[clamp(31px,2.381vw,36px)]"> curate.</span>
            </h1>
          </div>

          <p
            className="absolute left-1/2 top-[25.25%] -translate-x-1/2 whitespace-nowrap text-center text-[clamp(10px,0.794vw,12px)] leading-normal tracking-[0.2em] text-[#8e8e8e]"
            style={{ fontFamily: systemText }}
          >
            MARK PEREZ <span className="text-[#9F1F2E]">{"//"}</span>
            {" AI & TRADITIONAL"}
          </p>

          <div
            className="absolute left-1/2 top-[86.15%] -translate-x-1/2 text-center text-[clamp(10px,0.794vw,12px)] leading-[1.16] tracking-[0.36em] text-white"
            style={{ fontFamily: systemText }}
          >
            <p>scroll</p>
            <p>to</p>
            <p>explore</p>
          </div>

          <div
            className="absolute left-1/2 top-[91.85%] h-3 w-4 -translate-x-1/2 text-white"
            aria-hidden="true"
          >
            <span className="absolute left-0 top-0 h-1 w-1 bg-current" />
            <span className="absolute right-0 top-0 h-1 w-1 bg-current" />
            <span className="absolute left-1/2 top-2 h-1 w-1 -translate-x-1/2 bg-current" />
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
