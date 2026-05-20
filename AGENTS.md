<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Mobile home scroll (isolated from desktop)

**Architecture (do not merge mobile + desktop scroll logic):**

| Layer | File | Visibility |
|-------|------|------------|
| Mobile stack | `src/components/home/HomeMobileStack.tsx` | `md:hidden` (CSS) |
| Desktop stack | `src/components/home/HomeDesktopStack.tsx` | `hidden md:contents` |
| Shared scroll | `useHomeScrollProgress(containerRef)` in `page.tsx` | `window.scrollY / main height` |
| Main height | `h-[1800vh] md:h-[3600vh]` in `page.tsx` | Tailwind only — no JS height |

**Mobile section timing:** `MOBILE_SECTION_SPAN` in `src/lib/mobileHomeOpacity.ts` only.

**Rules:**

1. Never drive mobile opacity from desktop curves or `pickHomeSectionOpacity` mode switching.
2. Do not use `visibility: hidden` on mobile section wrappers — opacity only.
3. Convey/Create `mobileLite`: inner content follows scroll + `mobile*Opacity(progress)`; no ripple masks on mobile video.
4. Desktop changes stay in `HomeDesktopStack.tsx` — do not edit mobile spans when fixing desktop.

**Preview (Cursor):** narrow pane &lt; 768px uses mobile via CSS `md:` breakpoint, not `window.innerWidth` alone.
