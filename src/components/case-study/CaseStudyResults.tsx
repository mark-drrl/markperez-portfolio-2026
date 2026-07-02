"use client";

import type { CaseStudyContent } from "@/constants/caseStudies/types";
import Reveal from "./Reveal";
import { CASE_ACCENT, monoClass } from "./caseStudyStyles";

interface CaseStudyResultsProps {
  content: CaseStudyContent;
}

export default function CaseStudyResults({ content }: CaseStudyResultsProps) {
  const { results } = content;

  if (!results || results.stats.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-[#E5E5E3] px-5 py-[16vh] text-[#151515] md:px-8">
      <Reveal>
        <span
          className={`text-[10px] uppercase tracking-[0.3em] text-black/40 ${monoClass}`}
        >
          {results.label}
        </span>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="font-editorial mt-6 max-w-[16ch] text-[clamp(2rem,4.4vw,4rem)] font-light leading-[1.02] tracking-[-0.01em]">
          {results.heading}
        </h2>
      </Reveal>
      {results.intro ? (
        <Reveal delay={0.08}>
          <p className="font-neue mt-7 max-w-[46ch] text-[15px] leading-[1.6] text-black/62">
            {results.intro}
          </p>
        </Reveal>
      ) : null}

      <div className="mt-[10vh] grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
        {results.stats.map((stat, index) => (
          <Reveal key={stat.label} delay={0.06 * index}>
            <div className="flex flex-col gap-3 border-t border-black/12 pt-6">
              <span
                className="font-editorial text-[clamp(2.8rem,6vw,5.2rem)] font-light leading-none tracking-[-0.02em]"
                style={{ color: CASE_ACCENT }}
              >
                {stat.value}
              </span>
              <span
                className={`text-[9px] uppercase tracking-[0.26em] text-black/55 ${monoClass}`}
              >
                {stat.label}
              </span>
              {stat.description ? (
                <p className="font-neue max-w-[22ch] text-[13px] leading-[1.5] text-black/50">
                  {stat.description}
                </p>
              ) : null}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
