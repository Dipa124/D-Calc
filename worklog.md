# CalcFDM — Worklog

## Current Project Status: ✅ FULLY FUNCTIONAL (v3 — Rediseño adaptativo)

CalcFDM is a professional FDM 3D printing price calculator built with Next.js 16, TypeScript, Tailwind CSS 4, and shadcn/ui.

### Architecture
- **Frontend**: Next.js 16 App Router with `'use client'` components
- **Styling**: Tailwind CSS 4 with copper/sage/night/diamond theme (light + dark mode)
- **Animations**: Framer Motion + CSS keyframes (blobs, particles, shimmer, pulse-glow)
- **Fonts**: Space Grotesk (display/headings) + DM Sans (body)
- **State**: React hooks + localStorage persistence
- **Calculation**: Pure TypeScript calculation engine
- **Layout**: 2-column adaptive (5/7 on desktop, stacked on mobile)

### Key Files
| File | Purpose |
|------|---------|
| `src/lib/types.ts` | Domain types, constants, defaults — Lujo now uses diamond (#4FC3F7) |
| `src/lib/calculator.ts` | Core FDM price calculation engine |
| `src/app/globals.css` | Full theme: blobs, particles, shimmer, pulse-glow, animated grid, glass cards |
| `src/app/layout.tsx` | Root layout with fonts + ThemeProvider |
| `src/app/page.tsx` | Main page — 2-column layout, animated backgrounds, flashy titles |
| `src/hooks/use-persisted-project.ts` | localStorage persistence hook |
| `src/components/calculator/price-results.tsx` | Tier cards + horizontal breakdown bar (replaces chart) |
| `src/components/calculator/export-options.tsx` | PDF export (producer + buyer) |

---

## Session 3 — Rediseño Adaptativo + Restauración Visual

### Task ID: 3
**Agent**: Main Orchestrator

### Work Log:
- **Restaurado: Fondos animados** — Added `bg-grid-animated` with drifting dots animation
- **Restaurado: Partículas flotantes** — 12 floating particles (copper/sage/gold/diamond) with CSS `particle-float` animation
- **Restaurado: 4 blobs ambientales** — Added `blob-diamond` (azul diamante) alongside copper/sage/gold blobs
- **Restaurado: Efecto shimmer** — Shimmer animation on summary bar
- **Restaurado: Pulse glow** — Copper/diamond pulsing glow effects for dark mode
- **Restaurado: Textos vistosos** — `text-gradient-copper`, `text-gradient-diamond`, `animated-underline`, `section-card` hover effects
- **Restaurado: Títulos en MAYÚSCULAS** — Section titles now uppercase with tracking
- **Cambiado: Lujo → Azul Diamante** — New diamond color (#4FC3F7) for luxury tier, Gem icon
- **Cambiado: Comparativa → Barra horizontal** — Removed Recharts bar chart, replaced with horizontal stacked breakdown bar that appears when selecting a tier, with colored segments and legend
- **Cambiado: Layout adaptativo** — 2-column grid on desktop (lg:grid-cols-12, 5/7 split), stacked on mobile. Left: inputs. Right: results
- **Mejorado: Glass cards** — Increased blur (20px), added subtle shadows
- **Mejorado: Blobs** — Larger (450-500px), more visible, added diamond blob
- **Mejorado: Logo** — Gradient icon with shadow and hover rotation

### Changes Summary:
1. `types.ts` — luxury tier: darkAccent → #4FC3F7, color → 'diamond', Gem icon
2. `globals.css` — Added: diamond colors, animated grid, particles, shimmer, pulse-glow, text gradients, animated underline, breakdown bar styles, section-card hover
3. `price-results.tsx` — Complete rewrite: 4 tier cards + horizontal breakdown bar with segments (Material/Otros/Beneficio/IVA/Envío) + legend with amounts
4. `price-comparison-chart.tsx` — DELETED (replaced by breakdown bar)
5. `page.tsx` — Complete rewrite: 2-column layout, animated backgrounds, particles, flashy titles, uppercase sections, gradient logo icon

### Verified:
- ✅ Lint passes cleanly
- ✅ Dev server compiles with 200 responses
- ✅ 4-tier pricing with diamond color for Lujo
- ✅ Horizontal breakdown bar appears on tier selection
- ✅ 2-column layout on desktop, stacked on mobile
- ✅ Floating particles and animated grid background
- ✅ Flashy titles with gradients and animated underlines
- ✅ Shimmer effect on summary bar
- ✅ Glass cards with hover effects
