import type {
  CaseStudyContent,
  CaseStudyCredit,
} from "./types";

export const CASE_STUDY_ORDER = [
  "centurionv1",
  "lifestyle",
  "soren",
  "lsb",
  "wakedubai",
  "nautique",
  "interior",
  "atm",
  "phase5page",
  "supreme",
  "creed",
] as const;

export type CaseStudySlug = (typeof CASE_STUDY_ORDER)[number];

export const CASE_STUDY_TITLES: Record<CaseStudySlug, string> = {
  centurionv1: "Centurion Boats",
  lifestyle: "Lifestyle",
  soren: "Søren Lyng Hansen",
  lsb: "LSB Yacht Charter",
  wakedubai: "Wake Dubai",
  nautique: "Super Air Nautique G25",
  interior: "Interior",
  atm: "Arabian Travel Market",
  phase5page: "Phase 5 Wakesurfing",
  supreme: "Supreme Boats",
  creed: "CREED",
};

export function caseStudyHref(slug: CaseStudySlug) {
  return `/works-${slug}`;
}

export function nextCaseStudyFor(slug: CaseStudySlug) {
  const index = CASE_STUDY_ORDER.indexOf(slug);
  const nextSlug = CASE_STUDY_ORDER[(index + 1) % CASE_STUDY_ORDER.length];
  return { slug: nextSlug, href: caseStudyHref(nextSlug) };
}

export const NEXT_LABEL = "Next Project";

export function markPerezCredits(clientName: string): CaseStudyCredit[] {
  return [
    { role: "Photography & Production", name: "Mark Perez" },
    { role: "Art Direction", name: "Mark Perez" },
    { role: "Editing & Colour", name: "Mark Perez" },
    { role: "Client", name: clientName },
  ];
}

export const photoToolbox = [
  "Sony A7IV",
  "Sigma Lenses",
  "Adobe Photoshop",
  "Adobe Lightroom",
  "Photography",
] as const;

export const photoVideoToolbox = [
  ...photoToolbox,
  "Videography",
  "DaVinci Resolve",
] as const;

export const socialToolbox = [
  ...photoVideoToolbox,
  "Social Media Management",
] as const;

export function finalizeCaseStudy(
  content: Omit<CaseStudyContent, "index" | "next">,
): CaseStudyContent {
  const slug = content.slug as CaseStudySlug;
  const orderIndex = CASE_STUDY_ORDER.indexOf(slug);
  const next = nextCaseStudyFor(slug);

  return {
    ...content,
    index: String(orderIndex + 1).padStart(2, "0"),
    next: {
      label: NEXT_LABEL,
      title: CASE_STUDY_TITLES[next.slug],
      href: next.href,
    },
  };
}
