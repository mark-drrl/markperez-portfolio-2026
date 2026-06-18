"use client";

import ProjectMediaLightbox from "@/components/ProjectMediaLightbox";
import { motion } from "framer-motion";
import { useState } from "react";
import type { CaseStudyReels as CaseStudyReelsData } from "@/constants/caseStudies/types";
import { CASE_EASE, monoClass } from "./caseStudyStyles";

interface CaseStudyReelsProps {
  reels: CaseStudyReelsData;
}

export default function CaseStudyReels({ reels }: CaseStudyReelsProps) {
  const [lightboxItem, setLightboxItem] = useState<{
    type: "video";
    src: string;
    alt: string;
  } | null>(null);

  return (
    <section className="relative bg-[#0e0d0c] px-5 pb-[16vh] text-white md:px-8">
      <div className="flex items-baseline justify-between">
        <span
          className={`text-[10px] uppercase tracking-[0.3em] text-white/45 ${monoClass}`}
        >
          {reels.label}
        </span>
        <h2 className="font-editorial text-[clamp(1.6rem,3vw,2.6rem)] font-light italic leading-none">
          {reels.heading}
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reels.items.map((item, index) => {
          const fit = item.fit ?? "contain";

          return (
          <motion.button
            key={item.src}
            type="button"
            data-cursor-interactive="true"
            onClick={() =>
              setLightboxItem({ type: "video", src: item.src, alt: item.alt })
            }
            className={`group relative w-full self-start overflow-hidden bg-black ${item.aspect ?? "aspect-[9/16]"}`}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ duration: 0.85, ease: CASE_EASE, delay: 0.03 * (index % 3) }}
          >
            <video
              src={item.src}
              className={
                fit === "contain"
                  ? "h-full w-full object-contain"
                  : "h-full w-full object-cover"
              }
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            <span
              className={`absolute left-4 top-4 text-[10px] uppercase tracking-[0.24em] text-white/70 ${monoClass}`}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          </motion.button>
          );
        })}
      </div>

      <ProjectMediaLightbox
        item={lightboxItem}
        onClose={() => setLightboxItem(null)}
      />
    </section>
  );
}
