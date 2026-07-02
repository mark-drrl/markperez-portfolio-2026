import type { Metadata } from "next";
import CaseStudyPage from "@/components/case-study/CaseStudyPage";
import { interiorCaseStudy } from "@/constants/caseStudies/interior";

export const metadata: Metadata = {
  title: interiorCaseStudy.client,
  description: interiorCaseStudy.tagline,
  openGraph: {
    images: [{ url: `/og/${interiorCaseStudy.slug}.jpg`, width: 1200, height: 630, alt: interiorCaseStudy.tagline }],
  },
  twitter: {
    images: [`/og/${interiorCaseStudy.slug}.jpg`],
  },
};

export default function WorksInteriorPage() {
  return <CaseStudyPage content={interiorCaseStudy} />;
}
