import { MOBILE_WORK_SCROLL_FULL } from "@/lib/mobileHomeOpacity";
import {
  resetHomeScrollPosition,
  resetWorkVirtualScroll,
  workScrollBridge,
} from "@/lib/workScrollBridge";

export const HOME_SCROLL_TOP_KEY = "portfolio:home-scroll-top";
export const HOME_SCROLL_WORKS_KEY = "portfolio:home-scroll-works";
export const HOME_SCROLL_SYNC_EVENT = "portfolio:home-scroll-sync";

export const HOME_WORK_SCROLL_PROGRESS = 0.64;

export function dispatchHomeScrollSync() {
  window.dispatchEvent(new CustomEvent(HOME_SCROLL_SYNC_EVENT));
}

export function requestHomeScrollTop() {
  sessionStorage.removeItem(HOME_SCROLL_WORKS_KEY);
  sessionStorage.setItem(HOME_SCROLL_TOP_KEY, "1");
}

export function requestHomeScrollWorks() {
  sessionStorage.removeItem(HOME_SCROLL_TOP_KEY);
  sessionStorage.setItem(HOME_SCROLL_WORKS_KEY, "1");
}

export function consumeHomeScrollWorksRequest() {
  const shouldScrollWorks =
    sessionStorage.getItem(HOME_SCROLL_WORKS_KEY) === "1";

  if (shouldScrollWorks) {
    sessionStorage.removeItem(HOME_SCROLL_WORKS_KEY);
  }

  return shouldScrollWorks;
}

export function consumeHomeScrollTopRequest() {
  const shouldScrollTop = sessionStorage.getItem(HOME_SCROLL_TOP_KEY) === "1";

  if (shouldScrollTop) {
    sessionStorage.removeItem(HOME_SCROLL_TOP_KEY);
  }

  return shouldScrollTop;
}

function getHomeScrollY() {
  const lenis = workScrollBridge.lenis;

  if (
    typeof window !== "undefined" &&
    lenis &&
    window.matchMedia("(min-width: 768px)").matches
  ) {
    return lenis.scroll;
  }

  return window.scrollY;
}

export function getHomeScrollProgress(container?: HTMLElement | null) {
  const scrollRoot = container ?? document.querySelector("main");

  if (!scrollRoot) {
    return 0;
  }

  const maxScroll = scrollRoot.scrollHeight - window.innerHeight;

  if (maxScroll <= 0) {
    return 0;
  }

  let progress = Math.min(1, Math.max(0, getHomeScrollY() / maxScroll));

  if (workScrollBridge.isLocked) {
    progress = Math.max(progress, HOME_WORK_SCROLL_PROGRESS);
  }

  return progress;
}

export function scrollHomeToProgress(
  progress: number,
  container?: HTMLElement | null,
) {
  const scrollRoot = container ?? document.querySelector("main");

  if (!scrollRoot) {
    return 0;
  }

  const maxScroll = scrollRoot.scrollHeight - window.innerHeight;
  const top = maxScroll * Math.min(1, Math.max(0, progress));
  const lenis = workScrollBridge.lenis;

  if (
    lenis &&
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 768px)").matches
  ) {
    lenis.scrollTo(top, { immediate: true, force: true });
  } else {
    window.scrollTo({ top, left: 0, behavior: "auto" });
  }

  return getHomeScrollProgress(scrollRoot);
}

/** Reset to hero — used on `/` reload and explicit "back to home". */
export function scrollHomeToTop(container?: HTMLElement | null) {
  consumeHomeScrollTopRequest();
  resetHomeScrollPosition();
  return scrollHomeToProgress(0, container);
}

/** Scroll progress that lands on Work fully visible (avoids white crossfade on return). */
export function getWorkLandingScrollProgress() {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches
  ) {
    return MOBILE_WORK_SCROLL_FULL;
  }

  return HOME_WORK_SCROLL_PROGRESS;
}

export function shouldLandOnWorkGallery() {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.location.hash === "#works") {
    return true;
  }

  return sessionStorage.getItem(HOME_SCROLL_WORKS_KEY) === "1";
}

/** Ensures hash + consumes the works landing flag before scrolling to Work. */
export function prepareHomeScrollToWorks() {
  consumeHomeScrollWorksRequest();
  sessionStorage.removeItem(HOME_SCROLL_TOP_KEY);
  resetWorkVirtualScroll();

  if (window.location.hash !== "#works") {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#works`,
    );
  }
}
