import {
  finalizeCaseStudy,
  markPerezCredits,
  photoVideoToolbox,
} from "./helpers";
import { sorenProcessSteps } from "./processSteps";
import type { CaseStudyContent } from "./types";

const base: Omit<CaseStudyContent, "index" | "next"> = {
  slug: "soren",
  client: "SØREN",
  product: "Lyng Hansen",
  heroLines: ["SØREN", "LYNG", "HANSEN"],
  eyebrow: "Portrait & Performance, 2025",
  tagline: "A Danish cellist and conductor photographed between classical rigour and contemporary crossover.",
  hero: {
    src: "/soren/soren-1.jpg",
    alt: "Søren Lyng Hansen portrait",
    position: "50% 30%",
  },
  meta: [
    { label: "Discipline", value: "Photography · Videography" },
    { label: "Category", value: "Artist Portrait" },
    { label: "Subject", value: "Søren Lyng Hansen" },
    { label: "Year", value: "2025" },
    { label: "Toolkit", value: "Sony A7IV · DaVinci Resolve · Adobe Suite" },
  ],
  overview: {
    lead: "Søren Lyng Hansen moves between classical discipline and contemporary expression. The imagery had to hold both: intimate, precise, and alive.",
    body: [
      "I built a portrait set that could shift from stillness to performance, using light and negative space to echo the architecture of his music.",
      "Stills and film work as one campaign: the same tonal world, the same restraint, the same sense of a person mid-thought.",
    ],
  },
  concept: {
    label: "Concept",
    heading: "Between stillness and sound",
    body: [
      "The frames lean on shadow and texture: wood, fabric, breath. Nothing decorative for its own sake.",
      "Every composition leaves room for the music to happen in the viewer's imagination.",
    ],
    image: {
      src: "/soren/soren-4.jpg",
      alt: "Søren Lyng Hansen in performance light",
      aspect: "aspect-[4/5]",
    },
  },
  fullBleed: {
    src: "/soren/soren-8.jpg",
    alt: "Søren Lyng Hansen environmental portrait",
    aspect: "aspect-[16/9]",
  },
  process: {
    label: "Process",
    heading: "From session to story",
    intro:
      "Portrait session, editorial select, retouch, and a film cut that extends the same visual grammar.",
    steps: sorenProcessSteps,
  },
  film: {
    label: "Motion",
    heading: "The film",
    kind: "youtube",
    src: "https://www.youtube.com/embed/wbNUjmtsxc0?list=PLS0Z0CjV9ooEfT1hFJonWVXH8TRElG0PG&rel=0&modestbranding=1",
    caption: "Performance film. Cut and graded in DaVinci Resolve.",
  },
  gallery: {
    label: "Stills",
    heading: "Selected frames",
    items: [
      { src: "/soren/soren-2.jpg", alt: "Søren Lyng Hansen portrait study", aspect: "aspect-[4/5]" },
      { src: "/soren/soren-3.jpg", alt: "Søren Lyng Hansen close portrait", aspect: "aspect-[4/5]" },
      { src: "/soren/soren-5.jpg", alt: "Søren Lyng Hansen editorial frame", aspect: "aspect-[16/9]" },
      { src: "/soren/soren-6.jpg", alt: "Søren Lyng Hansen performance still", aspect: "aspect-[4/5]" },
    ],
  },
  toolbox: [...photoVideoToolbox],
  credits: markPerezCredits("Søren Lyng Hansen"),
};

export const sorenCaseStudy = finalizeCaseStudy(base);
