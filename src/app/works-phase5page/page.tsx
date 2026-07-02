import type { Metadata } from "next";
import CaseStudyPage from "@/components/case-study/CaseStudyPage";
import { phase5CaseStudy } from "@/constants/caseStudies/phase5page";

export const metadata: Metadata = {
  title: phase5CaseStudy.client,
  description: phase5CaseStudy.tagline,
  openGraph: {
    images: [{ url: `/og/${phase5CaseStudy.slug}.jpg`, width: 1200, height: 630, alt: phase5CaseStudy.tagline }],
  },
  twitter: {
    images: [`/og/${phase5CaseStudy.slug}.jpg`],
  },
};

export default function WorksPhase5Page() {
  return <CaseStudyPage content={phase5CaseStudy} />;
}
