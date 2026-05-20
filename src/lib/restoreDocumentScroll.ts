/** Undo Lenis / home scroll locks so project pages can scroll normally. */
export function restoreNativeDocumentScroll() {
  if (typeof document === "undefined") {
    return;
  }

  const { documentElement: html, body } = document;

  html.classList.remove("lenis", "lenis-smooth", "lenis-scrolling");
  body.classList.remove("lenis", "lenis-smooth", "lenis-scrolling");

  html.style.removeProperty("overflow");
  html.style.removeProperty("height");
  body.style.removeProperty("overflow");
  body.style.removeProperty("height");
  body.style.removeProperty("position");
}
