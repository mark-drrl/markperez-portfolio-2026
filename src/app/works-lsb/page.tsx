import type { Metadata } from "next";
import CaseStudyPage from "@/components/case-study/CaseStudyPage";
import { lsbCaseStudy } from "@/constants/caseStudies/lsb";

export const metadata: Metadata = {
  title: lsbCaseStudy.client,
  description: lsbCaseStudy.tagline,
  openGraph: {
    images: [{ url: `/og/${lsbCaseStudy.slug}.jpg`, width: 1200, height: 630, alt: lsbCaseStudy.tagline }],
  },
  twitter: {
    images: [`/og/${lsbCaseStudy.slug}.jpg`],
  },
};

export default function WorksLsbPage() {
  return <CaseStudyPage content={lsbCaseStudy} />;
}
