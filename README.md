# D-Calc

**Free Professional FDM 3D Printing Price Calculator**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

D-Calc is a professional, free, and open-source cost calculator for FDM 3D printing. Estimate filament, time, energy, and labor costs with industrial precision — no account required.

## Features

- **Accurate Cost Calculation** — Material, printer depreciation, electricity, maintenance, labor, supervision, finishing, failure risk, overhead, tax, packaging, shipping, and design time
- **4 Pricing Tiers** — Competitive (25%), Standard (60%), Premium (120%), Luxury (200%) margin presets
- **4 Sale Types** — Wholesale, Retail, Custom multiplier, Rush
- **50+ Printer Presets** — Real specs from Bambu Lab, Prusa, Creality, Anycubic, Artillery, Elegoo, QIDI, Voron, and more
- **14 Filament Types** — PLA, PLA+, ABS, PETG, TPU, Nylon, Carbon Fiber, Wood Fill, Metal Fill, HIPS, PVA, ASA, PC, Custom
- **8 Finishing Options** — None, Light Sanding, Full Sanding, Primer & Paint, Full Paint, Vapor Smoothing, Epoxy Coating, Custom
- **Multi-Currency** — 10 currencies with automatic region detection (EUR, USD, GBP, CNY, JPY, CAD, AUD, MXN, BRL, INR)
- **Multi-Language** — Spanish, English, Chinese, Basque (Euskera) with auto-detection
- **Dark/Light Theme** — With smooth animated toggle
- **Project Management** — Save projects, manage sub-pieces, track sales (with account)
- **Export** — Producer Report (detailed breakdown) + Customer Invoice
- **Sales Dashboard** — Revenue tracking, statistics, monthly breakdown (with account)
- **No Account Required** — Use all calculator features without signing up

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Animations**: Framer Motion
- **Database**: Prisma ORM with SQLite
- **Auth**: NextAuth.js v4
- **Fonts**: Space Grotesk + DM Sans

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/Dipa124/D-Calc.git
cd D-Calc

# Install dependencies
npm install
# or
bun install

# Set up the database
npx prisma db push
# or
bun run db:push

# (Optional) Seed demo account
npx prisma db seed
# or
bun run db:seed

# Start the development server
npm run dev
# or
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Account

A test account is available for exploring authenticated features:

- **Email**: `demo@dcalc.app`
- **Password**: `demo123`

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database (SQLite by default)
DATABASE_URL="file:./db/custom.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

For production, generate a secure secret:

```bash
openssl rand -base64 32
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository on [vercel.com](https://vercel.com)
3. Configure environment variables
4. Deploy

### Manual

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main calculator page
│   ├── layout.tsx            # Root layout with SEO, fonts, providers
│   ├── globals.css           # Theme variables, glass morphism, animations
│   └── api/                  # API routes (auth, projects, sales)
├── components/
│   ├── calculator/           # App-specific components
│   └── ui/                   # shadcn/ui primitives
├── hooks/                    # Custom React hooks
├── lib/                      # Core logic
│   ├── calculator.ts         # FDM cost calculation engine
│   ├── currency.ts           # Currency definitions and formatting
│   ├── i18n.ts               # Translations (ES, EN, ZH, EU)
│   ├── printers.ts           # 50+ FDM printer database
│   ├── types.ts              # TypeScript types and defaults
│   └── auth.ts               # NextAuth configuration
└── prisma/
    ├── schema.prisma         # Database schema
    └── seed.ts               # Demo data seed
```

## Adding/Editing Translations

Translations are in `src/lib/i18n.ts`. Each locale has a complete `Translations` object.

To add a new language:

1. Add the locale code to the `Locale` type: `'es' | 'en' | 'zh' | 'eu' | 'your-locale'`
2. Add the locale name and flag to `LOCALE_NAMES` and `LOCALE_FLAGS`
3. Add the detection logic in `detectLocale()`
4. Add the full translation object in the `translations` record

To edit existing translations (e.g., Basque/Euskera), modify the `eu` key in the `translations` object in `src/lib/i18n.ts`.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/), [shadcn/ui](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/), and [Prisma](https://www.prisma.io/)
- Printer data sourced from manufacturer specification sheets
