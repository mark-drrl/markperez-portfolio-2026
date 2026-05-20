"use client";

import {
  mobileSectionGridLayer,
  mobileStackCellBottom,
  mobileStackCellMiddle,
  mobileStackCellTop,
} from "@/constants/mobileSectionGrid";
import MarkPerezBrand from "@/components/MarkPerezBrand";
import SectionInlineCopy from "@/components/SectionInlineCopy";
import SectionNavLinks from "@/components/SectionNavLinks";
import { cellRevealTone } from "@/lib/sectionNavTone";
import {
  mobileBackgroundBlurFilter,
  mobileCreateBlur,
  desktopCreateOpacity,
  mobileCreateOpacity,
  mobileEdgeBlurPx,
  mobileRippleMask,
  mobileSectionLocalProgress,
  mobileSectionScrollKeys,
  mobileStaggeredRange,
  mobileSectionContentOpacity,
  mobileSectionTextOpacity,
} from "@/lib/mobileHomeOpacity";
import {
  motion,
  type MotionValue,
  useTransform,
} from "framer-motion";
import type { CSSProperties } from "react";

type CreateGridCell = {
  className: string;
  blur: number;
  start: number;
  end: number;
  origin: string;
};

const heading = "Creating the magic";
const sansStartIndex = heading.indexOf("the magic");
const textFormationStart = 0.18;
const textFormationLock = 0.29;
const formationLock = 0.32;
const gridCells: CreateGridCell[] = [
  {
    className: "left-0 top-0 h-[60.5%] w-[calc((100%-1vh)/3)]",
    blur: 28,
    start: 0.174,
    end: 0.265,
    origin: "42% 58%",
  },
  {
    className: "left-0 top-[calc(60.5%+0.5vh)] h-[60.5%] w-[calc((100%-1vh)/3)]",
    blur: 34,
    start: 0.162,
    end: 0.25,
    origin: "58% 28%",
  },
  {
    className: "left-[calc((100%-1vh)/3+0.5vh)] top-[13%] h-[60.5%] w-[calc((100%-1vh)/3)]",
    blur: 36,
    start: 0.158,
    end: 0.235,
    origin: "46% 48%",
  },
  {
    className: "left-[calc((100%-1vh)/3+0.5vh)] -top-[48%] h-[60.5%] w-[calc((100%-1vh)/3)]",
    blur: 30,
    start: 0.168,
    end: 0.255,
    origin: "64% 62%",
  },
  {
    className: "left-[calc((100%-1vh)/3+0.5vh)] top-[74%] h-[60.5%] w-[calc((100%-1vh)/3)]",
    blur: 26,
    start: 0.178,
    end: 0.27,
    origin: "38% 34%",
  },
  {
    className: "left-[calc(((100%-1vh)/3)*2+1vh)] top-0 h-[57.5%] w-[calc((100%-1vh)/3)]",
    blur: 24,
    start: 0.17,
    end: 0.26,
    origin: "52% 54%",
  },
  {
    className: "left-[calc(((100%-1vh)/3)*2+1vh)] top-[calc(57.5%+0.5vh)] h-[41.5%] w-[calc((100%-1vh)/3)]",
    blur: 32,
    start: 0.164,
    end: 0.252,
    origin: "36% 68%",
  },
];

const mobileGridCells: CreateGridCell[] = [
  {
    className: mobileStackCellTop,
    blur: 28,
    ...mobileStaggeredRange("create", 0, 3),
    origin: "50% 42%",
  },
  {
    className: mobileStackCellMiddle,
    blur: 34,
    ...mobileStaggeredRange("create", 1, 3),
    origin: "50% 50%",
  },
  {
    className: mobileStackCellBottom,
    blur: 36,
    ...mobileStaggeredRange("create", 2, 3),
    origin: "50% 58%",
  },
];

interface CreateProps {
  entranceBlur?: MotionValue<string>;
  entranceOpacity: MotionValue<number>;
  pointerEvents: MotionValue<CSSProperties["pointerEvents"]>;
  scrollYProgress: MotionValue<number>;
  mobileLite?: boolean;
}

interface CharacterProps {
  character: string;
  index: number;
  progress: MotionValue<number>;
  total: number;
  start: number;
  end: number;
}

