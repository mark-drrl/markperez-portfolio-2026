"use client";

/**
 * CardField — continuous card-field scene replacing Convey/Create/Curate desktop fades.
 * Stage A: progress 0 → ~0.62. Cards travel bottom→top with 3D-depth parallax.
 * Stage B: past 0.62 the virtual-scroll offset from workScrollBridge drives additional
 *          card travel, turning the field into the works gallery (no separate 3-col gallery).
 *
 * z-[31] = FAR cards (behind title)
 * z-[32] = title layer
 * z-[33] = RedThread (not rendered here)
 * z-[34] = NEAR cards (in front of title)
 */

import { workGalleryImages, workGallerySrcSet } from "@/constants/workGalleryImages";
import { getWorkGalleryProject } from "@/constants/workGalleryProjects";
import { curateCellShellTones } from "@/lib/workColumnLayout";
import { workScrollBridge } from "@/lib/workScrollBridge";
import { WorkImageLink, GalleryHoverTitle } from "@/components/work/tileParts";
import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Slot definitions
// ---------------------------------------------------------------------------

type SlotDef = {
  /** index into workGalleryImages */
  imageIndex: number;
  /** left position in vw */
  xVw: number;
  /** depth factor: higher = nearer = faster travel */
  d: number;
  /** width in vw */
  wVw: number;
  /** aspect ratio [w, h] */
  aspect: [number, number];
  /** visual layer */
  layer: "far" | "near";
};

const SLOT_DEFS: SlotDef[] = [
  // FAR layer
  { imageIndex: 0,  xVw: 8,  d: 0.60, wVw: 10, aspect: [4, 5], layer: "far" },
  { imageIndex: 1,  xVw: 30, d: 0.70, wVw: 12, aspect: [3, 2], layer: "far" },
  { imageIndex: 2,  xVw: 55, d: 0.65, wVw: 10, aspect: [1, 1], layer: "far" },
  { imageIndex: 3,  xVw: 78, d: 0.70, wVw: 11, aspect: [4, 5], layer: "far" },
  { imageIndex: 4,  xVw: 18, d: 0.80, wVw: 13, aspect: [3, 2], layer: "far" },
  { imageIndex: 5,  xVw: 68, d: 0.85, wVw: 13, aspect: [4, 5], layer: "far" },
  // NEAR layer
  { imageIndex: 6,  xVw: 4,  d: 1.05, wVw: 20, aspect: [4, 5], layer: "near" },
  { imageIndex: 7,  xVw: 36, d: 1.15, wVw: 22, aspect: [3, 2], layer: "near" },
  { imageIndex: 8,  xVw: 66, d: 1.10, wVw: 21, aspect: [4, 5], layer: "near" },
  { imageIndex: 9,  xVw: 14, d: 1.30, wVw: 24, aspect: [3, 2], layer: "near" },
  { imageIndex: 10, xVw: 48, d: 1.25, wVw: 23, aspect: [4, 5], layer: "near" },
  { imageIndex: 8,  xVw: 74, d: 1.40, wVw: 22, aspect: [1, 1], layer: "near" }, // s11 repeats img 8
  { imageIndex: 3,  xVw: 28, d: 1.35, wVw: 24, aspect: [4, 5], layer: "near" }, // s12 repeats img 3
  { imageIndex: 1,  xVw: 58, d: 1.40, wVw: 25, aspect: [3, 2], layer: "near" }, // s13 repeats img 1
];

// Baseline slot Y positions (at p=0.20) — distribute between -5vh and 95vh
// so the field looks scattered across viewport at travel start.
// Slots are ordered by their visual depth to give a natural scattered look.
const SLOT_BASE_Y_VH: number[] = [
  // FAR slots (s0–s5)
  -4,   // s0 x8
  42,   // s1 x30
  15,   // s2 x55
  70,   // s3 x78
  -1,   // s4 x18
  58,   // s5 x68
  // NEAR slots (s6–s13)
  25,   // s6 x4
  -5,   // s7 x36
  80,   // s8 x66
  55,   // s9 x14
  95,   // s10 x48
  10,   // s11 x74
  38,   // s12 x28
  68,   // s13 x58
];

