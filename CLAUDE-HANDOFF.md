# CLAUDE-HANDOFF.md — Portfolio 2026 Redesign

> Handoff from a claude.ai planning session (July 2026). This file is the source of
> truth for the redesign work. Read it fully before writing any code.
> Repo: `~/Documents/Personal/portfolio-2026` — live site: https://iammarkperez.com
>
> **AMENDED (Task 0, 2026-07-02):** repo recon complete — see `RECON.md` for the full
> component map. Tasks below carry real file paths and `AMENDED` notes where the audit
> no longer matched the repo. The live site is a STALE deploy; some audit findings
> (marquees) do not exist in current `main`.
> **CORRECTED (Task 1):** "immersive web architecture" IS still in the repo
> (`src/components/work/DesktopWorkView.tsx:223–227`, wraps across JSX lines) — trim in Task 3.

---

## 1. Project context

- Owner: Mark (Darrel) Perez — social media manager / content creator / graphic designer, Dubai.
- Site: personal portfolio, Next.js 16.2.6 / React 19 / Tailwind v4 / Framer Motion + Lenis.
  Cinematic identity on warm off-white `#efeeeb`, PP Editorial serif display, red accent
  `#9F1F2E`, case-study pages (LSB Yacht Charter, Wake Dubai, CREED, Centurion Boats, +7 more).
- Goal: elevate from "polished portfolio" to Awwwards-competitive (SOTD-level) while
  doubling as a hiring asset (active job search: content creator / graphic designer roles).
- Awwwards judging weights for reference: Design 40%, Usability 30%, Creativity 20%, Content 10%.
- ⚠️ Next.js APIs differ from training data — read `node_modules/next/dist/docs/` before coding.

## 2. Design direction from Mark (planning session — overrides audit where they conflict)

1. **Branding stays exactly as-is** (palette, type, grain, "convey. create. curate.").
2. **Hero keeps a looping video** — signature interaction is layered around the loop.
3. **Kill the "PowerPoint" feel**: homepage sections currently cross-fade inside a sticky
   viewport; they must instead flow like real scrolling (translate-driven transitions,
   overlap, parallax depth). Core of Task 5.
4. **Signature motifs (desktop dynamic, mobile lite):**
   - **Red thread** — organic curving red line that draws itself with scroll and threads
     through the homepage, stitching sections together.
   - **Pointillism cursor field** — fine ink/red dots reacting to the cursor, living in
     the hero alongside the video loop (this is the Task 4 signature).
   - Mobile keeps the lite architecture: no canvas layers, opacity-driven sections,
     at most a static red-line accent. 60fps + `prefers-reduced-motion` fallbacks required.
5. Implementation coding is delegated to **Sonnet subagents**; reviewing model checks
   diffs against acceptance criteria before Mark's review.

## 3. Audit findings (P1–P7)

See original audit below each task, and `RECON.md` §3 for the full problem→file map.
Key status after recon:

- **P1** partially addressed (desktop hover titles exist; no category/year, no mobile labels, no a11y).
- **P2** obsolete as written (no marquees); residual: Curate reuses the Work gallery's 11 images.
- **P3** valid — hero is competent but anonymous.
- **P4** valid — no results/impact section anywhere.
- **P5** valid — root-only metadata, no OG images, empty homepage alt, "random photo lol"
  line present; "immersive web architecture" present in Work chrome (`DesktopWorkView.tsx:223–227`);
  loader stray-text unreproducible in code.
- **P6** valid and expanded by Mark's "PowerPoint" feedback.
- **P7** likely valid — no Lighthouse baseline yet; big videos (up to 45 MB), raw `<img>` galleries, empty `next.config.ts`.

## 4. Task plan (execute strictly in order, one task per session)

### Task 0 — Repo recon ✅ DONE (2026-07-02)
Output: `RECON.md`. This document amended in place.

### Task 1 — Label the works gallery (fixes P1)
Branch: `redesign/task-1-works-labels`
Files: `src/constants/workGalleryProjectTitles.ts` (extend to title/discipline/year record),
`src/components/WorkColumnGallery.tsx` (hover/focus label block, `GalleryImage` lines 83–108),
`src/components/work.tsx` (mobile captions, `WorkMobileGallery` lines 95–203),
`src/components/work/DesktopWorkView.tsx:262` (remove "CLICK ON AN IMAGE").
Acceptance criteria:
- Each tile shows project title, discipline, year — hover/focus reveal on desktop,
  always visible on touch.
- Labels are real text, keyboard-focusable, visible on `:focus-visible`, announced to
  screen readers (fix `alt=""`/link naming on gallery tiles).
- "CLICK ON AN IMAGE" removed. Zero CLS introduced.

### Task 2 — De-duplicate imagery + section contrast (fixes P2, rescoped)
Branch: `redesign/task-2-image-dedupe`
AMENDED (Task 0): no marquees exist; convey/create/curate already have distinct formats.
Files: `src/components/Curate.tsx`, `src/constants/workGalleryImages.ts`, `src/components/work.tsx`.
Acceptance criteria:
- No image appears twice on the homepage (Curate gets its own picks/crops vs. the Work gallery).
- Section copy still matches what each section visually does.

