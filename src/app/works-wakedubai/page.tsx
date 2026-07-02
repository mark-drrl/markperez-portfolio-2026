import type { Metadata } from "next";
import CaseStudyPage from "@/components/case-study/CaseStudyPage";
import { wakedubaiCaseStudy } from "@/constants/caseStudies/wakedubai";

export const metadata: Metadata = {
  title: wakedubaiCaseStudy.client,
  description: wakedubaiCaseStudy.tagline,
  openGraph: {
    images: [{ url: `/og/${wakedubaiCaseStudy.slug}.jpg`, width: 1200, height: 630, alt: wakedubaiCaseStudy.tagline }],
  },
  twitter: {
    images: [`/og/${wakedubaiCaseStudy.slug}.jpg`],
  },
};

export default function WorksWakeDubaiPage() {
  return <CaseStudyPage content={wakedubaiCaseStudy} />;
}
