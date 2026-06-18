import {
  finalizeCaseStudy,
  markPerezCredits,
  photoVideoToolbox,
} from "./helpers";
import { nautiqueProcessSteps } from "./processSteps";
import type { CaseStudyContent } from "./types";

const base: Omit<CaseStudyContent, "index" | "next"> = {
  slug: "nautique",
  client: "SUPER AIR",
  product: "Nautique G25",
  heroLines: ["SUPER AIR", "NAUTIQUE G25"],
  eyebrow: "Product Photography, 2025",
  tagline: "Elite towboat imagery built for Nautique's Super Air G25 lineup.",
  hero: {
    src: "/nautique/nautique-1.jpg",
    alt: "Super Air Nautique G25 on the water",
    position: "50% 45%",
  },
  meta: [
    { label: "Discipline", value: "Photography · Videography" },
    { label: "Category", value: "Product Campaign" },
    { label: "Subject", value: "Super Air Nautique G25" },
    { label: "Year", value: "2025" },
    { label: "Toolkit", value: "Sony A7IV · DaVinci Resolve · Adobe Suite" },
  ],
  overview: {
    lead: "The Super Air Nautique G25 is engineered for serious tow sports. The imagery had to communicate craft, speed, and premium American build.",
    body: [
      "I photographed the boat across hero angles, lifestyle contexts, and detail frames that sell the interior and hull design.",
      "A hero film extends the campaign into motion, keeping the same grade and pacing as the still set.",
    ],
  },
  concept: {
    label: "Concept",
    heading: "Engineered for the wake",
    body: [
      "Clean lines, chrome highlights, and wake geometry carry the story. No clutter, no gimmicks.",
      "The grade stays cool and crisp so the product reads premium on every screen size.",
    ],
    image: {
      src: "/nautique/nautique-2.jpg",
      alt: "Nautique G25 profile on water",
      aspect: "aspect-[4/5]",
    },
  },
  fullBleed: {
    src: "/nautique/nautique-4.png",
    alt: "Nautique G25 wide campaign frame",
    aspect: "aspect-[16/9]",
  },
  process: {
    label: "Process",
    heading: "From hull to hero",
    intro:
      "Product shoot on water, tight select, retouch, and a hero film graded to match the stills.",
    steps: nautiqueProcessSteps,
  },
  film: {
    label: "Motion",
    heading: "The film",
    kind: "local",
    src: "/nautique/nautique-3.mp4",
    caption: "Super Air Nautique G25 hero film. Graded in DaVinci Resolve.",
  },
  gallery: {
    label: "Stills",
    heading: "Selected frames",
    items: [
      { src: "/nautique/nautique-5.png", alt: "Nautique G25 detail frame", aspect: "aspect-[4/5]" },
    ],
  },
  toolbox: [...photoVideoToolbox],
  credits: markPerezCredits("Nautique Boat Company"),
};

export const nautiqueCaseStudy = finalizeCaseStudy(base);
