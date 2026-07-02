import { WORK_CREED_TILE_SRC } from "@/constants/workGalleryLinks";

export interface WorkGalleryProject {
  title: string;
  discipline: string;
  year: string;
}

/**
 * Per-tile metadata for the Work gallery.
 * Sourced from each project's case-study data module.
 * Disciplines are condensed to 2–4 words for tile display.
 */
export const workGalleryProjects: Record<string, WorkGalleryProject> = {
  "/work/portfolio-1.jpg": {
    title: "Centurion Boats",
    discipline: "Photo · Art Direction",
    year: "2025",
  },
  "/work/portfolio-2.png": {
    title: "Lifestyle",
    discipline: "Photo · AI Utilization",
    year: "2025",
  },
  "/work/portfolio-3.jpg": {
    title: "Soren Lyng Hansen",
    discipline: "Photo · Videography",
    year: "2025",
  },
  "/work/portfolio-4.jpg": {
    title: "LSB Yacht Charter",
    discipline: "Photo · Video · Social",
    year: "2025",
  },
  "/work/portfolio-5.jpg": {
    title: "Wake Dubai",
    discipline: "Photo · Video · Social",
    year: "2025",
  },
  "/work/portfolio-6.jpg": {
    title: "Super Air Nautique G25",
    discipline: "Photo · Videography",
    year: "2025",
  },
  "/work/portfolio-7.jpg": {
    title: "Interior",
    discipline: "Photo · AI Utilization",
    year: "2025",
  },
  "/work/portfolio-8.jpg": {
    title: "Arabian Travel Market",
    discipline: "Photography",
    year: "2025",
  },
  "/work/portfolio-9.jpg": {
    title: "Phase 5 Wakesurfing",
    discipline: "Videography",
    year: "2025",
  },
  "/work/portfolio-10.jpg": {
    title: "Supreme Boats",
    discipline: "Photography",
    year: "2025",
  },
  [WORK_CREED_TILE_SRC]: {
    title: "Creed",
    discipline: "AI Art Direction",
    year: "2026",
  },
};

export function getWorkGalleryProject(src: string): WorkGalleryProject | null {
  return workGalleryProjects[src] ?? null;
}
