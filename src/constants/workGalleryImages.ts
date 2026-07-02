/** Shared gallery paths for Curate (mobile) and Work sections. */
export const workGalleryImages = [
  "/work/portfolio-3.jpg",
  "/work/portfolio-2.png",
  "/work/portfolio-4.jpg",
  "/work/portfolio-1.jpg",
  "/work/portfolio-5.jpg",
  "/work/portfolio-11.jpg",
  "/work/portfolio-7.jpg",
  "/work/portfolio-8.jpg",
  "/work/portfolio-9.jpg",
  "/work/portfolio-10.jpg",
  "/work/portfolio-6.jpg",
] as const;

/**
 * Derives a WebP srcSet from a work gallery image path.
 * e.g. "/work/portfolio-3.jpg" →
 *   "/work/resized/portfolio-3-400w.webp 400w,
 *    /work/resized/portfolio-3-800w.webp 800w,
 *    /work/resized/portfolio-3-1600w.webp 1600w"
 * Returns undefined for paths that don't match the /work/portfolio-N pattern.
 */
export function workGallerySrcSet(src: string): string | undefined {
  const match = src.match(/\/work\/(portfolio-\d+)\.(jpg|png|webp)$/i);
  if (!match) return undefined;
  const base = match[1];
  return [
    `/work/resized/${base}-400w.webp 400w`,
    `/work/resized/${base}-800w.webp 800w`,
    `/work/resized/${base}-1600w.webp 1600w`,
  ].join(", ");
}
