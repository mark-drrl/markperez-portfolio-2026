import {
  finalizeCaseStudy,
  markPerezCredits,
} from "./helpers";
import { phase5ProcessSteps } from "./processSteps";
import type { CaseStudyContent } from "./types";

const base: Omit<CaseStudyContent, "index" | "next"> = {
  slug: "phase5page",
  client: "PHASE 5",
  product: "Wakesurfing",
  heroLines: ["PHASE 5", "WAKESURFING"],
  eyebrow: "Product Film, 2025",
  tagline: "Competition-grade wakesurf boards, filmed with speed and precision.",
  hero: {
    src: "/work/portfolio-9.jpg",
    alt: "Phase 5 wakesurfing campaign",
    position: "50% 50%",
  },
  meta: [
    { label: "Discipline", value: "Videography" },
    { label: "Category", value: "Product Film" },
    { label: "Subject", value: "Phase 5 Wakesurfing" },
    { label: "Year", value: "2025" },
    { label: "Toolkit", value: "Sony A7IV · DaVinci Resolve" },
  ],
  overview: {
    lead: "Phase 5 handcrafts elite wakesurf boards for competitive riders. The film had to feel as fast and technical as the product.",
    body: [
      "I directed and shot a vertical hero reel focused on board detail, rider motion, and the snap of a competition-grade wave.",
      "The edit stays tight: no filler, just product, performance, and brand mark.",
    ],
  },
  concept: {
    label: "Concept",
    heading: "Built for the podium",
    body: [
      "Carbon fiber, skim lines, and spray. The visual language is athletic and minimal.",
      "Every cut is timed to sell craft and speed in under a minute.",
    ],
    image: {
      src: "/work/portfolio-9.jpg",
      alt: "Phase 5 product film still",
      aspect: "aspect-[4/5]",
    },
  },
  fullBleed: {
    src: "/work/portfolio-9.jpg",
    alt: "Phase 5 wakesurf action frame",
    aspect: "aspect-[16/9]",
  },
  process: {
    label: "Process",
    heading: "From board to reel",
    intro:
      "Tight shoot day on the water, fast assembly, grade, and delivery for social launch.",
    steps: phase5ProcessSteps,
  },
  film: {
    label: "Motion",
    heading: "The reel",
    kind: "local",
    src: "/sashimi/REEL 1_SASHIMI.mp4",
    aspect: "aspect-[9/16]",
    caption: "Phase 5 hero reel. Shot on Sony A7IV, graded in DaVinci Resolve.",
  },
  gallery: {
    label: "Stills",
    heading: "Selected frames",
    items: [],
  },
  toolbox: ["Sony A7IV", "Sigma Lenses", "DaVinci Resolve", "Videography"],
  credits: markPerezCredits("Phase 5 Wakesurfing"),
};

export const phase5CaseStudy = finalizeCaseStudy(base);
