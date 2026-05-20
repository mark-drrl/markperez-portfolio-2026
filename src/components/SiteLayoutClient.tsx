"use client";

import { getSiteRouteMode, isHomePath } from "@/lib/routeMode";
import { restoreNativeDocumentScroll } from "@/lib/restoreDocumentScroll";
import { unlockWorkScroll, workScrollBridge } from "@/lib/workScrollBridge";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface SiteLayoutClientProps {
  children: ReactNode;
}

/** Tear down home-only scroll state when leaving the main page. */
function teardownHomeScroll() {
  const lenis = workScrollBridge.lenis;

  if (lenis) {
    lenis.destroy();
  }

  unlockWorkScroll();
  workScrollBridge.lenis = null;
  workScrollBridge.scrollYProgress = null;
  workScrollBridge.virtualScroll = null;
  workScrollBridge.targetVirtualScroll = 0;
  workScrollBridge.displayVirtualScroll = 0;
  workScrollBridge.blockWorkEngagement = false;
  restoreNativeDocumentScroll();
}

export default function SiteLayoutClient({ children }: SiteLayoutClientProps) {
  const pathname = usePathname();
  const routeMode = getSiteRouteMode(pathname);

  useEffect(() => {
    document.documentElement.dataset.routeMode = routeMode;

    if (!isHomePath(pathname)) {
      teardownHomeScroll();
    }

    return () => {
      if (!isHomePath(pathname)) {
        teardownHomeScroll();
      }
    };
  }, [pathname, routeMode]);

  return <div key={pathname}>{children}</div>;
}
