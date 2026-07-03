"use client";

import {
  desktopRedThreadDrawProgress,
  desktopRedThreadOpacity,
} from "@/lib/desktopHomeTransitions";
import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { useEffect, useRef } from "react";

interface RedThreadProps {
  scrollYProgress: MotionValue<number>;
}

// Reduced-motion: render fully drawn at constant low opacity, no simulation
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ─── Design-space constants ───────────────────────────────────────────────────
const DESIGN_W = 1440;
const DESIGN_H = 900;
const N = 160; // number of rope points
const TILE_PAD = 40;

// ─── Bezier path segments (organic route) ────────────────────────────────────
// Original SVG:
//   M 720 -20
//   C 680 80, 520 120, 380 200
//   C 200 300, 140 320, 180 420
//   C 220 510, 480 460, 680 480
//   C 880 500, 1180 420, 1200 520
//   C 1220 620, 1020 660, 820 680
//   C 620 700, 440 720, 480 780
//   C 520 840, 680 860, 760 940
// Each row: [x0, y0, cx1, cy1, cx2, cy2, x1, y1]
const PATH_SEGMENTS: ReadonlyArray<readonly [number, number, number, number, number, number, number, number]> = [
  [720, -20,  680, 80,   520, 120,  380, 200],
  [380, 200,  200, 300,  140, 320,  180, 420],
  [180, 420,  220, 510,  480, 460,  680, 480],
  [680, 480,  880, 500, 1180, 420, 1200, 520],
  [1200, 520, 1220, 620, 1020, 660,  820, 680],
  [820, 680,  620, 700,  440, 720,  480, 780],
  [480, 780,  520, 840,  680, 860,  760, 940],
];

// ─── Straight route — vertical line slightly off-center (x≈640) ──────────────
// Hangs from just above top edge (y=-20) down to y≈940 in design coords,
// slightly left of center so it doesn't skewer the tagline.
const STRAIGHT_X = 640;
const STRAIGHT_Y_START = -20;
const STRAIGHT_Y_END = 940;

function cubicBezier(
  x0: number, y0: number,
  cx1: number, cy1: number,
  cx2: number, cy2: number,
  x1: number, y1: number,
  t: number,
): [number, number] {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return [
    mt2 * mt * x0 + 3 * mt2 * t * cx1 + 3 * mt * t2 * cx2 + t2 * t * x1,
    mt2 * mt * y0 + 3 * mt2 * t * cy1 + 3 * mt * t2 * cy2 + t2 * t * y1,
  ];
}

/**
 * Sample the full multi-segment bezier path (organic) into N evenly-spaced points.
 * Returns [baseX, baseY] in canvas logical (post-scale) coordinates.
 */
function sampleOrganicPath(scale: number, offX: number, offY: number): [Float32Array<ArrayBuffer>, Float32Array<ArrayBuffer>] {
  const DENSE = 2000;
  const denseX = new Float32Array(DENSE) as Float32Array<ArrayBuffer>;
  const denseY = new Float32Array(DENSE) as Float32Array<ArrayBuffer>;
  const nSeg = PATH_SEGMENTS.length;

  for (let i = 0; i < DENSE; i++) {
    const globalT = i / (DENSE - 1);
    const segT = globalT * nSeg;
    const segIdx = Math.min(Math.floor(segT), nSeg - 1);
    const t = segT - segIdx;
    const seg = PATH_SEGMENTS[segIdx];
    const [px, py] = cubicBezier(seg[0], seg[1], seg[2], seg[3], seg[4], seg[5], seg[6], seg[7], t);
    denseX[i] = px * scale + offX;
    denseY[i] = py * scale + offY;
  }

  // Arc-length parameterization
  const cumLen = new Float32Array(DENSE) as Float32Array<ArrayBuffer>;
  cumLen[0] = 0;
  for (let i = 1; i < DENSE; i++) {
    const dx = denseX[i] - denseX[i - 1];
    const dy = denseY[i] - denseY[i - 1];
    cumLen[i] = cumLen[i - 1] + Math.sqrt(dx * dx + dy * dy);
  }
  const totalLen = cumLen[DENSE - 1];

  const bx = new Float32Array(N) as Float32Array<ArrayBuffer>;
  const by = new Float32Array(N) as Float32Array<ArrayBuffer>;
  let di = 0;
  for (let i = 0; i < N; i++) {
    const target = (i / (N - 1)) * totalLen;
    while (di < DENSE - 1 && cumLen[di + 1] < target) di++;
    if (di >= DENSE - 1) {
      bx[i] = denseX[DENSE - 1];
      by[i] = denseY[DENSE - 1];
    } else {
      const span = cumLen[di + 1] - cumLen[di];
      const frac = span < 1e-9 ? 0 : (target - cumLen[di]) / span;
      bx[i] = denseX[di] + frac * (denseX[di + 1] - denseX[di]);
      by[i] = denseY[di] + frac * (denseY[di + 1] - denseY[di]);
    }
  }

  return [bx, by];
}

