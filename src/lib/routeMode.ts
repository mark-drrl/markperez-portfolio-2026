export function isHomePath(pathname: string) {
  return pathname === "/";
}

export function isWorkDetailPath(pathname: string) {
  return pathname.startsWith("/works-");
}

export function isStaticShellPath(pathname: string) {
  return pathname === "/about" || pathname === "/contact";
}

export type SiteRouteMode = "home" | "work-detail" | "static" | "other";

export function getSiteRouteMode(pathname: string): SiteRouteMode {
  if (isHomePath(pathname)) {
    return "home";
  }

  if (isWorkDetailPath(pathname)) {
    return "work-detail";
  }

  if (isStaticShellPath(pathname)) {
    return "static";
  }

  return "other";
}
