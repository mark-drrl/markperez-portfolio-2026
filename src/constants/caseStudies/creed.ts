import { finalizeCaseStudy } from "./helpers";
import type { CaseStudyContent } from "./types";

const creedBase: Omit<CaseStudyContent, "index" | "next"> = {
  slug: "creed",
  client: "CREED",
  product: "Oud Zarian",
  eyebrow: "Concept Campaign, 2026",
  tagline:
    "A fragrance conjured from the desert, an end-to-end AI visual campaign.",
  hero: {
    src: "/creed/hf_20260606_222605_2180e20d-97b0-40aa-92ec-9f9ad6a60b19 (1).png",
    alt: "Lone figure on a desert dune ridge at golden hour",
    position: "50% 45%",
  },
  meta: [
    { label: "Discipline", value: "AI Art Direction · Visual Production" },
    { label: "Category", value: "Self-Initiated Concept" },
    { label: "Subject", value: "Creed, Oud Zarian" },
    { label: "Year", value: "2026" },
    { label: "Toolkit", value: "ChatGPT Image 2.0 · Kling 3.0 · DaVinci Resolve" },
  ],
  overview: {
    lead: "I set myself a brief: imagine Creed's Oud Zarian as a film, a fragrance born where the desert meets the last light of day, and direct the entire campaign through AI.",
    body: [
      "No studio, no plates, no crew. Just a point of view and a pipeline. The goal was not to prove that AI can make an image, but that it can hold a story. Direction, restraint, and taste still decide whether a frame feels luxurious or generic.",
      "What follows is the concept, the imagery, and the exact process I used to take Oud Zarian from a single prompt to a graded, motion-led campaign.",
    ],
  },
  concept: {
    label: "Concept",
    heading: "A scent born of the desert",
    body: [
      "Oud Zarian is warmth and smoke, so the world had to feel the same. I anchored the campaign in the Empty Quarter at golden hour: endless dunes, a single figure, and the long, slow light that makes everything look carved from amber.",
      "Contrast carries the story. A deep crimson bottle against pale sand. Solitude against scale. Stillness against the wind moving across a ridge. Every frame is built to feel cinematic first and commercial second.",
    ],
    image: {
      src: "/creed/g2.png",
      alt: "Robed figure walking across a mirror-still desert lake at sunset",
      aspect: "aspect-[4/5]",
      position: "50% 50%",
    },
  },
  fullBleed: {
    src: "/creed/g1.png",
    alt: "Aerial view of a lone traveller crossing vast desert dunes",
    aspect: "aspect-[16/9]",
    position: "50% 50%",
  },
  process: {
    label: "Process",
    heading: "From prompt to picture",
    intro:
      "The campaign moved through five deliberate stages. Planning ran through Claude Opus 4.8. Stills were generated from structured JSON prompts. The tools change. The discipline does not: direction at every step.",
    steps: [
      {
        index: "01",
        title: "Direction",
        body: "Before a single image, I used Claude Opus 4.8 to define the world: the emotional arc, the palette, the references, and the rule that every frame must read as a film still.",
        tool: "Claude Opus 4.8",
      },
      {
        index: "02",
        title: "Generation",
        body: "I translated that plan into structured JSON prompts and built the stills frame by frame. Composition, lens, light, and mood were iterated until the frames felt authored rather than sampled.",
        tool: "ChatGPT Image 2.0",
      },
      {
        index: "03",
        title: "Curation",
        body: "Most generations never leave the folder. I kept only the frames where the amber light, the figure placement, and the bottle read as one continuous film still.",
        tool: "Editorial Selection",
      },
      {
        index: "04",
        title: "Motion",
        body: "Key frames were animated into living shots: drifting sand, shifting light, a held breath, to give the campaign its film.",
        tool: "Kling 3.0",
      },
      {
        index: "05",
        title: "Grade",
        body: "A final colour grade unified every frame into one warm, cohesive world and gave the campaign its signature amber signature.",
        tool: "DaVinci Resolve",
      },
    ],
  },
  film: {
    label: "Motion",
    heading: "The film",
    kind: "youtube",
    src: "https://www.youtube.com/embed/-eg0Ka6brwk?rel=0&modestbranding=1",
    caption: "Oud Zarian, concept film. Stills animated and graded in-pipeline.",
  },
  gallery: {
    label: "Stills",
    heading: "Selected frames",
    items: [
      {
        src: "/creed/g3.jpg",
        alt: "Creed Oud Zarian bottle on a desert salt flat at sunset",
        aspect: "aspect-[16/9]",
      },
      {
        src: "/creed/hf_20260606_220629_8d72ccc7-df6a-42cd-83ab-054619808f1d.png",
        alt: "Creed Oud Zarian bottle lit in deep red against black",
        aspect: "aspect-[16/9]",
      },
      {
        src: "/creed/hf_20260607_095146_d261605c-d116-4657-b23b-962699532470.png",
        alt: "Robed figure and the Oud Zarian bottle mirrored on a desert lake",
        aspect: "aspect-[16/9]",
      },
      {
        src: "/creed/hf_20260606_223248_c58ab2cc-a121-42a5-bcd7-bc8940de3b59.png",
        alt: "Vast hazy desert vista with a distant figure at dusk",
        aspect: "aspect-[16/9]",
      },
    ],
  },
  toolbox: [
    "Claude Opus 4.8",
    "ChatGPT Image 2.0",
    "Kling 3.0",
    "DaVinci Resolve",
    "JSON Prompting",
    "AI Image Generation",
    "AI Video Generation",
  ],
  credits: [
    { role: "Art Direction & Production", name: "Mark Perez" },
    { role: "Concept & Story", name: "Mark Perez" },
    { role: "Editing & Colour", name: "Mark Perez" },
    { role: "Brand (Concept Subject)", name: "Creed" },
  ],
};

export const creedCaseStudy = finalizeCaseStudy(creedBase);
