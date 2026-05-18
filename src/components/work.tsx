"use client";

import {
  motion,
  type MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const workImages = [
  "/work/portfolio-1.jpg",
  "/work/portfolio-2.png",
  "/work/portfolio-3.jpg",
  "/work/portfolio-4.jpg",
  "/work/portfolio-5.jpg",
  "/work/portfolio-6.jpg",
  "/work/portfolio-7.jpg",
  "/work/portfolio-8.jpg",
  "/work/portfolio-9.jpg",
  "/work/portfolio-10.jpg",
];

const columns = [
  {
    left: "0%",
    width: "calc((100% - 1vh) / 3)",
    speed: 0.28,
    cycleHeight: 183,
    initialY: 0,
    tiles: [
      { height: 60.5, image: 0 },
      { height: 60.5, image: 1 },
      { height: 60.5, image: 7 },
    ],
  },
  {
    left: "calc((100% - 1vh) / 3 + 0.5vh)",
    width: "calc((100% - 1vh) / 3)",
    speed: 0.60,
    cycleHeight: 244,
    initialY: -48,
    tiles: [
      { height: 60.5, image: 3 },
      { height: 60.5, image: 2 },
      { height: 60.5, image: 4 },
      { height: 60.5, image: 9 },
    ],
  },
  {
    left: "calc(((100% - 1vh) / 3) * 2 + 1vh)",
    width: "calc((100% - 1vh) / 3)",
    speed: 1.10,
    cycleHeight: 157.5,
    initialY: 0,
    tiles: [
      { height: 57.5, image: 5 },
      { height: 41.5, image: 6 },
      { height: 57.5, image: 8 },
    ],
  },
] as const;

const mobileTileHeight = 58;
const mobileGap = 0.5;
const mobileCycleHeight = workImages.length * (mobileTileHeight + mobileGap);

const socialButtons: readonly { label: string; href?: string }[] = [
  { label: "ABOUT", href: "/about" },
  { label: "CONTACT", href: "/contact" },
  { label: "INSTAGRAM", href: "https://www.instagram.com/mxrkdrrl/" },
  { label: "LINKEDIN", href: "https://www.linkedin.com/in/markdarrelperez/" },
  { label: "BEHANCE", href: "https://www.behance.net/markdarrel" },
] as const;

interface WorkProps {
  opacity: MotionValue<number>;
  blur: MotionValue<string>;
  pointerEvents: MotionValue<"none" | "auto">;
  scrollYProgress: MotionValue<number>;
}

interface WorkColumnProps {
  column: (typeof columns)[number];
  virtualScroll: MotionValue<number>;
}

function WorkImage({ src }: { src: string }) {
  const image = (
    <div className="group relative h-full w-full">
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover grayscale contrast-125 brightness-[0.96] transition-[filter] duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:grayscale-0 group-hover:contrast-110 group-hover:brightness-105"
        loading="lazy"
        decoding="async"
      />
    </div>
  );

  if (src === "/work/portfolio-1.jpg") {
    return (
      <Link href="/works-centurionv1" className="block h-full w-full">
        {image}
      </Link>
    );
  }

  if (src === "/work/portfolio-2.png") {
    return (
      <Link href="/works-lifestyle" className="block h-full w-full">
        {image}
      </Link>
    );
  }

  if (src === "/work/portfolio-3.jpg") {
    return (
      <Link href="/works-soren" className="block h-full w-full">
        {image}
      </Link>
    );
  }

  if (src === "/work/portfolio-5.jpg") {
    return (
      <Link href="/works-wakedubai" className="block h-full w-full">
        {image}
      </Link>
    );
  }

  if (src === "/work/portfolio-4.jpg") {
    return (
      <Link href="/works-lsb" className="block h-full w-full">
        {image}
      </Link>
    );
  }

  if (src === "/work/portfolio-6.jpg") {
    return (
      <Link href="/works-nautique" className="block h-full w-full">
        {image}
      </Link>
    );
  }

  if (src === "/work/portfolio-7.jpg") {
    return (
      <Link href="/works-interior" className="block h-full w-full">
        {image}
      </Link>
    );
  }

  if (src === "/work/portfolio-10.jpg") {
    return (
      <Link href="/works-supreme" className="block h-full w-full">
        {image}
      </Link>
    );
  }

  if (src === "/work/portfolio-8.jpg") {
    return (
      <Link href="/works-atm" className="block h-full w-full">
        {image}
      </Link>
    );
  }

  if (src === "/work/portfolio-9.jpg") {
    return (
      <Link href="/works-phase5page" className="block h-full w-full">
        {image}
      </Link>
    );
  }

  return image;
}

function WorkColumn({
  column,
  virtualScroll,
}: WorkColumnProps) {
  const loopedTiles = [...column.tiles, ...column.tiles, ...column.tiles];
  const y = useTransform(virtualScroll, (latest) => {
    const rawOffset = ((latest / 900) * column.speed * column.cycleHeight) %
      column.cycleHeight;
    return `${column.initialY - column.cycleHeight - rawOffset}vh`;
  });

  return (
    <motion.div
      className="absolute top-0 h-full will-change-transform"
      style={{
        left: column.left,
        width: column.width,
        y,
      }}
    >
      <div className="flex flex-col gap-[0.5vh]">
        {loopedTiles.map((tile, tileIndex) => (
          <div
            key={`${tile.image}-${tileIndex}`}
            className="w-full overflow-hidden bg-neutral-300"
            style={{
              height: `${tile.height}vh`,
            }}
          >
            <WorkImage src={workImages[tile.image]} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function WorkMobileColumn({
  virtualScroll,
}: {
  virtualScroll: MotionValue<number>;
}) {
  const loopedImages = [...workImages, ...workImages, ...workImages];
  const y = useTransform(virtualScroll, (latest) => {
    const rawOffset = ((latest / 900) * 0.72 * mobileCycleHeight) %
      mobileCycleHeight;
    return `${-mobileCycleHeight - rawOffset}vh`;
  });

  return (
    <motion.div
      className="absolute inset-x-0 top-0 h-full will-change-transform"
      style={{ y }}
    >
      <div className="flex flex-col gap-[0.5vh]">
        {loopedImages.map((src, tileIndex) => (
          <div
            key={`${src}-${tileIndex}`}
            className="w-full overflow-hidden bg-neutral-300"
            style={{ height: `${mobileTileHeight}vh` }}
          >
            <WorkImage src={src} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Work({
  opacity,
  blur,
  pointerEvents,
  scrollYProgress,
}: WorkProps) {
  const [dubaiTime, setDubaiTime] = useState("");
  const isWorkLockedRef = useRef(false);
  const workLockScrollYRef = useRef(0);
  const virtualScroll = useMotionValue(0);
  const easedVirtualScroll = useSpring(virtualScroll, {
    damping: 32,
    stiffness: 140,
    mass: 0.7,
    restDelta: 0.001,
  });

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Dubai",
      timeZoneName: "short",
    });

    function updateTime() {
      setDubaiTime(formatter.format(new Date()));
    }

    updateTime();
    const intervalId = window.setInterval(updateTime, 30_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    function handleWheel(event: WheelEvent) {
      if (scrollYProgress.get() >= 0.64) {
        isWorkLockedRef.current = true;
        workLockScrollYRef.current = Math.max(
          workLockScrollYRef.current,
          window.scrollY,
        );
      }

      if (!isWorkLockedRef.current) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      virtualScroll.set(virtualScroll.get() + event.deltaY * 0.8);
      window.scrollTo(0, workLockScrollYRef.current);
    }

    function handleScroll() {
      if (
        isWorkLockedRef.current &&
        window.scrollY < workLockScrollYRef.current
      ) {
        window.scrollTo(0, workLockScrollYRef.current);
      }
    }

    window.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel, { capture: true });
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollYProgress, virtualScroll]);

  function handleBackToHome() {
    isWorkLockedRef.current = false;
    workLockScrollYRef.current = 0;
    virtualScroll.set(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <motion.section
      className="absolute inset-0 h-full w-full overflow-hidden bg-[#EAEAEA] text-black"
      style={{
        opacity,
        filter: blur,
        pointerEvents,
      }}
    >
      <motion.div
        className="absolute inset-0 h-full w-full overflow-hidden will-change-transform"
      >
        <div className="hidden h-full w-full md:block">
          {columns.map((column, columnIndex) => (
            <WorkColumn
              key={`column-${columnIndex}`}
              column={column}
              virtualScroll={easedVirtualScroll}
            />
          ))}
        </div>
        <div className="block h-full w-full md:hidden">
          <WorkMobileColumn virtualScroll={easedVirtualScroll} />
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-[#EAEAEA]/10" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[8] h-44"
        style={{
          background: "rgba(155, 155, 155, 0.02)",
          backgroundBlendMode: "soft-light",
          filter: "blur(32px)",
          WebkitBackdropFilter: "blur(2px)",
          backdropFilter: "blur(2px)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 25%, rgba(0,0,0,0.64) 60%, rgba(0,0,0,0.18) 88%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 25%, rgba(0,0,0,0.64) 60%, rgba(0,0,0,0.18) 88%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[8] h-48"
        style={{
          background: "rgba(155, 155, 155, 0.02)",
          backgroundBlendMode: "soft-light",
          filter: "blur(32px)",
          WebkitBackdropFilter: "blur(2px)",
          backdropFilter: "blur(2px)",
          WebkitMaskImage:
            "linear-gradient(to top, black 0%, black 25%, rgba(0,0,0,0.66) 62%, rgba(0,0,0,0.18) 90%, transparent 100%)",
          maskImage:
            "linear-gradient(to top, black 0%, black 25%, rgba(0,0,0,0.66) 62%, rgba(0,0,0,0.18) 90%, transparent 100%)",
        }}
      />

      <div className="pointer-events-none absolute inset-x-8 top-8 z-20 grid grid-cols-[minmax(0,0.42fr)_minmax(0,1.88fr)_minmax(0,0.7fr)] items-start gap-8 text-[10px] uppercase tracking-[0.2em] text-white">
        <div className="font-semibold leading-relaxed">
          <p className="font-neue">
            MARK <span className="text-[#9F1F2E]">PEREZ</span>
          </p>
          <div className="mt-1 flex flex-col items-start gap-0.5 text-neutral-400">
            {socialButtons.map((item) =>
              item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                  className="pointer-events-auto tracking-[0.2em] transition-colors hover:text-white [font-family:'JetBrains_Mono','JetBrainsMono','SF_Mono',Consolas,monospace]"
                >
                  {item.label}
                </a>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  className="pointer-events-auto tracking-[0.2em] transition-colors hover:text-white [font-family:'JetBrains_Mono','JetBrainsMono','SF_Mono',Consolas,monospace]"
                >
                  {item.label}
                </button>
              ),
            )}
          </div>
        </div>
        <p className="font-neue max-w-[520px] font-semibold leading-relaxed uppercase tracking-[0.08em] text-white">
          Full-stack Creative Specialist bridging high-end cinematography,
          AI-driven art direction, social media strategy, and immersive web
          architecture.
        </p>
        <p className="font-neue text-right font-semibold leading-relaxed">
          DUBAI, UAE <span className="text-[#9F1F2E]">{"//"}</span>
          <br />
          MANILA, PHILIPPINES
          <br />
          <span className="font-normal text-white">{dubaiTime}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={handleBackToHome}
        className="absolute bottom-8 left-8 z-20 text-[10px] font-semibold tracking-[0.15em] text-white transition-colors hover:text-[#9F1F2E]"
      >
        BACK TO HOME
      </button>
      <div className="pointer-events-none absolute bottom-8 right-8 z-20 text-right">
        <p className="font-editorial text-5xl leading-none tracking-[-0.02em] text-[#9F1F2E]">
          works
        </p>
        <p className="font-neue mt-2 text-[10px] font-semibold tracking-[0.15em] text-white">
          CLICK ON AN IMAGE
        </p>
      </div>
    </motion.section>
  );
}
