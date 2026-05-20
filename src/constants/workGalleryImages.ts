/**
 * Desktop Curate grid cell → Work gallery index at virtual scroll 0.
 * Matches the three-column Work layout (middle column order differs from a simple 0..n walk).
 */
export const desktopCurateWorkHandoffImageIndices = [
  0, 1, 3, 2, 4, 5, 6,
] as const;

/** Shared gallery paths for Curate (mobile) and Work sections. */
export const workGalleryImages = [
  "/work/portfolio-1.jpg",
  "/work/portfolio-2.png",
  "/work/portfolio-3.jpg",
  "/work/portfolio-4.jpg",
  "/work/portfolio-5.jpg",
  "/work/portfolio-6.jpg",
  "/work/portfolio-7.jpg",
  "/work/portfolio-8.jpg",
  "/work/portfolio-9.jpg",
  "/work/portfolio-10.jpg",
] as const;
