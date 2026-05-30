"use client";

import MarkPerezBrand from "@/components/MarkPerezBrand";
import SectionInlineCopy from "@/components/SectionInlineCopy";
import SectionNavLinks from "@/components/SectionNavLinks";
import { cellRevealTone } from "@/lib/sectionNavTone";
import {
  mobileBackgroundBlurFilter,
  mobileConveyBlur,
  mobileConveyOpacity,
  mobileEdgeBlurPx,
  mobileSectionLocalProgress,
  mobileSectionScrollKeys,
} from "@/lib/mobileHomeOpacity";
import {
  motion,
  type MotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, type CSSProperties } from "react";

const darkNoise =
  'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 48 48\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\' x=\'0\' y=\'0\' width=\'100%25\' height=\'100%25\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'3.2\' numOctaves=\'6\' seed=\'21\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'48\' height=\'48\' fill=\'black\' filter=\'url(%23noise)\' opacity=\'0.95\'/%3E%3C/svg%3E")';

interface ConveyProps {
  entranceOpacity: MotionValue<number>;
  entranceBlur?: MotionValue<string>;
  pointerEvents: MotionValue<CSSProperties["pointerEvents"]>;
  scrollYProgress: MotionValue<number>;
  mobileLite?: boolean;
}

export default function Convey({
  entranceOpacity,
  entranceBlur,
  pointerEvents,
  scrollYProgress,
  mobileLite = false,
}: ConveyProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useMotionValueEvent(entranceOpacity, "change", (latest) => {
    if (!mobileLite) {
      return;
    }

    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (latest > 0.08) {
      void video.play().catch(() => {});
      return;
    }

    video.pause();
  });

  useEffect(() => {
    if (!mobileLite) {
      return;
    }

    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (entranceOpacity.get() > 0.08) {
      void video.play().catch(() => {});
    }
  }, [entranceOpacity, mobileLite]);

  const rectangleOpacity = useTransform(
    scrollYProgress,
    [0, 0.032, 0.058, 0.152, 0.18, 1],
    [0, 0, 0.9, 0.9, 0.28, 0],
  );
  const mobileContentOpacity = useTransform(scrollYProgress, (progress) => {
    if (!mobileLite) {
      return 1;
    }

    const layer = mobileConveyOpacity(progress);

    return layer > 0.06 ? 1 : layer > 0 ? layer / 0.06 : 0;
  });
  const mobileRectangleOpacity = mobileContentOpacity;
  const conveyKeys = mobileSectionScrollKeys("convey", [0, 0.2, 0.55, 0.85, 1]);
  const rectangleBlur = useTransform(
    scrollYProgress,
    mobileLite
      ? mobileSectionScrollKeys("convey", [0, 0.08, 0.5, 0.92, 1])
      : [0.024, 0.058, 0.152, 0.18],
    mobileLite
      ? ["blur(16px)", "blur(0px)", "blur(0px)", "blur(0px)", "blur(14px)"]
      : ["blur(20px)", "blur(0px)", "blur(0px)", "blur(36px)"],
  );
  const rectangleRippleMask = useTransform(scrollYProgress, (latest) => {
    if (!mobileLite) {
      if (latest < 0.138) {
        return "linear-gradient(black, black)";
      }

      const progress = Math.min(Math.max((latest - 0.138) / 0.052, 0), 1);
      const firstWave = 8 + progress * 116;
      const secondWave = 22 + progress * 134;

      return `radial-gradient(circle at 48% 58%, transparent 0%, transparent ${Math.max(
        firstWave - 22,
        0,
      )}%, rgba(0,0,0,0.42) ${firstWave}%, black ${firstWave + 18}%, black 100%),
    radial-gradient(circle at 62% 34%, transparent 0%, transparent ${Math.max(
        secondWave - 18,
        0,
      )}%, rgba(0,0,0,0.34) ${secondWave}%, black ${secondWave + 16}%, black 100%)`;
    }

    return "linear-gradient(black, black)";
  });
  const rectangleScale = useTransform(
    scrollYProgress,
    mobileLite ? conveyKeys : [0.024, 0.058, 0.148, 0.18],
    mobileLite ? [0.96, 1, 1.06, 1.12, 1.18] : [0.98, 1, 1, 1.38],
  );
  const burstOpacity = useTransform(
    scrollYProgress,
    mobileLite
      ? mobileSectionScrollKeys("convey", [0.38, 0.48, 0.58])
      : [0.142, 0.17, 0.18],
    mobileLite ? [0, 0.35, 0] : [0, 0.5, 0],
  );
  const burstScale = useTransform(
    scrollYProgress,
    mobileLite
      ? mobileSectionScrollKeys("convey", [0.38, 0.58])
      : [0.142, 0.18],
    mobileLite ? [0.95, 1.35] : [0.9, 1.75],
  );
  const textOpacity = useTransform(scrollYProgress, (latest) =>
    mobileLite ? 1 : latest <= 0.008 ? 0 : latest <= 0.026 ? (latest - 0.008) / 0.018 : latest >= 0.15 ? 0 : latest >= 0.128 ? 1 - (latest - 0.128) / 0.022 : 1,
  );
  const textBlur = useTransform(
    scrollYProgress,
    [0.004, 0.026, 0.128, 0.15],
    ["blur(18px)", "blur(0px)", "blur(0px)", "blur(18px)"],
  );
  const subtitleOpacity = useTransform(scrollYProgress, (latest) =>
    mobileLite ? 1 : latest <= 0.014 ? 0 : latest <= 0.032 ? (latest - 0.014) / 0.018 : latest >= 0.146 ? 0 : latest >= 0.124 ? 1 - (latest - 0.124) / 0.022 : 1,
  );
  const subtitleBlur = useTransform(
    scrollYProgress,
    [0.012, 0.032, 0.124, 0.146],
    ["blur(12px)", "blur(0px)", "blur(0px)", "blur(14px)"],
  );
  const videoY = useTransform(
    scrollYProgress,
    mobileLite
      ? mobileSectionScrollKeys("convey", [0, 0.45, 1])
      : [0.01, 0.152, 0.18],
    mobileLite ? ["-4%", "2%", "8%"] : ["-8%", "4%", "12%"],
  );
  const videoScale = useTransform(
    scrollYProgress,
    mobileLite ? conveyKeys : [0.01, 0.152, 0.18],
    mobileLite ? [1.06, 1.1, 1.14, 1.2, 1.26] : [1.18, 1.08, 1.46],
  );
  const mobileTextOpacity = mobileContentOpacity;
  const mobileTextBlur = useTransform(scrollYProgress, (latest) => {
    if (!mobileLite) {
      return "blur(0px)";
    }

    const px = mobileEdgeBlurPx(
      mobileSectionLocalProgress(latest, "convey"),
      16,
      0.16,
    );

    return px > 0 ? `blur(${px}px)` : "blur(0px)";
  });
  const mobileSubtitleOpacity = useTransform(scrollYProgress, (latest) => {
    if (!mobileLite) {
      return 1;
    }

    const local = mobileSectionLocalProgress(latest, "convey");

    if (local < 0.1) {
      return local / 0.1;
    }

    if (local > 0.9) {
      return (1 - local) / 0.1;
    }

    return 1;
  });
  const mobileBrandOpacity = mobileContentOpacity;
  const navOpacity = mobileContentOpacity;
  const navBackgroundTone = useTransform(scrollYProgress, (latest) => {
    if (mobileLite) {
      const local = mobileSectionLocalProgress(latest, "convey");
      const videoPresence =
        local > 0.12 && local < 0.9
          ? Math.min(1, (local - 0.12) / 0.35) * 0.35
          : 0;

      return videoPresence;
    }

    const rectTone = cellRevealTone(latest, 0.024, 0.152, 0.22);

    return rectTone;
  });
  const conveySubtitle =
    "through sharp market positioning and deliberate brand intent.";
  const mobileBackgroundFilter = useTransform(scrollYProgress, (progress) => {
    if (!mobileLite) {
      return "blur(0px)";
    }

    const sectionOpacity = mobileConveyOpacity(progress);

    return mobileBackgroundBlurFilter(
      sectionOpacity,
      progress,
      mobileConveyBlur,
    );
  });

  return (
    <motion.section
      className={`absolute inset-0 flex h-full w-full flex-col justify-between bg-[#EAEAEA] p-12 text-black ${mobileLite ? "overflow-x-visible overflow-y-hidden" : "overflow-hidden"}`}
      style={{
        opacity: mobileLite ? 1 : entranceOpacity,
        ...(entranceBlur ? { filter: entranceBlur } : {}),
        pointerEvents,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-25 mix-blend-multiply"
        style={{
          backgroundImage: darkNoise,
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute inset-0 flex h-full w-full flex-col justify-between p-12"
      >
        <motion.div
          className="pointer-events-none absolute left-1/2 top-[29%] z-0 h-[42%] w-[34%] -translate-x-1/2 overflow-hidden bg-neutral-300 md:left-[38.85%] md:top-[22%] md:h-[52%] md:w-[22.27%] md:translate-x-0"
          style={{
            opacity: mobileLite ? mobileRectangleOpacity : rectangleOpacity,
            filter: mobileLite
              ? mobileBackgroundFilter
              : rectangleBlur,
            scale: rectangleScale,
            WebkitMaskImage: rectangleRippleMask,
            maskImage: rectangleRippleMask,
          }}
          aria-hidden="true"
        >
          <motion.video
            ref={videoRef}
            className="h-[116%] w-full object-cover grayscale contrast-110 brightness-105 opacity-80"
            src="/GRADIENT.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            style={{
              y: videoY,
              scale: videoScale,
            }}
          />
          <div className="absolute inset-0 bg-[#EAEAEA]/20 mix-blend-screen" />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute left-1/2 top-[29%] z-10 h-[42%] w-[34%] -translate-x-1/2 bg-white/35 blur-3xl md:left-[38.85%] md:top-[22%] md:h-[52%] md:w-[22.27%] md:translate-x-0"
          style={{
            opacity: burstOpacity,
            scale: burstScale,
          }}
          aria-hidden="true"
        />

        <MarkPerezBrand
          className="absolute left-8 top-8 z-20"
          opacity={mobileBrandOpacity}
        />

        <SectionNavLinks opacity={navOpacity} backgroundTone={navBackgroundTone} />

        <motion.div
          className="relative z-20 my-auto w-full max-w-full overflow-visible"
          style={
            mobileLite
              ? { opacity: mobileTextOpacity, filter: mobileTextBlur }
              : { opacity: textOpacity, filter: textBlur }
          }
        >
          <SectionInlineCopy
            layout={mobileLite ? "inline" : "stacked"}
            heading={
              <h2 className="whitespace-nowrap text-[clamp(1.35rem,5.2vw,3.25rem)] tracking-[-0.02em] md:text-7xl">
                <span className="font-editorial italic font-light">
                  Conveying{" "}
                </span>
                <span className="font-neue text-[0.9em] font-medium not-italic">
                  the idea
                </span>
              </h2>
            }
            subtitle={
              mobileLite ? (
                <motion.span
                  style={{ opacity: mobileSubtitleOpacity }}
                >
                  {conveySubtitle}
                </motion.span>
              ) : (
                <motion.span
                  style={{ opacity: subtitleOpacity, filter: subtitleBlur }}
                >
                  {conveySubtitle}
                </motion.span>
              )
            }
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
