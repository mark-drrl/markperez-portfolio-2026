"use client";

import type { CaseStudyContent } from "@/constants/caseStudies/types";
import Reveal from "./Reveal";
import { monoClass } from "./caseStudyStyles";

interface CaseStudyFilmProps {
  content: CaseStudyContent;
}

export default function CaseStudyFilm({ content }: CaseStudyFilmProps) {
  const { film } = content;

  if (!film) {
    return null;
  }

  const aspect = film.aspect ?? "aspect-video";

  return (
    <section className="relative bg-[#0e0d0c] px-5 pb-[16vh] text-white md:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex items-baseline justify-between">
          <Reveal>
            <span
              className={`text-[10px] uppercase tracking-[0.3em] text-white/45 ${monoClass}`}
            >
              {film.label}
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-editorial text-[clamp(1.6rem,3vw,2.6rem)] font-light italic leading-none">
              {film.heading}
            </h2>
          </Reveal>
        </div>

        <Reveal delay={0.1} noBlur>
          <div className={`mt-8 w-full overflow-hidden bg-black ${aspect}`}>
            {film.kind === "youtube" ? (
              <iframe
                src={film.src}
                title={`${content.client} ${content.product} film`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <video
                src={film.src}
                className="h-full w-full object-cover"
                controls
                playsInline
                preload="metadata"
                poster={film.src.replace(/\.mp4$/i, "-poster.jpg")}
              />
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p
            className={`mt-5 text-[10px] uppercase tracking-[0.2em] text-white/40 ${monoClass}`}
          >
            {film.caption}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
