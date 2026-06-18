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

/** Reset window scroll so short routes do not inherit home-page depth. */
export function resetDocumentScrollTop() {
  if (typeof window === "undefined") {
    return;
  }

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}
