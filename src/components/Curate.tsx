"use client";

import MarkPerezBrand from "@/components/MarkPerezBrand";
import SectionInlineCopy from "@/components/SectionInlineCopy";
import SectionNavLinks from "@/components/SectionNavLinks";
import { cellRevealTone } from "@/lib/sectionNavTone";
import {
  curateDesktopImages,
  curateMobileImages,
} from "@/constants/curateImages";
import {
  desktopCurateFrostGrainOpacity,
  FROSTED_GRAIN_TEXTURE,
} from "@/lib/curateFrostedBlur";
import { figmaCurateTransitionBlurStyle } from "@/lib/figmaBlurStyles";
import {
  blurPxToFilter,
  desktopCurateAmbienceOpacity,
  desktopCurateGridShellOpacity,
  desktopCuratePreviewOpacity,
  desktopCurateSubtitleOpacity,
  desktopCurateTextOpacity,
  DESKTOP_CURATE_WORK_HANDOFF_END,
  DESKTOP_CURATE_WORK_HANDOFF_START,
} from "@/lib/desktopHomeTransitions";
import {
  curateCellShellTones,
  desktopCurateReplacementCells,
} from "@/lib/workColumnLayout";
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
  tone?: string;
}

function ReplacementImage({
  cell,
  index,
  scrollYProgress,
  variant,
  mobileLite = false,
  tone,
}: ReplacementImageProps) {
  const isMobile = variant === "mobile";
  const image = isMobile ? curateMobileImages[index] : curateDesktopImages[index];
  const { src, alt } = image;
  const opacity = useTransform(
    scrollYProgress,
    [cell.start, cell.end],
    isMobile ? [0, 0.72] : [0, 1],
  );
  const shellOpacity = useTransform(scrollYProgress, (latest) => {
    if (isMobile) {
      return 1;
    }

    return desktopCurateGridShellOpacity(latest);
  });
  const filter = useTransform(scrollYProgress, (latest) => {
    if (isMobile) {
      const amount = Math.min(
        Math.max((latest - cell.start) / (cell.end - cell.start), 0),
        1,
      );

      return blurPxToFilter(22 * (1 - amount));
    }

    return "blur(0px)";
  });
  const grainOpacity = useTransform(scrollYProgress, (latest) => {
    if (isMobile) {
      return 0;
    }

    const amount = Math.min(
      Math.max((latest - cell.start) / (cell.end - cell.start), 0),
      1,
    );

    return desktopCurateFrostGrainOpacity(latest, amount);
  });
  const scale = useTransform(
    scrollYProgress,
    [cell.start, cell.end],
    isMobile ? [1.06, 1] : [1.14, 1.05],
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
    <motion.div
      className={`absolute overflow-hidden shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] ring-1 ring-inset ring-black/[0.06] ${isMobile ? "bg-neutral-300" : ""} ${cell.className}`}
      style={
        isMobile
          ? undefined
          : { opacity: shellOpacity, backgroundColor: tone ?? "#c1c1c1" }
      }
    >
      <motion.div
        className="absolute inset-[1px] overflow-hidden"
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
          alt={alt}
          loading={isMobile ? "lazy" : "eager"}
          decoding="async"
          className="h-full w-full object-cover grayscale contrast-[1.02] brightness-[0.98] saturate-0"
          // For mobile curate images, serve smaller WebP variants by convention.
          // e.g. /work/mobile/curate-1.webp → /work/mobile/curate-1-400w.webp 400w, ...
          {...(isMobile && /\/work\/mobile\/curate-\d+\.webp$/i.test(src)
            ? {
                srcSet: [
                  src.replace(/\.webp$/i, "-400w.webp") + " 400w",
                  src.replace(/\.webp$/i, "-800w.webp") + " 800w",
                  src + " 1200w",
                ].join(", "),
                sizes: "(max-width: 480px) 100vw, 90vw",
              }
            : {})}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      </motion.div>
      {!isMobile ? (
        <motion.div
          className="pointer-events-none absolute inset-[-2px] mix-blend-soft-light"
          style={{
            opacity: grainOpacity,
            backgroundImage: FROSTED_GRAIN_TEXTURE,
            backgroundSize: "200px 200px",
          }}
          aria-hidden
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-neutral-300/20" />
      )}
      {!isMobile ? (
        <div className="pointer-events-none absolute inset-0 bg-neutral-200/8" />
      ) : null}
    </motion.div>
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
  const textOpacity = useTransform(scrollYProgress, desktopCurateTextOpacity);
  const textBlur = useTransform(scrollYProgress, () => "blur(0px)");
  const subtitleOpacity = useTransform(
    scrollYProgress,
    desktopCurateSubtitleOpacity,
  );
  const subtitleBlur = useTransform(
    scrollYProgress,
    [0.39, 0.45],
    ["blur(12px)", "blur(0px)"],
  );
  const desktopAmbienceOpacity = useTransform(
    scrollYProgress,
    desktopCurateAmbienceOpacity,
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
  const desktopPreviewOpacity = useTransform(
    scrollYProgress,
    desktopCuratePreviewOpacity,
  );
  const desktopBlurOverlayOpacity = useTransform(scrollYProgress, (latest) => {
    // Frosted background is present throughout Curate: it ramps in with the
    // grey boxes, holds at full strength while the images fill in one by one,
    // then fades out as the Work gallery takes over.
    if (latest < 0.34) {
      return 0;
    }

    if (latest < 0.4) {
      return (latest - 0.34) / 0.06;
    }

    if (latest < DESKTOP_CURATE_WORK_HANDOFF_START) {
      return 1;
    }

    if (latest >= DESKTOP_CURATE_WORK_HANDOFF_END) {
      return 0;
    }

    return (
      1 -
      (latest - DESKTOP_CURATE_WORK_HANDOFF_START) /
        (DESKTOP_CURATE_WORK_HANDOFF_END - DESKTOP_CURATE_WORK_HANDOFF_START)
    );
  });
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
            className="pointer-events-none absolute inset-0 z-0 hidden bg-[#EAEAEA]/10 md:block"
            style={{ opacity: desktopAmbienceOpacity }}
            aria-hidden="true"
          />
          <motion.div
            className="pointer-events-none absolute inset-0 z-[1] hidden overflow-hidden md:block"
            style={{ opacity: desktopPreviewOpacity }}
            aria-hidden="true"
          >
            {desktopCurateReplacementCells.map((cell, index) => (
              <ReplacementImage
                key={cell.className}
                cell={cell}
                index={cell.imageIndex}
                scrollYProgress={scrollYProgress}
                variant="desktop"
                tone={curateCellShellTones[index]}
              />
            ))}
          </motion.div>
          <motion.div
            className="pointer-events-none absolute inset-0 z-[2] hidden mix-blend-soft-light md:block"
            style={{
              opacity: desktopBlurOverlayOpacity,
              ...figmaCurateTransitionBlurStyle,
            }}
            aria-hidden
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
            layout={mobileLite ? "inline" : "stacked"}
            subtitleClassName={mobileLite ? "" : "text-white/92"}
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
