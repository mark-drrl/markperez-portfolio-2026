"use client";

/**
 * HeroPointillism — canvas-based dot field for the hero.
 *
 * Branding: ink #151515 (majority, low alpha) + red #9F1F2E accent (~8% of dots).
 * Desktop only: wrapped in hidden md:block; never renders on mobile / mobileLite paths.
 *
 * Architecture:
 *  - Single rAF loop, O(n) per frame, zero per-frame allocations (Float32Array backing).
 *  - Pauses when document.hidden OR heroOpacity MotionValue drops to 0.
 *  - Entrance: scatter-to-place over ~900 ms, staggered by per-dot noise phase.
 *  - Idle life: slow sine drift (amplitude ≤1.5 px) per dot phase.
 *  - Cursor repulsion: 130 px radius, radial falloff, spring back (stiffness 0.08, damping 0.82).
 *  - Density mask: dots thin toward center-bottom tagline zone.
 *  - Reduced motion: single static draw, no rAF.
 *  - DPR capped at 2.
 */

import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { useEffect, useRef } from "react";

// ─── Palette ──────────────────────────────────────────────────────────────────
const INK_COLOR = "51,51,51"; // #333333 rendered on off-white #efeeeb → reads as near-ink
const RED_COLOR = "159,31,46"; // #9F1F2E

// ─── Tuning constants ─────────────────────────────────────────────────────────
const GRID_SPACING_AT_1440 = 16; // px between dot centres at reference width
const MAX_DOTS = 2600;
const RED_FRACTION = 0.08; // ~8% dots are red accent
const DOT_RADIUS_MIN = 0.9; // px (logical)
const DOT_RADIUS_MAX = 1.5;
const REPEL_RADIUS = 130; // px (logical)
const SPRING_STIFFNESS = 0.08;
const SPRING_DAMPING = 0.82;
const IDLE_AMPLITUDE = 1.5; // px
const IDLE_SPEED = 0.0008; // radians per ms
const ENTRANCE_DURATION = 900; // ms

interface HeroPointillismProps {
  /** The hero's scroll-driven opacity MotionValue. Loop pauses when this hits 0. */
  heroOpacity: MotionValue<number>;
}