/**
 * Sample the straight vertical route into N evenly-spaced points.
 * Matches the same total arc length bucket positions as organic so the lerp
 * interpolates point-for-point.
 */
function sampleStraightPath(scale: number, offX: number, offY: number): [Float32Array<ArrayBuffer>, Float32Array<ArrayBuffer>] {
  const bx = new Float32Array(N) as Float32Array<ArrayBuffer>;
  const by = new Float32Array(N) as Float32Array<ArrayBuffer>;
  const sx = STRAIGHT_X * scale + offX;
  const sy0 = STRAIGHT_Y_START * scale + offY;
  const sy1 = STRAIGHT_Y_END * scale + offY;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    bx[i] = sx;
    by[i] = sy0 + t * (sy1 - sy0);
  }
  return [bx, by];
}

function computeRestLengths(bx: Float32Array<ArrayBuffer>, by: Float32Array<ArrayBuffer>): Float32Array<ArrayBuffer> {
  const rl = new Float32Array(N - 1) as Float32Array<ArrayBuffer>;
  for (let i = 0; i < N - 1; i++) {
    const dx = bx[i + 1] - bx[i];
    const dy = by[i + 1] - by[i];
    rl[i] = Math.sqrt(dx * dx + dy * dy);
  }
  return rl;
}

/**
 * Smoothstep over [edge0, edge1].
 * Returns 0 at edge0, 1 at edge1, smooth S-curve between.
 */
function smoothStep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * curveAmount: 0 at p=0 (fully straight), 1 at p≥0.22 (fully organic).
 * Smoothstep over [0.02, 0.22].
 */
function curveAmount(progress: number): number {
  return smoothStep(0.02, 0.22, progress);
}

// ─── Shared mutable state ─────────────────────────────────────────────────────
// These live outside the component so the rAF loop (in useEffect) and the
// MotionValue subscriber (in useMotionValueEvent) share the same values.
interface SimState {
  drawProgress: number;
  curveAmount: number;
  ptrX: number;
  ptrY: number;
  tileActive: boolean;
  tileX: number;
  tileY: number;
  tileW: number;
  tileH: number;
}