function FocusCharacter({
  character,
  index,
  progress,
  total,
  start,
  end,
}: CharacterProps) {
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const filter = useTransform(
    progress,
    [start, end],
    ["blur(16px)", "blur(0px)"],
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

interface GridCellProps {
  cell: CreateGridCell;
  progress: MotionValue<number>;
  mobileLite?: boolean;
}

function GridCell({ cell, progress, mobileLite = false }: GridCellProps) {
  const opacity = useTransform(
    progress,
    mobileLite
      ? [0, cell.start, cell.end, 1]
      : [cell.start, cell.end],
    mobileLite ? [0, 0, 1, 1] : [0, 1],
  );
  const filter = useTransform(
    progress,
    [cell.start, cell.end],
    [`blur(${cell.blur}px)`, "blur(0px)"],
  );
  const rippleMask = useTransform(progress, (latest) => {
    if (!mobileLite) {
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
    }

    const cellReveal = Math.min(
      Math.max((latest - cell.start) / (cell.end - cell.start), 0),
      1,
    );

    return mobileRippleMask(cellReveal, cell.origin);
  });

  return (
    <motion.div
      className={`absolute overflow-hidden ${mobileLite ? "bg-neutral-400/35" : "bg-neutral-400/70"} ${cell.className}`}
      style={{
        opacity,
        filter,
        WebkitMaskImage: rippleMask,
        maskImage: rippleMask,
      }}
    />
  );
}

function CreateHeading({
  progress,
  mobileLite,
}: {
  progress: MotionValue<number>;
  mobileLite: boolean;
}) {
  if (mobileLite) {
    const keys = mobileSectionScrollKeys("create", [0, 0.5]);
    const [formationStart, formationEnd] = keys;
    const span = formationEnd - formationStart;

    return (
      <h2 className="whitespace-nowrap text-[clamp(1.35rem,5.2vw,3.25rem)] tracking-[-0.02em]">
        {heading.split("").map((character, index) => {
          const charStart =
            formationStart + (index / Math.max(heading.length - 1, 1)) * span * 0.85;
          const charEnd = Math.min(charStart + span * 0.12, formationEnd);

          return (
            <FocusCharacter
              key={`${character}-${index}`}
              character={character}
              index={index}
              progress={progress}
              total={heading.length}
              start={charStart}
              end={charEnd}
            />
          );
        })}
      </h2>
    );
  }

  return (
    <h2 className="text-5xl tracking-[-0.02em] md:text-7xl">
      {heading.split("").map((character, index) => {
        const start = textFormationStart + (index / Math.max(heading.length - 1, 1)) * 0.07;
        const end = Math.min(start + 0.05, textFormationLock);

        return (
          <FocusCharacter
            key={`${character}-${index}`}
            character={character}
            index={index}
            progress={progress}
            total={heading.length}
            start={start}
            end={end}
          />
        );
      })}
    </h2>
  );
}

const createSubtitle =
  "where cinematic storytelling intersects with advanced AI synthesis.";

export default function Create({
  entranceBlur,
  entranceOpacity,
  pointerEvents,
  scrollYProgress,
  mobileLite = false,
}: CreateProps) {
  const subtitleOpacity = useTransform(scrollYProgress, [0.27, formationLock], [0, 1]);
  const subtitleFilter = useTransform(
    scrollYProgress,
    [0.27, formationLock],
    ["blur(14px)", "blur(0px)"],
  );
  const mobileSubtitleOpacity = useTransform(scrollYProgress, (latest) => {
    if (!mobileLite) {
      return 1;
    }

    const local = mobileSectionLocalProgress(latest, "create");

    if (local < 0.22) {
      return 0;
    }

    if (local < 0.38) {
      return (local - 0.22) / 0.16;
    }

    if (local > 0.88) {
      return (1 - local) / 0.12;
    }

    return 1;
  });
  const mobileSubtitleBlur = useTransform(scrollYProgress, (latest) => {
    if (!mobileLite) {
      return "blur(0px)";
    }

    const local = mobileSectionLocalProgress(latest, "create");
    const px =
      local < 0.38
        ? Math.round((1 - Math.min(local / 0.38, 1)) * 12)
        : mobileEdgeBlurPx(local, 12, 0.14);

    return px > 0 ? `blur(${px}px)` : "blur(0px)";
  });
  const mobileContentOpacity = useTransform(scrollYProgress, (progress) => {
    if (!mobileLite) {
      return 1;
    }

    const layer = mobileCreateOpacity(progress);

    return layer > 0.06 ? 1 : layer > 0 ? layer / 0.06 : 0;
  });
  const mobileTextOpacity = mobileContentOpacity;
  const mobileBrandOpacity = mobileContentOpacity;
  const mobileGridOpacity = mobileContentOpacity;
  const navOpacity = mobileContentOpacity;
  const createNavToneCell = mobileLite ? mobileGridCells[0] : gridCells[5];
  const navBackgroundTone = useTransform(scrollYProgress, (latest) =>
    cellRevealTone(
      latest,
      createNavToneCell.start,
      createNavToneCell.end,
      mobileLite ? 0.95 : 0.88,
    ),
  );
  const vignetteOpacity = useTransform(scrollYProgress, (latest) => {
    if (mobileLite) {
      return 0;
    }

    const sectionOpacity = desktopCreateOpacity(latest);

    if (sectionOpacity < 0.06) {
      return 0;
    }

    const exitFade =
      latest > 0.46
        ? latest >= 0.56
          ? 0
          : (0.56 - latest) / 0.1
        : 1;

    return Math.min(1, sectionOpacity) * exitFade;
  });
  const mobileBackgroundFilter = useTransform(scrollYProgress, (progress) => {
    if (!mobileLite) {
      return "blur(0px)";
    }

    const sectionOpacity = mobileCreateOpacity(progress);

    return mobileBackgroundBlurFilter(
      sectionOpacity,
      progress,
      mobileCreateBlur,
    );
  });

  return (
    <motion.section
      className={`absolute inset-0 z-10 flex h-full w-full flex-col justify-between bg-[#EAEAEA] p-12 text-black pointer-events-none ${mobileLite ? "overflow-x-visible overflow-y-hidden" : "overflow-hidden"}`}
      style={{
        opacity: mobileLite ? 1 : entranceOpacity,
        ...(entranceBlur ? { filter: entranceBlur } : {}),
        pointerEvents,
      }}
    >
      <motion.div className="absolute inset-0 flex h-full w-full flex-col justify-between p-12">
        <div className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden opacity-95 md:block">
          {gridCells.map((cell) => (
            <GridCell
              key={cell.className}
              cell={cell}
              progress={scrollYProgress}
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
          {mobileGridCells.map((cell) => (
            <GridCell
              key={cell.className}
              cell={cell}
              progress={scrollYProgress}
              mobileLite={mobileLite}
            />
          ))}
        </motion.div>

        {!mobileLite ? (
          <motion.div
            className="pointer-events-none absolute inset-0 z-[15] hidden md:block"
            style={{ opacity: vignetteOpacity }}
            aria-hidden
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 92% 88% at 50% 46%, transparent 32%, rgba(0,0,0,0.18) 62%, rgba(0,0,0,0.42) 100%)",
                boxShadow: "inset 0 0 140px 48px rgba(0, 0, 0, 0.28)",
              }}
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[26vh] bg-gradient-to-b from-black/22 via-black/8 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[26vh] bg-gradient-to-t from-black/22 via-black/8 to-transparent" />
          </motion.div>
        ) : null}

        <MarkPerezBrand
          className="absolute left-8 top-8 z-20"
          opacity={mobileBrandOpacity}
        />

        <SectionNavLinks opacity={navOpacity} backgroundTone={navBackgroundTone} />

        <motion.div
          className="relative z-20 my-auto w-full max-w-full overflow-visible"
          style={{ opacity: mobileLite ? mobileTextOpacity : 1 }}
        >
          <SectionInlineCopy
            heading={
              <CreateHeading
                progress={scrollYProgress}
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
                  {createSubtitle}
                </motion.span>
              ) : (
                <motion.span
                  style={{ opacity: subtitleOpacity, filter: subtitleFilter }}
                >
                  {createSubtitle}
                </motion.span>
              )
            }
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
