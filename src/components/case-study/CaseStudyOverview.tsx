"use client";

import type { CaseStudyContent } from "@/constants/caseStudies/types";
import Reveal from "./Reveal";
import { monoClass } from "./caseStudyStyles";

interface CaseStudyOverviewProps {
  content: CaseStudyContent;
}

export default function CaseStudyOverview({ content }: CaseStudyOverviewProps) {
  return (
    <section className="relative bg-[#E5E5E3] px-5 py-[16vh] text-[#151515] md:px-8">
      <Reveal>
        <span
          className={`text-[10px] uppercase tracking-[0.3em] text-black/40 ${monoClass}`}
        >
          ({content.index}) / Overview
        </span>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-x-[7vw] gap-y-16 md:grid-cols-[1.5fr_1fr]">
        <div>
          <Reveal>
            <h2 className="font-editorial max-w-[18ch] text-[clamp(1.9rem,4vw,3.7rem)] font-light leading-[1.04] tracking-[-0.01em]">
              {content.overview.lead}
            </h2>
          </Reveal>

          <div className="mt-10 max-w-[46ch] space-y-5">
            {content.overview.body.map((paragraph, index) => (
              <Reveal key={index} delay={0.05 * index}>
                <p className="font-neue text-[15px] leading-[1.6] text-black/62">
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.1} className="md:pt-3">
          <dl className="flex flex-col">
            {content.meta.map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-[16px_1fr] items-baseline gap-3 border-t border-black/12 py-5 first:border-t-0"
              >
                <span className="text-[#9F1F2E]" aria-hidden>
                  →
                </span>
                <div className="flex flex-col gap-1.5">
                  <dt
                    className={`text-[9px] uppercase tracking-[0.26em] text-black/38 ${monoClass}`}
                  >
                    {item.label}
                  </dt>
                  <dd className="font-neue text-[13px] leading-[1.4] text-black/80">
                    {item.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
