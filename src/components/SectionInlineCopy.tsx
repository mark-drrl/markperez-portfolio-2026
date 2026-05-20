"use client";

import type { ReactNode } from "react";

interface SectionInlineCopyProps {
  heading: ReactNode;
  subtitle: ReactNode;
  className?: string;
}

/**
 * Heading · subtitle on one baseline (subtitle wraps in-place on narrow widths).
 */
export default function SectionInlineCopy({
  heading,
  subtitle,
  className = "",
}: SectionInlineCopyProps) {
  return (
    <div
      className={`box-border w-full max-w-full overflow-visible px-4 sm:px-6 ${className}`}
    >
      <div className="mx-auto flex w-full max-w-full flex-nowrap items-baseline justify-center gap-x-2">
        <div className="shrink-0 text-[#9A3A3A] [&_h2]:tracking-[-0.02em] [&_h2]:text-[#9A3A3A]">
          {heading}
        </div>
        <span
          className="shrink-0 translate-y-[0.06em] text-[10px] leading-none text-neutral-300 sm:text-xs"
          aria-hidden="true"
        >
          ·
        </span>
        <div className="min-w-0 max-w-[min(46vw,12.5rem)] shrink font-neue text-[10px] font-normal leading-snug tracking-wide text-neutral-600 sm:max-w-[14rem] md:max-w-md md:text-sm">
          {subtitle}
        </div>
      </div>
    </div>
  );
}
