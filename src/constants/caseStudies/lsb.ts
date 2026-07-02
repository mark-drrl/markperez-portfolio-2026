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
    {
      label: "Discipline",
      value: "Photography · Videography · Graphic Design · Social",
    },
    { label: "Category", value: "Brand Campaign" },
    { label: "Subject", value: "LSB Yacht Charter" },
    { label: "Year", value: "2025" },
    { label: "Toolkit", value: "Sony A7IV · Adobe Suite · DaVinci Resolve" },
  ],
  overview: {
    lead: "LSB Yacht Charter owns and operates one of Dubai's most prestigious fleets. The content had to feel as exclusive as the experience itself.",
    body: [
      "I produced stills and vertical reels across the fleet, building a consistent visual language for web, social, and charter marketing.",
      "Print collateral — company profile and yacht brochures — extends that system into editorial layouts built for the charter deck.",
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
    src: "/lsb/6Q8A8318.jpg",
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
      {
        src: "/lsb/01-MAPS_LSB_SUNDAYTOUR.jpg",
        alt: "LSB Sunday tour route map",
        aspect: "aspect-[2000/1366]",
        fit: "contain",
      },
      {
        src: "/lsb/02-MAPS_LSB_DUBAIWATERCANAL.jpg",
        alt: "LSB Dubai Water Canal map",
        aspect: "aspect-[2000/1366]",
        fit: "contain",
      },
      {
        src: "/lsb/03-MAPS_LSB_MARINA_JUMEIRAH_ARABwSWIMMING.jpg",
        alt: "LSB Marina Jumeirah and Arab Swimming map",
        aspect: "aspect-[2000/1366]",
        fit: "contain",
      },
    ],
  },
  documents: {
    label: "Print",
    heading: "Brand collateral",
    intro:
      "Company profile and yacht brochures — editorial print design for charter marketing and fleet presentation.",
    items: [
      {
        id: "company-profile",
        title: "Company Profile",
        subtitle: "LSB Yacht Charter",
        previewDir: "/lsb/pdf-previews/company-profile",
        coverSrc: "/lsb/pdf-previews/company-profile/cover.webp",
        pageCount: 35,
        aspect: "aspect-[16/10]",
        featured: true,
      },
      {
        id: "benetti-gallus",
        title: "Benetti 115 Gallus",
        subtitle: "Yacht brochure",
        pdfSrc: "/lsb/pdf/benetti-115-gallus.pdf",
        previewDir: "/lsb/pdf-previews/benetti-gallus",
        coverSrc: "/lsb/pdf-previews/benetti-gallus/cover.webp",
        pageCount: 6,
        aspect: "aspect-[3/4]",
      },
      {
        id: "sunseeker-why-not",
        title: "Sunseeker 82 Why Not",
        subtitle: "Yacht brochure",
        pdfSrc: "/lsb/pdf/sunseeker-82-why-not.pdf",
        previewDir: "/lsb/pdf-previews/sunseeker-why-not",
        coverSrc: "/lsb/pdf-previews/sunseeker-why-not/cover.webp",
        pageCount: 6,
        aspect: "aspect-[3/4]",
      },
      {
        id: "azimut-viktoria",
        title: "Azimut 75 Viktoria",
        subtitle: "Yacht brochure",
        pdfSrc: "/lsb/pdf/azimut-75-viktoria.pdf",
        previewDir: "/lsb/pdf-previews/azimut-viktoria",
        coverSrc: "/lsb/pdf-previews/azimut-viktoria/cover.webp",
        pageCount: 6,
        aspect: "aspect-[3/4]",
      },
    ],
  },
  toolbox: [...socialToolbox, "Adobe InDesign"],
  credits: markPerezCredits("LSB Yacht Charter"),
  // Fill in real numbers to activate the Results/Impact section
  // (renders between Process and Reels; hidden while commented out):
  // results: {
  //   label: "Impact",
  //   heading: "What it moved",
  //   intro: "Key metrics from the campaign launch.",
  //   stats: [
  //     { value: "2.4M", label: "Impressions", description: "Across Instagram and TikTok in 30 days" },
  //     { value: "18%", label: "Engagement Rate", description: "3× industry average for luxury travel" },
  //     { value: "340+", label: "Booking Inquiries", description: "Directly attributed to content" },
  //     { value: "6", label: "Vessels Featured", description: "Benetti, Sunseeker, and Azimut fleet" },
  //   ],
  // },
};

export const lsbCaseStudy = finalizeCaseStudy(base);
