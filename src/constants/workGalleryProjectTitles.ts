import { WORK_CREED_TILE_SRC } from "@/constants/workGalleryLinks";

/** Hover titles for desktop Work gallery tiles (matches project pages). */
export const workGalleryProjectTitles: Record<string, string> = {
  "/work/portfolio-1.jpg": "Centurion Boats",
  "/work/portfolio-2.png": "Lifestyle",
  "/work/portfolio-3.jpg": "Soren Lyng Hansen",
  "/work/portfolio-4.jpg": "LSB Yacht Charter",
  "/work/portfolio-5.jpg": "Wake Dubai",
  "/work/portfolio-6.jpg": "Super Air Nautique G25",
  "/work/portfolio-7.jpg": "Interior",
  "/work/portfolio-8.jpg": "Arabian Travel Market",
  "/work/portfolio-9.jpg": "Phase 5 Wakesurfing",
  "/work/portfolio-10.jpg": "Supreme Boats",
  [WORK_CREED_TILE_SRC]: "Creed",
};

export function workGalleryProjectTitle(src: string) {
  return workGalleryProjectTitles[src] ?? null;
}
