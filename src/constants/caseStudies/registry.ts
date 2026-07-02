import { atmCaseStudy } from "./atm";
import { centurionCaseStudy } from "./centurionv1";
import { creedCaseStudy } from "./creed";
import { interiorCaseStudy } from "./interior";
import { lifestyleCaseStudy } from "./lifestyle";
import { lsbCaseStudy } from "./lsb";
import { nautiqueCaseStudy } from "./nautique";
import { phase5CaseStudy } from "./phase5page";
import { sorenCaseStudy } from "./soren";
import { supremeCaseStudy } from "./supreme";
import { wakedubaiCaseStudy } from "./wakedubai";
import { caseStudyHref, type CaseStudySlug } from "./helpers";
import type { CaseStudyContent } from "./types";

const caseStudies: CaseStudyContent[] = [
  centurionCaseStudy,
  lifestyleCaseStudy,
  sorenCaseStudy,
  lsbCaseStudy,
  wakedubaiCaseStudy,
  nautiqueCaseStudy,
  interiorCaseStudy,
  atmCaseStudy,
  phase5CaseStudy,
  supremeCaseStudy,
  creedCaseStudy,
];

export const caseStudyByPath = Object.fromEntries(
  caseStudies.map((study) => [
    caseStudyHref(study.slug as CaseStudySlug),
    study,
  ]),
) as Record<string, CaseStudyContent>;

export function getCaseStudyForPath(pathname: string): CaseStudyContent | null {
  return caseStudyByPath[pathname] ?? null;
}