export default function RedThread({ scrollYProgress }: RedThreadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Shared mutable state between the effect (rAF loop) and event subscribers
  const stateRef = useRef<SimState>({
    drawProgress: desktopRedThreadDrawProgress(scrollYProgress.get()),
    curveAmount: curveAmount(scrollYProgress.get()),
    ptrX: -9999,
    ptrY: -9999,
    tileActive: false,
    tileX: 0,
    tileY: 0,
    tileW: 0,
    tileH: 0,
  });

  // Subscribe to scrollYProgress — updates drawProgress, curveAmount, and wrapper opacity
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    stateRef.current.drawProgress = desktopRedThreadDrawProgress(progress);
    stateRef.current.curveAmount = curveAmount(progress);

    if (wrapperRef.current && !prefersReducedMotion) {
      wrapperRef.current.style.opacity = String(desktopRedThreadOpacity(progress));
    }
  });

  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) return;
    // Capture as non-null for use in inner closures
    const el: HTMLCanvasElement = canvasRef.current;
    const wr: HTMLDivElement = wrapperRef.current;

    const state = stateRef.current;

    // ── Simulation arrays ─────────────────────────────────────────────────────
    // Pre-allocated typed arrays for both routes (no allocations in the hot path)
    let organicX = new Float32Array(N) as Float32Array<ArrayBuffer>;
    let organicY = new Float32Array(N) as Float32Array<ArrayBuffer>;
    let straightX = new Float32Array(N) as Float32Array<ArrayBuffer>;
    let straightY = new Float32Array(N) as Float32Array<ArrayBuffer>;
    const baseX = new Float32Array(N) as Float32Array<ArrayBuffer>;
    const baseY = new Float32Array(N) as Float32Array<ArrayBuffer>;
    const curX = new Float32Array(N) as Float32Array<ArrayBuffer>;
    const curY = new Float32Array(N) as Float32Array<ArrayBuffer>;
    const prevX = new Float32Array(N) as Float32Array<ArrayBuffer>;
    const prevY = new Float32Array(N) as Float32Array<ArrayBuffer>;
    let restLen = new Float32Array(N - 1) as Float32Array<ArrayBuffer>;

    // Track last applied curveAmount to avoid recomputing base every frame
    let lastCurveAmount = -1;

    // ── Geometry setup ────────────────────────────────────────────────────────
    function getDpr() {
      return Math.min(window.devicePixelRatio || 1, 2);
    }

    function buildGeometry() {
      const dpr = getDpr();
      const w = wr.clientWidth || window.innerWidth;
      const h = wr.clientHeight || window.innerHeight;

      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;

      // Slice semantics: uniform scale = max(w/1440, h/900), centered
      const scale = Math.max(w / DESIGN_W, h / DESIGN_H);
      const scaledW = DESIGN_W * scale;
      const scaledH = DESIGN_H * scale;
      const offX = (w - scaledW) / 2;
      const offY = (h - scaledH) / 2;

      // Sample both routes into their typed arrays
      const [ox, oy] = sampleOrganicPath(scale, offX, offY);
      const [sx, sy] = sampleStraightPath(scale, offX, offY);
      organicX = ox;
      organicY = oy;
      straightX = sx;
      straightY = sy;

      // Force blended base recompute on next tick
      lastCurveAmount = -1;
      updateBlendedBase(state.curveAmount);

      // Initialize simulation at rest
      for (let i = 0; i < N; i++) {
        curX[i] = baseX[i];
        curY[i] = baseY[i];
        prevX[i] = baseX[i];
        prevY[i] = baseY[i];
      }
    }

    /**
     * Blend straight → organic by `amount` (0=straight, 1=organic).
     * Updates baseX/baseY and recomputes restLen.
     * O(N) — cheap; called only when curveAmount changes.
     */
    function updateBlendedBase(amount: number) {
      if (Math.abs(amount - lastCurveAmount) < 1e-6) return;
      lastCurveAmount = amount;

      for (let i = 0; i < N; i++) {
        baseX[i] = straightX[i] + amount * (organicX[i] - straightX[i]);
        baseY[i] = straightY[i] + amount * (organicY[i] - straightY[i]);
      }
      restLen = computeRestLengths(baseX, baseY);
    }

    // ── Simulation step ───────────────────────────────────────────────────────
    function simulate() {
      const { ptrX, ptrY, tileActive, tileX, tileY, tileW, tileH } = state;

      // Update blended base if curveAmount changed
      updateBlendedBase(state.curveAmount);

      // 1. Verlet integrate + spring toward base
      for (let i = 0; i < N; i++) {
        const velX = (curX[i] - prevX[i]) * 0.9;
        const velY = (curY[i] - prevY[i]) * 0.9;
        const nx = curX[i] + velX;
        const ny = curY[i] + velY;
        prevX[i] = curX[i];
        prevY[i] = curY[i];
        curX[i] = nx + (baseX[i] - nx) * 0.06;
        curY[i] = ny + (baseY[i] - ny) * 0.06;
      }

      // 2. Cursor repulsion (110px radius, max ~2.2px impulse, falloff²)
      const CURSOR_R = 110;
      const CURSOR_R_SQ = CURSOR_R * CURSOR_R;
      for (let i = 0; i < N; i++) {
        const dx = curX[i] - ptrX;
        const dy = curY[i] - ptrY;
        const distSq = dx * dx + dy * dy;
        if (distSq < CURSOR_R_SQ && distSq > 0.01) {
          const dist = Math.sqrt(distSq);
          const t = 1 - dist / CURSOR_R;
          const impulse = t * t * 2.2;
          curX[i] += (dx / dist) * impulse;
          curY[i] += (dy / dist) * impulse;
        }
      }

      // 3. Tile-hover attraction: pull points near tile rect toward tile center
      if (tileActive) {
        const padL = tileX - TILE_PAD;
        const padT = tileY - TILE_PAD;
        const padR = tileX + tileW + TILE_PAD;
        const padB = tileY + tileH + TILE_PAD;
        const tileCX = tileX + tileW / 2;
        const tileCY = tileY + tileH / 2;
        for (let i = 0; i < N; i++) {
          if (
            baseX[i] >= padL && baseX[i] <= padR &&
            baseY[i] >= padT && baseY[i] <= padB
          ) {
            curX[i] += (tileCX - curX[i]) * 0.04;
            curY[i] += (tileCY - curY[i]) * 0.04;
          }
        }
      }

      // 4. Constraint relaxation — 2 passes (propagates displacement along rope)
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < N - 1; i++) {
          const dx = curX[i + 1] - curX[i];
          const dy = curY[i + 1] - curY[i];
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 1e-9) continue;
          const diff = (dist - restLen[i]) / dist / 2;
          const cx = dx * diff;
          const cy = dy * diff;
          curX[i] += cx;
          curY[i] += cy;
          curX[i + 1] -= cx;
          curY[i + 1] -= cy;
        }
      }
    }

    // ── Render ────────────────────────────────────────────────────────────────
    function render() {
      const dpr = getDpr();
      const ctx = el.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, el.width, el.height);

      const dp = state.drawProgress;
      // Active points: last point index is dp * (N-1), partial last segment
      const activeFloat = dp * (N - 1);
      const activeCount = Math.max(2, Math.floor(activeFloat) + 1);

      if (activeCount < 2) return;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = "#9F1F2E";
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(curX[0], curY[0]);

      // Smoothed curve through midpoints (quadratic bezier segments)
      for (let i = 1; i < activeCount - 1; i++) {
        const midX = (curX[i] + curX[i + 1]) / 2;
        const midY = (curY[i] + curY[i + 1]) / 2;
        ctx.quadraticCurveTo(curX[i], curY[i], midX, midY);
      }

      // Last point — interpolated for partial segment
      const frac = activeFloat - Math.floor(activeFloat);
      const lastIdx = Math.min(activeCount - 1, N - 1);
      if (frac > 0 && lastIdx < N - 1) {
        const partialX = curX[lastIdx - 1] + frac * (curX[lastIdx] - curX[lastIdx - 1]);
        const partialY = curY[lastIdx - 1] + frac * (curY[lastIdx] - curY[lastIdx - 1]);
        ctx.lineTo(partialX, partialY);
      } else {
        ctx.lineTo(curX[lastIdx], curY[lastIdx]);
      }

      ctx.stroke();
      ctx.restore();
    }

    // ── Static draw (reduced-motion) — organic route fully drawn ─────────────
    function drawStatic() {
      const dpr = getDpr();
      const ctx = el.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, el.width, el.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = "#9F1F2E";
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Reduced-motion always uses the fully organic route
      ctx.beginPath();
      ctx.moveTo(organicX[0], organicY[0]);
      for (let i = 1; i < N - 1; i++) {
        const midX = (organicX[i] + organicX[i + 1]) / 2;
        const midY = (organicY[i] + organicY[i + 1]) / 2;
        ctx.quadraticCurveTo(organicX[i], organicY[i], midX, midY);
      }
      ctx.lineTo(organicX[N - 1], organicY[N - 1]);
      ctx.stroke();
      ctx.restore();
    }

    // ── rAF loop ──────────────────────────────────────────────────────────────
    let rafId = 0;
    let running = false;

    function tick() {
      if (!running) return;
      rafId = requestAnimationFrame(tick);
      simulate();
      render();
    }

    function startLoop() {
      if (running || prefersReducedMotion) return;
      running = true;
      rafId = requestAnimationFrame(tick);
    }

    function stopLoop() {
      running = false;
      cancelAnimationFrame(rafId);
      rafId = 0;
    }

    // ── Event handlers ────────────────────────────────────────────────────────
    function onPointerMove(e: PointerEvent) {
      state.ptrX = e.clientX;
      state.ptrY = e.clientY;
    }

    function onVisibilityChange() {
      if (document.hidden) {
        stopLoop();
      } else if (!prefersReducedMotion) {
        startLoop();
      }
    }

    interface TileHoverDetail {
      active: boolean;
      x?: number;
      y?: number;
      w?: number;
      h?: number;
    }

    function onTileHover(e: Event) {
      const detail = (e as CustomEvent<TileHoverDetail>).detail;
      if (detail.active) {
        state.tileActive = true;
        state.tileX = detail.x ?? 0;
        state.tileY = detail.y ?? 0;
        state.tileW = detail.w ?? 0;
        state.tileH = detail.h ?? 0;
      } else {
        state.tileActive = false;
      }
    }

    let resizeTimer: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        buildGeometry();
        if (prefersReducedMotion) {
          drawStatic();
        }
      }, 200);
    }

    // ── Initialize ────────────────────────────────────────────────────────────
    buildGeometry();

    if (prefersReducedMotion) {
      drawStatic();
    } else {
      // Set initial opacity from current scroll position
      const initialProgress = scrollYProgress.get();
      wr.style.opacity = String(desktopRedThreadOpacity(initialProgress));
      startLoop();
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("work-tile-hover", onTileHover);
    window.addEventListener("resize", onResize);

    return () => {
      stopLoop();
      clearTimeout(resizeTimer);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("work-tile-hover", onTileHover);
      window.removeEventListener("resize", onResize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="pointer-events-none absolute inset-0 z-[33]"
      aria-hidden="true"
      style={{ opacity: prefersReducedMotion ? 0.35 : desktopRedThreadOpacity(scrollYProgress.get()) }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      />
    </div>
  );
}
