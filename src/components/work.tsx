"use client";

import { workGalleryImages } from "@/constants/workGalleryImages";
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
import { HOME_SCROLL_SYNC_EVENT } from "@/lib/homeScroll";
import {
  getCenteredWorkGalleryIndex,
  maintainMobileWorkInfiniteScroll,
  MOBILE_CURATE_WORK_HANDOFF_INDEX,
  MOBILE_WORK_LOOP_COPIES,
  isMobileWorkViewport,
  scrollMobileWorkGalleryToIndex,
  syncMobileWorkToneFromIndex,
} from "@/lib/mobileWorkScroll";
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

const workImages = workGalleryImages;

const mobileWorkLoopItems = Array.from(
  { length: MOBILE_WORK_LOOP_COPIES },
  (_, copy) =>
    workImages.map((src, index) => ({
      copy,
      index,
      src,
      key: `${copy}-${index}-${src}`,
    })),
).flat();

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

function WorkMobileGallery({
  virtualScroll,
  onScrollerReady,
}: {
  virtualScroll: MotionValue<number>;
  onScrollerReady: (scroller: HTMLDivElement | null) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isRebalancingRef = useRef(false);
  const [focusedIndex, setFocusedIndex] = useState(
    MOBILE_CURATE_WORK_HANDOFF_INDEX,
  );

  const updateFocusedFromScroll = useCallback(() => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const nearestIndex = getCenteredWorkGalleryIndex(scroller);

    setFocusedIndex((current) =>
      current === nearestIndex ? current : nearestIndex,
    );
    syncMobileWorkToneFromIndex(virtualScroll, nearestIndex);
  }, [virtualScroll]);

  const handleScrollerScroll = useCallback(() => {
    const scroller = scrollerRef.current;

    if (!scroller || isRebalancingRef.current) {
      return;
    }

    if (maintainMobileWorkInfiniteScroll(scroller)) {
      isRebalancingRef.current = true;
      window.requestAnimationFrame(() => {
        isRebalancingRef.current = false;
        updateFocusedFromScroll();
      });
      return;
    }

    updateFocusedFromScroll();
  }, [updateFocusedFromScroll]);

  useEffect(() => {
    const scroller = scrollerRef.current;

    onScrollerReady(scroller);

    if (!scroller) {
      return;
    }

    scrollMobileWorkGalleryToIndex(scroller, MOBILE_CURATE_WORK_HANDOFF_INDEX);

    window.requestAnimationFrame(() => {
      handleScrollerScroll();
    });

    scroller.addEventListener("scroll", handleScrollerScroll, {
      passive: true,
    });
    window.visualViewport?.addEventListener("resize", handleScrollerScroll);
    window.visualViewport?.addEventListener("scroll", handleScrollerScroll);
    window.addEventListener("resize", handleScrollerScroll);

    return () => {
      onScrollerReady(null);
      scroller.removeEventListener("scroll", handleScrollerScroll);
      window.visualViewport?.removeEventListener("resize", handleScrollerScroll);
      window.visualViewport?.removeEventListener("scroll", handleScrollerScroll);
      window.removeEventListener("resize", handleScrollerScroll);
    };
  }, [handleScrollerScroll, onScrollerReady]);

  return (
    <div
      ref={scrollerRef}
      className="pointer-events-auto absolute inset-0 z-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] [touch-action:pan-y] md:hidden"
    >
      <div className="flex flex-col items-center gap-[0.5vh] pt-[22dvh] pb-[22dvh]">
        {mobileWorkLoopItems.map((item) => (
          <div
            key={item.key}
            data-work-gallery-item
            data-gallery-index={item.index}
            data-loop-copy={item.copy}
            className="h-[56dvh] w-full max-w-full shrink-0 overflow-hidden bg-neutral-300"
          >
            <WorkImageLink src={item.src}>
              <GalleryImage
                src={item.src}
                alt=""
                isFocused={focusedIndex === item.index}
                className="object-cover"
              />
            </WorkImageLink>
          </div>
        ))}
      </div>
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
  const mobileScrollerRef = useRef<HTMLDivElement | null>(null);
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

    if (isMobileWorkViewport()) {
      syncMobileWorkToneFromIndex(virtualScroll, MOBILE_CURATE_WORK_HANDOFF_INDEX);
    }

    return () => {
      unregisterWorkScrollMotionValues();
    };
  }, [scrollYProgress, virtualScroll]);

  const scrollMobileGalleryToHandoff = useCallback(() => {
    const scroller = mobileScrollerRef.current;

    if (!scroller) {
      return;
    }

    scrollMobileWorkGalleryToIndex(scroller, MOBILE_CURATE_WORK_HANDOFF_INDEX);
  }, []);

  useEffect(() => {
    if (!isMobileWorkViewport()) {
      return;
    }

    function handleHomeScrollSync() {
      if (window.location.pathname !== "/" || window.location.hash !== "#works") {
        return;
      }

      window.requestAnimationFrame(() => {
        scrollMobileGalleryToHandoff();
      });
    }

    handleHomeScrollSync();
    window.addEventListener(HOME_SCROLL_SYNC_EVENT, handleHomeScrollSync);

    return () => {
      window.removeEventListener(HOME_SCROLL_SYNC_EVENT, handleHomeScrollSync);
    };
  }, [scrollMobileGalleryToHandoff]);

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

  function handleBackToHome() {
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
        <WorkMobileGallery
          virtualScroll={virtualScroll}
          onScrollerReady={(scroller) => {
            mobileScrollerRef.current = scroller;
          }}
        />
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
          <MarkPerezBrand variant="onDark" onActivate={unlockWorkScroll} />
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

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-6 px-8 pb-7 pt-3 max-md:pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] md:pb-8 md:pt-0">
        <button
          type="button"
          onClick={handleBackToHome}
          className="pointer-events-auto text-[10px] font-semibold tracking-[0.15em] text-white transition-colors hover:text-[#9F1F2E]"
        >
          BACK TO HOME
        </button>
        <div className="text-right">
          <p className="font-editorial text-5xl leading-none tracking-[-0.02em] text-[#9F1F2E]">
            works
          </p>
          <p className="font-neue mt-2 text-[10px] font-semibold tracking-[0.15em] text-white">
            CLICK ON AN IMAGE
          </p>
        </div>
      </div>
    </motion.section>
  );
}
