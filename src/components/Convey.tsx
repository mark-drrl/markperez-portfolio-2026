"use client";

import { motion, type MotionValue, useTransform } from "framer-motion";

const darkNoise =
  'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 48 48\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\' x=\'0\' y=\'0\' width=\'100%25\' height=\'100%25\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'3.2\' numOctaves=\'6\' seed=\'21\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'48\' height=\'48\' fill=\'black\' filter=\'url(%23noise)\' opacity=\'0.95\'/%3E%3C/svg%3E")';

interface ConveyProps {
  entranceOpacity: MotionValue<number>;
  entranceBlur: MotionValue<string>;
  pointerEvents: MotionValue<"none" | "auto">;
  scrollYProgress: MotionValue<number>;
}

export default function Convey({
  entranceOpacity,
  entranceBlur,
  pointerEvents,
  scrollYProgress,
}: ConveyProps) {
  const rectangleOpacity = useTransform(
    scrollYProgress,
    [0, 0.032, 0.058, 0.152, 0.18, 1],
    [0, 0, 0.9, 0.9, 0.28, 0],
  );
  const rectangleBlur = useTransform(
    scrollYProgress,
    [0.024, 0.058, 0.152, 0.18],
    ["blur(20px)", "blur(0px)", "blur(0px)", "blur(36px)"],
  );
  const rectangleRippleMask = useTransform(scrollYProgress, (latest) => {
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
  });
  const rectangleScale = useTransform(
    scrollYProgress,
    [0.024, 0.058, 0.148, 0.18],
    [0.98, 1, 1, 1.38],
  );
  const burstOpacity = useTransform(
    scrollYProgress,
    [0.142, 0.17, 0.18],
    [0, 0.5, 0],
  );
  const burstScale = useTransform(
    scrollYProgress,
    [0.142, 0.18],
    [0.9, 1.75],
  );
  const textOpacity = useTransform(
    scrollYProgress,
    [0, 0.008, 0.026, 0.128, 0.15, 1],
    [0, 0, 1, 1, 0, 0],
  );
  const textBlur = useTransform(
    scrollYProgress,
    [0.004, 0.026, 0.128, 0.15],
    ["blur(18px)", "blur(0px)", "blur(0px)", "blur(18px)"],
  );
  const subtitleOpacity = useTransform(
    scrollYProgress,
    [0, 0.014, 0.032, 0.124, 0.146, 1],
    [0, 0, 1, 1, 0, 0],
  );
  const subtitleBlur = useTransform(
    scrollYProgress,
    [0.012, 0.032, 0.124, 0.146],
    ["blur(12px)", "blur(0px)", "blur(0px)", "blur(14px)"],
  );
  const videoY = useTransform(scrollYProgress, [0.01, 0.152, 0.18], ["-8%", "4%", "12%"]);
  const videoScale = useTransform(scrollYProgress, [0.01, 0.152, 0.18], [1.18, 1.08, 1.46]);

  return (
    <motion.section
      className="absolute inset-0 w-full h-full bg-[#EAEAEA] text-black flex flex-col justify-between p-12 overflow-hidden"
      style={{
        opacity: entranceOpacity,
        filter: entranceBlur,
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
            opacity: rectangleOpacity,
            filter: rectangleBlur,
            scale: rectangleScale,
            WebkitMaskImage: rectangleRippleMask,
            maskImage: rectangleRippleMask,
          }}
          aria-hidden="true"
        >
          <motion.video
            className="h-[116%] w-full object-cover grayscale contrast-110 brightness-105 opacity-80"
            src="/GRADIENT.mp4"
            autoPlay
            muted
            loop
            playsInline
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

        <p className="font-neue absolute left-8 top-8 z-20 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
          MARK <span className="text-[#9F1F2E]">PEREZ</span>
        </p>

        <motion.div
          className="relative z-20 flex flex-col items-center justify-center text-center my-auto w-full"
          style={{
            opacity: textOpacity,
            filter: textBlur,
          }}
        >
          <h2
            className="whitespace-nowrap text-[clamp(26px,7vw,40px)] tracking-[-0.02em] text-[#9A3A3A] md:text-7xl"
          >
            <span className="font-editorial italic font-light">
              Conveying
            </span>{" "}
            <span className="font-neue text-[0.9em] font-medium not-italic">
              the idea
            </span>
          </h2>
          <motion.p
            className="font-neue text-xs md:text-sm text-neutral-600 tracking-wide mt-4 font-normal max-w-xl"
            style={{
              opacity: subtitleOpacity,
              filter: subtitleBlur,
            }}
          >
            through sharp market positioning and deliberate brand intent.
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
