import type { Metadata } from "next";
import CaseStudyPage from "@/components/case-study/CaseStudyPage";
import { centurionCaseStudy } from "@/constants/caseStudies/centurionv1";

export const metadata: Metadata = {
  title: centurionCaseStudy.client,
  description: centurionCaseStudy.tagline,
  openGraph: {
    images: [{ url: `/og/${centurionCaseStudy.slug}.jpg`, width: 1200, height: 630, alt: centurionCaseStudy.tagline }],
  },
  twitter: {
    images: [`/og/${centurionCaseStudy.slug}.jpg`],
  },
};

export default function WorksCenturionV1Page() {
  return <CaseStudyPage content={centurionCaseStudy} />;
}
