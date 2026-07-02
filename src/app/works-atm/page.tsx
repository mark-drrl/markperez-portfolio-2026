import type { Metadata } from "next";
import CaseStudyPage from "@/components/case-study/CaseStudyPage";
import { atmCaseStudy } from "@/constants/caseStudies/atm";

export const metadata: Metadata = {
  title: atmCaseStudy.client,
  description: atmCaseStudy.tagline,
  openGraph: {
    images: [{ url: `/og/${atmCaseStudy.slug}.jpg`, width: 1200, height: 630, alt: atmCaseStudy.tagline }],
  },
  twitter: {
    images: [`/og/${atmCaseStudy.slug}.jpg`],
  },
};

export default function WorksAtmPage() {
  return <CaseStudyPage content={atmCaseStudy} />;
}
