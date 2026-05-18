"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function LuxuryCursor() {
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const activeMagneticElementRef = useRef<HTMLElement | null>(null);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const cursorSpringX = useSpring(cursorX, {
    damping: 34,
    stiffness: 180,
    mass: 0.55,
  });
  const cursorSpringY = useSpring(cursorY, {
    damping: 34,
    stiffness: 180,
    mass: 0.55,
  });

  useEffect(() => {
    const clickableSelector =
      'a[href], button, input, textarea, select, summary, [role="button"], [data-cursor-interactive="true"]';

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
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);

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
      resetMagneticElement();
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      resetMagneticElement();
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[70] h-2.5 w-2.5 rounded-full bg-[#9F1F2E]"
      animate={{
        backgroundColor: isHoveringClickable
          ? "rgba(159, 31, 46, 0.45)"
          : "rgba(159, 31, 46, 1)",
        filter: isHoveringClickable ? "blur(8px)" : "blur(0px)",
        opacity: isHoveringClickable ? 0.58 : 1,
        scale: isHoveringClickable ? 1.65 : 1,
      }}
      transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
      style={{
        x: cursorSpringX,
        y: cursorSpringY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      aria-hidden="true"
    />
  );
}
