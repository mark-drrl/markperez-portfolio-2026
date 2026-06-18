"use client";

import { workPageSocialLinks } from "@/constants/workPageSocialLinks";
import type { CaseStudyContent } from "@/constants/caseStudies/types";
import Link from "next/link";
import Reveal from "./Reveal";
import { monoClass } from "./caseStudyStyles";

interface CaseStudyOutroProps {
  content: CaseStudyContent;
}

export default function CaseStudyOutro({ content }: CaseStudyOutroProps) {
  const { next } = content;

  return (
    <footer className="relative overflow-hidden bg-[#0b0a09] px-5 pb-12 pt-[14vh] text-white md:px-8">
      <Link
        href={next.href}
        data-cursor-interactive="true"
        className="group block border-t border-white/15 pt-10"
      >
        <Reveal>
          <span
            className={`text-[10px] uppercase tracking-[0.3em] text-white/45 ${monoClass}`}
          >
            {next.label}
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="mt-5 flex items-end justify-between gap-6">
            <h2 className="font-editorial text-[clamp(2.4rem,9vw,8rem)] font-light leading-[0.9] tracking-[-0.01em] transition-transform duration-[0.8s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2">
              {next.title}
            </h2>
            <span className="font-editorial mb-2 text-[clamp(2rem,5vw,4rem)] font-light leading-none text-[#9F1F2E] transition-transform duration-[0.8s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
              →
            </span>
          </div>
        </Reveal>
      </Link>

      <div className="mt-[12vh] flex flex-col gap-8 border-t border-white/12 pt-8 md:flex-row md:items-end md:justify-between">
        <Link
          href="/#works"
          className={`text-[10px] font-medium uppercase tracking-[0.28em] text-white/50 transition-colors hover:text-white ${monoClass}`}
        >
          ← Back to Works
        </Link>

        <div className="text-left md:text-right">
          <p className="font-neue text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
            MARK <span className="text-[#9F1F2E]">PEREZ</span>
          </p>
          <div
            className={`mt-2 flex flex-wrap gap-x-5 gap-y-1 text-white/40 md:justify-end ${monoClass}`}
          >
            {workPageSocialLinks.map((item) =>
              item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                  className="text-[9px] uppercase tracking-[0.2em] transition-colors hover:text-[#9F1F2E]"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  key={item.label}
                  className="text-[9px] uppercase tracking-[0.2em]"
                >
                  {item.label}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
