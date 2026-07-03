"use client";

/**
 * SiteCursor — site-wide custom cursor, mounted once in layout.tsx.
 *
 * Position: updated imperatively via rAF (translate3d) — at most ~1 frame
 * behind the pointer. No spring/lag on the position itself.
 *
 * State animation: Framer Motion handles size/opacity/blur swell on
 * interactive elements (same visual as the old page.tsx cursor), but only
 * for those properties — NOT position.
 *
 * Visibility:
 *   - Hidden (display:none) on touch-primary devices (pointer:coarse or
 *     hover:none) — matchMedia('(hover:hover) and (pointer:fine)').
 *   - Fades out on pointerleave, fades back on pointerenter.
 */

import { motion, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function SiteCursor() {
  const [isCapable, setIsCapable] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // DOM ref for the cursor element — position written imperatively
  const dotRef = useRef<HTMLDivElement>(null);
  const activeMagneticElementRef = useRef<HTMLElement | null>(null);

  // We still use Framer Motion motion values for the SIZE/OPACITY animate props
  // but position is written directly, bypassing the React render cycle.
  const motionX = useMotionValue(-100);
  const motionY = useMotionValue(-100);

  // Detect fine-pointer capability (hydration-safe).
  // Subscribes to the media-query change event; reads initial state in callback.
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");

    function onChange(e: MediaQueryListEvent) {
      setIsCapable(e.matches);
    }

    mq.addEventListener("change", onChange);

    // Schedule state update after commit so React can batch it properly
    const id = requestAnimationFrame(() => setIsCapable(mq.matches));

    return () => {
      cancelAnimationFrame(id);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  useEffect(() => {
    if (!isCapable) return;

    const dot = dotRef.current;
    if (!dot) return;

    const clickableSelector =
      'a[href], button, input, textarea, select, summary, [role="button"], [data-cursor-interactive="true"]';

    // rAF-batched imperative position write
    let pendingX = -100;
    let pendingY = -100;
    let rafPending = false;

    function flushPosition() {
      rafPending = false;
      const el = dotRef.current;
      if (!el) return;
      el.style.transform = `translate3d(${pendingX}px,${pendingY}px,0) translate(-50%,-50%)`;
    }

    function resetMagneticElement() {
      const activeElement = activeMagneticElementRef.current;
      if (activeElement) {
        activeElement.style.transform = "";
        activeElement.style.transition =
          "transform 420ms cubic-bezier(0.16, 1, 0.3, 1)";
      }
      activeMagneticElementRef.current = null;
    }

    function handlePointerMove(event: PointerEvent) {
      pendingX = event.clientX;
      pendingY = event.clientY;

      // Schedule one rAF write per frame (coalesce multiple events)
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(flushPosition);
      }

      // Also keep the motion values in sync so Framer doesn't fight us
      motionX.set(event.clientX);
      motionY.set(event.clientY);

      const target = event.target;
      const clickableElement =
        target instanceof Element
          ? target.closest<HTMLElement>(clickableSelector)
          : null;

      if (!clickableElement) {
        setIsHoveringClickable(false);
        resetMagneticElement();
        return;
      }

      setIsHoveringClickable(true);

      if (activeMagneticElementRef.current !== clickableElement) {
        resetMagneticElement();
        activeMagneticElementRef.current = clickableElement;
      }

      const rect = clickableElement.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / Math.max(rect.width, 1);
      const relativeY = (event.clientY - rect.top) / Math.max(rect.height, 1);
      const normalizedX = relativeX * 2 - 1;
      const normalizedY = relativeY * 2 - 1;
      const pullX = normalizedX * 4;
      const pullY = normalizedY * 3;
      const rotateY = normalizedX * 5;
      const rotateX = normalizedY * -4;

      clickableElement.style.transition =
        "transform 180ms cubic-bezier(0.16, 1, 0.3, 1)";
      clickableElement.style.transform = `translate3d(${pullX}px, ${pullY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    function handlePointerLeave() {
      setIsHoveringClickable(false);
      setIsVisible(false);
      resetMagneticElement();
    }

    function handlePointerEnter() {
      setIsVisible(true);
    }

    // Show cursor on first move (so it doesn't flash at off-screen position)
    function handleFirstMove(event: PointerEvent) {
      pendingX = event.clientX;
      pendingY = event.clientY;
      flushPosition();
      setIsVisible(true);
    }

    window.addEventListener("pointermove", handleFirstMove, { once: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("pointerenter", handlePointerEnter);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("pointerenter", handlePointerEnter);
      resetMagneticElement();
    };
  }, [isCapable, motionX, motionY]);

  // Don't render on touch-primary devices
  if (!isCapable) return null;

  return (
    <motion.div
      ref={dotRef}
      className="pointer-events-none fixed left-0 top-0 z-[1000] h-2.5 w-2.5 rounded-full bg-[#9F1F2E]"
      aria-hidden="true"
      animate={{
        backgroundColor: isHoveringClickable
          ? "rgba(159, 31, 46, 0.45)"
          : "rgba(159, 31, 46, 1)",
        filter: isHoveringClickable ? "blur(8px)" : "blur(0px)",
        opacity: isHoveringClickable ? 0.58 : isVisible ? 1 : 0,
        scale: isHoveringClickable ? 1.65 : 1,
      }}
      transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
      // position is NOT driven by motion values — it's written imperatively
      // via rAF in the effect above. We do NOT set x/y/translateX/translateY
      // here so Framer Motion can't lag the position.
      style={{
        // Initial off-screen position (overwritten by first pointermove)
        transform: "translate3d(-100px,-100px,0) translate(-50%,-50%)",
        willChange: "transform",
      }}
    />
  );
}
