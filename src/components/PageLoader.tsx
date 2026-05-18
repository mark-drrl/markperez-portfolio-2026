"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const LOAD_DURATION = 1150;
const SOFT_TRANSITION_PATHS = new Set(["/about", "/contact"]);

function isInternalNavigation(event: MouseEvent, anchor: HTMLAnchorElement) {
  if (
    event.defaultPrevented ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    anchor.target ||
    anchor.hasAttribute("download")
  ) {
    return false;
  }

  const url = new URL(anchor.href);

  return url.origin === window.location.origin && url.href !== window.location.href;
}

export default function PageLoader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [isSoftBlurVisible, setIsSoftBlurVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const isTransitioningRef = useRef(false);
  const isSoftTransitioningRef = useRef(false);
  const frameRef = useRef(0);

  function playLoader(onComplete?: () => void, hideAfterComplete = true) {
    window.cancelAnimationFrame(frameRef.current);
    setIsVisible(true);
    setProgress(0);

    const startTime = performance.now();

    function render(time: number) {
      const elapsed = time - startTime;
      const linearProgress = Math.min(elapsed / LOAD_DURATION, 1);
      const easedProgress = 1 - Math.pow(1 - linearProgress, 3);
      const nextProgress = Math.min(100, Math.round(easedProgress * 100));

      setProgress(nextProgress);

      if (linearProgress < 1) {
        frameRef.current = window.requestAnimationFrame(render);
        return;
      }

      setProgress(100);
      window.setTimeout(() => {
        onComplete?.();
        if (hideAfterComplete) {
          setIsVisible(false);
        }
      }, 180);
    }

    frameRef.current = window.requestAnimationFrame(render);
  }

  useEffect(() => {
    const initialLoaderFrame = window.requestAnimationFrame(() => {
      playLoader();
    });

    return () => {
      window.cancelAnimationFrame(initialLoaderFrame);
      window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useEffect(() => {
    if (isSoftTransitioningRef.current) {
      const timeoutId = window.setTimeout(() => {
        setIsSoftBlurVisible(false);
        isSoftTransitioningRef.current = false;
      }, 620);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    if (!isTransitioningRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsVisible(false);
      isTransitioningRef.current = false;
    }, 420);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pathname]);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      const target = event.target;
      const anchor =
        target instanceof Element ? target.closest<HTMLAnchorElement>("a[href]") : null;

      if (!anchor || !isInternalNavigation(event, anchor)) {
        return;
      }

      event.preventDefault();

      if (isTransitioningRef.current) {
        return;
      }

      isTransitioningRef.current = true;
      const nextUrl = `${anchor.pathname}${anchor.search}${anchor.hash}`;

      if (
        SOFT_TRANSITION_PATHS.has(pathname) &&
        SOFT_TRANSITION_PATHS.has(anchor.pathname)
      ) {
        isTransitioningRef.current = false;
        isSoftTransitioningRef.current = true;
        setIsSoftBlurVisible(true);
        window.setTimeout(() => {
          router.push(nextUrl);
        }, 300);
        return;
      }

      playLoader(() => {
        router.push(nextUrl);
      }, false);
    }

    document.addEventListener("click", handleDocumentClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
    };
  }, [pathname, router]);

  return (
    <AnimatePresence>
      {isSoftBlurVisible && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[998] bg-[#E5E5E3]/32 backdrop-blur-[30px]"
          initial={{ opacity: 0, filter: "blur(0px)" }}
          animate={{ opacity: 1, filter: "blur(8px)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        />
      )}
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-[#E5E5E3] text-[#151515]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
          aria-live="polite"
          aria-busy="true"
        >
          <motion.div
            className="flex w-[min(360px,42vw)] flex-col items-center"
            initial={{ opacity: 1, filter: "blur(0px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-editorial text-[13px] uppercase tracking-[-0.01em] text-black/64">
              MARK PEREZ
            </p>
            <div className="mt-5 h-px w-full overflow-hidden bg-[#9F1F2E]/24">
              <motion.div
                className="h-full origin-left bg-[#9F1F2E]"
                style={{ scaleX: progress / 100 }}
              />
            </div>
            <p className="mt-4 font-mono text-[11px] tracking-[0.24em] text-black/38">
              {progress.toString().padStart(3, "0")}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
