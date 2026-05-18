"use client";

import {
  motion,
  type MotionValue,
  useTransform,
} from "framer-motion";

const heading = "Creating the magic";
const sansStartIndex = heading.indexOf("the magic");
const textFormationStart = 0.18;
const textFormationLock = 0.29;
const formationLock = 0.32;
const gridCells = [
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

const mobileGridCells = [
  { className: "left-0 top-[-24%] h-[56%] w-full", blur: 28, start: 0.174, end: 0.265, origin: "48% 26%" },
  { className: "left-0 top-[calc(32%+0.5vh)] h-[56%] w-full", blur: 34, start: 0.162, end: 0.25, origin: "52% 48%" },
  { className: "left-0 top-[calc(88%+1vh)] h-[56%] w-full", blur: 36, start: 0.158, end: 0.235, origin: "48% 70%" },
] as const;

interface CreateProps {
  entranceBlur: MotionValue<string>;
  entranceOpacity: MotionValue<number>;
  pointerEvents: MotionValue<"none" | "auto">;
  scrollYProgress: MotionValue<number>;
}

interface CharacterProps {
  character: string;
  index: number;
  progress: MotionValue<number>;
  total: number;
}

function FocusCharacter({ character, index, progress, total }: CharacterProps) {
  const start = textFormationStart + (index / Math.max(total - 1, 1)) * 0.07;
  const end = Math.min(start + 0.05, textFormationLock);
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const filter = useTransform(progress, [start, end], ["blur(16px)", "blur(0px)"]);
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
  cell: (typeof gridCells)[number];
  progress: MotionValue<number>;
}

function GridCell({ cell, progress }: GridCellProps) {
  const opacity = useTransform(progress, [cell.start, cell.end], [0, 1]);
  const filter = useTransform(
    progress,
    [cell.start, cell.end],
    [`blur(${cell.blur}px)`, "blur(0px)"],
  );
  const rippleMask = useTransform(progress, (latest) => {
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
      className={`absolute bg-neutral-400/70 ${cell.className}`}
      style={{
        opacity,
        filter,
        WebkitMaskImage: rippleMask,
        maskImage: rippleMask,
      }}
    />
  );
}

export default function Create({
  entranceBlur,
  entranceOpacity,
  pointerEvents,
  scrollYProgress,
}: CreateProps) {
  const subtitleOpacity = useTransform(scrollYProgress, [0.27, formationLock], [0, 1]);
  const subtitleFilter = useTransform(
    scrollYProgress,
    [0.27, formationLock],
    ["blur(14px)", "blur(0px)"],
  );

  return (
    <motion.section
      className="absolute inset-0 z-10 flex h-full w-full flex-col justify-between overflow-hidden bg-[#EAEAEA] p-12 text-black pointer-events-none"
      style={{ opacity: entranceOpacity, filter: entranceBlur, pointerEvents }}
    >
      <motion.div className="absolute inset-0 h-full w-full">
        <div className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden opacity-95 md:block">
          {gridCells.map((cell) => (
            <GridCell
              key={cell.className}
              cell={cell}
              progress={scrollYProgress}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 z-0 block overflow-hidden opacity-95 md:hidden">
          {mobileGridCells.map((cell) => (
            <GridCell
              key={cell.className}
              cell={cell}
              progress={scrollYProgress}
            />
          ))}
        </div>

        <p className="font-neue absolute left-8 top-8 z-20 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
          MARK <span className="text-[#9F1F2E]">PEREZ</span>
        </p>

        <div
          className="relative z-20 flex h-full w-full flex-col items-center justify-center text-center"
        >
          <h2
            className="text-5xl md:text-7xl tracking-[-0.02em] text-[#9A3A3A]"
          >
            {heading.split("").map((character, index) => (
              <FocusCharacter
                key={`${character}-${index}`}
                character={character}
                index={index}
                progress={scrollYProgress}
                total={heading.length}
              />
            ))}
          </h2>
          <motion.p
            className="font-neue text-xs md:text-sm text-neutral-600 tracking-wide mt-4 font-normal max-w-xl"
            style={{
              opacity: subtitleOpacity,
              filter: subtitleFilter,
            }}
          >
            where cinematic storytelling intersects with advanced AI synthesis.
          </motion.p>
        </div>

      </motion.div>
    </motion.section>
  );
}
