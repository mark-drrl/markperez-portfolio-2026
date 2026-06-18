"use client";

import Image from "next/image";
import type { CaseStudyContent } from "@/constants/caseStudies/types";
import Reveal from "./Reveal";
import { monoClass } from "./caseStudyStyles";

interface CaseStudyNarrativeProps {
  content: CaseStudyContent;
}

export default function CaseStudyNarrative({
  content,
}: CaseStudyNarrativeProps) {
  const { concept } = content;

  return (
    <section className="relative bg-[#E5E5E3] px-5 pb-[14vh] text-[#151515] md:px-8">
      <div className="grid grid-cols-1 gap-x-[7vw] gap-y-12 md:grid-cols-2">
        <div className="md:sticky md:top-[22vh] md:h-fit md:self-start">
          <Reveal>
            <span
              className={`text-[10px] uppercase tracking-[0.3em] text-black/40 ${monoClass}`}
            >
              {concept.label}
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-editorial mt-6 max-w-[14ch] text-[clamp(2rem,4.4vw,4rem)] font-light leading-[1.02] tracking-[-0.01em]">
              {concept.heading}
            </h2>
          </Reveal>
          <div className="mt-8 max-w-[42ch] space-y-5">
            {concept.body.map((paragraph, index) => (
              <Reveal key={index} delay={0.1 + 0.05 * index}>
                <p className="font-neue text-[15px] leading-[1.6] text-black/62">
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.05} noBlur>
          <div
            className={`relative w-full overflow-hidden bg-[#dddcd9] ring-1 ring-black/[0.06] ${
              concept.image.aspect ?? "aspect-[4/5]"
            }`}
          >
            <Image
              src={concept.image.src}
              alt={concept.image.alt}
              fill
              sizes="(min-width: 768px) 46vw, 90vw"
              className={
                concept.image.fit === "contain"
                  ? "object-contain p-2 md:p-3"
                  : "object-cover"
              }
              style={{ objectPosition: concept.image.position ?? "50% 50%" }}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
