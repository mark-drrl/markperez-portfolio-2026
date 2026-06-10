/** Normalize work gallery item wrappers — fit image height, no crop, tighter snap rhythm. */
export function normalizeGalleryItemClass(
  className: string,
  index: number,
  total: number,
) {
  let normalized = className.replace(/\baspect-[^\s]+/g, "");
  normalized = normalized.replace(/\b-mt-[^\s]+/g, "");

  if (index === 0) {
    normalized = normalized
      .replace(/\bmt-[^\s]+/g, "")
      .replace(/\bmy-(\[[^\]]+\]|[^\s]+)/g, "mb-$1");
  }

  if (index === total - 1) {
    normalized = normalized.replace(/\bmb-[^\s]+/g, "");
  }

  return normalized.replace(/\s+/g, " ").trim();
}

export const galleryNaturalImageClassName =
  "block h-auto w-full max-h-[62vh] object-contain";

/** Video / iframe tiles keep authored aspect boxes. */
export function isGalleryAspectItem(className: string) {
  return /\baspect-/.test(className);
}