export default function HeroPointillism({ heroOpacity }: HeroPointillismProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // expose running state via data-attribute for testability
  const stateRef = useRef<"running" | "paused">("paused");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Alias so inner closures see a narrowed non-null type
    const el = canvas;

    // ── Reduced-motion: draw once, no rAF ─────────────────────────────────────
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    // ── DPR ───────────────────────────────────────────────────────────────────
    function getDpr() {
      return Math.min(window.devicePixelRatio || 1, 2);
    }

    // ── Build dot field ───────────────────────────────────────────────────────
    let dotCount = 0;
    // Typed arrays — pre-allocated, zero per-frame alloc
    const homeX = new Float32Array(MAX_DOTS);
    const homeY = new Float32Array(MAX_DOTS);
    const curX = new Float32Array(MAX_DOTS);
    const curY = new Float32Array(MAX_DOTS);
    const vx = new Float32Array(MAX_DOTS);
    const vy = new Float32Array(MAX_DOTS);
    const phase = new Float32Array(MAX_DOTS); // per-dot noise phase
    const radii = new Float32Array(MAX_DOTS);
    const alphaBase = new Float32Array(MAX_DOTS);
    // 0 = ink, 1 = red
    const colorFlag = new Uint8Array(MAX_DOTS);
    // entrance scatter offset (decays to 0)
    const scatterX = new Float32Array(MAX_DOTS);
    const scatterY = new Float32Array(MAX_DOTS);
    const entranceDelay = new Float32Array(MAX_DOTS); // ms

    function densityWeight(nx: number, ny: number): number {
      // nx, ny in 0–1 (normalised canvas coords)
      // Reduce density near center-bottom band (tagline lives around y=20–28%)
      const dx = nx - 0.5;
      const dy = ny - 0.23; // tagline vertical centre ~23%
      const dist = Math.sqrt(dx * dx + (dy * 1.6) * (dy * 1.6)); // squish vertically
      // smooth falloff: 0 at center, 1 at edges
      const falloff = Math.min(1, dist / 0.28);
      return 0.15 + 0.85 * falloff; // minimum density 15% even at center
    }

    function buildGrid(w: number, h: number) {
      const spacing =
        GRID_SPACING_AT_1440 * Math.sqrt((w * h) / (1440 * 900));
      const cols = Math.ceil(w / spacing);
      const rows = Math.ceil(h / spacing);
      const candidates: Array<{
        x: number;
        y: number;
        weight: number;
        noise: number;
      }> = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // jitter: ±35% of spacing (not row-based, noise from multiply)
          const jx = (Math.random() - 0.5) * spacing * 0.7;
          const jy = (Math.random() - 0.5) * spacing * 0.7;
          const x = (c + 0.5) * spacing + jx;
          const y = (r + 0.5) * spacing + jy;
          const nx = x / w;
          const ny = y / h;
          const weight = densityWeight(nx, ny);
          candidates.push({ x, y, weight, noise: Math.random() });
        }
      }

      // shuffle so we can take the first MAX_DOTS after rejection sampling
      candidates.sort(() => Math.random() - 0.5);

      let count = 0;
      for (const c of candidates) {
        if (count >= MAX_DOTS) break;
        // rejection sample by weight
        if (Math.random() > c.weight) continue;

        homeX[count] = c.x;
        homeY[count] = c.y;
        curX[count] = c.x;
        curY[count] = c.y;
        vx[count] = 0;
        vy[count] = 0;
        phase[count] = Math.random() * Math.PI * 2;
        radii[count] = DOT_RADIUS_MIN + Math.random() * (DOT_RADIUS_MAX - DOT_RADIUS_MIN);
        // ink dots: alpha 0.25–0.45; red: slightly higher 0.45–0.62
        colorFlag[count] = Math.random() < RED_FRACTION ? 1 : 0;
        alphaBase[count] = colorFlag[count]
          ? 0.45 + Math.random() * 0.17
          : 0.25 + Math.random() * 0.20;

        // entrance scatter: organic, driven by phase (not row order)
        const scatterAngle = Math.random() * Math.PI * 2;
        const scatterDist = 18 + Math.random() * 32;
        scatterX[count] = Math.cos(scatterAngle) * scatterDist;
        scatterY[count] = Math.sin(scatterAngle) * scatterDist;
        // stagger by noise * ENTRANCE_DURATION so organic, not row-based
        entranceDelay[count] = c.noise * ENTRANCE_DURATION * 0.6;

        count++;
      }

      dotCount = count;
    }

    // ── Resize ────────────────────────────────────────────────────────────────
    function resize() {
      const dpr = getDpr();
      const parent = el.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      buildGrid(w, h);
    }

    // ── Static draw (reduced-motion) ──────────────────────────────────────────
    function drawStatic() {
      const dpr = getDpr();
      const ctx = el.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      for (let i = 0; i < dotCount; i++) {
        ctx.beginPath();
        ctx.arc(homeX[i], homeY[i], radii[i], 0, Math.PI * 2);
        const color = colorFlag[i] ? RED_COLOR : INK_COLOR;
        ctx.fillStyle = `rgba(${color},${alphaBase[i].toFixed(3)})`;
        ctx.fill();
      }
      ctx.restore();
    }

    // ── rAF loop ──────────────────────────────────────────────────────────────
    let rafId = 0;
    let running = false;
    let ptrX = -9999;
    let ptrY = -9999;
    let startTime = 0;
    let lastTime = 0;

    function setRunning(next: boolean) {
      running = next;
      stateRef.current = next ? "running" : "paused";
      el.dataset.pointillismState = stateRef.current;
    }

    function tick(now: number) {
      if (!running) return;
      rafId = requestAnimationFrame(tick);

      if (startTime === 0) startTime = now;
      const elapsed = now - startTime;
      lastTime = now;

      const dpr = getDpr();
      const ctx = el.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, el.width, el.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      for (let i = 0; i < dotCount; i++) {
        // ── Entrance ────────────────────────────────────────────────────────
        const dotElapsed = Math.max(0, elapsed - entranceDelay[i]);
        const dotEntrance = Math.min(
          1,
          dotElapsed / (ENTRANCE_DURATION * 0.65),
        );
        // cubic ease-out
        const t = 1 - Math.pow(1 - dotEntrance, 3);
        const alpha = alphaBase[i] * t;

        // scatter offset decays with entrance
        const scatter = 1 - t;
        const sx = scatterX[i] * scatter;
        const sy = scatterY[i] * scatter;

        // ── Idle drift (sine offset by phase) ─────────────────────────────
        const driftX =
          IDLE_AMPLITUDE * Math.sin(now * IDLE_SPEED + phase[i]);
        const driftY =
          IDLE_AMPLITUDE * Math.cos(now * IDLE_SPEED * 0.73 + phase[i] + 1.2);

        // ── Spring back toward homeX/homeY ────────────────────────────────
        const targetX = homeX[i] + driftX + sx;
        const targetY = homeY[i] + driftY + sy;
        const distX = targetX - curX[i];
        const distY = targetY - curY[i];

        vx[i] = (vx[i] + distX * SPRING_STIFFNESS) * SPRING_DAMPING;
        vy[i] = (vy[i] + distY * SPRING_STIFFNESS) * SPRING_DAMPING;

        // ── Cursor repulsion ──────────────────────────────────────────────
        const rx = curX[i] - ptrX;
        const ry = curY[i] - ptrY;
        const distSq = rx * rx + ry * ry;

        if (distSq < REPEL_RADIUS * REPEL_RADIUS && distSq > 0.01) {
          const dist = Math.sqrt(distSq);
          const strength = 1 - dist / REPEL_RADIUS;
          // smooth falloff: strength² × 14 px max push per frame
          const push = strength * strength * 14;
          vx[i] += (rx / dist) * push;
          vy[i] += (ry / dist) * push;
        }

        curX[i] += vx[i];
        curY[i] += vy[i];

        // ── Draw ──────────────────────────────────────────────────────────
        // Near cursor boundary: slight alpha/radius boost (the "parting" reads)
        let drawR = radii[i];
        let drawAlpha = alpha;
        if (distSq < REPEL_RADIUS * REPEL_RADIUS && distSq > 0) {
          const dist = Math.sqrt(distSq);
          // boost peaks at 85% of repel radius
          const boundaryFactor =
            1 - Math.abs(dist / REPEL_RADIUS - 0.85) / 0.25;
          const boost = Math.max(0, boundaryFactor);
          drawR = radii[i] + boost * 0.55;
          drawAlpha = Math.min(1, alpha + boost * 0.18);
        }

        ctx.beginPath();
        ctx.arc(curX[i], curY[i], drawR, 0, Math.PI * 2);
        const color = colorFlag[i] ? RED_COLOR : INK_COLOR;
        ctx.fillStyle = `rgba(${color},${drawAlpha.toFixed(3)})`;
        ctx.fill();
      }

      ctx.restore();
    }

    function startLoop() {
      if (running || reducedMotionQuery.matches) return;
      setRunning(true);
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    }

    function stopLoop() {
      setRunning(false);
      cancelAnimationFrame(rafId);
      rafId = 0;
    }

    // ── Pointer tracking (window coords → canvas logical coords) ─────────────
    function onPointerMove(e: PointerEvent) {
      const rect = el.getBoundingClientRect();
      ptrX = e.clientX - rect.left;
      ptrY = e.clientY - rect.top;
    }

    function onPointerLeave() {
      ptrX = -9999;
      ptrY = -9999;
    }

    // ── Visibility gating: page visibility ────────────────────────────────────
    function onVisibilityChange() {
      if (document.hidden) {
        stopLoop();
      } else if (!reducedMotionQuery.matches) {
        startLoop();
      }
    }

    // ── Resize (debounced 200ms) ──────────────────────────────────────────────
    let resizeTimer: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        if (reducedMotionQuery.matches) {
          drawStatic();
        } else {
          // Reset entrance on resize so dots settle into new positions
          startTime = 0;
        }
      }, 200);
    }

    // ── Reduced-motion handler ────────────────────────────────────────────────
    function onReducedMotionChange(e: MediaQueryListEvent) {
      if (e.matches) {
        stopLoop();
        drawStatic();
      } else {
        startTime = 0; // re-run entrance
        startLoop();
      }
    }

    // ── Initial setup ─────────────────────────────────────────────────────────
    resize();

    if (reducedMotionQuery.matches) {
      drawStatic();
      el.dataset.pointillismState = "paused";
    } else {
      startLoop();
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("resize", onResize);
    reducedMotionQuery.addEventListener("change", onReducedMotionChange);

    // ── heroOpacity subscription: pause when hero is off-screen ──────────────
    // We subscribe OUTSIDE the useEffect via useMotionValueEvent (see below),
    // but we also need the unsubscribe here. We use a ref that the outer
    // useMotionValueEvent hook populates.

    // Expose control functions so outer hook can pause/resume
    el.dataset.pointillismState = reducedMotionQuery.matches
      ? "paused"
      : "running";

    // Return a context object on the canvas so the opacity subscriber can call it
    (el as HTMLCanvasElement & { __pointillism?: { start: () => void; stop: () => void } }).__pointillism = {
      start: () => {
        if (!reducedMotionQuery.matches && !document.hidden) {
          startLoop();
        }
      },
      stop: stopLoop,
    };

    return () => {
      stopLoop();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("resize", onResize);
      reducedMotionQuery.removeEventListener("change", onReducedMotionChange);
      clearTimeout(resizeTimer);
      delete (el as HTMLCanvasElement & { __pointillism?: unknown }).__pointillism;
    };
  }, []);

  // ── Visibility gating via heroOpacity MotionValue ─────────────────────────
  // Reuses the existing MotionValue; no new scroll listener.
  useMotionValueEvent(heroOpacity, "change", (latest) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctrl = (canvas as HTMLCanvasElement & { __pointillism?: { start: () => void; stop: () => void } }).__pointillism;
    if (!ctrl) return;
    if (latest <= 0.02) {
      ctrl.stop();
    } else {
      ctrl.start();
    }
  });

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
      data-pointillism-state="paused"
    />
  );
}
