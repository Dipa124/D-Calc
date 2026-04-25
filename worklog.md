# D-Calc Project Worklog

---
Task ID: 1
Agent: Main
Task: Fix all i18n translations - homepage hardcoded English texts

Work Log:
- Added 22+ new translation keys to Translations interface in i18n.ts
- Added translations for all 4 languages (es, en, zh, eu)
- Replaced all hardcoded English texts in homepage: hero badge, hero title, features title/subtitle, how it works title, CTA title/subtitle
- Fixed "Theme" label in settings drawer (was hardcoded)
- Added "sin registro obligatorio" messaging and register benefits text
- Fixed footer text using existing i18n key

Stage Summary:
- All homepage texts now use i18n system
- New keys: heroBadge, heroTitlePrefix, heroTitleHighlight, featuresTitle, featuresSubtitle, howItWorksTitle, ctaTitlePrefix, ctaTitleHighlight, ctaTitleSuffix, ctaSubtitle, noRegistrationRequired, registerBenefits, logisticsBusiness, designPerPiece, laborPerPiece, shareReport, shareReportDesc, accountSettings, deleteAccount, changeData, loginToCreateProfile, theme

---
Task ID: 2
Agent: Main
Task: Fix homepage buttons and add registration info

Work Log:
- Homepage "Calculate" button navigates to calculator page via onNavigate('calculator')
- Homepage "Register" button navigates to auth page via onNavigate('auth')
- Added CTA subtitle with "sin registro obligatorio" messaging
- Added registerBenefits text explaining expanded possibilities

Stage Summary:
- All homepage buttons work correctly
- Clear messaging about no registration required + benefits of registering

---
Task ID: 3
Agent: Main
Task: Fix all tooltips to deploy to the RIGHT side

Work Log:
- Changed default `side` prop in InfoTooltip from 'top' to 'right'
- This ensures consistent tooltip direction across the entire app

Stage Summary:
- All tooltips now deploy to the right by default

---
Task ID: 4
Agent: Main
Task: Reorganize calculator parameters

Work Log:
- Moved laborCostPerHour from ProjectParams to SubPiece (per-piece)
- Moved designTimeMinutes from ProjectParams to SubPiece (per-piece)
- Moved designHourlyRate from ProjectParams to SubPiece (per-piece)
- Created new "Logística y negocio" section with taxRate, packaging, shipping
- Updated calculator.ts to use per-piece labor rate and design cost
- Updated SubPieceCostBreakdown with designCost field
- Added labor rate and design time/rate fields to PieceCard
- Removed these fields from ProjectParams and advanced settings

Stage Summary:
- Print params section: printer cost, lifespan, maintenance, power, electricity, supervision
- Advanced print params: failure rate, overhead
- Logistics & Business section: IVA, packaging, shipping
- Per-piece fields: labor rate, design time, design rate
- Calculator engine updated to use per-piece values

---
Task ID: 5
Agent: Main
Task: Printer profile creation only for logged-in users

Work Log:
- "Create Profile" button now disabled (opacity-50, pointer-events-none) for guests
- Shows Lock icon instead of Plus for non-logged-in users
- Tooltip explains they need to sign in

Stage Summary:
- Guest users cannot create printer profiles (button locked)
- Visual indicator and tooltip explain the restriction

---
Task ID: 6
Agent: Main
Task: Settings in calculator header + account settings

Work Log:
- Added currency, language, and theme selectors to calculator summary bar
- Removed settings gear button and drawer from NavBar
- Added user dropdown menu with Dashboard, Account Settings, and Sign Out
- Compact inline selectors in summary bar for desktop/mobile

Stage Summary:
- Settings always visible in calculator header bar
- Account settings only available for logged-in users via dropdown
- Removed old settings drawer

---
Task ID: 7
Agent: Main
Task: Improve calculator UI with more personality

Work Log:
- Added animated gradient borders on active tier card
- Added sparkle effect on price display when it updates
- Added decorative section dividers between sections
- Added piece card color accent (left border from piece color)
- Added micro-interactions (hover effects, scale, glow)
- Better empty states with animated Package icon
- Enhanced section headers with decorative icon badges
- Price glow animation when total changes

Stage Summary:
- Calculator now has more visual personality and life
- Multiple animation layers: sparkles, glow, gradient borders
- Better visual hierarchy with decorative elements

---
Task ID: 8
Agent: Main
Task: Smoother theme transition

Work Log:
- Removed blanket body transition rule that caused flash
- Added targeted .theme-transition class
- ThemeToggle adds class before switching, removes after 500ms
- Only affects: background-color, color, border-color, box-shadow
- Fixed invalid CSS nesting of @keyframes inside .dark

Stage Summary:
- Theme transition is now smooth (0.5s ease)
- No more flash/jarring transition
- Targeted CSS properties only

---
Task ID: 9
Agent: Main
Task: Add shareable report links

Work Log:
- Added SharedReport model to Prisma schema
- Created POST /api/reports endpoint to create shared reports
- Created GET /api/reports/[id] endpoint returning standalone HTML
- Shared report page looks like PDF preview (professional styling)
- Added "Share Report" and "Share Invoice" buttons in calculator
- URL is copied to clipboard on share
- Toast notification with share URL

Stage Summary:
- Reports can be shared as view-only links
- Standalone HTML page with clean report/invoice view
- "Generated by D-Calc" footer on shared pages
- Database stores shared report data

---
Task ID: 10
Agent: Main
Task: Update GitHub

Work Log:
- Committed all changes with descriptive message
- Pushed to https://github.com/Dipa124/D-Calc (main branch)

Stage Summary:
- GitHub repository updated with all V6 changes
