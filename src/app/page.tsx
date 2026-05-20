"use client";

import Convey from "@/components/Convey";
import Create from "@/components/Create";
import Curate from "@/components/Curate";
import FluidDistortion from "@/components/FluidDistortion";
import Hero from "@/components/Hero";
import ProceduralGrain from "@/components/ProceduralGrain";
import Work from "@/components/work";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
} from "framer-motion";
import { useFinePointer } from "@/hooks/useFinePointer";
import Lenis from "lenis";
import { type CSSProperties, useEffect, useRef, useState } from "react";

function LastPage({ onClose }: { onClose: () => void }) {
  return (
    <section className="flex h-full w-full flex-col items-center justify-center bg-[#EAEAEA] p-12 text-center text-black">
      <p className="font-neue text-[10px] tracking-[0.25em] text-black/40">FINAL ACT</p>
      <h2 className="font-editorial mt-4 text-5xl italic text-[#9A3A3A] md:text-7xl">
        Last page
      </h2>
      <button
        type="button"
        onClick={onClose}
        className="mt-8 text-[10px] tracking-[0.25em] text-black/50 transition-colors hover:text-black"
      >
        CLOSE
      </button>
    </section>
  );
}

export default function Home() {
  const isFinePointer = useFinePointer();
  const [isLastPageOpen, setIsLastPageOpen] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const activeMagneticElementRef = useRef<HTMLElement | null>(null);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const cursorSpringX = useSpring(cursorX, {
    damping: 34,
    stiffness: 180,
    mass: 0.55,
  });
  const cursorSpringY = useSpring(cursorY, {
    damping: 34,
    stiffness: 180,
    mass: 0.55,
  });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const heroOpacity = useTransform(
    scrollYProgress,
    [0, 0.004, 0.038, 0.052, 1],
    [1, 1, 1, 0, 0],
  );
  const heroBlur = useTransform(
    scrollYProgress,
    [0, 0.004, 0.038, 0.052, 1],
    ["blur(0px)", "blur(0px)", "blur(18px)", "blur(42px)", "blur(42px)"],
  );
  const conveyOpacity = useTransform(
    scrollYProgress,
    [0, 0.004, 0.01, 0.14, 0.18, 1],
    [0, 0, 1, 1, 0, 0],
  );
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
  const conveyRevealMask = useTransform(
    heroToConveySweep,
    (value) => {
      if (value >= 99) {
        return "none";
      }

      const solidEnd = Math.max(0, value - 8);
      const softMid = value + 10;
      const featherEnd = value + 28;

      return `linear-gradient(to top, black 0%, black ${solidEnd}%, rgba(0,0,0,0.72) ${softMid}%, transparent ${featherEnd}%, transparent 100%)`;
    },
  );
  const glassSweepMask = useTransform(
    heroToConveySweep,
    (value) => {
      const leadingEdge = value - 42;
      const fullStart = value - 8;
      const fullEnd = value + 18;
      const trailingEdge = value + 62;

      return `linear-gradient(to top, transparent 0%, transparent ${leadingEdge}%, rgba(0,0,0,0.45) ${value - 24}%, black ${fullStart}%, black ${fullEnd}%, rgba(0,0,0,0.45) ${value + 38}%, transparent ${trailingEdge}%, transparent 100%)`;
    },
  );
  const glassSweepOpacity = useTransform(
    scrollYProgress,
    [0, 0.003, 0.014, 0.044, 0.052, 1],
    [0, 0, 1, 1, 0, 0],
  );
  const conveyPointerEvents = useTransform(conveyOpacity, (value) =>
    value > 0.9 ? "auto" : "none",
  );
  const createOpacity = useTransform(
    scrollYProgress,
    [0, 0.14, 0.18, 0.52, 0.58, 1],
    [0, 0, 1, 1, 0, 0],
  );
  const createBlur = useTransform(
    scrollYProgress,
    [0, 0.14, 0.18, 0.52, 0.58, 1],
    [
      "blur(4px)",
      "blur(4px)",
      "blur(0px)",
      "blur(0px)",
      "blur(8px)",
      "blur(8px)",
    ],
  );
  const createPointerEvents = useTransform(createOpacity, (value) =>
    value > 0.9 ? "auto" : "none",
  );
  const curateOpacity = useTransform(
    scrollYProgress,
    [0, 0.34, 0.42, 1],
    [0, 0, 1, 1],
  );
  const curateBlur = useTransform(
    scrollYProgress,
    [0, 0.34, 0.42, 1],
    [
      "blur(24px)",
      "blur(24px)",
      "blur(0px)",
      "blur(0px)",
    ],
  );
  const curatePointerEvents = useTransform(curateOpacity, (value) =>
    value > 0.9 ? "auto" : "none",
  );
  const curateVisibility = useTransform(
    scrollYProgress,
    (latest): CSSProperties["visibility"] =>
      latest > 0.34 ? "visible" : "hidden",
  );
  const workOpacity = useTransform(
    scrollYProgress,
    [0, 0.56, 0.64, 1],
    [0, 0, 1, 1],
  );
  const workBlur = useTransform(
    scrollYProgress,
    [0, 0.56, 0.64, 1],
    ["blur(28px)", "blur(28px)", "blur(0px)", "blur(0px)"],
  );
  const workGlassOpacity = useTransform(
    scrollYProgress,
    [0, 0.56, 0.6, 0.64, 1],
    [0, 0, 1, 0, 0],
  );
  const workPointerEvents = useTransform(workOpacity, (value) =>
    value > 0.9 ? "auto" : "none",
  );
  const grainOpacity = useTransform(
    scrollYProgress,
    [0, 0.58, 0.64, 1],
    [0.25, 0.25, 0, 0],
  );
  const scrollProgressScaleX = useTransform(
    scrollYProgress,
    [0, 0.64, 1],
    [0, 1, 1],
  );
  const scrollProgressOpacity = useTransform(
    scrollYProgress,
    [0, 0.6, 0.64, 1],
    [1, 1, 0, 0],
  );
  const heroVisibility = useTransform(
    scrollYProgress,
    (latest): CSSProperties["visibility"] =>
      latest > 0.06 ? "hidden" : "visible",
  );
  const heroPointerEvents = useTransform(
    scrollYProgress,
    (latest): CSSProperties["pointerEvents"] =>
      latest > 0.052 ? "none" : "auto",
  );

  useEffect(() => {
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const lenis = new Lenis({
      lerp: isCoarsePointer ? 1 : 0.075,
      smoothWheel: !isCoarsePointer,
    });
    let animationFrameId = 0;

    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (!isFinePointer) {
      document
        .querySelectorAll<HTMLElement>(
          '[data-cursor-interactive="true"], a[href], button',
        )
        .forEach((element) => {
          element.style.transform = "";
        });
      return;
    }

    const clickableSelector =
      'a[href], button, input, textarea, select, summary, [role="button"], [data-cursor-interactive="true"]';

    function resetMagneticElement() {
      const activeElement = activeMagneticElementRef.current;

      if (activeElement) {
        activeElement.style.transform = "";
        activeElement.style.transition =
          "transform 420ms cubic-bezier(0.16, 1, 0.3, 1)";
      }

      activeMagneticElementRef.current = null;
    }

    function handlePointerMove(event: PointerEvent) {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);

      const target = event.target;
      const clickableElement =
        target instanceof Element
          ? target.closest<HTMLElement>(clickableSelector)
          : null;

      if (!clickableElement) {
        setIsHoveringClickable(false);
        resetMagneticElement();
        return;
      }

      setIsHoveringClickable(true);

      if (activeMagneticElementRef.current !== clickableElement) {
        resetMagneticElement();
        activeMagneticElementRef.current = clickableElement;
      }

      const rect = clickableElement.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / Math.max(rect.width, 1);
      const relativeY = (event.clientY - rect.top) / Math.max(rect.height, 1);
      const normalizedX = relativeX * 2 - 1;
      const normalizedY = relativeY * 2 - 1;
      const pullX = normalizedX * 4;
      const pullY = normalizedY * 3;
      const rotateY = normalizedX * 5;
      const rotateX = normalizedY * -4;

      clickableElement.style.transition =
        "transform 180ms cubic-bezier(0.16, 1, 0.3, 1)";
      clickableElement.style.transform = `translate3d(${pullX}px, ${pullY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    function handlePointerLeave() {
      setIsHoveringClickable(false);
      resetMagneticElement();
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      resetMagneticElement();
    };
  }, [cursorX, cursorY, isFinePointer]);

  return (
    <main ref={containerRef} className="relative h-[1800vh] bg-[#EAEAEA] md:h-[3600vh]">
      <span
        id="works"
        className="pointer-events-none absolute top-[64%] h-px w-px"
        aria-hidden="true"
      />
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.div className="absolute inset-0 z-10 w-full h-screen">
          <Hero
            opacity={heroOpacity}
            blur={heroBlur}
            visibility={heroVisibility}
            pointerEvents={heroPointerEvents}
          />
        </motion.div>
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 w-full h-screen"
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
        <motion.div className="pointer-events-none absolute inset-0 z-30 w-full h-screen">
          <Create
            entranceOpacity={createOpacity}
            entranceBlur={createBlur}
            pointerEvents={createPointerEvents}
            scrollYProgress={scrollYProgress}
          />
        </motion.div>
        <motion.div className="pointer-events-none absolute inset-0 z-40 w-full h-screen">
          <Curate
            opacity={curateOpacity}
            blur={curateBlur}
            pointerEvents={curatePointerEvents}
            visibility={curateVisibility}
            scrollYProgress={scrollYProgress}
          />
        </motion.div>
        <motion.div className="pointer-events-none absolute inset-0 z-[45] w-full h-screen">
          <Work
            opacity={workOpacity}
            blur={workBlur}
            pointerEvents={workPointerEvents}
            scrollYProgress={scrollYProgress}
          />
        </motion.div>
        <motion.div
          className="pointer-events-none absolute inset-0 z-[46] hidden bg-[#EAEAEA]/20 backdrop-blur-[36px] md:block"
          style={{ opacity: workGlassOpacity }}
          aria-hidden="true"
        />
      </div>
      <motion.div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] h-1.5 origin-left bg-[#9F1F2E]"
        style={{
          opacity: scrollProgressOpacity,
          scaleX: scrollProgressScaleX,
        }}
        aria-hidden="true"
      />
      <ProceduralGrain opacity={grainOpacity} />
      <FluidDistortion progress={scrollYProgress} />
      {isFinePointer ? (
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-[15] h-2.5 w-2.5 rounded-full bg-[#9F1F2E]"
          animate={{
            backgroundColor: isHoveringClickable
              ? "rgba(159, 31, 46, 0.45)"
              : "rgba(159, 31, 46, 1)",
            filter: isHoveringClickable ? "blur(8px)" : "blur(0px)",
            opacity: isHoveringClickable ? 0.58 : 1,
            scale: isHoveringClickable ? 1.65 : 1,
          }}
          transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
          style={{
            x: cursorSpringX,
            y: cursorSpringY,
            translateX: "-50%",
            translateY: "-50%",
          }}
          aria-hidden="true"
        />
      ) : null}
      <AnimatePresence>
        {isLastPageOpen && (
          <motion.div
            initial={{ opacity: 0, filter: "blur(30px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(30px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 w-full h-screen z-50 bg-[#EAEAEA]"
          >
            <LastPage onClose={() => setIsLastPageOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