// ---------------------------------------------------------------------------
// Image pool rotation — 11 projects across 14 slots cycling on each wrap.
// Each slot has an independent wrap counter so reassignment staggers naturally.
// We map slot-wrap counts to image indices (mod 11) to ensure every project
// appears within a couple of full wheel cycles.
// ---------------------------------------------------------------------------

const IMAGE_COUNT = workGalleryImages.length; // 11

/**
 * Returns the image index for a given slot at a given wrap count.
 * Offset by slotIndex so different slots start at different images.
 */
function imageIndexForSlotWrap(slotIndex: number, wrapCount: number): number {
  return (slotIndex + wrapCount * 3) % IMAGE_COUNT;
}

// ---------------------------------------------------------------------------
// Animation constants
// ---------------------------------------------------------------------------

const TRAVEL_VH = 220;
const FIELD_START = 0.20;
// FIELD_END = 0.62 — cards continue past this via virtual scroll; kept as doc comment.

// Image fill windows spread across 0.30–0.56, ordered by slot Y baseline (lowest fills first)
// We compute fill windows based on slot vertical position.
const FILL_START_GLOBAL = 0.30;
const FILL_END_GLOBAL = 0.56;
const FILL_WINDOW_SPAN = 0.055; // per-card fill duration

// Gradient card (convey special card)
const GRAD_CARD_START = 0.05;
const GRAD_CARD_CENTER = 0.09; // progress when gradient card reaches screen center
const PUSH_OUT_START = 0.13;
const PUSH_OUT_END = 0.20;
const GRAD_CARD_FADE_START = 0.16;
const GRAD_CARD_FADE_END = 0.20;

// Title phase boundaries
// HERO_PHASE_END = 0.05: field cards hidden before GRAD_CARD_START (same value, doc only)
const PHASE1_START = 0.05;
// PHASE1_END = 0.13 = PUSH_OUT_START (doc only)
const PHASE2_START = 0.13;
// PHASE2_END = 0.34 = PHASE3_START (doc only)
const PHASE3_START = 0.34;
// PHASE3_END = 0.58 = PHASE4_START (doc only)
const PHASE4_START = 0.58;

// Works mode: links become interactive at this threshold
const LINKS_ENABLE_PROGRESS = 0.62;

// ---------------------------------------------------------------------------
// Virtual-scroll → card travel factor
// Converts virtual-pixel offset to vh of additional card travel.
// Tuned so wheel browsing feels like the old 3-column gallery:
//   - Old gallery: 1 virtual-px ≈ small column translate
//   - CardField: we want ~0.045vh per virtual-px (far cards) to ~0.12vh (near cards)
//   - With depth multiplier applied, that means base factor = 0.065 vh/px
// Factor chosen empirically: 1400 virtual-px (WORK_VIRTUAL_SCROLL_DISTANCE) ≈ 90vh near-card travel
// ---------------------------------------------------------------------------
const VIRTUAL_TO_VH = 0.065; // vh per virtual-pixel (before depth multiplier)

// ---------------------------------------------------------------------------
// Easing helpers
// ---------------------------------------------------------------------------

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function easeOutCubic(t: number) {
  const c = clamp01(t);
  return 1 - (1 - c) ** 3;
}

// ---------------------------------------------------------------------------
// Per-slot fill progress computation
// ---------------------------------------------------------------------------

/**
 * Returns the fill fraction (0–1) for slot i at scroll progress p.
 * Windows are spread across FILL_START_GLOBAL–FILL_END_GLOBAL,
 * ordered by slot Y baseline (lowest/highest-Y fills first for bottom→top sweep).
 */
function getSlotFillOrder(): number[] {
  // Sort slots by their baseY descending (highest Y = lowest on screen = fills first)
  const indices = SLOT_DEFS.map((_, i) => i);
  indices.sort((a, b) => SLOT_BASE_Y_VH[b] - SLOT_BASE_Y_VH[a]);
  const order: number[] = new Array(SLOT_DEFS.length);
  indices.forEach((slotIndex, rank) => {
    order[slotIndex] = rank;
  });
  return order;
}

