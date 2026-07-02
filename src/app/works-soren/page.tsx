import type { Metadata } from "next";
import CaseStudyPage from "@/components/case-study/CaseStudyPage";
import { sorenCaseStudy } from "@/constants/caseStudies/soren";

export const metadata: Metadata = {
  title: sorenCaseStudy.client,
  description: sorenCaseStudy.tagline,
  openGraph: {
    images: [{ url: `/og/${sorenCaseStudy.slug}.jpg`, width: 1200, height: 630, alt: sorenCaseStudy.tagline }],
  },
  twitter: {
    images: [`/og/${sorenCaseStudy.slug}.jpg`],
  },
};

export default function WorksSorenPage() {
  return <CaseStudyPage content={sorenCaseStudy} />;
}
