"use client";

import Convey from "@/components/Convey";
import Create from "@/components/Create";
import Curate from "@/components/Curate";
import Hero from "@/components/Hero";
import Work from "@/components/work";
import {
  MOBILE_WORK_SCROLL_PROGRESS,
  mobileConveyOpacity,
  mobileCreateOpacity,
  mobileCurateOpacity,
  mobileHeroBlur,
  mobileHeroOpacity,
} from "@/lib/mobileHomeOpacity";
import { motion, type MotionValue, useMotionValueEvent, useTransform } from "framer-motion";
import { useState, type CSSProperties } from "react";

const MOBILE_Z = {
  hero: 10,
  convey: 20,
  create: 30,
  curate: 40,
  work: 45,
} as const;

function mobileStackZIndex(
  progress: number,
  section: keyof typeof MOBILE_Z,
  opacityFor: (value: number) => number,
) {
  const opacity = opacityFor(progress);
  const opacities = {
    hero: mobileHeroOpacity(progress),
    convey: mobileConveyOpacity(progress),
    create: mobileCreateOpacity(progress),
    curate: mobileCurateOpacity(progress),
  };
  const top = Math.max(...Object.values(opacities));

  if (opacity >= top - 0.001 && opacity > 0.08) {
    return 50;
  }

  return MOBILE_Z[section];
}

interface HomeMobileStackProps {
  scrollYProgress: MotionValue<number>;
}

/** Mobile-only sticky stack. Hidden from `md:` up — does not affect desktop. */
export default function HomeMobileStack({ scrollYProgress }: HomeMobileStackProps) {
  const [heroVideoActive, setHeroVideoActive] = useState(true);

  const heroOpacity = useTransform(scrollYProgress, mobileHeroOpacity);
  const heroBlur = useTransform(scrollYProgress, mobileHeroBlur);
  const conveyOpacity = useTransform(scrollYProgress, mobileConveyOpacity);
  const createOpacity = useTransform(scrollYProgress, mobileCreateOpacity);
  const curateOpacity = useTransform(scrollYProgress, mobileCurateOpacity);

  const heroPointerEvents = useTransform(
    scrollYProgress,
    (p): CSSProperties["pointerEvents"] =>
      mobileHeroOpacity(p) > 0.85 ? "auto" : "none",
  );
  const conveyPointerEvents = useTransform(
    conveyOpacity,
    (v): CSSProperties["pointerEvents"] => (v > 0.85 ? "auto" : "none"),
  );
  const createPointerEvents = useTransform(
    createOpacity,
    (v): CSSProperties["pointerEvents"] => (v > 0.85 ? "auto" : "none"),
  );
  const curatePointerEvents = useTransform(
    curateOpacity,
    (v): CSSProperties["pointerEvents"] => (v > 0.85 ? "auto" : "none"),
  );

  const heroZ = useTransform(scrollYProgress, (p) =>
    mobileStackZIndex(p, "hero", mobileHeroOpacity),
  );
  const conveyZ = useTransform(scrollYProgress, (p) =>
    mobileStackZIndex(p, "convey", mobileConveyOpacity),
  );
  const createZ = useTransform(scrollYProgress, (p) =>
    mobileStackZIndex(p, "create", mobileCreateOpacity),
  );
  const curateZ = useTransform(scrollYProgress, (p) =>
    mobileStackZIndex(p, "curate", mobileCurateOpacity),
  );

  const workOpacity = useTransform(scrollYProgress, (progress) => {
    const workEnter = MOBILE_WORK_SCROLL_PROGRESS - 0.05;

    if (progress <= workEnter) {
      return 0;
    }

    if (progress >= MOBILE_WORK_SCROLL_PROGRESS) {
      return 1;
    }

    return (progress - workEnter) / (MOBILE_WORK_SCROLL_PROGRESS - workEnter);
  });
  const workPointerEvents = useTransform(scrollYProgress, (progress) =>
    progress >= MOBILE_WORK_SCROLL_PROGRESS - 0.02 ? "auto" : "none",
  );

  const heroVisibility = useTransform(
    scrollYProgress,
    (): CSSProperties["visibility"] => "visible",
  );
  const curateVisibility = useTransform(
    scrollYProgress,
    (): CSSProperties["visibility"] => "visible",
  );

  useMotionValueEvent(heroOpacity, "change", (latest) => {
    setHeroVideoActive(latest > 0.08);
  });

  return (
    <div className="contents md:hidden">
      <motion.div
        className="absolute inset-0 h-full w-full will-change-[opacity,filter]"
        style={{
          zIndex: heroZ,
          opacity: heroOpacity,
          filter: heroBlur,
        }}
      >
        <Hero
          opacity={heroOpacity}
          visibility={heroVisibility}
          pointerEvents={heroPointerEvents}
          isVideoActive={heroVideoActive}
          scrollYProgress={scrollYProgress}
          mobileLite
        />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-0 h-screen w-full will-change-opacity"
        style={{ zIndex: conveyZ, opacity: conveyOpacity }}
      >
        <Convey
          entranceOpacity={conveyOpacity}
          pointerEvents={conveyPointerEvents}
          scrollYProgress={scrollYProgress}
          mobileLite
        />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-0 h-screen w-full will-change-opacity"
        style={{ zIndex: createZ, opacity: createOpacity }}
      >
        <Create
          entranceOpacity={createOpacity}
          pointerEvents={createPointerEvents}
          scrollYProgress={scrollYProgress}
          mobileLite
        />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-0 h-screen w-full will-change-opacity"
        style={{ zIndex: curateZ, opacity: curateOpacity }}
      >
        <Curate
          opacity={curateOpacity}
          pointerEvents={curatePointerEvents}
          visibility={curateVisibility}
          scrollYProgress={scrollYProgress}
          mobileLite
        />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-0 z-[45] h-full w-full will-change-opacity"
        style={{ opacity: workOpacity }}
      >
        <Work scrollYProgress={scrollYProgress} pointerEvents={workPointerEvents} />
      </motion.div>
    </div>
  );
}