const SLOT_FILL_ORDER = getSlotFillOrder();
const FILL_TOTAL_SPAN = FILL_END_GLOBAL - FILL_START_GLOBAL - FILL_WINDOW_SPAN;
const FILL_STEP = FILL_TOTAL_SPAN / Math.max(SLOT_DEFS.length - 1, 1);

function slotFillStart(slotIndex: number): number {
  return FILL_START_GLOBAL + SLOT_FILL_ORDER[slotIndex] * FILL_STEP;
}

function slotFillProgress(slotIndex: number, p: number): number {
  const start = slotFillStart(slotIndex);
  const end = start + FILL_WINDOW_SPAN;
  return clamp01((p - start) / (end - start));
}

// ---------------------------------------------------------------------------
// Reduced-motion detection
// ---------------------------------------------------------------------------

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------------------------
// Gradient card position computation
// (centered at 50% viewport width, 40% viewport height — near the middle)
// ---------------------------------------------------------------------------

const GRAD_CARD_W_VW = 42;
const GRAD_CARD_H_VH = 54;
// GRAD_CARD_CENTER_X_VW = 29vw — used in JSX style directly as "50%" with translate3d(-50%)
const GRAD_CARD_CENTER_Y_VH = (100 - GRAD_CARD_H_VH) / 2; // 23vh top

// ---------------------------------------------------------------------------
// Per-slot card position at given progress
// ---------------------------------------------------------------------------

function computeSlotY(slotIndex: number, p: number, virtualOffset: number): {
  yVh: number;
  wrapCount: number;
} {
  const slot = SLOT_DEFS[slotIndex];
  const baseY = SLOT_BASE_Y_VH[slotIndex];

  if (p < FIELD_START) {
    return { yVh: baseY, wrapCount: 0 };
  }

  // Main scroll travel (pre-lock)
  const scrollTravel = (p - FIELD_START) * TRAVEL_VH * slot.d;

  // Virtual scroll travel (post-lock): depth multiplier keeps 3D parallax during gallery browse
  const virtualTravel = virtualOffset * VIRTUAL_TO_VH * slot.d;

  const totalTravel = scrollTravel + virtualTravel;

  const cardHeightVh = (slot.wVw * slot.aspect[1]) / slot.aspect[0];
  const cycleSpan = 160 + cardHeightVh;

  let y = baseY - totalTravel;

  // Count how many times this card has wrapped (for image assignment)
  const rawWraps = Math.floor((baseY + cardHeightVh - y) / cycleSpan);
  const wrapCount = Math.max(0, rawWraps);

  // Wrap: when card top goes above -cardHeightVh, wrap below viewport
  y = ((y + cardHeightVh) % cycleSpan) - cardHeightVh;
  if (y < -cardHeightVh) {
    y += cycleSpan;
  }

  return { yVh: y, wrapCount };
}

// ---------------------------------------------------------------------------
// Push-out lerp: slot positions during push-out phase (0.13–0.20)
// ---------------------------------------------------------------------------

function computePushOutY(slotIndex: number, p: number): number {
  const t = clamp01((p - PUSH_OUT_START) / (PUSH_OUT_END - PUSH_OUT_START));

  // Stagger by slot index noise (spread ~0.15)
  const stagger = (slotIndex / SLOT_DEFS.length) * 0.15;
  const staggeredT = clamp01((t - stagger * 0.5) / (1 - stagger * 0.5));
  const staggerEase = easeOutCubic(staggeredT);

  // Source: gradient card center Y
  const sourceY = GRAD_CARD_CENTER_Y_VH;
  const targetY = SLOT_BASE_Y_VH[slotIndex];

  return sourceY + (targetY - sourceY) * staggerEase;
}

function computePushOutScale(slotIndex: number, p: number): number {
  const t = clamp01((p - PUSH_OUT_START) / (PUSH_OUT_END - PUSH_OUT_START));
  const stagger = (slotIndex / SLOT_DEFS.length) * 0.15;
  const staggeredT = clamp01((t - stagger * 0.5) / (1 - stagger * 0.5));
  return 0.5 + 0.5 * easeOutCubic(staggeredT);
}

// ---------------------------------------------------------------------------
// Main Y computation for a card (combining all phases)
// ---------------------------------------------------------------------------

