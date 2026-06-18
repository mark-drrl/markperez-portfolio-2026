"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import type { CaseStudyContent } from "@/constants/caseStudies/types";
import { CASE_EASE, monoClass } from "./caseStudyStyles";

interface CaseStudyHeroProps {
  content: CaseStudyContent;
}

export default function CaseStudyHero({ content }: CaseStudyHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.16]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.35]);

  const titleLines = content.heroLines ?? [content.client];

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] w-full overflow-hidden bg-[#0b0a09] text-white"
    >
      <motion.div
        className="absolute inset-0"
        style={{ y: imageY, scale: imageScale }}
      >
        <Image
          src={content.hero.src}
          alt={content.hero.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: content.hero.position ?? "50% 50%" }}
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-black/70"
        style={{ opacity: overlayOpacity }}
        aria-hidden
      />

      <div className="relative z-10 flex h-full flex-col justify-between px-5 pb-12 pt-24 md:px-8 md:pb-16">
        <motion.p
          className={`max-w-md text-[10px] uppercase leading-relaxed tracking-[0.26em] text-white/70 ${monoClass}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: CASE_EASE, delay: 0.2 }}
        >
          {content.eyebrow}
        </motion.p>

        <div className="flex flex-col gap-6">
          <h1 className="font-editorial flex flex-col gap-1 py-[0.08em] text-[clamp(2.4rem,14vw,11rem)] font-light leading-[0.95] tracking-[0.02em] md:gap-2">
            {titleLines.map((line, lineIndex) => (
              <span key={line} className="flex overflow-visible">
                {line.split("").map((letter, index) => (
                  <motion.span
                    key={`${line}-${letter}-${index}`}
                    className="inline-block will-change-transform"
                    initial={{ opacity: 0, y: "0.28em" }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 1.1,
                      ease: CASE_EASE,
                      delay: 0.35 + lineIndex * 0.12 + index * 0.05,
                    }}
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <motion.p
              className="font-editorial max-w-xl text-[clamp(1.1rem,2.2vw,1.9rem)] italic leading-[1.15] text-white/90"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: CASE_EASE, delay: 0.75 }}
            >
              {content.heroLines
                ? content.tagline
                : `${content.product}. ${content.tagline}`}
            </motion.p>

            <motion.div
              className={`flex items-center gap-3 text-[10px] uppercase tracking-[0.26em] text-white/55 ${monoClass}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease: CASE_EASE, delay: 1 }}
            >
              <span>Scroll</span>
              <motion.span
                className="block h-10 w-px bg-white/40"
                animate={{ scaleY: [0.3, 1, 0.3] }}
                style={{ originY: 0 }}
                transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
