"use client";

import LuxuryCursor from "@/components/LuxuryCursor";
import {
  CASE_STUDY_VIEWER_CLOSE_EVENT,
  CASE_STUDY_VIEWER_OPEN_EVENT,
} from "@/lib/caseStudyViewer";
import { resetDocumentScrollTop } from "@/lib/restoreDocumentScroll";
import Lenis from "lenis";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { monoClass } from "./caseStudyStyles";

interface CaseStudyShellProps {
  children: ReactNode;
  /** Short label shown top-right (e.g. "CREED / (01)"). */
  topRightLabel: string;
  backHref?: string;
}

/**
 * Client wrapper for a case study page: scoped Lenis smooth scroll, the luxury
 * cursor, and a minimal fixed top bar that adapts to dark/light sections via
 * `mix-blend-difference`.
 */
export default function CaseStudyShell({
  children,
  topRightLabel,
  backHref = "/#works",
}: CaseStudyShellProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useLayoutEffect(() => {
    resetDocumentScrollTop();
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      return;
    }

    resetDocumentScrollTop();

    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.scrollTo(0, { immediate: true, force: true });
    let frameId = 0;

    function raf(time: number) {
      lenis.raf(time);
      frameId = window.requestAnimationFrame(raf);
    }

    frameId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frameId);
      lenisRef.current = null;
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    function handleViewerOpen() {
      lenisRef.current?.stop();
    }

    function handleViewerClose() {
      lenisRef.current?.start();
    }

    window.addEventListener(CASE_STUDY_VIEWER_OPEN_EVENT, handleViewerOpen);
    window.addEventListener(CASE_STUDY_VIEWER_CLOSE_EVENT, handleViewerClose);

    return () => {
      window.removeEventListener(CASE_STUDY_VIEWER_OPEN_EVENT, handleViewerOpen);
      window.removeEventListener(CASE_STUDY_VIEWER_CLOSE_EVENT, handleViewerClose);
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 mix-blend-difference">
        <div className="flex items-center justify-between px-5 py-5 text-white md:px-8">
          <Link
            href={backHref}
            className={`pointer-events-auto text-[10px] font-medium uppercase tracking-[0.28em] transition-opacity hover:opacity-60 ${monoClass}`}
          >
            ← Back to Works
          </Link>
          <span
            className={`text-[10px] font-medium uppercase tracking-[0.28em] ${monoClass}`}
          >
            {topRightLabel}
          </span>
        </div>
      </div>

      {children}

      <LuxuryCursor />
    </>
  );
}