function computeCardY(slotIndex: number, p: number, virtualOffset: number): {
  yVh: number;
  scale: number;
  visible: boolean;
  wrapCount: number;
} {
  // Phase 0: no cards on screen (p < GRAD_CARD_START)
  if (p < GRAD_CARD_START) {
    return { yVh: 110, scale: 1, visible: false, wrapCount: 0 };
  }

  // Phase 1 (0.05–0.13): gradient card visible, field cards hidden below viewport
  if (p < PUSH_OUT_START) {
    return { yVh: 110, scale: 0.5, visible: false, wrapCount: 0 };
  }

  // Phase 2 (0.13–0.20): push-out — cards expand from gradient card center to slots
  if (p < PUSH_OUT_END) {
    const yVh = computePushOutY(slotIndex, p);
    const scale = computePushOutScale(slotIndex, p);
    return { yVh, scale, visible: true, wrapCount: 0 };
  }

  // Phase 3+ (0.20+): field travel + virtual offset
  const { yVh, wrapCount } = computeSlotY(slotIndex, p, virtualOffset);
  return { yVh, scale: 1, visible: true, wrapCount };
}

// ---------------------------------------------------------------------------
// Gradient card Y computation
// ---------------------------------------------------------------------------

function computeGradCardY(p: number): number {
  if (p < GRAD_CARD_START) {
    return 115; // below viewport
  }
  if (p < GRAD_CARD_CENTER) {
    // Rise from below to center
    const t = (p - GRAD_CARD_START) / (GRAD_CARD_CENTER - GRAD_CARD_START);
    return 115 - (115 - GRAD_CARD_CENTER_Y_VH) * easeOutCubic(t);
  }
  return GRAD_CARD_CENTER_Y_VH;
}

function computeGradCardOpacity(p: number): number {
  if (p < GRAD_CARD_FADE_START) return 1;
  if (p >= GRAD_CARD_FADE_END) return 0;
  return 1 - (p - GRAD_CARD_FADE_START) / (GRAD_CARD_FADE_END - GRAD_CARD_FADE_START);
}

// ---------------------------------------------------------------------------
// Title phase computation
// ---------------------------------------------------------------------------

type TitlePhase = 1 | 2 | 3 | 4;

function getTitlePhase(p: number): TitlePhase {
  if (p < PHASE1_START) return 1; // hidden but phase 1 type
  if (p < PHASE2_START) return 1;
  if (p < PHASE3_START) return 2;
  if (p < PHASE4_START) return 3;
  return 4;
}

function getTitleOpacity(p: number): number {
  if (p < PHASE1_START) return 0;
  if (p < PHASE1_START + 0.015) return (p - PHASE1_START) / 0.015;
  return 1;
}

// ---------------------------------------------------------------------------
// Image mask fill
// ---------------------------------------------------------------------------

function computeMaskStyle(fill: number): string {
  if (fill <= 0) return "linear-gradient(to top, transparent, transparent)";
  if (fill >= 1) return "none";
  const fillPct = fill * 112 - 12;
  const transparentPct = fill * 112 + 8;
  return `linear-gradient(to top, black 0%, black ${Math.max(0, fillPct).toFixed(1)}%, transparent ${transparentPct.toFixed(1)}%)`;
}

// ---------------------------------------------------------------------------
// Char stagger title component (reused for phase 2 heading)
// ---------------------------------------------------------------------------

const CREATE_HEADING = "Creating the magic";
const CREATE_SANS_INDEX = CREATE_HEADING.indexOf("the magic");

const CURATE_HEADING = "Curating the brand";
const CURATE_SANS_INDEX = CURATE_HEADING.indexOf("the brand");

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CardFieldProps {
  scrollYProgress: MotionValue<number>;
}

