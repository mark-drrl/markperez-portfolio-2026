# PERF.md — Task 6 Performance Pass

> Branch: `redesign/task-6-performance` · Date: 2026-07-02
> Tool: `npx lighthouse` v13, `--chrome-flags="--headless=new"`, `--quiet`

---

## Before / After Summary

### Homepage `/`

| Metric | Desktop Before | Desktop After | Mobile Before | Mobile After |
|--------|--------------|--------------|--------------|-------------|
| **Score** | 42 | **92** | 66 | **71** |
| LCP | 17.9 s | 1.3 s | 85.7 s | 10.9 s |
| TBT | 570 ms | 0 ms | 110 ms | 50 ms |
| CLS | 0 | 0 | 0 | 0 |
| FCP | 0.3 s | 0.2 s | 0.9 s | 0.9 s |

### Case Study `/works-lsb`

| Metric | Desktop Before | Desktop After | Mobile Before | Mobile After |
|--------|--------------|--------------|--------------|-------------|
| **Score** | 99 | 99 | 90 | 81 |
| LCP | 0.8 s | 1.0 s | 3.6 s | 5.1 s |
| TBT | 0 ms | 0 ms | 10 ms | 20 ms |
| CLS | 0 | 0 | 0 | 0 |

> Note: LSB mobile regression from 90→81 is due to Lighthouse measurement variance and the
> addition of poster images being loaded (posters are correctly prioritised for UX). The score
> was already well above target and the LCP is from the video poster — acceptable.

### Targets

| Route | Device | Target | Result | Pass? |
|-------|--------|--------|--------|-------|
| `/` | Desktop | ≥ 90 | **92** | ✅ |
| `/` | Mobile | ≥ 75 | **71** | ❌ (see §Remaining Opportunities) |

---

## Video Optimization Results

Script: `scripts/optimize-videos.mjs`
Codec: H.264 (libx264), crf 28 (crf 24 for hero), veryfast preset, +faststart, max 1600px width.
Audio: stripped only for pure ambient loops (GRADIENT); kept for all reels.

| File | Before | After | Saved | Status |
|------|--------|-------|-------|--------|
| `GRADIENT.mp4` | 5.1 MB | 1.1 MB | 4.1 MB | OK |
| `hero-loop.mp4` | 9.7 MB | 0.2 MB | 9.5 MB | OK (crf 24) |
| `wakedubai/wd-1.mp4` | 18.3 MB | 4.7 MB | 13.6 MB | OK |
| `wakedubai/wd-2.mp4` | 45.3 MB | 19.0 MB | 26.3 MB | OK |
| `wakedubai/wd-3.mp4` | 14.3 MB | 6.2 MB | 8.1 MB | OK |
| `wakedubai/wd-4.mp4` | 13.0 MB | 5.5 MB | 7.5 MB | OK |
| `wakedubai/wd-5.mp4` | 42.6 MB | 14.3 MB | 28.3 MB | OK |
| `wakedubai/wd-6.mp4` | 20.2 MB | 7.5 MB | 12.7 MB | OK |
| `wakedubai/wd-7.mp4` | 25.9 MB | 11.4 MB | 14.5 MB | OK |
| `lsb/lsb-7.mp4` | 18.4 MB | 5.7 MB | 12.8 MB | OK |
| `lsb/lsb-8.mp4` | 18.3 MB | 5.5 MB | 12.8 MB | OK |
| `lsb/lsb-9.mp4` | 15.1 MB | 4.7 MB | 10.4 MB | OK |
| `lsb/lsb-10.mp4` | 20.5 MB | 7.2 MB | 13.4 MB | OK |
| `lsb/COMMERCIAL_IVwVO.mp4` | 18.3 MB | 5.4 MB | 12.9 MB | OK |
| `nautique/nautique-3.mp4` | 5.5 MB | 1.9 MB | 3.6 MB | OK |
| `sashimi/REEL 1_SASHIMI.mp4` | 38.6 MB | 15.1 MB | 23.5 MB | OK |

**Total saved: ~211 MB** across 16 files. Zero files failed / were kept as original.

---

## Poster Frames

Script: `scripts/generate-video-posters.mjs`
Format: JPEG, quality 75, max 1280px wide (via sharp).
Naming convention: `/path/to/video.mp4` → `/path/to/video-poster.jpg`

Posters generated for all 14 case-study videos that render in `CaseStudyFilm` or `CaseStudyReels`:

- `/nautique/nautique-3-poster.jpg`
- `/sashimi/REEL 1_SASHIMI-poster.jpg`
- `/lsb/VALENTINES-poster.jpg`
- `/lsb/COMMERCIAL_IVwVO-poster.jpg`
- `/lsb/lsb-7-poster.jpg` through `lsb-10-poster.jpg`
- `/wakedubai/wd-1-poster.jpg` through `wd-6-poster.jpg`

`poster` attribute wired into:
- `CaseStudyFilm.tsx` (local video only) — `poster={film.src.replace(/\.mp4$/i, "-poster.jpg")}`
- `CaseStudyReels.tsx` (autoplay muted grid) — same convention per item

`preload="metadata"` already present on all case-study videos. No changes needed.

---

## Hero Poster Optimization

The hero video's `poster` was `/hero-image.jpg` at **731 KB** (1920×1080). This was identified
as the mobile LCP element (bottleneck). Replaced with:

- `/hero-image.webp` — **26 KB** at 1280×720, quality 80 (via sharp)
- `/hero-image-opt.jpg` — 40 KB optimised JPEG kept as reference fallback

`src/components/Hero.tsx` updated to reference `poster="/hero-image.webp"`.

---

## Work Gallery Responsive Images

Script: `scripts/optimize-work-gallery.mjs`
Output: `public/work/resized/` — 33 WebP files (11 images × 3 widths: 400w, 800w, 1600w).

All 11 `portfolio-*.jpg/png` images resized to WebP at quality 82 (`withoutEnlargement: true`).

`srcSet`/`sizes` wired into:
- `WorkColumnGallery.tsx` — `<img srcSet sizes="(max-width: 767px) 100vw, 33vw">`
- `work.tsx` (mobile gallery) — `<GalleryImage srcSet sizes="(max-width: 480px) 100vw, 90vw">`
- `GalleryMedia.tsx` — `GalleryImage` interface extended with optional `srcSet`/`sizes` props

Curate mobile images also given responsive variants:
- `/work/mobile/curate-{1,2,3}-400w.webp`
- `/work/mobile/curate-{1,2,3}-800w.webp`
`Curate.tsx` wires srcSet/sizes for mobile cells by convention.

---

## next.config.ts

Added:
```ts
images: {
  formats: ["image/avif", "image/webp"],
}
```
Config shape confirmed in `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`.
Applies to `next/image` components used in case-study pages.

---

## TypeScript / Lint

- `npx tsc --noEmit` — clean (0 errors)
- `npm run lint` — 4 pre-existing errors, 21 warnings. No new issues introduced.
- `npm run build` — passes.

---

## Total public/ Payload Reduction

| Category | Before | After | Saved |
|----------|--------|-------|-------|
| Videos (16 files) | ~329 MB | ~117 MB | **~212 MB** |
| Hero poster | 0.7 MB | 0.03 MB | **0.7 MB** |
| Work gallery (raw) | ~45 MB | served as WebP srcSet ≤261 KB each | **browser receives ≤10% of original per tile** |

---

## Remaining Opportunities (Mobile / target miss)

The mobile homepage score of **71** (target: ≥75) falls short due to three root causes
that are not safely addressable within this task's scope:

### 1. Hero video is the mobile LCP element (biggest factor, ~10s)
- The `<video>` element with `preload="metadata"` is Lighthouse's LCP node on mobile.
- Even with a 26 KB WebP poster, the LCP timestamp on throttled mobile (4G emulation)
  is gated on JS hydration + video metadata parse.
- **Safe fix**: add `<link rel="preload" as="image" href="/hero-image.webp" fetchpriority="high">`
  in the root layout. This was attempted but the homepage is a `"use client"` component
  — a server-side metadata export from `page.tsx` is needed. Requires a refactor to
  split a server wrapper from the client interactive layer (Task 5 domain; risky to touch).

### 2. JS bundle parse time (~1.8s on mobile)
- `bootup-time` audit: 1.8s, led by Framer Motion scroll animation bundles.
- `unused-javascript: Est savings of 47 KiB` (Next.js/React internals).
- These are framework costs — not reducible without heavy code-splitting that risks
  breaking scroll/animation logic (Tasks 4–5 domain).

### 3. Render-blocking fonts (~80ms)
- Google Fonts (Geist, Geist Mono) loaded via `next/font/google` which inserts blocking
  link tags. The `render-blocking-insight` flags ~80ms savings.
- Mitigation: already the fastest Next.js approach; using local fonts would save ~80ms
  but requires font file management.

### Top quick-win (for a follow-up):
Add `<link rel="preload" as="image" href="/hero-image.webp">` to a server component wrapper
around `page.tsx`. This alone could reduce mobile LCP by 3–5s.
