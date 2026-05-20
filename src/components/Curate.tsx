"use client";

import MarkPerezBrand from "@/components/MarkPerezBrand";
import SectionInlineCopy from "@/components/SectionInlineCopy";
import SectionNavLinks from "@/components/SectionNavLinks";
import { cellRevealTone } from "@/lib/sectionNavTone";
import {
  desktopCurateWorkHandoffImageIndices,
  workGalleryImages,
} from "@/constants/workGalleryImages";
import {
  mobileBackgroundBlurFilter,
  mobileCurateBlur,
  mobileCurateOpacity,
  mobileEdgeBlurPx,
  mobileSectionLocalProgress,
  mobileSectionScrollKeys,
  mobileStaggeredRange,
} from "@/lib/mobileHomeOpacity";
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
interface ReplacementCellDefinition {
  className: string;
  start: number;
  end: number;
  origin?: string;
}

const replacementCells = [
  {
    className: "left-0 top-0 h-[60.5%] w-[calc((100%-1vh)/3)]",
    start: 0.33,
    end: 0.42,
    origin: "42% 58%",
  },
  {
    className: "left-0 top-[calc(60.5%+0.5vh)] h-[60.5%] w-[calc((100%-1vh)/3)]",
    start: 0.36,
    end: 0.45,
    origin: "58% 72%",
  },
  {
    className: "left-[calc((100%-1vh)/3+0.5vh)] top-[13%] h-[60.5%] w-[calc((100%-1vh)/3)]",
    start: 0.39,
    end: 0.48,
    origin: "46% 48%",
  },
  {
    className: "left-[calc((100%-1vh)/3+0.5vh)] -top-[48%] h-[60.5%] w-[calc((100%-1vh)/3)]",
    start: 0.42,
    end: 0.51,
    origin: "64% 34%",
  },
  {
    className: "left-[calc((100%-1vh)/3+0.5vh)] top-[74%] h-[60.5%] w-[calc((100%-1vh)/3)]",
    start: 0.45,
    end: 0.54,
    origin: "38% 68%",
  },
  {
    className: "left-[calc(((100%-1vh)/3)*2+1vh)] top-0 h-[57.5%] w-[calc((100%-1vh)/3)]",
    start: 0.48,
    end: 0.57,
    origin: "52% 54%",
  },
  {
    className: "left-[calc(((100%-1vh)/3)*2+1vh)] top-[calc(57.5%+0.5vh)] h-[41.5%] w-[calc((100%-1vh)/3)]",
    start: 0.51,
    end: 0.6,
    origin: "36% 62%",
  },
] as const satisfies readonly ReplacementCellDefinition[];

const mobileReplacementCells = [
  {
    className: mobileStackCellTop,
    ...mobileStaggeredRange("curate", 0, 3),
  },
  {
    className: mobileStackCellMiddle,
    ...mobileStaggeredRange("curate", 1, 3),
  },
  {
    className: mobileStackCellBottom,
    ...mobileStaggeredRange("curate", 2, 3),
  },
] as const satisfies readonly ReplacementCellDefinition[];

interface CurateProps {
  opacity: MotionValue<number>;
  blur?: MotionValue<string>;
  pointerEvents: MotionValue<CSSProperties["pointerEvents"]>;
  visibility: MotionValue<CSSProperties["visibility"]>;
  scrollYProgress: MotionValue<number>;
  mobileLite?: boolean;
}

interface ReplacementImageProps {
  cell: ReplacementCellDefinition;
  index: number;
  scrollYProgress: MotionValue<number>;
  variant: "desktop" | "mobile";
  mobileLite?: boolean;
}

