import { isMobileHomeViewport } from "@/hooks/useHomeScrollProgress";
import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  const query = window.matchMedia("(max-width: 767px), (pointer: coarse)");
  query.addEventListener("change", onStoreChange);
  window.addEventListener("resize", onStoreChange);
  window.visualViewport?.addEventListener("resize", onStoreChange);

  return () => {
    query.removeEventListener("change", onStoreChange);
    window.removeEventListener("resize", onStoreChange);
    window.visualViewport?.removeEventListener("resize", onStoreChange);
  };
}

function getSnapshot() {
  return isMobileHomeViewport();
}

/** SSR/hydration default — desktop tree until client confirms mobile. */
function getServerSnapshot() {
  return false;
}

/** Touch-first / narrow viewports: lighter home scroll (Hero → Curate). */
export function useMobileHomeLite() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
