# Task 3-6-combined — Professional Redesign + Desktop Layout + Tooltips

## Agent: Main Orchestrator
## Status: ✅ COMPLETED

## Summary
Complete rewrite of 8 files to transform CalcFDM from a 2-column prototype into a professional SaaS-quality 3-panel layout with tooltips, pencil icons, labor time field, and polished visual design.

## Files Rewritten
1. `src/app/page.tsx` — 3-panel layout (sidebar | main | results), collapsible sidebar, pencil icon on project name
2. `src/components/calculator/sub-piece-form.tsx` — InfoTooltip on every label, pencil icon on name, laborTimeMinutes field, fixed filament dropdown
3. `src/components/calculator/project-settings-form.tsx` — InfoTooltip on every param label via tooltipKey prop
4. `src/components/calculator/sale-type-selector.tsx` — Number input for custom multiplier (no artificial cap), InfoTooltip
5. `src/components/calculator/finish-type-selector.tsx` — Number input for custom cost (no artificial cap), InfoTooltip
6. `src/components/calculator/export-options.tsx` — Hidden iframe print approach (fixes about:blank)
7. `src/components/calculator/price-results.tsx` — Animated tier badge, icon backgrounds, animated breakdown bar segments
8. `src/components/calculator/cost-breakdown.tsx` — Tier dot indicator, highlighted totals, AnimatePresence on expand

## Key Decisions
- Export placed only in right panel (not duplicated in sidebar) to avoid confusion
- Sidebar contains Sale type + Settings on desktop; hidden on mobile/tablet (those show inline)
- Custom multiplier/cost use number inputs instead of range sliders — allows any positive value
- Hidden iframe approach for printing avoids "about:blank" in document footer
- laborTimeMinutes field added alongside postProcessingTimeMinutes with tooltip explaining the difference

## Lint: ✅ PASSES
