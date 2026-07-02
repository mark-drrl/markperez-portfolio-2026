import type { Metadata } from "next";
import CaseStudyPage from "@/components/case-study/CaseStudyPage";
import { lifestyleCaseStudy } from "@/constants/caseStudies/lifestyle";

export const metadata: Metadata = {
  title: lifestyleCaseStudy.client,
  description: lifestyleCaseStudy.tagline,
  openGraph: {
    images: [{ url: `/og/${lifestyleCaseStudy.slug}.jpg`, width: 1200, height: 630, alt: lifestyleCaseStudy.tagline }],
  },
  twitter: {
    images: [`/og/${lifestyleCaseStudy.slug}.jpg`],
  },
};

export default function WorksLifestylePage() {
  return <CaseStudyPage content={lifestyleCaseStudy} />;
}
