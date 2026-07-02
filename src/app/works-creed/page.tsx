import type { Metadata } from "next";
import CaseStudyPage from "@/components/case-study/CaseStudyPage";
import { creedCaseStudy } from "@/constants/caseStudies/creed";

export const metadata: Metadata = {
  title: creedCaseStudy.client,
  description: creedCaseStudy.tagline,
  openGraph: {
    images: [{ url: `/og/${creedCaseStudy.slug}.jpg`, width: 1200, height: 630, alt: creedCaseStudy.tagline }],
  },
  twitter: {
    images: [`/og/${creedCaseStudy.slug}.jpg`],
  },
};

export default function WorksCreedPage() {
  return <CaseStudyPage content={creedCaseStudy} />;
}
