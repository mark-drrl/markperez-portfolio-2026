# RECON.md — Task 0 output (July 2026)

> Repo recon for the redesign plan in `CLAUDE-HANDOFF.md`. Maps every audit problem
> (P1–P7) to concrete files, flags where the handoff doc no longer matches the repo,
> and records Mark's design direction locked in during the planning session.
> No code was changed in Task 0.

---

## 0. Headline finding: the repo is AHEAD of the live site

The claude.ai audit reviewed **iammarkperez.com**, which is a stale deploy. Recent
commits (`a7e5313` works-page rebuild, `b3a2d7f` Creed + scroll snap, `6bdedba`
frosted transitions) already removed or fixed several audited items:

| Audit claim | Repo reality |
|---|---|
| Multiple marquee strips (P2) | **No marquee components exist.** Convey/Create/Curate already have distinct formats. |
| Tagline "immersive web architecture" (P5) | Still present — `DesktopWorkView.tsx:223–227` (Work-section chrome; grep missed it due to JSX line wrap). Trim in Task 3. |
| Works index fully unlabeled (P1) | Desktop tiles already show project title on hover (`GalleryHoverTitle`). Category/year, mobile labels, and a11y still missing. |
| Videos without posters (P7) | Hero video **has** a poster (`Hero.tsx:90`). Case-study/section videos do not. |

**Recommendation:** deploy current `main` (or note the delta) before any re-audit;
otherwise we chase ghosts.

---

## 1. Stack snapshot

- **Next.js 16.2.6** — App Router. ⚠️ APIs differ from training data; read
  `node_modules/next/dist/docs/` before coding (per `AGENTS.md`).
- React 19.2.4 · TypeScript 5 · Tailwind **v4** (no config file; `@theme` in `src/app/globals.css`)
- Framer Motion 12.38 (all scroll-linked animation) · Lenis 1.3 (desktop home smooth scroll only)
- `sharp` available; `scripts/optimize-curate-mobile.mjs` is an existing optimization precedent
- No test framework. No CMS — all content is TypeScript constants.
- Fonts: PP Editorial (serif display), PP Neue Montreal (sans), Geist/Geist Mono (layout-level).
- Palette: warm off-white `#efeeeb` fields, near-black ink, accent red `#9F1F2E`.

## 2. Homepage architecture (context for Tasks 2, 4, 5)

- `src/app/page.tsx` (~503 lines): `main` track `h-[2100vh] md:h-[3600vh]` with a
  sticky `h-screen` viewport; `useHomeScrollProgress(containerRef)` yields one
  `scrollYProgress` MotionValue that drives everything.
- Desktop stack: `src/components/home/HomeDesktopStack.tsx` — z-layered sections,
  opacity/blur curves from `src/lib/desktopHomeTransitions.ts`.
- Mobile stack: `src/components/home/HomeMobileStack.tsx` — opacity-only spans from
  `src/lib/mobileHomeOpacity.ts` (`MOBILE_SECTION_SPAN`). **Never merge mobile +
  desktop logic** (see `AGENTS.md` rules).
- Sections: `Hero.tsx`, `Convey.tsx` (video rect + burst mask), `Create.tsx`
  (7-cell grid + ripple masks), `Curate.tsx` (gallery cells + frosted blur),
  `work.tsx` (works gallery).
- Extras: `FluidDistortion` + grain (desktop), custom cursor (`page.tsx:467–487`),
  scroll bridge `src/lib/workScrollBridge.ts` (Lenis ↔ native handoff).

## 3. Problem → file map

### P1 — Works index labels
| What | Where |
|---|---|
| Desktop gallery (3-col) | `src/components/WorkColumnGallery.tsx` (`GalleryImage` lines 83–108; hover title line 102; `alt=""` line 97) |
| Desktop chrome | `src/components/work/DesktopWorkView.tsx` — **"CLICK ON AN IMAGE" at line 262** |
| Mobile gallery | `src/components/work.tsx` (`WorkMobileGallery` lines 95–203; `alt=""` line 193; **no labels at all**) |
| Image list | `src/constants/workGalleryImages.ts` (11 images) |
| Tile → route map | `src/constants/workGalleryLinks.ts` |
| Titles (title-only today) | `src/constants/workGalleryProjectTitles.ts` — no client/year/discipline fields yet |

