/** Pauses CaseStudyShell Lenis while the document lookbook viewer is open. */

export const CASE_STUDY_VIEWER_OPEN_EVENT = "case-study-viewer-open";
export const CASE_STUDY_VIEWER_CLOSE_EVENT = "case-study-viewer-close";

export function notifyCaseStudyViewerOpen() {
  window.dispatchEvent(new Event(CASE_STUDY_VIEWER_OPEN_EVENT));
}

export function notifyCaseStudyViewerClose() {
  window.dispatchEvent(new Event(CASE_STUDY_VIEWER_CLOSE_EVENT));
}
