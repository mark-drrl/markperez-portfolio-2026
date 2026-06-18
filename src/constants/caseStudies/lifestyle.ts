import {
  finalizeCaseStudy,
  markPerezCredits,
} from "./helpers";
import { lifestyleProcessSteps } from "./processSteps";
import type { CaseStudyContent } from "./types";

const base: Omit<CaseStudyContent, "index" | "next"> = {
  slug: "lifestyle",
  client: "LIFE",
  product: "STYLE",
  heroLines: ["LIFE", "STYLE"],
  eyebrow: "Editorial Photography, 2025",
  tagline: "Authentic storytelling with cinematic editorial light and AI refinement.",
  hero: {
    src: "/lifestyle/main.png",
    alt: "Lifestyle editorial portrait",
    position: "50% 35%",
  },
  meta: [
    { label: "Discipline", value: "Photography · AI Utilization" },
    { label: "Category", value: "Editorial" },
    { label: "Subject", value: "Lifestyle" },
    { label: "Year", value: "2025" },
    { label: "Toolkit", value: "Sony A7IV · Sigma · Photoshop · Lightroom" },
  ],
  overview: {
    lead: "Lifestyle work is about believable worlds: light that feels found, people that feel real, and frames that still read as elevated.",
    body: [
      "I blend high-resolution capture with selective AI utilization to extend sets, refine atmosphere, and keep the narrative cohesive across campaigns.",
      "The goal is never to overpower the subject. It is to build a visual language brands can live inside.",
    ],
  },
  concept: {
    label: "Concept",
    heading: "Cinematic everyday",
    body: [
      "Each shoot starts with mood before wardrobe: what time of day is this, what is the air temperature, what is the story one frame before this one.",
      "AI enters as a refinement layer, not a replacement for direction. Taste still decides whether a frame feels luxurious or generic.",
    ],
    image: {
      src: "/lifestyle/A7403986.jpg",
      alt: "Editorial lifestyle portrait in natural light",
      aspect: "aspect-[4/5]",
    },
  },
  fullBleed: {
    src: "/lifestyle/VALENTINES.jpg",
    alt: "Lifestyle campaign frame with warm editorial light",
    aspect: "aspect-[16/9]",
  },
  process: {
    label: "Process",
    heading: "From mood to frame",
    intro:
      "Capture first, then refine. AI supports the world-building; direction and curation keep it human.",
    steps: lifestyleProcessSteps,
  },
  gallery: {
    label: "Stills",
    heading: "Selected frames",
    items: [
      { src: "/lifestyle/1.jpg", alt: "Lifestyle editorial still", aspect: "aspect-[4/5]" },
      { src: "/lifestyle/A7404010.jpg", alt: "Lifestyle portrait in soft light", aspect: "aspect-[4/5]" },
      { src: "/lifestyle/RAMADAN.jpg", alt: "Seasonal lifestyle campaign frame", aspect: "aspect-[4/5]" },
    ],
  },
  toolbox: [
    "Sony A7IV",
    "Sigma Lenses",
    "Adobe Photoshop",
    "Adobe Lightroom",
    "AI Utilization",
    "Photography",
  ],
  credits: markPerezCredits("Lifestyle"),
};

export const lifestyleCaseStudy = finalizeCaseStudy(base);
