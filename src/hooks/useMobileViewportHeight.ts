import { useEffect } from "react";

/** Keeps `--app-vh` in sync with the visible viewport (Android Chrome toolbar). */
export function useMobileViewportHeight(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(max-width: 767px)");

    function apply() {
      if (!media.matches) {
        document.documentElement.style.removeProperty("--app-vh");
        return;
      }

      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty("--app-vh", `${height}px`);
    }

    apply();
    media.addEventListener("change", apply);
    window.visualViewport?.addEventListener("resize", apply);
    window.visualViewport?.addEventListener("scroll", apply);
    window.addEventListener("resize", apply);

    return () => {
      media.removeEventListener("change", apply);
      window.visualViewport?.removeEventListener("resize", apply);
      window.visualViewport?.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
      document.documentElement.style.removeProperty("--app-vh");
    };
  }, [enabled]);
}