export default function CardField({ scrollYProgress }: CardFieldProps) {
  // Refs for card DOM elements (indexed by slot)
  const cardRefs = useRef<(HTMLDivElement | null)[]>(Array(SLOT_DEFS.length).fill(null));
  // Refs for image mask wrappers inside each card
  const maskRefs = useRef<(HTMLDivElement | null)[]>(Array(SLOT_DEFS.length).fill(null));
  // Refs for the img elements inside each card (for dynamic src swaps on wrap)
  const imgRefs = useRef<(HTMLImageElement | null)[]>(Array(SLOT_DEFS.length).fill(null));
  // Refs to FAR/NEAR layer containers for pointer-event toggling
  const farLayerRef = useRef<HTMLDivElement>(null);
  const nearLayerRef = useRef<HTMLDivElement>(null);
  // Gradient card ref
  const gradCardRef = useRef<HTMLDivElement>(null);
  const gradCardOpacityRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Title refs
  const titleRef = useRef<HTMLDivElement>(null);
  const phase1Ref = useRef<HTMLDivElement>(null);
  const phase2Ref = useRef<HTMLDivElement>(null);
  const phase3Ref = useRef<HTMLDivElement>(null);
  const phase4Ref = useRef<HTMLDivElement>(null);

  // Track last wrap counts so we only update img src when they change
  const lastWrapCountsRef = useRef<number[]>(Array(SLOT_DEFS.length).fill(0));
  // Current image src per slot (for re-render stability when linksEnabled toggles)
  const currentImgSrcsRef = useRef<string[]>(
    SLOT_DEFS.map((slot) => workGalleryImages[slot.imageIndex])
  );

  // links-enabled state: true when progress ≥ LINKS_ENABLE_PROGRESS or bridge is locked
  const [linksEnabled, setLinksEnabled] = useState(false);

  // Imperative update — zero React re-renders per scroll frame
  const applyTransforms = useCallback((p: number) => {
    // Read virtual offset from bridge (0 when not locked / handoff not prepared)
    const virtualOffset = workScrollBridge.virtualScroll?.get() ?? 0;
    // Effective virtual contribution: 0 at DESKTOP_GALLERY_HANDOFF_OFFSET (which is 0),
    // positive as drift/wheel advances it.
    const effectiveVirtual = Math.max(0, virtualOffset);

    if (prefersReducedMotion) {
      // Reduced motion: show cards at slot positions with fills per phase
      SLOT_DEFS.forEach((_slot, i) => {
        const el = cardRefs.current[i];
        const maskEl = maskRefs.current[i];
        if (!el) return;

        const yVh = SLOT_BASE_Y_VH[i];
        el.style.transform = `translate3d(0, ${yVh}vh, 0)`;
        el.style.opacity = p >= PUSH_OUT_START ? "1" : "0";

        if (maskEl) {
          const fill = slotFillProgress(i, p);
          maskEl.style.webkitMaskImage = computeMaskStyle(fill);
          maskEl.style.maskImage = computeMaskStyle(fill);
        }
      });
      return;
    }

    // Full animation
    SLOT_DEFS.forEach((_slot, i) => {
      const el = cardRefs.current[i];
      const maskEl = maskRefs.current[i];
      if (!el) return;

      const { yVh, scale, visible, wrapCount } = computeCardY(i, p, effectiveVirtual);
      el.style.transform = `translate3d(0, ${yVh}vh, 0) scale(${scale.toFixed(4)})`;
      el.style.opacity = visible ? "1" : "0";
      el.style.pointerEvents = visible ? "auto" : "none";

      if (maskEl) {
        const fill = slotFillProgress(i, p);
        const maskStyle = computeMaskStyle(fill);
        maskEl.style.webkitMaskImage = maskStyle;
        maskEl.style.maskImage = maskStyle;
      }

      // Swap image src when wrap count changes (project rotation)
      if (wrapCount !== lastWrapCountsRef.current[i]) {
        lastWrapCountsRef.current[i] = wrapCount;
        const newImgIndex = imageIndexForSlotWrap(i, wrapCount);
        const newSrc = workGalleryImages[newImgIndex];
        currentImgSrcsRef.current[i] = newSrc;
        const imgEl = imgRefs.current[i];
        if (imgEl) {
          if (!imgEl.src.endsWith(newSrc)) {
            imgEl.src = newSrc;
            const srcSet = workGallerySrcSet(newSrc);
            if (srcSet) imgEl.srcset = srcSet;
          }
        }
      }
    });

    // Gradient card
    const gradEl = gradCardRef.current;
    const gradOpacityEl = gradCardOpacityRef.current;
    if (gradEl) {
      const yVh = computeGradCardY(p);
      gradEl.style.transform = `translate3d(-50%, ${yVh}vh, 0)`;
    }
    if (gradOpacityEl) {
      const opacity = computeGradCardOpacity(p);
      gradOpacityEl.style.opacity = String(opacity);
      gradOpacityEl.style.pointerEvents = opacity > 0.01 ? "auto" : "none";
    }

    // Video play/pause based on gradient card visibility
    const video = videoRef.current;
    if (video) {
      if (p >= GRAD_CARD_START && p < GRAD_CARD_FADE_END) {
        if (video.paused) void video.play().catch(() => {});
      } else {
        video.pause();
      }
    }

    // Title phases
    const phase = getTitlePhase(p);
    const titleOpacity = getTitleOpacity(p);

    if (titleRef.current) {
      titleRef.current.style.opacity = String(titleOpacity);
    }

    // Show/hide phases
    const phases = [phase1Ref, phase2Ref, phase3Ref, phase4Ref];
    phases.forEach((ref, idx) => {
      if (ref.current) {
        const isActive = phase === idx + 1;
        ref.current.style.opacity = isActive ? "1" : "0";
        ref.current.style.pointerEvents = "none";
      }
    });
  }, []);

  // Subscribe to scrollYProgress
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    applyTransforms(p);
    // Update links-enabled state (triggers React re-render only on threshold crossing)
    const shouldEnable = p >= LINKS_ENABLE_PROGRESS || workScrollBridge.isLocked;
    setLinksEnabled((prev) => prev !== shouldEnable ? shouldEnable : prev);
  });

  // Subscribe to virtualScroll changes (bridge may register it after mount).
  // The bridge's MotionValue INSTANCE can be replaced when DesktopWorkView
  // remounts (e.g. returning from a case study or reload-into-work), so we
  // keep polling and re-subscribe whenever the instance changes — never cache
  // a stale MotionValue.
  useEffect(() => {
    let subscribed: MotionValue<number> | null = null;
    let unsub: (() => void) | null = null;

    function syncSubscription() {
      const vs = workScrollBridge.virtualScroll;
      if (vs === subscribed) return;
      unsub?.();
      subscribed = vs;
      unsub = vs
        ? vs.on("change", () => {
            applyTransforms(scrollYProgress.get());
          })
        : null;
    }

    syncSubscription();
    const interval = window.setInterval(syncSubscription, 400);

    return () => {
      window.clearInterval(interval);
      unsub?.();
    };
  }, [scrollYProgress, applyTransforms]);

  useEffect(() => {
    applyTransforms(scrollYProgress.get());
  }, [scrollYProgress, applyTransforms]);

  // Initial layout effect to ensure transforms are applied before first paint
  useLayoutEffect(() => {
    applyTransforms(scrollYProgress.get());
  }, [scrollYProgress, applyTransforms]);

  // After any re-render (e.g. linksEnabled toggle), restore current img srcs
  // in case React reset them to the initial slot imageIndex values.
  useEffect(() => {
    SLOT_DEFS.forEach((_slot, i) => {
      const imgEl = imgRefs.current[i];
      const currentSrc = currentImgSrcsRef.current[i];
      if (imgEl && currentSrc && !imgEl.src.endsWith(currentSrc)) {
        imgEl.src = currentSrc;
        const srcSet = workGallerySrcSet(currentSrc);
        if (srcSet) imgEl.srcset = srcSet;
      }
    });
  });

  // Toggle aria-hidden on layer containers when links become enabled
  // (pointer-events are controlled per-card via cardRefs; pointer-events on children
  // override the parent's pointer-events:none in HTML even without inheriting it)
  useEffect(() => {
    const far = farLayerRef.current;
    const near = nearLayerRef.current;
    if (linksEnabled) {
      far?.removeAttribute("aria-hidden");
      near?.removeAttribute("aria-hidden");
    } else {
      far?.setAttribute("aria-hidden", "true");
      near?.setAttribute("aria-hidden", "true");
    }
  }, [linksEnabled]);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  function renderCardContent(slotIndex: number, imgSrc: string, wVw: number, heightVw: number, isGradient: boolean) {
    const srcSet = workGallerySrcSet(imgSrc);
    const project = isGradient ? null : getWorkGalleryProject(imgSrc);
    const ariaLabel = project
      ? `${project.title} — ${project.discipline}, ${project.year} (case study)`
      : undefined;

    const imgEl = (
      <img
        ref={(el) => { imgRefs.current[slotIndex] = el; }}
        src={imgSrc}
        srcSet={srcSet}
        sizes="25vw"
        alt=""
        loading="eager"
        decoding="async"
        className={`h-full w-full object-cover grayscale contrast-[1.05] brightness-[0.95] saturate-0 transition-[filter] duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)]${linksEnabled ? " group-hover/tile:grayscale-0 group-hover/tile:contrast-110 group-hover/tile:brightness-105 group-focus-visible/tile:grayscale-0 group-focus-visible/tile:contrast-110 group-focus-visible/tile:brightness-105" : ""}`}
      />
    );

    return (
      <WorkImageLink src={imgSrc} linksEnabled={isGradient ? false : linksEnabled} ariaLabel={ariaLabel}>
        <div className="relative h-full w-full overflow-hidden">
          {imgEl}
          {project ? (
            <GalleryHoverTitle
              title={project.title}
              discipline={project.discipline}
              year={project.year}
              linksEnabled={linksEnabled}
            />
          ) : null}
        </div>
      </WorkImageLink>
    );
  }

  return (
    <>
      {/* FAR card layer — z-[31] (behind title z-[32] and RedThread z-[33]) */}
      <div ref={farLayerRef} className="pointer-events-none absolute inset-0 z-[31] hidden md:block" aria-hidden="true">
        {SLOT_DEFS.map((slot, i) => {
          if (slot.layer !== "far") return null;
          const heightVw = (slot.wVw * slot.aspect[1]) / slot.aspect[0];
          const tone = curateCellShellTones[i % curateCellShellTones.length];
          const imgSrc = workGalleryImages[slot.imageIndex];

          return (
            <div
              key={`far-${i}`}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="absolute left-0 top-0 will-change-transform overflow-hidden"
              style={{
                width: `${slot.wVw}vw`,
                height: `${heightVw}vw`,
                left: `${slot.xVw}vw`,
                transform: `translate3d(0, 110vh, 0)`,
                opacity: 0,
                backgroundColor: tone,
              }}
            >
              {/* Image fill — revealed by bottom→top mask */}
              <div
                ref={(el) => { maskRefs.current[i] = el; }}
                className="absolute inset-0 overflow-hidden"
                style={{
                  WebkitMaskImage: "linear-gradient(to top, transparent, transparent)",
                  maskImage: "linear-gradient(to top, transparent, transparent)",
                }}
              >
                {renderCardContent(i, imgSrc, slot.wVw, heightVw, false)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gradient card — z-[31] (part of far layer, but rendered separately for choreography) */}
      {/* This is the special Convey-act card */}
      <div
        ref={gradCardOpacityRef}
        className="pointer-events-none absolute inset-0 z-[31] hidden md:block"
        style={{ opacity: 0 }}
        aria-hidden="true"
      >
        <div
          ref={gradCardRef}
          className="absolute overflow-hidden"
          style={{
            width: `${GRAD_CARD_W_VW}vw`,
            height: `${GRAD_CARD_H_VH}vh`,
            left: "50%",
            top: "0",
            transform: "translate3d(-50%, 115vh, 0)",
            backgroundColor: "#d0d0d0",
          }}
        >
          <video
            ref={videoRef}
            className="h-[116%] w-full object-cover grayscale contrast-110 brightness-105 opacity-80"
            src="/GRADIENT.mp4"
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 bg-[#EAEAEA]/20 mix-blend-screen" />
        </div>
      </div>

      {/* Title layer — z-[32] */}
      <div
        ref={titleRef}
        className="pointer-events-none absolute inset-0 z-[32] hidden items-center justify-center md:flex"
        style={{ opacity: 0 }}
        aria-hidden="true"
      >
        {/* Phase 1: Conveying the idea */}
        <div
          ref={phase1Ref}
          className="absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-300"
          style={{ opacity: 0 }}
        >
          <h2 className="tracking-[-0.02em] md:text-7xl" style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)" }}>
            <span className="font-editorial italic font-light text-[#151515]/90">Conveying </span>
            <span className="font-neue text-[0.9em] font-medium not-italic text-[#151515]/90">the idea</span>
          </h2>
          <p
            className="font-neue mt-3 max-w-md text-sm font-normal leading-snug tracking-wide text-neutral-600"
          >
            through sharp market positioning and deliberate brand intent.
          </p>
        </div>

        {/* Phase 2: Creating the magic (char stagger — rendered as static on mount, animated in CSS) */}
        <div
          ref={phase2Ref}
          className="absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-300"
          style={{ opacity: 0 }}
        >
          <h2 className="tracking-[-0.02em] md:text-7xl" style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)" }}>
            {CREATE_HEADING.split("").map((char, idx) => {
              const isSans = idx >= CREATE_SANS_INDEX;
              return (
                <span
                  key={`p2-${idx}`}
                  className={`inline-block ${isSans ? "font-neue text-[0.9em] font-medium not-italic" : "font-editorial italic font-light"} text-[#151515]/90`}
                >
                  {char === " " ? " " : char}
                </span>
              );
            })}
          </h2>
          <p className="font-neue mt-3 max-w-md text-sm font-normal leading-snug tracking-wide text-neutral-600">
            where creativity intersects with advanced AI synthesis.
          </p>
        </div>

        {/* Phase 3: Curating the brand */}
        <div
          ref={phase3Ref}
          className="absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-300"
          style={{ opacity: 0 }}
        >
          <h2 className="tracking-[-0.02em] md:text-7xl" style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)" }}>
            {CURATE_HEADING.split("").map((char, idx) => {
              const isSans = idx >= CURATE_SANS_INDEX;
              return (
                <span
                  key={`p3-${idx}`}
                  className={`inline-block ${isSans ? "font-neue text-[0.9em] font-medium not-italic" : "font-editorial italic font-light"} text-[#151515]/90`}
                >
                  {char === " " ? " " : char}
                </span>
              );
            })}
          </h2>
          <p className="font-neue mt-3 max-w-md text-sm font-normal leading-snug tracking-wide text-neutral-600">
            into a quiet, high-impact design system that strips away the noise.
          </p>
        </div>

        {/* Phase 4: Selected Works */}
        <div
          ref={phase4Ref}
          className="absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-300"
          style={{ opacity: 0 }}
        >
          <h2
            className="font-neue tracking-[-0.02em] font-medium"
            style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.8rem)", color: "#151515e6" }}
          >
            Selected Works
          </h2>
        </div>
      </div>

      {/* NEAR card layer — z-[34] (in front of title and RedThread) */}
      <div ref={nearLayerRef} className="pointer-events-none absolute inset-0 z-[34] hidden md:block" aria-hidden="true">
        {SLOT_DEFS.map((slot, i) => {
          if (slot.layer !== "near") return null;
          const heightVw = (slot.wVw * slot.aspect[1]) / slot.aspect[0];
          const tone = curateCellShellTones[i % curateCellShellTones.length];
          const imgSrc = workGalleryImages[slot.imageIndex];

          return (
            <div
              key={`near-${i}`}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="absolute left-0 top-0 will-change-transform overflow-hidden"
              style={{
                width: `${slot.wVw}vw`,
                height: `${heightVw}vw`,
                left: `${slot.xVw}vw`,
                transform: `translate3d(0, 110vh, 0)`,
                opacity: 0,
                backgroundColor: tone,
              }}
            >
              {/* Image fill — revealed by bottom→top mask */}
              <div
                ref={(el) => { maskRefs.current[i] = el; }}
                className="absolute inset-0 overflow-hidden"
                style={{
                  WebkitMaskImage: "linear-gradient(to top, transparent, transparent)",
                  maskImage: "linear-gradient(to top, transparent, transparent)",
                }}
              >
                {renderCardContent(i, imgSrc, slot.wVw, heightVw, false)}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
