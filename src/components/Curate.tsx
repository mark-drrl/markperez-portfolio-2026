"use client";

import {
  mobileSectionGridLayer,
  mobileStackCellBottom,
  mobileStackCellMiddle,
  mobileStackCellTop,
} from "@/constants/mobileSectionGrid";
import { motion, type MotionValue, useTransform } from "framer-motion";
import type { CSSProperties } from "react";

const title = "Curating the brand";
const sansStartIndex = title.indexOf("the brand");
const existingImagePaths = [
  "/work/portfolio-1.jpg",
  "/work/portfolio-2.png",
  "/work/portfolio-3.jpg",
  "/work/portfolio-4.jpg",
  "/work/portfolio-5.jpg",
  "/work/portfolio-6.jpg",
  "/work/portfolio-7.jpg",
];

interface ReplacementCellDefinition {
  className: string;
  start: number;
  end: number;
}

const replacementCells = [
  {
    className: "left-0 top-0 h-[60.5%] w-[calc((100%-1vh)/3)]",
    start: 0.345,
    end: 0.405,
  },
  {
    className: "left-0 top-[calc(60.5%+0.5vh)] h-[60.5%] w-[calc((100%-1vh)/3)]",
    start: 0.375,
    end: 0.435,
  },
  {
    className: "left-[calc((100%-1vh)/3+0.5vh)] top-[13%] h-[60.5%] w-[calc((100%-1vh)/3)]",
    start: 0.405,
    end: 0.465,
  },
  {
    className: "left-[calc((100%-1vh)/3+0.5vh)] -top-[48%] h-[60.5%] w-[calc((100%-1vh)/3)]",
    start: 0.435,
    end: 0.495,
  },
  {
    className: "left-[calc((100%-1vh)/3+0.5vh)] top-[74%] h-[60.5%] w-[calc((100%-1vh)/3)]",
    start: 0.465,
    end: 0.525,
  },
  {
    className: "left-[calc(((100%-1vh)/3)*2+1vh)] top-0 h-[57.5%] w-[calc((100%-1vh)/3)]",
    start: 0.495,
    end: 0.555,
  },
  {
    className: "left-[calc(((100%-1vh)/3)*2+1vh)] top-[calc(57.5%+0.5vh)] h-[41.5%] w-[calc((100%-1vh)/3)]",
    start: 0.525,
    end: 0.585,
  },
] as const satisfies readonly ReplacementCellDefinition[];

const mobileReplacementCells = [
  { className: mobileStackCellTop, start: 0.345, end: 0.405 },
  { className: mobileStackCellMiddle, start: 0.405, end: 0.465 },
  { className: mobileStackCellBottom, start: 0.495, end: 0.555 },
] as const satisfies readonly ReplacementCellDefinition[];

interface CurateProps {
  opacity: MotionValue<number>;
  blur: MotionValue<string>;
  pointerEvents: MotionValue<"none" | "auto">;
  visibility: MotionValue<CSSProperties["visibility"]>;
  scrollYProgress: MotionValue<number>;
}

interface ReplacementImageProps {
  cell: ReplacementCellDefinition;
  index: number;
  scrollYProgress: MotionValue<number>;
  variant: "desktop" | "mobile";
}

function ReplacementImage({
  cell,
  index,
  scrollYProgress,
  variant,
}: ReplacementImageProps) {
  const src = existingImagePaths[index % existingImagePaths.length];
  const isMobile = variant === "mobile";
  const opacity = useTransform(
    scrollYProgress,
    [cell.start, cell.end],
    isMobile ? [0, 0.72] : [0, 0.46],
  );
  const filter = useTransform(
    scrollYProgress,
    [cell.start, cell.end],
    isMobile ? ["blur(18px)", "blur(0px)"] : ["blur(38px)", "blur(10px)"],
  );
  const scale = useTransform(
    scrollYProgress,
    [cell.start, cell.end],
    isMobile ? [1, 1] : [1.08, 1.03],
  );

  return (
    <div className={`absolute overflow-hidden bg-neutral-400/70 ${cell.className}`}>
      <motion.div
        className="absolute inset-0"
        style={{ opacity, filter, scale }}
      >
        <img
          src={src}
          alt=""
          className={`h-full w-full object-cover grayscale ${
            isMobile ? "" : "blur-[10px]"
          }`}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-neutral-300/20 md:bg-neutral-300/28" />
    </div>
  );
}

