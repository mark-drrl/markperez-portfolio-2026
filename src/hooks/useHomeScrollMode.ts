import { useLayoutEffect, useState } from "react";

export type HomeScrollMode = "mobile" | "desktop";

/**
 * Scroll mode must match which section tree is rendered in page.tsx.
 * - Server + pre-hydration: always desktop (matches SSR).
 * - After mount: mobile when useMobileHomeLite() is true.
 *
 * Do NOT use matchMedia or refs inside useTransform for opacity — use this mode.
 */
export function getHomeScrollMode(
  hasMounted: boolean,
  isMobileHomeLite: boolean,
): HomeScrollMode {
  if (!hasMounted) {
    return "desktop";
  }

  return isMobileHomeLite ? "mobile" : "desktop";
}

export function useHomeScrollMode(isMobileHomeLite: boolean) {
  const [hasMounted, setHasMounted] = useState(false);

  useLayoutEffect(() => {
    setHasMounted(true);
  }, []);

  const mode = getHomeScrollMode(hasMounted, isMobileHomeLite);

  return {
    mode,
    hasMounted,
    /** Same condition as the mobile JSX branch in page.tsx */
    showMobileHomeLite: mode === "mobile",
  };
}
