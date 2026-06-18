import {
  finalizeCaseStudy,
  markPerezCredits,
  socialToolbox,
} from "./helpers";
import { wakedubaiProcessSteps } from "./processSteps";
import type { CaseStudyContent } from "./types";

const base: Omit<CaseStudyContent, "index" | "next"> = {
  slug: "wakedubai",
  client: "WAKE",
  product: "Dubai",
  heroLines: ["WAKE", "DUBAI"],
  eyebrow: "Brand Content, 2025",
  tagline: "Premier wakeboarding and wakesurfing content across Dubai's iconic harbors.",
  hero: {
    src: "/wakedubai/wdp-1.jpg",
    alt: "Wake Dubai athlete on the water",
    position: "50% 40%",
  },
  meta: [
    { label: "Discipline", value: "Photography · Videography · Social" },
    { label: "Category", value: "Brand Campaign" },
    { label: "Subject", value: "Wake Dubai" },
    { label: "Year", value: "2025" },
    { label: "Toolkit", value: "Sony A7IV · DaVinci Resolve · Social" },
  ],
  overview: {
    lead: "Wake Dubai runs luxury towboat experiences across the UAE. The content needed to feel fast, sun-soaked, and unmistakably Dubai.",
    body: [
      "I produced a large still library and vertical reel suite covering athletes, boats, skyline backdrops, and campaign graphics.",
      "The visual system had to work at thumbnail scale and full-bleed: bold colour, clean type, and motion that sells the ride.",
    ],
  },
  concept: {
    label: "Concept",
    heading: "Ride the skyline",
    body: [
      "Water, wake, and city edge became the triangle: every frame ties the sport to place.",
      "Campaign graphics sit inside the same warm palette as the photography so social tiles feel continuous, not pasted on.",
    ],
    image: {
      src: "/wakedubai/WAKESUNSET%20(1).jpg",
      alt: "Wake Dubai sunset session on the water",
      aspect: "aspect-[4/5]",
    },
  },
  fullBleed: {
    src: "/wakedubai/A7406243-Edit.jpg",
    alt: "Wake Dubai athlete in action",
    aspect: "aspect-[16/9]",
  },
  process: {
    label: "Process",
    heading: "From shoot to social",
    intro:
      "High-volume on-water production, fast select, grade, and delivery tuned for social cadence.",
    steps: wakedubaiProcessSteps,
  },
  reels: {
    label: "Motion",
    heading: "Reels",
    items: [
      { src: "/wakedubai/wd-1.mp4", alt: "Wake Dubai reel 1", aspect: "aspect-[9/16]" },
      { src: "/wakedubai/wd-2.mp4", alt: "Wake Dubai reel 2", aspect: "aspect-[9/16]" },
      { src: "/wakedubai/wd-3.mp4", alt: "Wake Dubai reel 3", aspect: "aspect-[9/16]" },
      { src: "/wakedubai/wd-4.mp4", alt: "Wake Dubai reel 4", aspect: "aspect-[9/16]" },
      { src: "/wakedubai/wd-5.mp4", alt: "Wake Dubai reel 5", aspect: "aspect-[9/16]" },
      { src: "/wakedubai/wd-6.mp4", alt: "Wake Dubai reel 6", aspect: "aspect-[9/16]" },
    ],
  },
  gallery: {
    label: "Social",
    heading: "Campaign grids",
    mode: "branding",
    items: [
      {
        src: "/wakedubai/wdp-2.png",
        alt: "Wake Dubai wide Instagram banner grid",
        aspect: "aspect-[1662/731]",
        fit: "contain",
      },
      {
        src: "/wakedubai/wdp-3.png",
        alt: "Wake Dubai campaign banner grid",
        aspect: "aspect-[1663/732]",
        fit: "contain",
      },
      {
        src: "/wakedubai/wdp-4.png",
        alt: "Wake Dubai social banner layout",
        aspect: "aspect-[1661/685]",
        fit: "contain",
      },
      {
        src: "/wakedubai/wdp-5.png",
        alt: "Wake Dubai portrait campaign tile",
        aspect: "aspect-[3/4]",
        fit: "contain",
      },
      {
        src: "/wakedubai/wdp-6.png",
        alt: "Wake Dubai portrait social tile",
        aspect: "aspect-[3/4]",
        fit: "contain",
      },
      {
        src: "/wakedubai/wdp-7.png",
        alt: "Wake Dubai branded portrait tile",
        aspect: "aspect-[3/4]",
        fit: "contain",
      },
      {
        src: "/wakedubai/ISD.jpg",
        alt: "Wake Dubai Independence Day campaign",
        aspect: "aspect-[4/5]",
        fit: "contain",
      },
      {
        src: "/wakedubai/NTLDAY.jpg",
        alt: "Wake Dubai National Day campaign",
        aspect: "aspect-[4/5]",
        fit: "contain",
      },
    ],
  },
  toolbox: [...socialToolbox],
  credits: markPerezCredits("Wake Dubai"),
};

export const wakedubaiCaseStudy = finalizeCaseStudy(base);
