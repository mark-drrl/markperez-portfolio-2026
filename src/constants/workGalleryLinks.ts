/** Work gallery tile → project route. */
export const workGalleryHrefBySrc: Record<string, string> = {
  "/work/portfolio-1.jpg": "/works-centurionv1",
  "/work/portfolio-2.png": "/works-lifestyle",
  "/work/portfolio-3.jpg": "/works-soren",
  "/work/portfolio-4.jpg": "/works-lsb",
  "/work/portfolio-5.jpg": "/works-wakedubai",
  "/work/portfolio-6.jpg": "/works-nautique",
  "/work/portfolio-7.jpg": "/works-interior",
  "/work/portfolio-8.jpg": "/works-atm",
  "/work/portfolio-9.jpg": "/works-phase5page",
  "/work/portfolio-10.jpg": "/works-supreme",
  "/work/portfolio-11.jpg": "/works-creed",
};

export const WORK_CREED_TILE_SRC = "/work/portfolio-11.jpg";

export function getWorkGalleryHref(src: string) {
  return workGalleryHrefBySrc[src] ?? null;
}
