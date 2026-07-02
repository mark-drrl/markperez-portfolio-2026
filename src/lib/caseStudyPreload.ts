import { getCaseStudyForPath } from "@/constants/caseStudies/registry";
import { getImageProps } from "next/image";

const PRELOAD_QUALITY = 75;
const PRELOAD_TIMEOUT_MS = 5000;

type PreloadSpec = {
  src: string;
  sizes: string;
  width: number;
  height: number;
};

function buildPreloadSpecs(pathname: string): PreloadSpec[] {
  const study = getCaseStudyForPath(pathname);

  if (!study) {
    return [];
  }

  return [
    {
      src: study.hero.src,
      sizes: "100vw",
      width: 2400,
      height: 1600,
    },
    {
      src: study.concept.image.src,
      sizes: "(min-width: 768px) 46vw, 90vw",
      width: 1400,
      height: 1000,
    },
  ];
}

function optimizedImageUrl(spec: PreloadSpec): string {
  const { props } = getImageProps({
    alt: "",
    src: spec.src,
    width: spec.width,
    height: spec.height,
    sizes: spec.sizes,
    quality: PRELOAD_QUALITY,
  });

  if (!props.srcSet) {
    return props.src;
  }

  const candidates = props.srcSet.split(", ").map((part) => {
    const [url, descriptor] = part.split(" ");
    const width = descriptor?.endsWith("w") ? Number.parseInt(descriptor, 10) : 0;

    return { url, width };
  });

  const largest = candidates.reduce((best, candidate) =>
    candidate.width > best.width ? candidate : best,
  );

  return largest.url || props.src;
}

function preloadUrl(url: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";

    const finish = () => resolve();

    image.onload = finish;
    image.onerror = finish;
    image.src = url;
  });
}

function withTimeout(promise: Promise<void>, timeoutMs: number): Promise<void> {
  return Promise.race([
    promise,
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, timeoutMs);
    }),
  ]);
}

export function preloadCaseStudyRoute(pathname: string): Promise<void> {
  const specs = buildPreloadSpecs(pathname);

  if (specs.length === 0) {
    return Promise.resolve();
  }

  const urls = [...new Set(specs.map(optimizedImageUrl))];
  const preloadAll = Promise.all(urls.map(preloadUrl)).then(() => undefined);

  return withTimeout(preloadAll, PRELOAD_TIMEOUT_MS);
}
