import {
  finalizeCaseStudy,
  markPerezCredits,
} from "./helpers";
import { interiorProcessSteps } from "./processSteps";
import type { CaseStudyContent } from "./types";

const base: Omit<CaseStudyContent, "index" | "next"> = {
  slug: "interior",
  client: "INTERIOR",
  product: "Spaces",
  eyebrow: "Spatial Photography, 2025",
  tagline: "Interior worlds from cinematic brutalism to curated maximalism, with AI in the workflow.",
  hero: {
    src: "/interior/int-1.png",
    alt: "Interior spatial composition",
    position: "50% 50%",
  },
  meta: [
    { label: "Discipline", value: "Photography · AI Utilization" },
    { label: "Category", value: "Interior" },
    { label: "Subject", value: "Interior" },
    { label: "Year", value: "2025" },
    { label: "Toolkit", value: "Sony A7IV · AI Tools · Adobe Suite" },
  ],
  overview: {
    lead: "Interior photography is spatial storytelling: how light enters, how materials meet, and how a room makes you feel before you step inside.",
    body: [
      "I integrate AI generative tools into the workflow to extend sets, refine atmosphere, and explore stylized narratives from brutalist calm to maximalist warmth.",
      "The discipline stays the same: composition, scale, and a coherent tonal world across every frame.",
    ],
  },
  concept: {
    label: "Concept",
    heading: "Rooms with atmosphere",
    body: [
      "Each space is treated like a set: camera height, lens choice, and shadow placement are deliberate.",
      "AI supports world-building where practical limits would break the mood. Direction still decides what feels real.",
    ],
    image: {
      src: "/interior/int-3.jpg",
      alt: "Interior detail with dramatic light",
      aspect: "aspect-[4/5]",
    },
  },
  fullBleed: {
    src: "/interior/int-2.jpg",
    alt: "Wide interior architectural frame",
    aspect: "aspect-[16/9]",
  },
  process: {
    label: "Process",
    heading: "From space to story",
    intro:
      "Spatial brief, capture or generation, curation, and a unified grade across the set.",
    steps: interiorProcessSteps,
  },
  gallery: {
    label: "Stills",
    heading: "Selected frames",
    items: [
      { src: "/interior/int-4.jpeg", alt: "Interior lifestyle frame", aspect: "aspect-[16/9]" },
      { src: "/interior/int-5.jpeg", alt: "Interior warm light study", aspect: "aspect-[16/9]" },
      { src: "/interior/int-6.png", alt: "Interior maximalist composition", aspect: "aspect-[16/9]" },
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
  credits: markPerezCredits("Interior"),
};

export const interiorCaseStudy = finalizeCaseStudy(base);
