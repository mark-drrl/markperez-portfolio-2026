"use client";

import {
  motion,
  type MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from "framer-motion";
import { mobileStackColumn } from "@/constants/mobileSectionGrid";
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

function columnCycleHeight(tiles: readonly { height: number }[]) {
  return tiles.reduce(
    (total, tile, index) => total + tile.height + (index > 0 ? 0.5 : 0),
    0,
  );
}

const columns = [
  {
    left: "0%",
    width: "calc((100% - 1vh) / 3)",
    speed: 0.28,
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
const mobileCycleHeight =
  workImages.length * mobileTileHeight + (workImages.length - 1) * mobileGap;

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
        className="h-full w-full object-cover grayscale contrast-125 brightness-[0.96] md:transition-[filter] md:duration-[1400ms] md:ease-[cubic-bezier(0.16,1,0.3,1)] max-md:grayscale md:group-hover:grayscale-0 md:group-hover:contrast-110 md:group-hover:brightness-105"
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
  const cycleHeight = columnCycleHeight(column.tiles);
  const loopedTiles = [...column.tiles, ...column.tiles, ...column.tiles];
  const y = useTransform(virtualScroll, (latest) => {
    const travel = (latest / 900) * column.speed * cycleHeight;
    const rawOffset = ((travel % cycleHeight) + cycleHeight) % cycleHeight;
    return `${column.initialY - cycleHeight - rawOffset}vh`;
  });

  return (
    <motion.div
      className="absolute top-0 h-full transform-gpu"
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
    const travel = (latest / 900) * 0.55 * mobileCycleHeight;
    const rawOffset =
      ((travel % mobileCycleHeight) + mobileCycleHeight) % mobileCycleHeight;
    return `${-mobileCycleHeight - rawOffset}vh`;
  });

  return (
    <motion.div
      className={`${mobileStackColumn} transform-gpu`}
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
  const sectionRef = useRef<HTMLElement>(null);
  const isWorkLockedRef = useRef(false);
  const workLockScrollYRef = useRef(0);
  const lastTouchYRef = useRef(0);
  const scrollLockFrameRef = useRef(0);
  const virtualScroll = useMotionValue(0);
  const mobileEasedVirtualScroll = useSpring(virtualScroll, {
    damping: 52,
    stiffness: 200,
    mass: 0.55,
    restDelta: 0.03,
  });
  const desktopEasedVirtualScroll = useSpring(virtualScroll, {
    damping: 50,
    stiffness: 240,
    mass: 0.45,
    restDelta: 0.05,
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.63) {
      isWorkLockedRef.current = false;
      workLockScrollYRef.current = 0;
    }
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
    const sectionElement = sectionRef.current;

    function isMobileViewport() {
      return window.matchMedia("(max-width: 767px)").matches;
    }

    function isInWorkSection() {
      return scrollYProgress.get() >= 0.64;
    }

    function unlockWorkScroll() {
      isWorkLockedRef.current = false;
      workLockScrollYRef.current = 0;
    }

    function lockWorkScroll() {
      if (!isInWorkSection()) {
        unlockWorkScroll();
        return false;
      }

      isWorkLockedRef.current = true;
      workLockScrollYRef.current = Math.max(
        workLockScrollYRef.current,
        window.scrollY,
      );

      return true;
    }

    function lockPageScroll() {
      if (!isInWorkSection() || !isWorkLockedRef.current) {
        return;
      }

      if (Math.abs(window.scrollY - workLockScrollYRef.current) <= 2) {
        return;
      }

      window.scrollTo(0, workLockScrollYRef.current);
    }

    function schedulePageScrollLock() {
      if (scrollLockFrameRef.current) {
        return;
      }

      scrollLockFrameRef.current = window.requestAnimationFrame(() => {
        scrollLockFrameRef.current = 0;
        lockPageScroll();
      });
    }

    function handleWheel(event: WheelEvent) {
      if (isMobileViewport()) {
        return;
      }

      if (!lockWorkScroll()) {
        return;
      }

      const currentVirtualScroll = virtualScroll.get();

      if (event.deltaY < 0 && currentVirtualScroll <= 0) {
        unlockWorkScroll();
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      virtualScroll.set(Math.max(0, currentVirtualScroll + event.deltaY * 0.85));
      schedulePageScrollLock();
    }

    function handleTouchStart(event: TouchEvent) {
      const touch = event.touches[0];

      if (!touch || !isMobileViewport()) {
        return;
      }

      lastTouchYRef.current = touch.clientY;
      lockWorkScroll();
    }

    function handleTouchMove(event: TouchEvent) {
      const touch = event.touches[0];

      if (!touch || !isMobileViewport() || !isWorkLockedRef.current) {
        return;
      }

      event.preventDefault();
      const deltaY = lastTouchYRef.current - touch.clientY;
      lastTouchYRef.current = touch.clientY;
      virtualScroll.set(virtualScroll.get() + deltaY * 0.55);

      schedulePageScrollLock();
    }

    function handleScroll() {
      if (!isInWorkSection()) {
        unlockWorkScroll();
        return;
      }

      if (isWorkLockedRef.current) {
        schedulePageScrollLock();
      }
    }

    window.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });
    window.addEventListener("scroll", handleScroll, { passive: true });
    sectionElement?.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    sectionElement?.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    return () => {
      window.removeEventListener("wheel", handleWheel, { capture: true });
      window.removeEventListener("scroll", handleScroll);
      sectionElement?.removeEventListener("touchstart", handleTouchStart);
      sectionElement?.removeEventListener("touchmove", handleTouchMove);
      window.cancelAnimationFrame(scrollLockFrameRef.current);
    };
  }, [scrollYProgress, virtualScroll]);

  function handleBackToHome() {
    isWorkLockedRef.current = false;
    workLockScrollYRef.current = 0;
    window.cancelAnimationFrame(scrollLockFrameRef.current);
    scrollLockFrameRef.current = 0;
    virtualScroll.set(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <motion.section
      ref={sectionRef}
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
              virtualScroll={desktopEasedVirtualScroll}
            />
          ))}
        </div>
        <div className="block h-full w-full md:hidden">
          <WorkMobileColumn virtualScroll={mobileEasedVirtualScroll} />
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

      <div className="pointer-events-none absolute inset-x-8 top-8 z-20 grid grid-cols-[1fr_auto] items-start gap-8 text-[10px] uppercase tracking-[0.2em] text-white md:grid-cols-[minmax(0,0.42fr)_minmax(0,1.88fr)_minmax(0,0.7fr)]">
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
        <p className="font-neue hidden max-w-[520px] font-semibold leading-relaxed uppercase tracking-[0.08em] text-white md:block">
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
