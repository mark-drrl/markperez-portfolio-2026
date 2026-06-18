import {
  finalizeCaseStudy,
  markPerezCredits,
  photoToolbox,
} from "./helpers";
import { atmProcessSteps } from "./processSteps";
import type { CaseStudyContent } from "./types";

const base: Omit<CaseStudyContent, "index" | "next"> = {
  slug: "atm",
  client: "ARABIAN",
  product: "Travel Market",
  heroLines: ["ARABIAN", "TRAVEL MARKET"],
  eyebrow: "Event Photography, 2025",
  tagline: "The Middle East's leading travel exhibition, captured with editorial clarity.",
  hero: {
    src: "/atm/A7401490.jpg",
    alt: "Arabian Travel Market event photography",
    position: "50% 35%",
  },
  meta: [
    { label: "Discipline", value: "Photography" },
    { label: "Category", value: "Event" },
    { label: "Subject", value: "Arabian Travel Market" },
    { label: "Year", value: "2025" },
    { label: "Toolkit", value: "Sony A7IV · Sigma · Photoshop · Lightroom" },
  ],
  overview: {
    lead: "Arabian Travel Market brings the global travel industry to Dubai each year. The photography had to move fast without looking rushed.",
    body: [
      "I covered pavilions, speakers, and brand moments with an editorial eye: clean composition, readable faces, and consistent light across a chaotic show floor.",
      "The deliverable is a library brands can use for press, social, and year-round marketing.",
    ],
  },
  concept: {
    label: "Concept",
    heading: "Industry in motion",
    body: [
      "Event work is timing: anticipate the handshake, the panel pause, the walk-through moment before it happens.",
      "I keep the grade neutral and bright so logos, skin tones, and architecture stay truthful.",
    ],
    image: {
      src: "/atm/A7401513.jpg",
      alt: "ATM conference moment",
      aspect: "aspect-[4/5]",
    },
  },
  fullBleed: {
    src: "/atm/A7401526.jpg",
    alt: "Arabian Travel Market wide event frame",
    aspect: "aspect-[16/9]",
  },
  process: {
    label: "Process",
    heading: "From floor to file",
    intro:
      "Fast coverage on the day, overnight select, and next-day delivery for press and social teams.",
    steps: atmProcessSteps,
  },
  gallery: {
    label: "Stills",
    heading: "Selected frames",
    items: [
      { src: "/atm/A7401505.jpg", alt: "ATM exhibition still", aspect: "aspect-[4/5]" },
      { src: "/atm/A7401535.jpg", alt: "ATM brand moment", aspect: "aspect-[4/5]" },
    ],
  },
  toolbox: [...photoToolbox],
  credits: markPerezCredits("Arabian Travel Market"),
};

export const atmCaseStudy = finalizeCaseStudy(base);
