"use client";

import {
  notifyCaseStudyViewerClose,
  notifyCaseStudyViewerOpen,
} from "@/lib/caseStudyViewer";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CaseStudyDocument } from "@/constants/caseStudies/types";
import { CASE_EASE, monoClass } from "./caseStudyStyles";

interface CaseStudyDocumentViewerProps {
  document: CaseStudyDocument | null;
  onClose: () => void;
}

const SLIDE_EASE = [0.22, 1, 0.36, 1] as const;
const SLIDE_DURATION = 0.34;

function pageSrc(previewDir: string, pageNumber: number) {
  return `${previewDir}/page-${String(pageNumber).padStart(3, "0")}.webp`;
}

function preloadPage(src: string) {
  const image = new Image();
  image.decoding = "async";
  image.src = src;
}

export default function CaseStudyDocumentViewer({
  document: activeDocument,
  onClose,
}: CaseStudyDocumentViewerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [slideWidth, setSlideWidth] = useState(0);

  const goToPage = useCallback(
    (nextPage: number) => {
      if (!activeDocument) {
        return;
      }

      const clamped = Math.min(
        activeDocument.pageCount,
        Math.max(1, nextPage),
      );

      if (clamped !== currentPage) {
        setCurrentPage(clamped);
      }
    },
    [activeDocument, currentPage],
  );

  const goNext = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const goPrev = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  useEffect(() => {
    const mountFrame = window.requestAnimationFrame(() => {
      setIsMounted(true);
    });

    return () => {
      window.cancelAnimationFrame(mountFrame);
    };
  }, []);

  useEffect(() => {
    if (!activeDocument) {
      return;
    }

    setCurrentPage(1);
  }, [activeDocument?.id]);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    function measure() {
      setSlideWidth(viewport?.clientWidth ?? 0);
    }

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);

    return () => {
      observer.disconnect();
    };
  }, [activeDocument?.id, isMounted]);

  useEffect(() => {
    if (!activeDocument) {
      return;
    }

    for (const page of [currentPage - 1, currentPage, currentPage + 1]) {
      if (page >= 1 && page <= activeDocument.pageCount) {
        preloadPage(pageSrc(activeDocument.previewDir, page));
      }
    }
  }, [activeDocument, currentPage]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        goNext();
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        goPrev();
      }
    }

    if (!activeDocument) {
      return;
    }

    notifyCaseStudyViewerOpen();

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      notifyCaseStudyViewerClose();
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeDocument, onClose, goNext, goPrev]);

  if (!isMounted || !activeDocument) {
    return null;
  }

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < activeDocument.pageCount;
  const pageLabel = `${String(currentPage).padStart(2, "0")} / ${String(activeDocument.pageCount).padStart(2, "0")}`;

  return createPortal(
    <AnimatePresence>
      {activeDocument ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex h-[100dvh] flex-col bg-[#050505]/94 backdrop-blur-[24px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32, ease: CASE_EASE }}
          role="dialog"
          aria-modal="true"
          aria-label={`${activeDocument.title} document viewer`}
        >
          <div className="flex shrink-0 items-center justify-between px-5 py-5 text-white md:px-8">
            <div>
              <p
                className={`text-[10px] uppercase tracking-[0.28em] text-white/50 ${monoClass}`}
              >
                {activeDocument.subtitle ?? "Lookbook"}
              </p>
              <p className="font-editorial mt-2 text-[clamp(1.4rem,2.6vw,2.2rem)] font-light leading-none">
                {activeDocument.title}
              </p>
            </div>
            <button
              type="button"
              data-cursor-interactive="true"
              onClick={onClose}
              className={`text-[10px] uppercase tracking-[0.28em] text-white/58 transition-colors hover:text-[#9F1F2E] ${monoClass}`}
            >
              Close
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-10">
            <button
              type="button"
              data-cursor-interactive="true"
              onClick={goPrev}
              disabled={!canGoPrev}
              aria-label="Previous page"
              className={`absolute left-3 z-20 hidden h-14 w-14 items-center justify-center rounded-full border border-white/12 bg-black/30 text-white/70 backdrop-blur-md transition-all hover:border-white/25 hover:bg-black/45 hover:text-white disabled:pointer-events-none disabled:opacity-0 md:flex ${monoClass}`}
            >
              ←
            </button>

            <div
              ref={viewportRef}
              className="relative h-[min(72dvh,760px)] w-[min(92vw,920px)] overflow-hidden"
              onTouchStart={(event) => {
                setTouchStartX(event.changedTouches[0]?.clientX ?? null);
              }}
              onTouchEnd={(event) => {
                const startX = touchStartX;
                const endX = event.changedTouches[0]?.clientX;

                setTouchStartX(null);

                if (startX == null || endX == null) {
                  return;
                }

                const delta = endX - startX;

                if (Math.abs(delta) < 40) {
                  return;
                }

                if (delta < 0) {
                  goNext();
                } else {
                  goPrev();
                }
              }}
            >
              <button
                type="button"
                aria-label="Previous page"
                onClick={goPrev}
                disabled={!canGoPrev}
                className="absolute inset-y-0 left-0 z-10 w-[30%] cursor-w-resize disabled:cursor-default"
              />
              <button
                type="button"
                aria-label="Next page"
                onClick={goNext}
                disabled={!canGoNext}
                className="absolute inset-y-0 right-0 z-10 w-[30%] cursor-e-resize disabled:cursor-default"
              />

              <motion.div
                className="flex h-full"
                animate={{
                  x: slideWidth > 0 ? -slideWidth * (currentPage - 1) : 0,
                }}
                transition={{ duration: SLIDE_DURATION, ease: SLIDE_EASE }}
              >
                {Array.from(
                  { length: activeDocument.pageCount },
                  (_, index) => {
                    const pageNumber = index + 1;

                    return (
                      <div
                        key={`${activeDocument.id}-page-${pageNumber}`}
                        className="flex h-full shrink-0 items-center justify-center"
                        style={{ width: slideWidth || "100%" }}
                      >
                        <img
                          src={pageSrc(activeDocument.previewDir, pageNumber)}
                          alt={`${activeDocument.title} page ${pageNumber}`}
                          className="max-h-full max-w-full object-contain"
                          draggable={false}
                          loading={Math.abs(pageNumber - currentPage) <= 1 ? "eager" : "lazy"}
                        />
                      </div>
                    );
                  },
                )}
              </motion.div>
            </div>

            <button
              type="button"
              data-cursor-interactive="true"
              onClick={goNext}
              disabled={!canGoNext}
              aria-label="Next page"
              className={`absolute right-3 z-20 hidden h-14 w-14 items-center justify-center rounded-full border border-white/12 bg-black/30 text-white/70 backdrop-blur-md transition-all hover:border-white/25 hover:bg-black/45 hover:text-white disabled:pointer-events-none disabled:opacity-0 md:flex ${monoClass}`}
            >
              →
            </button>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-3 border-t border-white/10 px-5 py-4 md:px-8">
            <p
              className={`text-[10px] uppercase tracking-[0.28em] text-white/55 ${monoClass}`}
            >
              {pageLabel} · Arrow keys or swipe
            </p>
            <div className="flex items-center gap-4 md:hidden">
              <button
                type="button"
                data-cursor-interactive="true"
                onClick={goPrev}
                disabled={!canGoPrev}
                className={`text-[10px] uppercase tracking-[0.24em] text-white/55 transition-colors hover:text-white disabled:opacity-30 ${monoClass}`}
              >
                Previous
              </button>
              <button
                type="button"
                data-cursor-interactive="true"
                onClick={goNext}
                disabled={!canGoNext}
                className={`text-[10px] uppercase tracking-[0.24em] text-white/55 transition-colors hover:text-white disabled:opacity-30 ${monoClass}`}
              >
                Next
              </button>
            </div>
            {activeDocument.pdfSrc ? (
              <a
                href={activeDocument.pdfSrc}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-[10px] uppercase tracking-[0.28em] text-white/45 transition-colors hover:text-white ${monoClass}`}
              >
                Download original PDF
              </a>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
