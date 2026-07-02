import type { Metadata } from "next";
import CaseStudyPage from "@/components/case-study/CaseStudyPage";
import { nautiqueCaseStudy } from "@/constants/caseStudies/nautique";

export const metadata: Metadata = {
  title: nautiqueCaseStudy.client,
  description: nautiqueCaseStudy.tagline,
  openGraph: {
    images: [{ url: `/og/${nautiqueCaseStudy.slug}.jpg`, width: 1200, height: 630, alt: nautiqueCaseStudy.tagline }],
  },
  twitter: {
    images: [`/og/${nautiqueCaseStudy.slug}.jpg`],
  },
};

export default function WorksNautiquePage() {
  return <CaseStudyPage content={nautiqueCaseStudy} />;
}
