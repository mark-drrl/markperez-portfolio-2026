"use client";

import { mobileSectionScrollKeys } from "@/lib/mobileHomeOpacity";
import { motion, type MotionValue, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const systemText =
  '"PP Neue Montreal", "PPNeueMontreal", "Neue Montreal", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';
const monoText =
  '"JetBrains Mono", "JetBrainsMono", "SF Mono", Consolas, monospace';

interface HeroProps {
  opacity: MotionValue<number>;
  blur?: MotionValue<string>;
  visibility: MotionValue<CSSProperties["visibility"]>;
  pointerEvents: MotionValue<CSSProperties["pointerEvents"]>;
  isVideoActive?: boolean;
  scrollYProgress?: MotionValue<number>;
  mobileLite?: boolean;
}

export default function Hero({
  opacity,
  blur,
  visibility,
  pointerEvents,
  isVideoActive = true,
  scrollYProgress,
  mobileLite = false,
}: HeroProps) {
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoScale = useTransform(
    scrollYProgress ?? opacity,
    mobileLite && scrollYProgress
      ? mobileSectionScrollKeys("hero", [0, 0.5, 1])
      : [0, 1],
    mobileLite ? [1.02, 1.06, 1.1] : [1, 1],
  );

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (isVideoActive) {
      void video.play().catch(() => {});
      return;
    }

    video.pause();
  }, [isVideoActive]);

  function scrollToProgress(progress: number) {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    window.scrollTo({
      top: maxScroll * progress,
      behavior: "smooth",
    });
  }

  const sectionStyle = mobileLite
    ? {
        opacity: 1,
        visibility: "visible" as const,
        pointerEvents: "auto" as const,
      }
    : {
        opacity,
        ...(blur ? { filter: blur } : {}),
        visibility,
        pointerEvents,
      };

  return (
    <motion.section
      className={`relative w-full overflow-hidden bg-[#efeeeb] ${mobileLite ? "h-full" : "h-screen"}`}
      style={sectionStyle}
    >
      {isVideoActive ? (
        <motion.video
          ref={videoRef}
          className="absolute left-[30%] top-0 h-full w-[185%] max-w-none -translate-x-1/2 object-cover md:left-1/2 md:w-[115.48%]"
          src="/hero-loop.mp4"
          poster="/hero-image.webp"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          style={mobileLite && scrollYProgress ? { scale: videoScale } : undefined}
          aria-hidden="true"
        />
      ) : null}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[24%] bg-[#efeeeb]/5 [mask-image:linear-gradient(to_top,black_0%,black_45%,transparent_100%)] ${
          mobileLite ? "" : "backdrop-blur-[6px]"
        }`}
        aria-hidden="true"
      />
      <div className="absolute inset-0 z-10">
        {mobileLite ? (
          <div className="relative h-full w-full">
            <HeroChrome
              hoveredNav={hoveredNav}
              setHoveredNav={setHoveredNav}
              scrollToProgress={scrollToProgress}
            />
          </div>
        ) : (
          <motion.div
            className="relative h-full w-full"
            initial={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <HeroChrome
              hoveredNav={hoveredNav}
              setHoveredNav={setHoveredNav}
              scrollToProgress={scrollToProgress}
            />
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

function HeroChrome({
  hoveredNav,
  setHoveredNav,
  scrollToProgress,
}: {
  hoveredNav: string | null;
  setHoveredNav: (value: string | null) => void;
  scrollToProgress: (progress: number) => void;
}) {
  return (
    <>
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
    </>
  );
}
