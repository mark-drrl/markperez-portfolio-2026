"use client";

import { workPageSocialLinks } from "@/constants/workPageSocialLinks";
import {
  motion,
  type MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { GalleryImage } from "@/components/GalleryMedia";
import MarkPerezBrand from "@/components/MarkPerezBrand";
import WorkSocialLinks from "@/components/WorkSocialLinks";
import { MOBILE_WORK_SCROLL_PROGRESS } from "@/lib/mobileHomeOpacity";
import { workHeaderNavTone } from "@/lib/workSocialTone";
import {
  dispatchHomeScrollSync,
  requestHomeScrollTop,
} from "@/lib/homeScroll";
import {
  registerWorkScrollMotionValues,
  resetHomeScrollPosition,
  unlockWorkScroll,
  unregisterWorkScrollMotionValues,
  WORK_ENTER_PROGRESS,
  workScrollBridge,
} from "@/lib/workScrollBridge";
import Link from "next/link";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

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
    speed: 0.56,
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
    speed: 0.84,
    initialY: 0,
    tiles: [
      { height: 57.5, image: 5 },
      { height: 41.5, image: 6 },
      { height: 57.5, image: 8 },
    ],
  },
] as const;

const MOBILE_SNAP_DURATION_MS = 480;
const MOBILE_WORK_CELL_VH = 56;
const MOBILE_WORK_CELL_GAP_VH = 0.5;

const mobileWorkStripImages = [
  ...workImages,
  ...workImages,
  ...workImages,
] as const;

function getMobileWorkScrollStride() {
  if (typeof window === "undefined") {
    return 560;
  }

  return window.innerHeight * ((MOBILE_WORK_CELL_VH + MOBILE_WORK_CELL_GAP_VH) / 100);
}

function workScrollEnterThreshold() {
  if (typeof window === "undefined") {
    return WORK_ENTER_PROGRESS;
  }

  return window.matchMedia("(max-width: 767px)").matches
    ? MOBILE_WORK_SCROLL_PROGRESS - 0.04
    : WORK_ENTER_PROGRESS;
}

function getWorkHref(src: string) {
  if (src === "/work/portfolio-1.jpg") return "/works-centurionv1";
  if (src === "/work/portfolio-2.png") return "/works-lifestyle";
  if (src === "/work/portfolio-3.jpg") return "/works-soren";
  if (src === "/work/portfolio-4.jpg") return "/works-lsb";
  if (src === "/work/portfolio-5.jpg") return "/works-wakedubai";
  if (src === "/work/portfolio-6.jpg") return "/works-nautique";
  if (src === "/work/portfolio-7.jpg") return "/works-interior";
  if (src === "/work/portfolio-8.jpg") return "/works-atm";
  if (src === "/work/portfolio-9.jpg") return "/works-phase5page";
  if (src === "/work/portfolio-10.jpg") return "/works-supreme";
  return null;
}

function WorkImageLink({ src, children }: { src: string; children: ReactNode }) {
  const href = getWorkHref(src);

  if (href) {
    return (
      <Link
        href={href}
        prefetch={false}
        className="block h-full w-full"
        data-no-magnetic
      >
        {children}
      </Link>
    );
  }

  return <div className="h-full w-full">{children}</div>;
}

const socialButtons = workPageSocialLinks;

interface WorkProps {
  opacity: MotionValue<number>;
  blur: MotionValue<string>;
  pointerEvents: MotionValue<"none" | "auto">;
  scrollYProgress: MotionValue<number>;
}

function computeColumnTranslateVh(
  virtualOffset: number,
  column: (typeof columns)[number],
) {
  const cycleHeight = columnCycleHeight(column.tiles);
  const travel = (virtualOffset / 900) * column.speed * cycleHeight;
  const rawOffset =
    ((travel % cycleHeight) + cycleHeight) % cycleHeight;

  return column.initialY - cycleHeight - rawOffset;
}

function WorkImage({ src }: { src: string }) {
  return (
    <WorkImageLink src={src}>
      <div className="group relative h-full w-full">
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover grayscale contrast-125 brightness-[0.96] transition-[filter] duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:grayscale-0 group-hover:contrast-110 group-hover:brightness-105"
          loading="lazy"
          decoding="async"
        />
      </div>
    </WorkImageLink>
  );
}