### P2 — Section variety / image repetition (rescoped — no marquees exist)
- Residual issue: `Curate.tsx` renders the **same 11 `workGalleryImages`** later reused
  by the Work gallery; mobile Work loops copies for infinite scroll.
- Files: `src/components/Curate.tsx` (image cells ~lines 159–206), `src/components/work.tsx`,
  `src/constants/workGalleryImages.ts`.

### P3 — Signature hero
- `src/components/Hero.tsx` (225 lines): `/hero-loop.mp4` + poster `/hero-image.jpg`,
  `preload="metadata"`, tagline "convey. create. curate." + "MARK PEREZ // AI & TRADITIONAL",
  nav (ABOUT/WORK/CONTACT), scroll cue.
- ⚠️ Untracked assets `public/signature-hero-banner.png`, `public/signature-hero-right.jpg`
  suggest hero exploration already started — Mark to confirm what they're for.

### P4 — Case-study results section (missing)
- Template: `src/components/case-study/CaseStudyPage.tsx` — render order Hero →
  Overview → Narrative → FullBleed → Process → Film? → Reels? → Gallery? → Documents? →
  Credits → Outro. Conditional pattern to copy: `{content.film ? <CaseStudyFilm/> : null}`.
- Types: `src/constants/caseStudies/types.ts` (`CaseStudyContent`, lines 62–107 — add optional `results` here).
- Data: `src/constants/caseStudies/{slug}.ts` × 11; `registry.ts`; `finalizeCaseStudy()` +
  cyclic next-links in `helpers.ts`.
- CREED "From prompt to picture" (protect/amplify): data `src/constants/caseStudies/creed.ts:50–87`,
  renderer `src/components/case-study/CaseStudyProcess.tsx`.

### P5 — Metadata / a11y / copy
- Metadata: **root layout only** — `src/app/layout.tsx:18–21` (`title: "MARK PEREZ"`,
  `description: "Selected Works"`). Zero `generateMetadata`/route metadata, no OG or
  Twitter images anywhere. Next 16 still supports the classic Metadata API.
- Empty alt: homepage galleries (`WorkColumnGallery.tsx:97`, `work.tsx:193`,
  `Curate.tsx` ~180). Case-study images all have descriptive alt ✓ (in data modules).
- Preloader counter: `src/components/PageLoader.tsx:206–208` — zero-padded "000"
  inside the loader overlay (`aria-live="polite"`). Stray-text repro from the audit
  not reproducible in code; likely stale deploy — verify after next deploy.
- About copy: "I like the outdoors so I used this random photo lol" —
  `src/components/AboutContactShell.tsx:164` (mobile) and `:185` (desktop).
