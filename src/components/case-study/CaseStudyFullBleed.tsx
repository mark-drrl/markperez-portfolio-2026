"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import type { CaseStudyImage } from "@/constants/caseStudies/types";

interface CaseStudyFullBleedProps {
  image: CaseStudyImage;
  /** Optional caption rendered bottom-left over the image. */
  caption?: string;
}

export default function CaseStudyFullBleed({
  image,
  caption,
}: CaseStudyFullBleedProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  // Image is over-tall inside an overflow-hidden frame; drift it for parallax.
  const imageY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section className="relative bg-[#E5E5E3] py-[6vh]">
      <div
        ref={sectionRef}
        className="relative h-[62vh] w-full overflow-hidden md:h-[84vh]"
      >
        <motion.div className="absolute inset-x-0 -top-[8%] h-[116%]" style={{ y: imageY }}>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: image.position ?? "50% 50%" }}
          />
        </motion.div>

        {caption ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-6 md:p-8">
            <p className="font-neue max-w-[40ch] text-[12px] leading-[1.5] text-white/80">
              {caption}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
