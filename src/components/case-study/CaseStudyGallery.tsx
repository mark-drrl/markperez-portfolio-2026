"use client";

import ProjectMediaLightbox from "@/components/ProjectMediaLightbox";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import type { CaseStudyContent } from "@/constants/caseStudies/types";
import { CASE_EASE, monoClass } from "./caseStudyStyles";

interface CaseStudyGalleryProps {
  content: CaseStudyContent;
}

/** Editorial layout: big / two-up / big with cover crops. */
const editorialLayout = [
  { span: "md:col-span-12", aspect: "aspect-[16/9]" },
  { span: "md:col-span-6", aspect: "aspect-[4/3]" },
  { span: "md:col-span-6", aspect: "aspect-[4/3]" },
  { span: "md:col-span-12", aspect: "aspect-[16/9]" },
] as const;

export default function CaseStudyGallery({ content }: CaseStudyGalleryProps) {
  const { gallery } = content;
  const isBranding = gallery.mode === "branding";
  const [lightboxItem, setLightboxItem] = useState<{
    type: "image";
    src: string;
    alt: string;
  } | null>(null);

  return (
    <section className="relative bg-[#E5E5E3] px-5 py-[16vh] text-[#151515] md:px-8">
      <div className="flex items-baseline justify-between">
        <span
          className={`text-[10px] uppercase tracking-[0.3em] text-black/40 ${monoClass}`}
        >
          {gallery.label}
        </span>
        <h2 className="font-editorial text-[clamp(1.6rem,3vw,2.6rem)] font-light italic leading-none">
          {gallery.heading}
        </h2>
      </div>

      <div
        className={`mt-10 grid grid-cols-1 gap-3 md:gap-4 ${
          isBranding ? "md:grid-cols-1" : "md:grid-cols-12"
        }`}
      >
        {gallery.items.map((item, index) => {
          const editorial = editorialLayout[index % editorialLayout.length];
          const fit = item.fit ?? (isBranding ? "contain" : "cover");
          const aspect =
            item.aspect ?? (isBranding ? "aspect-[16/9]" : editorial.aspect);
          const span = isBranding ? "w-full" : editorial.span;
          const isPortrait =
            aspect.includes("3/4") ||
            aspect.includes("4/5") ||
            aspect.includes("9/16");

          return (
            <motion.button
              key={item.src}
              type="button"
              data-cursor-interactive="true"
              onClick={() =>
                setLightboxItem({ type: "image", src: item.src, alt: item.alt })
              }
              className={`group relative block overflow-hidden ${span} ${aspect} ${
                isBranding
                  ? `mx-auto bg-[#dddcd9] ring-1 ring-black/[0.06] ${
                      isPortrait ? "max-w-md" : "max-w-[1200px]"
                    }`
                  : ""
              }`}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{
                duration: 0.9,
                ease: CASE_EASE,
                delay: 0.04 * (index % 2),
              }}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes={
                  isBranding
                    ? isPortrait
                      ? "420px"
                      : "1200px"
                    : "(min-width: 768px) 90vw, 100vw"
                }
                className={
                  fit === "contain"
                    ? "object-contain p-1 md:p-2"
                    : "object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                }
                style={{ objectPosition: item.position ?? "50% 50%" }}
              />
              <span
                className={`absolute left-4 top-4 text-[10px] uppercase tracking-[0.24em] text-black/45 ${monoClass}`}
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
