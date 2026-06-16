/** Blur tokens from Figma file cT4UWIN95BcmYKUm4HIt23 */

/** INFINITE SCROLL — top/bottom edge strips (nodes 20:139, 20:137). */
export const FIGMA_WORK_EDGE_FILTER_BLUR_PX = 32;
export const FIGMA_WORK_EDGE_BACKDROP_BLUR_PX = 2;
export const FIGMA_WORK_EDGE_TOP_HEIGHT_VH = 27;
export const FIGMA_WORK_EDGE_BOTTOM_HEIGHT_VH = 29;

/** CURATE — full-screen transition blur (node 15:52). */
export const FIGMA_CURATE_TRANSITION_BACKDROP_BLUR_PX = 16.45;

const FIGMA_GLASS_TINT = "rgba(155, 155, 155, 0.02)";

export const figmaWorkEdgeOuterStyle = {
  filter: `blur(${FIGMA_WORK_EDGE_FILTER_BLUR_PX}px)`,
};

export const figmaWorkEdgeInnerStyle = {
  background: FIGMA_GLASS_TINT,
  backgroundBlendMode: "soft-light" as const,
  mixBlendMode: "soft-light" as const,
  WebkitBackdropFilter: `blur(${FIGMA_WORK_EDGE_BACKDROP_BLUR_PX}px)`,
  backdropFilter: `blur(${FIGMA_WORK_EDGE_BACKDROP_BLUR_PX}px)`,
};

export const figmaCurateTransitionBlurStyle = {
  background: FIGMA_GLASS_TINT,
  mixBlendMode: "soft-light" as const,
  WebkitBackdropFilter: `blur(${FIGMA_CURATE_TRANSITION_BACKDROP_BLUR_PX}px)`,
  backdropFilter: `blur(${FIGMA_CURATE_TRANSITION_BACKDROP_BLUR_PX}px)`,
};
