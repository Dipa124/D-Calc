# CalcFDM — Worklog

## Current Project Status: ✅ FULLY FUNCTIONAL (v5 — Auth + Dashboard)

CalcFDM is a professional FDM 3D printing price calculator built with Next.js 16, TypeScript, Tailwind CSS 4, and shadcn/ui.

### Architecture
- **Frontend**: Next.js 16 App Router with `'use client'` components
- **Styling**: Tailwind CSS 4 with copper/sage/night/diamond theme (light + dark mode)
- **Animations**: Framer Motion + CSS keyframes (blobs, particles, shimmer, pulse-glow)
- **Fonts**: Space Grotesk (display/headings) + DM Sans (body)
- **State**: React hooks + localStorage persistence (guest) / Prisma SQLite (authenticated)
- **Auth**: NextAuth.js v4 with Credentials provider (JWT sessions)
- **Database**: Prisma ORM with SQLite (User, Project, Sale models)
- **Calculation**: Pure TypeScript calculation engine
- **Layout**: 3-panel adaptive (sidebar | main | results on desktop, 2-col on tablet, stacked on mobile)

### Key Files
| File | Purpose |
|------|---------|
| `src/lib/types.ts` | Domain types, constants, defaults, PARAM_TOOLTIPS — Lujo uses diamond (#4FC3F7) |
| `src/lib/calculator.ts` | Core FDM price calculation engine |
| `src/lib/auth.ts` | NextAuth configuration (Credentials provider, JWT, callbacks) |
| `src/lib/db.ts` | Prisma client singleton |
| `src/app/globals.css` | Full theme: blobs, particles, shimmer, pulse-glow, animated grid, glass cards |
| `src/app/layout.tsx` | Root layout with fonts + ThemeProvider + AuthProvider |
| `src/app/page.tsx` | Main page — 3-panel layout, collapsible sidebar, animated backgrounds, auth integration |
| `src/hooks/use-persisted-project.ts` | localStorage persistence hook |
| `src/components/auth-provider.tsx` | SessionProvider wrapper for NextAuth |
| `src/components/calculator/auth-panel.tsx` | Login/register modals + user dropdown |
| `src/components/calculator/dashboard.tsx` | Stats dashboard (revenue, projects, sales, monthly breakdown) |
| `src/components/calculator/info-tooltip.tsx` | Reusable InfoTooltip component using shadcn/ui Tooltip |
| `src/components/calculator/price-results.tsx` | Tier cards + horizontal breakdown bar with animated segments |
| `src/components/calculator/export-options.tsx` | Print/PDF export (producer + buyer) using hidden iframe |
| `src/components/calculator/sub-piece-form.tsx` | Sub-piece form with tooltips, pencil icon, laborTimeMinutes |
| `src/components/calculator/project-settings-form.tsx` | Settings form with tooltips on every param |
| `src/components/calculator/sale-type-selector.tsx` | Sale type with number input for custom multiplier |
| `src/components/calculator/finish-type-selector.tsx` | Finish type with number input for custom cost |
| `src/types/next-auth.d.ts` | TypeScript declarations for NextAuth session types |

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

---

## Session 4 — Professional Redesign + Desktop Layout + Tooltips

### Task ID: 3-6-combined
**Agent**: Main Orchestrator

### Work Log:
- **Rediseñado: Layout 3 paneles** — Desktop (lg+): sidebar (Sale+Params) | main (Pieces) | right (Results+Export). Tablet (md): 2-column. Mobile: stacked with collapsible sections
- **Añadido: Sidebar colapsable** — Desktop sidebar can be collapsed via toggle button, redistributing space to main and right panels
- **Añadido: InfoTooltip** — Every parameter label now has an "i" icon tooltip using PARAM_TOOLTIPS from types.ts. Used in: sub-piece-form, project-settings-form, sale-type-selector, finish-type-selector
- **Añadido: Pencil icon** — Project name and piece names show a Pencil icon to indicate they're editable
- **Añadido: laborTimeMinutes** — New field in SubPiece form for dedicated labor/supervision time, separate from postProcessingTimeMinutes, with tooltip
- **Corregido: Filamento dropdown** — Removed descriptions in parentheses; Custom type shows "Personalizado" without price suggestion; other types show "TYPE — price€/kg"
- **Corregido: Custom multiplier** — Replaced range slider (max 5) with number input allowing any positive value
- **Corregido: Custom finish cost** — Replaced range slider (max 50) with number input allowing any positive value
- **Corregido: Export about:blank** — Replaced `window.open('', '_blank')` with hidden iframe approach to avoid "about:blank" appearing in print footer
- **Pulido: Price results** — Better spacing, icon backgrounds, animated "Seleccionado" badge, animated breakdown bar segments
- **Pulido: Cost breakdown** — Better visual hierarchy, colored tier dot, highlighted total row, subtle row backgrounds for bold items
- **Mejorado: max-w** — Increased max-width from 7xl to 1600px for wider desktop layout
- **Eliminado: Export duplicado** — Export only appears in right panel (not duplicated in sidebar)

### Changes Summary:
1. `page.tsx` — Complete rewrite: 3-panel layout with collapsible sidebar, pencil icon on project name, responsive detection with useIsMobile
2. `sub-piece-form.tsx` — Complete rewrite: InfoTooltip on every label, pencil icon on name, laborTimeMinutes field, fixed filament dropdown
3. `project-settings-form.tsx` — Complete rewrite: InfoTooltip on every param label via tooltipKey prop
4. `sale-type-selector.tsx` — Complete rewrite: Number input for custom multiplier (no cap), InfoTooltip
5. `finish-type-selector.tsx` — Complete rewrite: Number input for custom cost (no cap), InfoTooltip
6. `export-options.tsx` — Complete rewrite: Hidden iframe print approach instead of window.open
7. `price-results.tsx` — Complete rewrite: Animated tier badge, icon backgrounds, animated breakdown bar segments
8. `cost-breakdown.tsx` — Complete rewrite: Tier dot indicator, highlighted totals, AnimatePresence on sub-piece expand

### Verified:
- ✅ Lint passes cleanly
- ✅ 3-panel layout on desktop with collapsible sidebar
- ✅ 2-column layout on tablet, stacked on mobile
- ✅ InfoTooltip on every parameter in all forms
- ✅ Pencil icon on project name and piece names
- ✅ laborTimeMinutes field in sub-piece form
- ✅ Filament dropdown shows clean options without descriptions
- ✅ Custom multiplier allows any positive value
- ✅ Custom finish cost allows any positive value
- ✅ Export uses hidden iframe (no about:blank)
- ✅ Animated transitions on tier selection and breakdown bar

---

## Session 5 — Authentication System + Dashboard + Sales API

### Task ID: 8
**Agent**: Main Orchestrator

### Work Log:
- **Añadido: Prisma Schema** — Updated schema with `User` (email, password hashed), `Project` (JSON data), `Sale` (tier, saleType, quantity, unitPrice, totalPrice, notes) models with indexes
- **Añadido: NextAuth v4** — Credentials provider (email+password), JWT sessions (30-day expiry), custom callbacks for user ID in token/session
- **Añadido: Auth API routes** — `POST /api/auth/register` (email/password/name with bcrypt hashing, auto-login after registration)
- **Añadido: Projects API** — `GET/POST /api/projects` (list user projects, create new), `GET/PUT/DELETE /api/projects/[id]` (with ownership verification)
- **Añadido: Sales API** — `GET/POST /api/sales` (list with filters: projectId, dateRange; record new sale with ownership check), `GET /api/sales/stats` (total revenue, projects, sales, avg price, monthly breakdown, sales by tier, recent sales)
- **Añadido: AuthPanel** — Login/register dialog modals with shadcn/ui Dialog, user avatar dropdown (Dashboard + Cerrar sesión), animated error messages, auto-login after registration
- **Añadido: Dashboard** — Full-screen overlay with 4 stat cards (revenue/projects/sales/avg price), monthly revenue bar chart, sales by tier breakdown, recent sales list. Uses copper/sage/gold/diamond color scheme with glass-card styling
- **Añadido: Guest banner** — Subtle card in results panel suggesting sign-in to save projects and access statistics
- **Añadido: Save project button** — Sage-colored Save icon in header (authenticated only), checks for existing project and creates/updates accordingly
- **Añadido: Record sale button** — Green gradient button below results (authenticated only), auto-saves project then records the sale
- **Añadido: AuthProvider** — SessionProvider wrapper for NextAuth, added to layout.tsx
- **Añadido: TypeScript declarations** — `src/types/next-auth.d.ts` for custom session/user types
- **Instalado: bcryptjs + @types/bcryptjs** — For secure password hashing

### Changes Summary:
1. `prisma/schema.prisma` — Added User (with password), Project (JSON data), Sale models with proper indexes and cascading deletes
2. `.env` — Added NEXTAUTH_SECRET, NEXTAUTH_URL
3. `src/lib/auth.ts` — New: NextAuth configuration
4. `src/app/api/auth/[...nextauth]/route.ts` — New: NextAuth route handler
5. `src/app/api/auth/register/route.ts` — New: User registration endpoint
6. `src/app/api/projects/route.ts` — New: List/Create projects
7. `src/app/api/projects/[id]/route.ts` — New: Get/Update/Delete project with ownership checks
8. `src/app/api/sales/route.ts` — New: List/Create sales with filters
9. `src/app/api/sales/stats/route.ts` — New: Dashboard statistics
10. `src/components/auth-provider.tsx` — New: SessionProvider wrapper
11. `src/components/calculator/auth-panel.tsx` — New: Login/register modals + user dropdown
12. `src/components/calculator/dashboard.tsx` — New: Stats dashboard
13. `src/types/next-auth.d.ts` — New: TypeScript declarations for NextAuth
14. `src/app/layout.tsx` — Updated: Added AuthProvider wrapper
15. `src/app/page.tsx` — Updated: Auth integration, guest banner, save/recording buttons, dashboard overlay

### Verified:
- ✅ Lint passes cleanly (0 errors, 0 warnings)
- ✅ Prisma schema pushed successfully
- ✅ Guest mode: calculator works without login
- ✅ Auth modals: login/register with validation
- ✅ Authenticated: save project, record sale, dashboard access
- ✅ Dashboard: stat cards, monthly chart, tier breakdown, recent sales
- ✅ API routes: proper auth checks and ownership verification
