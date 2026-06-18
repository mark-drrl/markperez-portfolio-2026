"use client";

import type { CaseStudyContent } from "@/constants/caseStudies/types";
import Reveal from "./Reveal";
import { monoClass } from "./caseStudyStyles";

interface CaseStudyProcessProps {
  content: CaseStudyContent;
}

export default function CaseStudyProcess({ content }: CaseStudyProcessProps) {
  const { process } = content;

  return (
    <section className="relative bg-[#0e0d0c] px-5 py-[16vh] text-white md:px-8">
      <div className="grid grid-cols-1 gap-x-[7vw] gap-y-12 md:grid-cols-[1fr_1.6fr]">
        <div className="md:sticky md:top-[22vh] md:h-fit md:self-start">
          <Reveal>
            <span
              className={`text-[10px] uppercase tracking-[0.3em] text-white/45 ${monoClass}`}
            >
              {process.label}
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-editorial mt-6 max-w-[12ch] text-[clamp(2rem,4.4vw,4rem)] font-light leading-[1.02] tracking-[-0.01em]">
              {process.heading}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="font-neue mt-7 max-w-[38ch] text-[15px] leading-[1.6] text-white/55">
              {process.intro}
            </p>
          </Reveal>
        </div>

        <ol className="flex flex-col">
          {process.steps.map((step, index) => (
            <Reveal key={step.index} delay={0.04 * index}>
              <li className="grid grid-cols-[auto_1fr] gap-x-6 border-t border-white/12 py-8 md:gap-x-10 md:py-10">
                <span className="font-editorial text-[clamp(1.6rem,2.6vw,2.4rem)] font-light leading-none text-[#9F1F2E]">
                  {step.index}
                </span>
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                    <h3 className="font-editorial text-[clamp(1.4rem,2.4vw,2.2rem)] font-light leading-none">
                      {step.title}
                    </h3>
                    {step.tool ? (
                      <span
                        className={`text-[9px] uppercase tracking-[0.24em] text-white/45 ${monoClass}`}
                      >
                        {step.tool}
                      </span>
                    ) : null}
                  </div>
                  <p className="font-neue mt-4 max-w-[52ch] text-[14px] leading-[1.6] text-white/60">
                    {step.body}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
