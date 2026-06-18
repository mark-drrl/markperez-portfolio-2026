"use client";

import type { CaseStudyContent } from "@/constants/caseStudies/types";
import Reveal from "./Reveal";
import { monoClass } from "./caseStudyStyles";

interface CaseStudyCreditsProps {
  content: CaseStudyContent;
}

export default function CaseStudyCredits({ content }: CaseStudyCreditsProps) {
  return (
    <section className="relative bg-[#E5E5E3] px-5 pb-[14vh] text-[#151515] md:px-8">
      <div className="grid grid-cols-1 gap-x-[7vw] gap-y-14 border-t border-black/12 pt-[10vh] md:grid-cols-2">
        <div>
          <Reveal>
            <span
              className={`text-[10px] uppercase tracking-[0.3em] text-black/40 ${monoClass}`}
            >
              Toolbox
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {content.toolbox.map((tool) => (
                <span
                  key={tool}
                  className="font-neue rounded-full border border-black/15 px-4 py-2 text-[12px] leading-none text-black/70"
                >
                  {tool}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <div>
          <Reveal>
            <span
              className={`text-[10px] uppercase tracking-[0.3em] text-black/40 ${monoClass}`}
            >
              Credits
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <dl className="mt-7 flex flex-col">
              {content.credits.map((credit) => (
                <div
                  key={credit.role}
                  className="flex items-baseline justify-between gap-6 border-t border-black/12 py-4 first:border-t-0"
                >
                  <dt
                    className={`text-[9px] uppercase tracking-[0.22em] text-black/40 ${monoClass}`}
                  >
                    {credit.role}
                  </dt>
                  <dd className="font-neue text-[14px] text-black/80">
                    {credit.name}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