interface CurateCharacterProps {
  character: string;
  index: number;
  scrollYProgress: MotionValue<number>;
  total: number;
}

function CurateCharacter({
  character,
  index,
  scrollYProgress,
  total,
}: CurateCharacterProps) {
  const start = 0.36 + (index / Math.max(total - 1, 1)) * 0.05;
  const end = Math.min(start + 0.04, 0.44);
  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
  const filter = useTransform(
    scrollYProgress,
    [start, end],
    ["blur(18px)", "blur(0px)"],
  );
  const isSans = index >= sansStartIndex;

  return (
    <motion.span
      className={`inline-block ${
        isSans
          ? "font-neue text-[0.9em] font-medium not-italic"
          : "font-editorial italic font-light"
      }`}
      style={{ opacity, filter }}
    >
      {character === " " ? "\u00A0" : character}
    </motion.span>
  );
}

export default function Curate({
  opacity,
  blur,
  pointerEvents,
  visibility,
  scrollYProgress,
}: CurateProps) {
  const textOpacity = useTransform(scrollYProgress, [0.58, 0.66], [1, 0]);
  const textBlur = useTransform(
    scrollYProgress,
    [0.58, 0.66],
    ["blur(0px)", "blur(22px)"],
  );
  const subtitleOpacity = useTransform(
    scrollYProgress,
    [0.39, 0.45, 0.58, 0.66],
    [0, 1, 1, 0],
  );
  const subtitleBlur = useTransform(
    scrollYProgress,
    [0.39, 0.45, 0.58, 0.66],
    ["blur(12px)", "blur(0px)", "blur(0px)", "blur(22px)"],
  );

  return (
    <motion.section
      className="absolute inset-0 flex h-full w-full flex-col justify-between overflow-hidden bg-[#EAEAEA] p-12 text-black pointer-events-none"
      style={{ opacity, filter: blur, pointerEvents, visibility }}
    >
      <motion.div className="absolute inset-0 h-full w-full">
      <div className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden opacity-95 blur-[18px] md:block">
        {replacementCells.map((cell, index) => (
          <ReplacementImage
            key={cell.className}
            cell={cell}
            index={index}
            scrollYProgress={scrollYProgress}
            variant="desktop"
          />
        ))}
      </div>
      <div className={mobileSectionGridLayer}>
        {mobileReplacementCells.map((cell, index) => (
          <ReplacementImage
            key={cell.className}
            cell={cell}
            index={index}
            scrollYProgress={scrollYProgress}
            variant="mobile"
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 z-[2] hidden bg-[#EAEAEA]/22 backdrop-blur-[18px] md:block" />

      <p className="font-neue absolute left-8 top-8 z-20 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
        MARK <span className="text-[#9F1F2E]">PEREZ</span>
      </p>

      </motion.div>

      <motion.div
        className="pointer-events-none relative z-20 flex h-full w-full flex-col items-center justify-center text-center"
        style={{ opacity: textOpacity, filter: textBlur }}
      >
        <h2
          className="text-5xl tracking-[-0.02em] text-[#9A3A3A] md:text-7xl"
        >
          {title.split("").map((character, index) => (
            <CurateCharacter
              key={`${character}-${index}`}
              character={character}
              index={index}
              scrollYProgress={scrollYProgress}
              total={title.length}
            />
          ))}
        </h2>
        <motion.p
          className="font-neue mt-4 max-w-xl text-xs font-normal tracking-wide text-neutral-600 md:text-sm"
          style={{
            opacity: subtitleOpacity,
            filter: subtitleBlur,
          }}
        >
          into a quiet, high-impact design system that strips away the noise.
        </motion.p>
      </motion.div>
    </motion.section>
  );
}