### Task 3 — Case study results + metadata/a11y cleanup (fixes P4 + P5)
Branch: `redesign/task-3-results-metadata`
Files: `src/constants/caseStudies/types.ts` (optional `results` field, lines 62–107),
new `src/components/case-study/CaseStudyResults.tsx` (follow the conditional pattern in
`CaseStudyPage.tsx`), `src/app/layout.tsx:18–21` + per-route metadata for all 14 routes,
`src/components/AboutContactShell.tsx:164,185` (cut "random photo lol" line),
homepage gallery alt text (`WorkColumnGallery.tsx:97`, `work.tsx:193`, `Curate.tsx`).
Acceptance criteria:
- "Results"/"Impact" section renders only when a case study supplies numbers (Mark supplies
  them; placeholder-safe — hides if empty). Style: large serif stats, red accent.
- Per-page `<title>`, description, OG image via Metadata API for every route incl. /about + /contact.
- All homepage images get meaningful alt text.
- Verify preloader counter never renders as stray text (post-deploy check; code looks fine).
- Trim "immersive web architecture" from the Work chrome copy
  (`src/components/work/DesktopWorkView.tsx:223–227`) — reword the specialist line to
  end without the overclaim.

### Task 4 — Signature hero (fixes P3)
Branch: `redesign/task-4-signature-hero`
DECISION MADE: looping video stays (`src/components/Hero.tsx`, `/hero-loop.mp4`);
signature layer = **pointillism cursor field** (canvas dots, repel/ripple + spring
re-settle, ink/red on off-white). Prototype pass first, then build.
Note: confirm purpose of untracked `public/signature-hero-banner.png` / `signature-hero-right.jpg`.
Acceptance criteria:
- 60fps on a mid-range laptop; particle count capped; canvas paused when hero off-screen.
- `prefers-reduced-motion` → poster + static composition; mobile hero unchanged (lite).
- Hero communicates "motion designer / cinematographer" within 4 seconds.

### Task 5 — Scroll flow re-edit (fixes P6, rescoped — biggest visible change)
Branch: `redesign/task-5-scroll-flow`
Files: `src/components/home/HomeDesktopStack.tsx`, `src/lib/desktopHomeTransitions.ts`
(desktop); `src/lib/mobileHomeOpacity.ts` (mobile, separately — never share curves,
see AGENTS.md); section components as needed.
Acceptance criteria:
- Section transitions read as vertical travel, not dissolves: outgoing content translates
  up/away, incoming rises from below, transitions overlap (no blank beat), per-layer parallax.
- **Red thread**: curving `#9F1F2E` SVG path draws with `scrollYProgress` through the whole
  homepage, layered between texture and content in the desktop stack.
- Velocity-aware skew/blur on fast scroll (desktop only).
- One full-viewport "loud" set piece + one deliberately quiet section in the lower half.
- Footer/homepage ends with a designed CTA moment, not a fade-out.
- Mobile stays lite (opacity spans in `mobileHomeOpacity.ts`; no canvas; static red accent at most).
- Reduced-motion falls back to simple fades / fully-drawn line.

### Task 6 — Performance pass (fixes P7)
Branch: `redesign/task-6-performance`
Files: `next.config.ts` (currently empty), `public/` video assets (esp. `wakedubai/wd-*.mp4`
13–45 MB), homepage gallery `<img>` → responsive strategy, case-study video posters.
Acceptance criteria:
- Lighthouse ≥ 90 desktop, ≥ 75 mobile (document before/after).
- Videos: poster frames everywhere, `preload="metadata"`/lazy strategies, compressed sources.
- Images: responsive `sizes`, nothing served above 2× rendered size, AVIF/WebP.
- No scroll jank on hero; red thread + pointillism hold 60fps (DevTools trace).

## 5. Working agreement for Claude Code

- ONE task per session. Finish, summarize the diff, STOP for Mark's review before
  the next task. Do not batch tasks.
- Plan before code: state approach + files, wait for a "go" if it differs from this doc.
- Do not redesign outside the active task's scope. Branding is untouchable.
- One branch per task (`redesign/task-N-…`); never commit directly to main.
- Coding delegated to Sonnet subagents; review diffs against acceptance criteria.
- If reality in the repo contradicts this document, flag it and propose an amendment.
- Housekeeping when convenient: untracked `scripts/debug-*` + `scripts/debug-output/`
  (gitignore or delete), untracked `public/signature-hero-*` (confirm with Mark).

## 6. Kickoff prompt for the next session

```
Read CLAUDE-HANDOFF.md and RECON.md in the repo root in full. Then execute Task 1
(works gallery labels) exactly as specified, on branch redesign/task-1-works-labels.
Delegate coding to a Sonnet subagent, review against the acceptance criteria,
summarize the diff, and stop for my review.
```
