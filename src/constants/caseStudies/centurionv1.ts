import {
  finalizeCaseStudy,
  markPerezCredits,
  photoToolbox,
} from "./helpers";
import { centurionProcessSteps } from "./processSteps";
import type { CaseStudyContent } from "./types";

const base: Omit<CaseStudyContent, "index" | "next"> = {
  slug: "centurionv1",
  client: "CENTURION",
  product: "Boats",
  heroLines: ["CENTURION", "BOATS"],
  eyebrow: "Brand Photography, 2025",
  tagline: "Competition-grade towboats photographed with power, precision, and wake.",
  hero: {
    src: "/centurion-v1/centurionv1-1.jpg",
    alt: "Centurion towboat on open water",
    position: "50% 40%",
  },
  meta: [
    { label: "Discipline", value: "Photography · Art Direction" },
    { label: "Category", value: "Brand Campaign" },
    { label: "Subject", value: "Centurion Boats" },
    { label: "Year", value: "2025" },
    { label: "Toolkit", value: "Sony A7IV · Sigma · Photoshop · Lightroom" },
  ],
  overview: {
    lead: "Centurion builds competition-grade wakes. The imagery had to feel as engineered as the hull: bold, fast, and unmistakably premium.",
    body: [
      "I photographed the fleet across water and shoreline, chasing the moment where spray, light, and line read as pure performance.",
      "Every frame was built to sell the craft of the boat and the culture around it, without losing the editorial restraint that keeps luxury brands credible.",
    ],
  },
  concept: {
    label: "Concept",
    heading: "Power in motion",
    body: [
      "The visual language leaned into contrast: dark hulls against bright sky, sharp wake geometry against calm horizon, detail against scale.",
      "I treated each boat as a sculptural subject, letting form, chrome, and water do the storytelling.",
    ],
    image: {
      src: "/centurion-v1/centurionv1-4.jpg",
      alt: "Centurion boat detail on the water",
      aspect: "aspect-[4/5]",
    },
  },
  fullBleed: {
    src: "/centurion-v1/A7405216.jpg",
    alt: "Centurion boat cutting through water at speed",
    aspect: "aspect-[16/9]",
  },
  process: {
    label: "Process",
    heading: "From brief to frame",
    intro:
      "A straight photography pipeline: brief, shoot, select, retouch, deliver. Speed on set, discipline in post.",
    steps: centurionProcessSteps,
  },
  gallery: {
    label: "Stills",
    heading: "Selected frames",
    items: [
      { src: "/centurion-v1/centurionv1-2.png", alt: "Centurion boat wide composition", aspect: "aspect-[16/9]" },
      { src: "/centurion-v1/centurionv1-5.jpg", alt: "Centurion boat profile on water", aspect: "aspect-[4/5]" },
      { src: "/centurion-v1/A7405191.jpg", alt: "Centurion boat lifestyle frame", aspect: "aspect-[4/5]" },
      { src: "/centurion-v1/A7405248.jpg", alt: "Centurion wake and hull detail", aspect: "aspect-[16/9]" },
    ],
  },
  toolbox: [...photoToolbox],
  credits: markPerezCredits("Centurion Boats"),
};

export const centurionCaseStudy = finalizeCaseStudy(base);