function WorkColumnsDesktop({
  virtualScroll,
}: {
  virtualScroll: MotionValue<number>;
}) {
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);

  const applyColumnTransforms = useCallback((virtualOffset: number) => {
    columns.forEach((column, columnIndex) => {
      const columnElement = columnRefs.current[columnIndex];

      if (!columnElement) {
        return;
      }

      const translateVh = computeColumnTranslateVh(virtualOffset, column);
      columnElement.style.transform = `translate3d(0, ${translateVh}vh, 0)`;
    });
  }, []);

  useMotionValueEvent(virtualScroll, "change", applyColumnTransforms);

  useEffect(() => {
    applyColumnTransforms(virtualScroll.get());
  }, [virtualScroll, applyColumnTransforms]);

  return (
    <div className="hidden h-full w-full md:block">
      {columns.map((column, columnIndex) => {
        const loopedTiles = [...column.tiles, ...column.tiles, ...column.tiles];

        return (
          <div
            key={`column-${columnIndex}`}
            ref={(element) => {
              columnRefs.current[columnIndex] = element;
            }}
            className="absolute top-0 h-full will-change-transform"
            style={{
              left: column.left,
              width: column.width,
              transform: `translate3d(0, ${computeColumnTranslateVh(virtualScroll.get(), column)}vh, 0)`,
            }}
          >
            <div className="flex flex-col gap-[0.5vh]">
              {loopedTiles.map((tile, tileIndex) => (
                <div
                  key={`${tile.image}-${tileIndex}`}
                  className="w-full overflow-hidden bg-neutral-300"
                  style={{ height: `${tile.height}vh` }}
                >
                  <WorkImage src={workImages[tile.image]} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const mobileFocusedFilter = "grayscale(0) contrast(1.1) brightness(1.03)";
const mobileIdleFilter = "grayscale(1) contrast(1.1) brightness(0.96)";

function MobileWorkGalleryImage({
  virtualScroll,
  imageIndex,
  src,
}: {
  virtualScroll: MotionValue<number>;
  imageIndex: number;
  src: string;
}) {
  const filter = useTransform(virtualScroll, (offset) => {
    const stride = getMobileWorkScrollStride();
    const focused =
      ((Math.round(offset / stride) % workImages.length) + workImages.length) %
      workImages.length;

    return imageIndex === focused ? mobileFocusedFilter : mobileIdleFilter;
  });

  return (
    <WorkImageLink src={src}>
      <motion.img
        src={src}
        alt=""
        className="h-full w-full object-cover"
        style={{ filter }}
        loading="lazy"
        decoding="async"
      />
    </WorkImageLink>
  );
}

function WorkMobileStack({
  virtualScroll,
}: {
  virtualScroll: MotionValue<number>;
}) {
  const stripY = useTransform(virtualScroll, (offset) => -offset);

  return (
    <div className="absolute inset-0 overflow-hidden md:hidden">
      <motion.div
        className="absolute left-1/2 top-[22vh] w-full max-w-full -translate-x-1/2 will-change-transform"
        style={{ y: stripY }}
      >
        {mobileWorkStripImages.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="mb-[0.5vh] h-[56vh] w-full overflow-hidden bg-neutral-300"
          >
            <MobileWorkGalleryImage
              virtualScroll={virtualScroll}
              imageIndex={index % workImages.length}
              src={src}
            />
          </div>
        ))}
      </motion.div>
    </div>
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
  const snapFrameRef = useRef(0);
  const virtualScroll = useMotionValue(0);
  const socialNavTone = useTransform(virtualScroll, (offset) =>
    workHeaderNavTone(offset, {
      isMobile:
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 767px)").matches,
      imageCount: workImages.length,
      leftColumn: columns[0],
    }),
  );

  useEffect(() => {
    registerWorkScrollMotionValues(scrollYProgress, virtualScroll);

    return () => {
      unregisterWorkScrollMotionValues();
    };
  }, [scrollYProgress, virtualScroll]);

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
      return (
        workScrollBridge.isLocked ||
        scrollYProgress.get() >= workScrollEnterThreshold()
      );
    }

    function cancelSnapAnimation() {
      window.cancelAnimationFrame(snapFrameRef.current);
      snapFrameRef.current = 0;
    }

    function setVirtualScrollValue(value: number) {
      const clamped = Math.max(0, value);
      workScrollBridge.targetVirtualScroll = clamped;
      workScrollBridge.displayVirtualScroll = clamped;
      virtualScroll.set(clamped);
    }

    function snapMobileVirtualScroll() {
      cancelSnapAnimation();

      const stride = getMobileWorkScrollStride();
      const start = virtualScroll.get();
      const target = Math.round(start / stride) * stride;

      if (Math.abs(target - start) < 0.5) {
        setVirtualScrollValue(target);
        return;
      }

      const startTime = performance.now();

      function frame(now: number) {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / MOBILE_SNAP_DURATION_MS);
        const eased = 1 - (1 - t) ** 3;
        const value = start + (target - start) * eased;

        setVirtualScrollValue(value);

        if (t < 1) {
          snapFrameRef.current = window.requestAnimationFrame(frame);
        }
      }

      snapFrameRef.current = window.requestAnimationFrame(frame);
    }

    function handleTouchStart(event: TouchEvent) {
      const touch = event.touches[0];

      if (!touch || !isMobileViewport()) {
        return;
      }

      cancelSnapAnimation();
      lastTouchYRef.current = touch.clientY;

      if (isInWorkSection()) {
        isWorkLockedRef.current = true;
        workLockScrollYRef.current = window.scrollY;
      }
    }

    function handleTouchMove(event: TouchEvent) {
      const touch = event.touches[0];

      if (!touch || !isMobileViewport() || !isWorkLockedRef.current) {
        return;
      }

      if (!isInWorkSection()) {
        isWorkLockedRef.current = false;
        unlockWorkScroll();
        return;
      }

      event.preventDefault();
      const deltaY = lastTouchYRef.current - touch.clientY;
      lastTouchYRef.current = touch.clientY;
      setVirtualScrollValue(virtualScroll.get() + deltaY * 0.55);
    }

    function handleTouchEnd() {
      if (!isMobileViewport() || !isWorkLockedRef.current || !isInWorkSection()) {
        return;
      }

      snapMobileVirtualScroll();
    }

    sectionElement?.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    sectionElement?.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    sectionElement?.addEventListener("touchend", handleTouchEnd, {
      passive: true,
    });
    sectionElement?.addEventListener("touchcancel", handleTouchEnd, {
      passive: true,
    });

    return () => {
      cancelSnapAnimation();
      sectionElement?.removeEventListener("touchstart", handleTouchStart);
      sectionElement?.removeEventListener("touchmove", handleTouchMove);
      sectionElement?.removeEventListener("touchend", handleTouchEnd);
      sectionElement?.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [scrollYProgress, virtualScroll]);

  function handleBackToHome() {
    isWorkLockedRef.current = false;
    workLockScrollYRef.current = 0;
    requestHomeScrollTop();

    if (window.location.pathname === "/") {
      window.history.replaceState(null, "", "/");
      resetHomeScrollPosition();
      window.requestAnimationFrame(() => {
        dispatchHomeScrollSync();
      });
      return;
    }

    window.location.href = "/";
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
      <motion.div className="absolute inset-0 h-full w-full overflow-hidden">
        <WorkColumnsDesktop virtualScroll={virtualScroll} />
        <WorkMobileStack virtualScroll={virtualScroll} />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 z-[8] bg-[#EAEAEA]/10" />
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
        aria-hidden="true"
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
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-x-8 top-8 z-20 grid grid-cols-[1fr_auto] items-start gap-8 text-[10px] uppercase tracking-[0.2em] text-white md:grid-cols-[minmax(0,0.42fr)_minmax(0,1.88fr)_minmax(0,0.7fr)]">
        <div className="font-semibold leading-relaxed">
          <MarkPerezBrand
            variant="onDark"
            onActivate={() => {
              isWorkLockedRef.current = false;
              workLockScrollYRef.current = 0;
            }}
          />
          <WorkSocialLinks links={socialButtons} toneSource={socialNavTone} />
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
          <span className="font-normal text-white" suppressHydrationWarning>
            {dubaiTime || "\u00a0"}
          </span>
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
