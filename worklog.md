# D-Calc — Worklog

---
Task ID: 1
Agent: Main Orchestrator
Task: Complete visual redesign and feature overhaul of D-Calc (formerly CalcFDM)

Work Log:
- Read and analyzed all existing source files (page.tsx, types.ts, calculator.ts, globals.css, layout.tsx, all components)
- Created i18n system with 4 languages (ES, EN, ZH, EU) with auto-detect in `/src/lib/i18n.ts`
- Created i18n React context provider in `/src/hooks/use-i18n.tsx`
- Created currency system with 10 currencies and auto-detect in `/src/lib/currency.ts`
- Created comprehensive printer database with 50+ printers in `/src/lib/printers.ts`
- Updated types in `/src/lib/types.ts` with new fields (printerModel, supervisionCostPerHour, additionalLaborCostPerHour, currency, locale)
- Updated calculator engine in `/src/lib/calculator.ts` to separate supervision, labor, and additional labor costs
- Rewrote globals.css with professional design system, removed ugly particles, kept subtle ambient glows
- Updated layout.tsx with D-Calc branding and comprehensive SEO metadata + structured data
- Completely rewrote page.tsx with:
  - D-Calc branding throughout
  - No price in header (user request)
  - Clean 2-column layout on desktop
  - Settings as slide-out drawer panel
  - Sale type inline in left column
  - Pencil icon close to titles, clickable to focus input
  - Language and currency selectors in header
  - Printer model selector in settings with auto-fill
  - Supervision rate and additional labor rate as separate settings
  - Professional glass cards with proper text containment
- Updated auth-provider.tsx to wrap with I18nProvider
- Updated dashboard.tsx with currency support and D-Calc branding
- Updated persistence hook to use 'dcalc' prefix and version 5
- Created seed script and test account: demo@dcalc.app / demo123
- Fixed tooltip text colors in CSS for both dark and light modes
- Fixed Euskera translation typo (leenzingSanding → lightSanding)
- Fixed PDF about:blank issue by using hidden iframe with proper title

Stage Summary:
- App renamed from CalcFDM to D-Calc
- Complete visual redesign with professional, modern UI
- i18n system with 4 languages (ES, EN, ZH, EU) and auto-detect
- Currency system with 10 currencies and auto-detect by region
- Printer database with 50+ models grouped by brand
- Labor cost fix: separate supervision rate, labor rate, and additional labor rate
- Test account created: demo@dcalc.app / demo123
- All lint checks pass
- Dev server runs successfully
