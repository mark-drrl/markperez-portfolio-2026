import type { Metadata } from "next";
import CaseStudyPage from "@/components/case-study/CaseStudyPage";
import { supremeCaseStudy } from "@/constants/caseStudies/supreme";

export const metadata: Metadata = {
  title: supremeCaseStudy.client,
  description: supremeCaseStudy.tagline,
  openGraph: {
    images: [{ url: `/og/${supremeCaseStudy.slug}.jpg`, width: 1200, height: 630, alt: supremeCaseStudy.tagline }],
  },
  twitter: {
    images: [`/og/${supremeCaseStudy.slug}.jpg`],
  },
};

export default function WorksSupremePage() {
  return <CaseStudyPage content={supremeCaseStudy} />;
}
