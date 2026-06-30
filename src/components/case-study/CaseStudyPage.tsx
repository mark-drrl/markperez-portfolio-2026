import type { CaseStudyContent } from "@/constants/caseStudies/types";
import CaseStudyCredits from "./CaseStudyCredits";
import CaseStudyDocuments from "./CaseStudyDocuments";
import CaseStudyFilm from "./CaseStudyFilm";
import CaseStudyFullBleed from "./CaseStudyFullBleed";
import CaseStudyGallery from "./CaseStudyGallery";
import CaseStudyHero from "./CaseStudyHero";
import CaseStudyNarrative from "./CaseStudyNarrative";
import CaseStudyOverview from "./CaseStudyOverview";
import CaseStudyProcess from "./CaseStudyProcess";
import CaseStudyReels from "./CaseStudyReels";
import CaseStudyShell from "./CaseStudyShell";
import CaseStudyOutro from "./CaseStudyOutro";

interface CaseStudyPageProps {
  content: CaseStudyContent;
}

export default function CaseStudyPage({ content }: CaseStudyPageProps) {
  return (
    <CaseStudyShell topRightLabel={`${content.client} / (${content.index})`}>
      <main className="relative w-full bg-[#E5E5E3] text-[#151515]">
        <CaseStudyHero content={content} />
        <CaseStudyOverview content={content} />
        <CaseStudyNarrative content={content} />
        <CaseStudyFullBleed image={content.fullBleed} />
        <CaseStudyProcess content={content} />
        {content.film ? <CaseStudyFilm content={content} /> : null}
        {content.reels ? <CaseStudyReels reels={content.reels} /> : null}
        {content.gallery.items.length > 0 ? (
          <CaseStudyGallery content={content} />
        ) : null}
        {content.documents ? <CaseStudyDocuments content={content} /> : null}
        <CaseStudyCredits content={content} />
        <CaseStudyOutro content={content} />
      </main>
    </CaseStudyShell>
  );
}
