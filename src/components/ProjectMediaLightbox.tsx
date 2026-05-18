"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface LightboxItem {
  type: "image" | "video";
  src: string;
  alt: string;
}

interface ProjectMediaLightboxProps {
  item: LightboxItem | null;
  onClose: () => void;
}

export default function ProjectMediaLightbox({
  item,
  onClose,
}: ProjectMediaLightboxProps) {
  const [isMounted, setIsMounted] = useState(false);
  const isEmbeddedVideo = item?.type === "video" && item.src.startsWith("http");

  useEffect(() => {
    const mountFrame = window.requestAnimationFrame(() => {
      setIsMounted(true);
    });

    return () => {
      window.cancelAnimationFrame(mountFrame);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (!item) {
      return;
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-[#050505]/86 p-8 backdrop-blur-[24px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            className="relative max-h-[86vh] w-[min(1120px,88vw)]"
            initial={{ opacity: 0, filter: "blur(18px)", scale: 0.98 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, filter: "blur(18px)", scale: 0.98 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            {item.type === "image" ? (
              <img
                src={item.src}
                alt={item.alt}
                className="max-h-[86vh] w-full object-contain"
                decoding="async"
              />
            ) : isEmbeddedVideo ? (
              <div className="aspect-video w-full overflow-hidden bg-black">
                <iframe
                  src={item.src}
                  title={item.alt}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <video
                src={item.src}
                className="max-h-[86vh] w-full object-contain"
                controls
                autoPlay
                playsInline
              />
            )}
            <button
              type="button"
              onClick={onClose}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-[0.28em] text-white/58 transition-colors hover:text-[#9F1F2E] [font-family:'JetBrains_Mono','JetBrainsMono','SF_Mono',Consolas,monospace]"
            >
              CLOSE
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
