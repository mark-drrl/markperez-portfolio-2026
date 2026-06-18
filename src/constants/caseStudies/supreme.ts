import {
  finalizeCaseStudy,
  markPerezCredits,
  photoToolbox,
} from "./helpers";
import { supremeProcessSteps } from "./processSteps";
import type { CaseStudyContent } from "./types";

const base: Omit<CaseStudyContent, "index" | "next"> = {
  slug: "supreme",
  client: "SUPREME",
  product: "Boats",
  heroLines: ["SUPREME", "BOATS"],
  eyebrow: "Product Photography, 2025",
  tagline: "High-performance towboats with value-driven design, shot with clean American confidence.",
  hero: {
    src: "/supreme/supreme.jpg",
    alt: "Supreme towboat hero frame",
    position: "50% 40%",
  },
  meta: [
    { label: "Discipline", value: "Photography" },
    { label: "Category", value: "Product Campaign" },
    { label: "Subject", value: "Supreme Boats" },
    { label: "Year", value: "2025" },
    { label: "Toolkit", value: "Sony A7IV · Sigma · Photoshop · Lightroom" },
  ],
  overview: {
    lead: "Supreme Boats sits under Correct Craft with a clear promise: serious performance without the premium price theatre.",
    body: [
      "I photographed the lineup to feel approachable and engineered: honest light, readable details, and frames that work for dealers and riders alike.",
      "The set spans hero boat angles, lifestyle contexts, and graphic-ready crops for web and print.",
    ],
  },
  concept: {
    label: "Concept",
    heading: "Performance, plainly stated",
    body: [
      "No overwrought styling. The boats are the hero, the wake is the proof, and the grade stays bright and trustworthy.",
      "Composition favours clarity over drama so product specs and hull lines stay legible.",
    ],
    image: {
      src: "/supreme/supreme-2.jpg",
      alt: "Supreme boat on open water",
      aspect: "aspect-[4/5]",
    },
  },
  fullBleed: {
    src: "/supreme/supreme-3.png",
    alt: "Supreme boat wide campaign graphic",
    aspect: "aspect-[16/9]",
  },
  process: {
    label: "Process",
    heading: "From lineup to library",
    intro:
      "Efficient on-water production, dealer-ready selects, and consistent retouch across the full set.",
    steps: supremeProcessSteps,
  },
  gallery: {
    label: "Stills",
    heading: "Selected frames",
    items: [
      { src: "/supreme/supreme-1.jpg", alt: "Supreme boat profile", aspect: "aspect-[4/5]" },
      { src: "/supreme/supreme-4.png", alt: "Supreme campaign composition", aspect: "aspect-[16/9]" },
      { src: "/supreme/supreme-5.jpg", alt: "Supreme boat lifestyle frame", aspect: "aspect-[4/5]" },
      { src: "/supreme/supreme-6.jpg", alt: "Supreme detail study", aspect: "aspect-[4/5]" },
    ],
  },
  toolbox: [...photoToolbox],
  credits: markPerezCredits("Supreme Boats"),
};

export const supremeCaseStudy = finalizeCaseStudy(base);
