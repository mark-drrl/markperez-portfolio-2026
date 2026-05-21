"use client";

import MarkPerezBrand from "@/components/MarkPerezBrand";
import SectionInlineCopy from "@/components/SectionInlineCopy";
import SectionNavLinks from "@/components/SectionNavLinks";
import { cellRevealTone } from "@/lib/sectionNavTone";
import { workGalleryImages } from "@/constants/workGalleryImages";
import { desktopCurateReplacementCells } from "@/lib/workColumnLayout";
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
  const src = workGalleryImages[index];
  const opacity = useTransform(
    scrollYProgress,
    [cell.start, cell.end],
    isMobile ? [0, 0.72] : [0, 0.6],
  );
  const filter = useTransform(
    scrollYProgress,
    [cell.start, cell.end],
    isMobile ? ["blur(22px)", "blur(0px)"] : ["blur(38px)", "blur(0px)"],
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
          className="h-full w-full object-cover grayscale"
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
    : { start: 0.48, end: 0.57 };
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
  const desktopPreviewOpacity = useTransform(scrollYProgress, (progress) => {
    let reveal = 0;

    if (progress >= 0.42) {
      reveal = 1;
    } else if (progress >= 0.33) {
      reveal = (progress - 0.33) / 0.09;
    }

    if (progress <= 0.58) {
      return reveal;
    }

    if (progress >= 0.64) {
      return 0;
    }

    return reveal * (1 - (progress - 0.58) / 0.06);
  });
  const desktopHandoffWashOpacity = useTransform(
    scrollYProgress,
    [0.5, 0.56, 0.58, 0.64, 0.68],
    [0, 0.45, 0.85, 0.5, 0],
  );
  const desktopPreviewHandoffBlur = useTransform(
    scrollYProgress,
    [0.5, 0.58, 0.62, 0.64],
    ["blur(0px)", "blur(10px)", "blur(12px)", "blur(0px)"],
  );

  return (
    <motion.section
      className={`absolute inset-0 flex h-full w-full flex-col justify-between bg-[#EAEAEA] text-black pointer-events-none ${mobileLite ? "overflow-x-visible overflow-y-hidden p-12" : "overflow-hidden"}`}
      style={{
        opacity: mobileLite ? 1 : opacity,
        ...(blur ? { filter: blur } : {}),
        pointerEvents,
        visibility: mobileLite ? "visible" : visibility,
      }}
    >
      {!mobileLite ? (
        <>
          <motion.div
            className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden opacity-95 md:block"
            style={{
              opacity: desktopPreviewOpacity,
              filter: desktopPreviewHandoffBlur,
            }}
            aria-hidden="true"
          >
            {desktopCurateReplacementCells.map((cell) => (
              <ReplacementImage
                key={cell.className}
                cell={cell}
                index={cell.imageIndex}
                scrollYProgress={scrollYProgress}
                variant="desktop"
              />
            ))}
          </motion.div>
          <motion.div
            className="pointer-events-none absolute inset-0 z-[1] hidden bg-[#EAEAEA]/22 backdrop-blur-[10px] md:block"
            style={{ opacity: desktopHandoffWashOpacity }}
            aria-hidden="true"
          />
        </>
      ) : null}
      <motion.div
        className={`absolute inset-0 flex h-full w-full flex-col justify-between ${mobileLite ? "p-12" : "p-12"}`}
      >
        {mobileLite ? (
          <motion.div
            className={mobileSectionGridLayer}
            style={{
              opacity: mobileGridOpacity,
              filter: mobileBackgroundFilter,
            }}
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
        ) : null}

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
