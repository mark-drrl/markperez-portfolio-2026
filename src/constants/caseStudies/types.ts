export type CaseStudyMetaItem = {
  label: string;
  value: string;
};

export type CaseStudyImage = {
  src: string;
  alt: string;
  aspect?: string;
  position?: string;
  /** Default cover. Use contain for social grids and campaign graphics. */
  fit?: "cover" | "contain";
};

export type CaseStudyProcessStep = {
  index: string;
  title: string;
  body: string;
  tool?: string;
};

export type CaseStudyCredit = {
  role: string;
  name: string;
};

export type CaseStudyFilm = {
  label: string;
  heading: string;
  kind: "youtube" | "local";
  src: string;
  aspect?: string;
  caption: string;
};

export type CaseStudyReels = {
  label: string;
  heading: string;
  items: readonly CaseStudyImage[];
};

export type CaseStudyDocument = {
  id: string;
  title: string;
  subtitle?: string;
  /** Omitted when the source PDF exceeds hosting limits; previews still work. */
  pdfSrc?: string;
  previewDir: string;
  coverSrc: string;
  pageCount: number;
  aspect?: string;
  featured?: boolean;
};

export type CaseStudyDocuments = {
  label: string;
  heading: string;
  intro?: string;
  items: readonly CaseStudyDocument[];
};

export interface CaseStudyContent {
  slug: string;
  index: string;
  client: string;
  product: string;
  eyebrow: string;
  tagline: string;
  /** When set, renders stacked hero lines instead of letter-by-letter client name. */
  heroLines?: readonly string[];
  hero: CaseStudyImage;
  meta: readonly CaseStudyMetaItem[];
  overview: {
    lead: string;
    body: readonly string[];
  };
  concept: {
    label: string;
    heading: string;
    body: readonly string[];
    image: CaseStudyImage;
  };
  fullBleed: CaseStudyImage;
  process: {
    label: string;
    heading: string;
    intro: string;
    steps: readonly CaseStudyProcessStep[];
  };
  film?: CaseStudyFilm;
  reels?: CaseStudyReels;
  documents?: CaseStudyDocuments;
  gallery: {
    label: string;
    heading: string;
    /** Branding mode shows full campaign/social grids without cropping. */
    mode?: "editorial" | "branding";
    items: readonly CaseStudyImage[];
  };
  toolbox: readonly string[];
  credits: readonly CaseStudyCredit[];
  next: {
    label: string;
    title: string;
    href: string;
  };
}