- "immersive web architecture": **present** in the Work-section chrome copy —
  `src/components/work/DesktopWorkView.tsx:223–227` ("Full-stack Creative Specialist …
  and immersive web architecture."). Earlier grep missed it because the phrase wraps
  across JSX lines. Trim in Task 3 as originally planned.
- Flat URLs: `/works-{centurionv1,lifestyle,soren,lsb,wakedubai,nautique,interior,atm,phase5page,supreme,creed}` — cosmetic, low priority (unchanged).

### P6 — Scroll pacing / flow  ← rescoped, see §4.3
- Owner files: `src/app/page.tsx`, `HomeDesktopStack.tsx`, `desktopHomeTransitions.ts`,
  `mobileHomeOpacity.ts`, section components.
- Endings today: case studies end well (`CaseStudyOutro.tsx` next-project link);
  About/Contact ends with "Website made with FIGMA/CURSOR/CLAUDE"
  (`AboutContactShell.tsx:231–241`); homepage has no designed CTA ending.

### P7 — Performance
- Videos (`public/`): `hero-loop.mp4` 9.7M, `GRADIENT.mp4` 5.1M, `grain.mp4` 15M
  (+webm variants), `lsb/*.mp4` 2.8–21M, `wakedubai/wd-*.mp4` **13–45M**,
  `nautique-3.mp4` 5.5M. Posters: hero only.
- Images: case studies use `next/image` with `sizes` ✓; homepage galleries use raw
  `<img>` (no `sizes`, no responsive widths). `next.config.ts` is **empty** (defaults).
- No Lighthouse baseline recorded yet — capture before/after in Task 6.

---

## 4. Design direction locked in with Mark (planning session, July 2026)

1. **Branding stays exactly as-is** — palette, type, grain, "convey. create. curate."
   All work is motion/structure/content inside the existing art direction.
2. **Hero keeps a looping video.** Signature layer is built around the loop, not instead of it.
3. **Kill the "PowerPoint" feel.** Sections currently cross-fade in a fixed viewport;
   motion must instead follow the scroll: outgoing content translates up + away,
   incoming rises from below with parallax depth, sections overlap (no blank beat),
   velocity-aware skew/blur on desktop. Opacity/blur become secondary.
4. **Two signature motifs (desktop only; mobile stays lite):**
   - **Red thread** — an organic curving `#9F1F2E` line that draws itself with scroll
     and threads through the whole homepage (SVG stroke-dash tied to `scrollYProgress`,
     layered between texture and content in the desktop stack). Doubles as the bridge
     element stitching sections together; may echo on case-study pages as a thin progress thread.
   - **Pointillism cursor field** — canvas layer of fine ink/red dots reacting to the
     cursor (repel/ripple, spring re-settle), living in the hero over/beside the video
     loop (this IS the Task 4 signature); optional quiet reprise at the footer CTA.
   - Guardrails: 60fps on mid-range hardware, particle count capped, canvas paused
     off-screen, `prefers-reduced-motion` → line fully drawn + static dots.
     Mobile: at most a static/CSS-only red accent; no canvas.

---

## 5. Amended task list (supersedes handoff §3; one task per session)

- **Task 1 — Label the works gallery** (P1): extend `workGalleryProjectTitles.ts` into a
  proper per-project record (title/discipline/year), hover+focus label block on desktop
  (`WorkColumnGallery.tsx`), always-visible captions on mobile (`work.tsx`), remove
  "CLICK ON AN IMAGE" (`DesktopWorkView.tsx:262`), real text + focusable + SR-announced, zero CLS.
- **Task 2 — De-duplicate imagery + section contrast** (P2 rescoped): Curate gets its own
  image picks/crops so nothing repeats across the homepage; light rhythm pass only.
- **Task 3 — Results section + metadata/a11y/copy** (P4+P5): optional `results` in
  `types.ts` + `CaseStudyResults` component (hidden when empty, stats in serif + red);
  per-route titles/descriptions/OG via Metadata API incl. `/about`+`/contact`; meaningful
  alt on homepage images; verify loader counter post-deploy; cut the "random photo lol"
  line; trim "immersive web architecture" from the Work chrome copy (`DesktopWorkView.tsx:223–227`).
- **Task 4 — Signature hero** (P3): looping video stays; add pointillism cursor field
  (prototype first, then build); reduced-motion fallback = poster + static composition.
- **Task 5 — Scroll flow re-edit** (P6 rescoped, biggest change): translate-driven
  section transitions with overlap + parallax; **red thread** scroll-drawn through the
  page; velocity skew/blur; one loud set piece + one quiet section low on the page;
  designed CTA ending. Desktop in `HomeDesktopStack.tsx`/`desktopHomeTransitions.ts`;
  mobile separately in `mobileHomeOpacity.ts` per AGENTS.md.
- **Task 6 — Performance** (P7): Lighthouse baseline → posters for all videos, compress
  (esp. `wakedubai/`), lazy strategies, responsive images/`sizes` on homepage galleries,
  configure `next.config.ts` image settings; targets ≥90 desktop / ≥75 mobile; verify
  60fps on red thread + pointillism.

**Housekeeping (any session):** decide fate of untracked `scripts/debug-*` +
`scripts/debug-output/` (gitignore or delete); confirm purpose of untracked
`public/signature-hero-*` assets.

## 6. Working agreement (unchanged from handoff §4)

One task per session → summarize diff → STOP for Mark's review. One branch per task
(`redesign/task-1-works-labels`, …). Coding is delegated to Sonnet subagents with
review against acceptance criteria before handoff. If the repo contradicts the plan,
flag it — don't improvise.
