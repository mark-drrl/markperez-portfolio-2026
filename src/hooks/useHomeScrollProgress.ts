import { getHomeScrollProgress } from "@/lib/homeScroll";
import { useMotionValue } from "framer-motion";
import { useEffect, type RefObject } from "react";

function readViewportWidth() {
  if (typeof window === "undefined") {
    return 0;
  }

  return Math.min(
    window.innerWidth,
    document.documentElement.clientWidth,
    window.visualViewport?.width ?? window.innerWidth,
  );
}

/** True when the home page should use the mobile scroll stack (matches Tailwind `md:`). */
export function isMobileHomeViewport() {
  if (typeof window === "undefined") {
    return false;
  }

  // matchMedia respects the preview iframe width in Cursor (innerWidth may be the IDE window).
  if (window.matchMedia("(max-width: 767px)").matches) {
    return true;
  }

  if (readViewportWidth() < 768) {
    return true;
  }

  return window.matchMedia("(pointer: coarse)").matches;
}

/**
 * Scroll progress 0–1 from window scroll / main height.
 * Framer useScroll({ target }) can lag behind this in embedded previews (e.g. Cursor).
 */
export function useHomeScrollProgress(
  containerRef: RefObject<HTMLElement | null>,
) {
  const scrollYProgress = useMotionValue(0);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let frameId = 0;

    const update = () => {
      scrollYProgress.set(getHomeScrollProgress(container));
    };

    const onScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.visualViewport?.addEventListener("resize", onScroll);

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(onScroll)
        : null;
    observer?.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.visualViewport?.removeEventListener("resize", onScroll);
      observer?.disconnect();
    };
  }, [containerRef, scrollYProgress]);

  return scrollYProgress;
}
