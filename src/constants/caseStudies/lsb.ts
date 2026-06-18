import {
  finalizeCaseStudy,
  markPerezCredits,
  socialToolbox,
} from "./helpers";
import { lsbProcessSteps } from "./processSteps";
import type { CaseStudyContent } from "./types";

const base: Omit<CaseStudyContent, "index" | "next"> = {
  slug: "lsb",
  client: "LSB",
  product: "Yacht Charter",
  heroLines: ["LSB YACHT", "CHARTER"],
  eyebrow: "Brand Content, 2025",
  tagline: "Luxury yacht charter content for Dubai's elite Benetti, Sunseeker, and Azimut fleet.",
  hero: {
    src: "/lsb/lsb-1.jpg",
    alt: "LSB luxury yacht on Dubai waters",
    position: "50% 45%",
  },
  meta: [
    { label: "Discipline", value: "Photography · Videography · Social" },
    { label: "Category", value: "Brand Campaign" },
    { label: "Subject", value: "LSB Yacht Charter" },
    { label: "Year", value: "2025" },
    { label: "Toolkit", value: "Sony A7IV · DaVinci Resolve · Social" },
  ],
  overview: {
    lead: "LSB Yacht Charter owns and operates one of Dubai's most prestigious fleets. The content had to feel as exclusive as the experience itself.",
    body: [
      "I produced stills and vertical reels across the fleet, building a consistent visual language for web, social, and charter marketing.",
      "Every frame balances aspiration with credibility: real boats, real light, real scale on the water.",
    ],
  },
  concept: {
    label: "Concept",
    heading: "Luxury at sea level",
    body: [
      "The campaign leans into golden-hour water, clean lines, and the quiet confidence of a crew that does not need to shout.",
      "Reels extend the stills into motion native to Instagram: vertical, immediate, and polished without feeling over-produced.",
    ],
    image: {
      src: "/lsb/lsb-2.png",
      alt: "LSB wide Instagram campaign banner",
      aspect: "aspect-[1399/616]",
      fit: "contain",
    },
  },
  fullBleed: {
    src: "/lsb/lsb-7.jpg",
    alt: "LSB yacht lifestyle frame on Dubai waters",
    aspect: "aspect-[16/9]",
    position: "50% 35%",
  },
  process: {
    label: "Process",
    heading: "From charter to content",
    intro:
      "On-water production, editorial select, grade, and social-ready delivery across stills and reels.",
    steps: lsbProcessSteps,
  },
  reels: {
    label: "Motion",
    heading: "Reels",
    items: [
      { src: "/lsb/VALENTINES.mp4", alt: "LSB Valentines reel", aspect: "aspect-[9/16]" },
      { src: "/lsb/COMMERCIAL_IVwVO.mp4", alt: "LSB commercial reel", aspect: "aspect-[9/16]" },
      { src: "/lsb/lsb-7.mp4", alt: "LSB yacht reel", aspect: "aspect-[9/16]" },
      { src: "/lsb/lsb-8.mp4", alt: "LSB charter reel", aspect: "aspect-[9/16]" },
      { src: "/lsb/lsb-9.mp4", alt: "LSB fleet reel", aspect: "aspect-[9/16]" },
      { src: "/lsb/lsb-10.mp4", alt: "LSB lifestyle reel", aspect: "aspect-[9/16]" },
    ],
  },
  gallery: {
    label: "Social",
    heading: "Campaign grids",
    mode: "branding",
    items: [
      {
        src: "/lsb/lsb-2.png",
        alt: "LSB Instagram grid, fleet showcase",
        aspect: "aspect-[1399/616]",
        fit: "contain",
      },
      {
        src: "/lsb/lsb-3.png",
        alt: "LSB Instagram grid, charter campaign",
        aspect: "aspect-[3/4]",
        fit: "contain",
      },
      {
        src: "/lsb/lsb-4.png",
        alt: "LSB nine-tile Instagram feed grid",
        aspect: "aspect-[3/4]",
        fit: "contain",
      },
      {
        src: "/lsb/lsb-5.png",
        alt: "LSB social campaign grid layout",
        aspect: "aspect-[3/4]",
        fit: "contain",
      },
      {
        src: "/lsb/lsb-6.png",
        alt: "LSB branded social grid",
        aspect: "aspect-[3/4]",
        fit: "contain",
      },
    ],
  },
  toolbox: [...socialToolbox],
  credits: markPerezCredits("LSB Yacht Charter"),
};

export const lsbCaseStudy = finalizeCaseStudy(base);