function ReplacementImage({
  cell,
  index,
  scrollYProgress,
  variant,
  mobileLite = false,
}: ReplacementImageProps) {
  const isMobile = variant === "mobile";
  const imageIndex = isMobile
    ? index % workGalleryImages.length
    : (desktopCurateWorkHandoffImageIndices[index] ?? index);
  const src = workGalleryImages[imageIndex % workGalleryImages.length];
  const opacity = useTransform(
    scrollYProgress,
    [cell.start, cell.end],
    isMobile ? [0, 0.72] : [0, 0.6],
  );
  const filter = useTransform(
    scrollYProgress,
    [cell.start, cell.end],
    isMobile ? ["blur(22px)", "blur(0px)"] : ["blur(38px)", "blur(10px)"],
  );
  const scale = useTransform(
    scrollYProgress,
    [cell.start, cell.end],
    isMobile ? [1.06, 1] : [1.08, 1.03],
  );
  const rippleMask = useTransform(scrollYProgress, (latest) => {
    if (isMobile || !cell.origin) {
      return "linear-gradient(black, black)";
    }

    const rippleProgress = Math.min(
      Math.max((latest - cell.start) / (cell.end - cell.start), 0),
      1,
    );

    if (rippleProgress >= 0.995) {
      return "linear-gradient(black, black)";
    }

    const wave = rippleProgress * 142;
    const inner = Math.max(wave - 22, 0);
    const feather = wave + 18;

    return `radial-gradient(circle at ${cell.origin}, black 0%, black ${inner}%, rgba(0,0,0,0.72) ${wave}%, transparent ${feather}%, transparent 100%)`;
  });

  return (
    <div className={`absolute overflow-hidden bg-neutral-400/70 ${cell.className}`}>
      <motion.div
        className="absolute inset-0"
        style={{
          opacity,
          scale,
          filter,
          WebkitMaskImage: isMobile ? undefined : rippleMask,
          maskImage: isMobile ? undefined : rippleMask,
        }}
      >
        <img
          src={src}
          alt=""
          loading={isMobile ? "lazy" : "eager"}
          decoding="async"
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
  start: number;
  end: number;
}

function CurateCharacter({
  character,
  index,
  scrollYProgress,
  total,
  start,
  end,
}: CurateCharacterProps) {
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

const curateSubtitle =
  "into a quiet, high-impact design system that strips away the noise.";

function CurateHeadingDesktop({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  return (
    <h2 className="text-5xl tracking-[-0.02em] text-[#9A3A3A] md:text-7xl">
      {title.split("").map((character, index) => {
        const start = 0.36 + (index / Math.max(title.length - 1, 1)) * 0.05;
        const end = Math.min(start + 0.04, 0.44);

        return (
          <CurateCharacter
            key={`${character}-${index}`}
            character={character}
            index={index}
            scrollYProgress={scrollYProgress}
            total={title.length}
            start={start}
            end={end}
          />
        );
      })}
    </h2>
  );
}

function CurateHeading({
  scrollYProgress,
  mobileLite,
}: {
  scrollYProgress: MotionValue<number>;
  mobileLite: boolean;
}) {
  if (mobileLite) {
    const keys = mobileSectionScrollKeys("curate", [0.06, 0.38]);
    const [formationStart, formationEnd] = keys;
    const span = formationEnd - formationStart;

    return (
      <h2 className="whitespace-nowrap text-[clamp(1.35rem,5.2vw,3.25rem)] tracking-[-0.02em]">
        {title.split("").map((character, index) => {
          const charStart =
            formationStart + (index / Math.max(title.length - 1, 1)) * span * 0.88;
          const charEnd = Math.min(charStart + span * 0.1, formationEnd);

          return (
            <CurateCharacter
              key={`${character}-${index}`}
              character={character}
              index={index}
              scrollYProgress={scrollYProgress}
              total={title.length}
              start={charStart}
              end={charEnd}
            />
          );
        })}
      </h2>
    );
  }

  return <CurateHeadingDesktop scrollYProgress={scrollYProgress} />;
}

export default function Curate({
  opacity,
  blur,
  pointerEvents,
  visibility,
  scrollYProgress,
  mobileLite = false,
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
  const mobileBrandOpacity = useTransform(scrollYProgress, (latest) => {
    if (!mobileLite) {
      return 1;
    }

    const local = mobileSectionLocalProgress(latest, "curate");

    if (local < 0.2) {
      return 0;
    }

    if (local < 0.32) {
      return (local - 0.2) / 0.12;
    }

    if (local > 0.9) {
      return (1 - local) / 0.1;
    }

    return 1;
  });
  const mobileTextOpacity = useTransform(scrollYProgress, (progress) => {
    if (!mobileLite) {
      return 1;
    }

    const layer = mobileCurateOpacity(progress);

    if (layer < 0.08) {
      return 0;
    }

    if (layer < 0.18) {
      return (layer - 0.08) / 0.1;
    }

    return 1;
  });
  const navOpacity = mobileBrandOpacity;
  const curateNavToneCell = mobileLite
    ? mobileReplacementCells[0]
    : replacementCells[5];
  const navBackgroundTone = useTransform(scrollYProgress, (latest) =>
    cellRevealTone(
      latest,
      curateNavToneCell.start,
      curateNavToneCell.end,
      mobileLite ? 0.82 : 0.75,
    ),
  );
  const mobileBackgroundFilter = useTransform(opacity, (sectionOpacity) => {
    if (!mobileLite) {
      return "blur(0px)";
    }

    return mobileBackgroundBlurFilter(
      sectionOpacity,
      scrollYProgress.get(),
      mobileCurateBlur,
    );
  });
  const mobileGridOpacity = useTransform(scrollYProgress, (progress) => {
    if (!mobileLite) {
      return 1;
    }

    const layer = mobileCurateOpacity(progress);

    return layer > 0.06 ? 1 : layer > 0 ? layer / 0.06 : 0;
  });
  const mobileSubtitleOpacity = useTransform(scrollYProgress, (latest) => {
    if (!mobileLite) {
      return 1;
    }

    const local = mobileSectionLocalProgress(latest, "curate");

    if (local < 0.32) {
      return 0;
    }

    if (local < 0.42) {
      return (local - 0.32) / 0.1;
    }

    if (local > 0.92) {
      return (1 - local) / 0.08;
    }

    return 1;
  });
  const mobileSubtitleBlur = useTransform(scrollYProgress, (latest) => {
    if (!mobileLite) {
      return "blur(0px)";
    }

    const local = mobileSectionLocalProgress(latest, "curate");

    if (local >= 0.42 && local <= 0.88) {
      return "blur(0px)";
    }

    if (local < 0.42) {
      const amount = Math.round((1 - local / 0.42) * 6);
      return amount > 0 ? `blur(${amount}px)` : "blur(0px)";
    }

    const px = mobileEdgeBlurPx(local, 6, 0.1);

    return px > 0 ? `blur(${px}px)` : "blur(0px)";
  });
  const mobileTextBlur = useTransform(scrollYProgress, () => "blur(0px)");

  return (
    <motion.section
      className={`absolute inset-0 flex h-full w-full flex-col justify-between bg-[#EAEAEA] p-12 text-black pointer-events-none ${mobileLite ? "overflow-x-visible overflow-y-hidden" : "overflow-hidden"}`}
      style={{
        opacity: mobileLite ? 1 : opacity,
        ...(blur ? { filter: blur } : {}),
        pointerEvents,
        visibility: mobileLite ? "visible" : visibility,
      }}
    >
      <motion.div className="absolute inset-0 flex h-full w-full flex-col justify-between p-12">
      <div className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden opacity-95 blur-[10px] md:block">
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
      <motion.div
        className={mobileSectionGridLayer}
        style={
          mobileLite
            ? { opacity: mobileGridOpacity, filter: mobileBackgroundFilter }
            : undefined
        }
      >
        {mobileReplacementCells.map((cell, index) => (
          <ReplacementImage
            key={cell.className}
            cell={cell}
            index={index}
            scrollYProgress={scrollYProgress}
            variant="mobile"
            mobileLite={mobileLite}
          />
        ))}
      </motion.div>

      <div className="pointer-events-none absolute inset-0 z-[2] hidden bg-[#EAEAEA]/22 backdrop-blur-[10px] md:block" />

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
            heading={
              <CurateHeading
                scrollYProgress={scrollYProgress}
                mobileLite={mobileLite}
              />
            }
            subtitle={
              mobileLite ? (
                <motion.span
                  style={{
                    opacity: mobileSubtitleOpacity,
                    filter: mobileSubtitleBlur,
                  }}
                >
                  {curateSubtitle}
                </motion.span>
              ) : (
                <motion.span
                  style={{ opacity: subtitleOpacity, filter: subtitleBlur }}
                >
                  {curateSubtitle}
                </motion.span>
              )
            }
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
