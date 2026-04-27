'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@/hooks/use-i18n'
import { useRouter } from 'next/navigation'
import {
  User, Lock, Palette, Code2, Calculator, Trash2,
  AlertCircle, ChevronDown, Settings, Sun, Moon, Monitor,
  Globe, DollarSign, Eye, EyeOff, Shield
} from 'lucide-react'

// ─── Collapsible Formula Section ───
function FormulaSection({
  title,
  formula,
  description,
  icon,
  accentColor,
  defaultOpen = false,
}: {
  title: string
  formula: string
  description: string
  icon: React.ReactNode
  accentColor: string
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3 hover:bg-secondary/30 transition-colors text-left"
      >
        <div className={`w-7 h-7 rounded-md ${accentColor} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <span className="font-display font-semibold text-sm text-foreground flex-1">{title}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              <div className="bg-secondary/30 rounded-lg p-3 font-mono text-sm text-foreground break-all">
                {formula}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── API Endpoint Row ───
function ApiEndpointRow({
  method,
  path,
  description,
}: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
}) {
  const methodColors: Record<string, string> = {
    GET: 'bg-sage/15 text-sage',
    POST: 'bg-copper/15 text-copper',
    PUT: 'bg-gold/15 text-gold',
    DELETE: 'bg-destructive/15 text-destructive',
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/20 transition-colors">
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider shrink-0 ${methodColors[method] || 'bg-secondary text-muted-foreground'}`}>
        {method}
      </span>
      <div className="min-w-0 flex-1">
        <code className="font-mono text-sm text-foreground break-all">{path}</code>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  )
}

// ─── Main Settings Page ───
export default function SettingsPage() {
  const { data: session } = useSession()
  const { t } = useI18n()
  const router = useRouter()

  // General settings state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Calculation docs expand/collapse all
  const [allCalcOpen, setAllCalcOpen] = useState(false)

  // Not logged in redirect
  if (!session?.user) {
    return (
      <div className="flex-1 relative">
        <div className="mesh-gradient-bg opacity-30">
          <div className="mesh-blob-1" />
          <div className="mesh-blob-2" />
          <div className="mesh-blob-3" />
          <div className="mesh-blob-4" />
        </div>
        <div className="flex items-center justify-center min-h-[60vh] relative z-10">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-copper to-gold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-copper/20">
              <User className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-display font-bold text-xl text-foreground mb-2">{t.loginDesc}</h2>
            <p className="text-sm text-muted-foreground mb-6">{t.saveProjectsDesc}</p>
            <button
              onClick={() => router.push('/register')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-copper to-copper-dark text-white font-semibold shadow-lg shadow-copper/20 hover:shadow-copper/30 transition-shadow"
            >
              {t.enter}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 relative">
      {/* Animated mesh background */}
      <div className="mesh-gradient-bg opacity-30">
        <div className="mesh-blob-1" />
        <div className="mesh-blob-2" />
        <div className="mesh-blob-3" />
        <div className="mesh-blob-4" />
      </div>

      <div className="space-y-6 max-w-[900px] mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-2"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-copper to-gold flex items-center justify-center shadow-lg shadow-copper/20">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">{t.accountSettings}</h1>
            <p className="text-sm text-muted-foreground">{t.appSubtitle}</p>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            Section 1: Account Info
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-6"
        >
          <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase mb-5 flex items-center gap-2">
            <User className="w-4 h-4 text-copper" /> Account Info
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.name}</label>
                <p className="text-sm text-foreground font-medium mt-0.5">{session.user.name || '—'}</p>
              </div>
              <button
                className="px-3 py-1.5 rounded-lg bg-secondary/80 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Coming soon"
              >
                Edit
              </button>
            </div>
            <div className="h-px bg-border/50" />
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.email}</label>
                <p className="text-sm text-foreground font-medium mt-0.5">{session.user.email || '—'}</p>
              </div>
              <button
                className="px-3 py-1.5 rounded-lg bg-secondary/80 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Coming soon"
              >
                Edit
              </button>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-4 italic">
            Account editing features coming soon.
          </p>
        </motion.div>

        {/* ═══════════════════════════════════════════
            Section 2: Change Password
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase mb-5 flex items-center gap-2">
            <Lock className="w-4 h-4 text-sage" /> Change Password
          </h2>
          <div className="space-y-4">
            {/* Current password */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Current Password</label>
              <div className="relative mt-1">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-muted-foreground pr-10 opacity-60 cursor-not-allowed"
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {/* New password */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">New Password</label>
              <div className="relative mt-1">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-muted-foreground pr-10 opacity-60 cursor-not-allowed"
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {/* Confirm password */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Confirm New Password</label>
              <div className="relative mt-1">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-muted-foreground pr-10 opacity-60 cursor-not-allowed"
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <p className="text-[11px] text-muted-foreground italic">Password change coming soon.</p>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            Section 3: General Settings
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6"
        >
          <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase mb-5 flex items-center gap-2">
            <Palette className="w-4 h-4 text-gold" /> General Settings
          </h2>
          <div className="space-y-5">
            {/* Theme */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">{t.theme}</label>
              <div className="flex gap-2">
                {([
                  { value: 'light' as const, icon: <Sun className="w-4 h-4" />, label: 'Light' },
                  { value: 'dark' as const, icon: <Moon className="w-4 h-4" />, label: 'Dark' },
                  { value: 'system' as const, icon: <Monitor className="w-4 h-4" />, label: 'System' },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      theme === opt.value
                        ? 'bg-copper/15 text-copper border-copper/30'
                        : 'bg-secondary/50 text-muted-foreground border-border hover:text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {opt.icon}
                    <span className="hidden sm:inline">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> {t.language}
              </label>
              <select
                disabled
                className="w-full max-w-xs px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-muted-foreground opacity-60 cursor-not-allowed"
              >
                <option>Español</option>
                <option>English</option>
                <option>中文</option>
                <option>Euskera</option>
              </select>
              <p className="text-[11px] text-muted-foreground mt-1 italic">Language preference saving coming soon.</p>
            </div>

            {/* Default Currency */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> {t.currency}
              </label>
              <select
                disabled
                className="w-full max-w-xs px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-muted-foreground opacity-60 cursor-not-allowed"
              >
                <option>EUR (€)</option>
                <option>USD ($)</option>
                <option>GBP (£)</option>
                <option>CNY (¥)</option>
              </select>
              <p className="text-[11px] text-muted-foreground mt-1 italic">Default currency saving coming soon.</p>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            Section 4: API Documentation
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase mb-5 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-diamond" /> API Documentation
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {t.apiKeyDesc}
          </p>

          {/* Base URL */}
          <div className="mb-4">
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Base URL</label>
            <div className="bg-secondary/30 rounded-lg p-3 font-mono text-sm text-foreground">
              /api/
            </div>
          </div>

          {/* Endpoints */}
          <div className="space-y-1">
            <ApiEndpointRow
              method="POST"
              path="/api/projects"
              description="Create a new project with calculation parameters"
            />
            <ApiEndpointRow
              method="GET"
              path="/api/projects"
              description="List all projects for the authenticated user"
            />
            <ApiEndpointRow
              method="POST"
              path="/api/sales"
              description="Record a new sale with project and pricing details"
            />
            <ApiEndpointRow
              method="GET"
              path="/api/sales/stats"
              description="Get aggregated sales statistics and revenue breakdown"
            />
            <ApiEndpointRow
              method="POST"
              path="/api/reports"
              description="Create a shared report link for a project"
            />
          </div>

          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-diamond/5 border border-diamond/10">
            <Shield className="w-4 h-4 text-diamond shrink-0" />
            <p className="text-xs text-muted-foreground">
              All API endpoints require authentication via NextAuth session cookie.
            </p>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            Section 5: Calculation Documentation
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase flex items-center gap-2">
              <Calculator className="w-4 h-4 text-copper" /> Calculation Documentation
            </h2>
            <button
              onClick={() => setAllCalcOpen(!allCalcOpen)}
              className="text-xs text-copper hover:text-copper-light font-medium transition-colors"
            >
              {allCalcOpen ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Detailed breakdown of how D-Calc computes 3D printing prices. Each formula is applied per piece and then summed for the project total.
          </p>

          <div className="space-y-2">
            {/* a) Material Cost */}
            <FormulaSection
              title="a) Material Cost"
              formula="weight(g) × (1 + waste%) / 1000 × costPerKg"
              description="Calculates the cost of filament consumed, accounting for waste percentage (supports, purges, failed attempts). Weight is converted from grams to kilograms before multiplying by the per-kilogram cost."
              icon={<Calculator className="w-3.5 h-3.5 text-white" />}
              accentColor="bg-copper/15 text-copper"
              defaultOpen={allCalcOpen}
            />

            {/* b) Printer Depreciation */}
            <FormulaSection
              title="b) Printer Depreciation"
              formula="(printerCost + additionalInitialCost) / amortizationMonths + monthlyMaintenance) / (dailyHours × 30) × printTimeHours"
              description="Distributes the printer purchase cost and additional initial investment over the amortization period, adds monthly maintenance, and allocates the hourly cost based on actual print time. Daily hours × 30 estimates monthly operating hours."
              icon={<Calculator className="w-3.5 h-3.5 text-white" />}
              accentColor="bg-sage/15 text-sage"
              defaultOpen={allCalcOpen}
            />

            {/* c) Electricity */}
            <FormulaSection
              title="c) Electricity"
              formula="(watts / 1000) × printTimeHours × costPerKWh"
              description="Converts printer power consumption from watts to kilowatts, multiplies by print duration and the local electricity rate per kilowatt-hour."
              icon={<Calculator className="w-3.5 h-3.5 text-white" />}
              accentColor="bg-gold/15 text-gold"
              defaultOpen={allCalcOpen}
            />

            {/* d) Supervision */}
            <FormulaSection
              title="d) Supervision"
              formula="supervisionRatePerHour × printTimeHours × 0.05"
              description="Applies the supervision rate to only 5% of print time, reflecting passive monitoring (periodic checking) rather than active oversight. This models the real-world scenario of occasionally checking on a running print."
              icon={<Calculator className="w-3.5 h-3.5 text-white" />}
              accentColor="bg-diamond/15 text-diamond"
              defaultOpen={allCalcOpen}
            />

            {/* e) Post-processing */}
            <FormulaSection
              title="e) Post-processing"
              formula="Σ(rate_i × time_i / 60) for each post-process step"
              description="Sums the cost of all post-processing steps (support removal, sanding, painting, assembly, etc.). Each step's time in minutes is converted to hours before multiplying by its specific hourly rate."
              icon={<Calculator className="w-3.5 h-3.5 text-white" />}
              accentColor="bg-copper/15 text-copper"
              defaultOpen={allCalcOpen}
            />

            {/* f) Design */}
            <FormulaSection
              title="f) Design"
              formula="(designMinutes / 60) × designHourlyRate"
              description="Converts design time from minutes to hours and applies the designer's hourly rate. This covers the cost of 3D modeling and CAD work for custom designs."
              icon={<Calculator className="w-3.5 h-3.5 text-white" />}
              accentColor="bg-sage/15 text-sage"
              defaultOpen={allCalcOpen}
            />

            {/* g) Failure Risk */}
            <FormulaSection
              title="g) Failure Risk"
              formula="coreCosts × failureRate% × bufferFactor"
              description="Applies a risk premium based on the probability of print failure. Core costs include material + depreciation + electricity + supervision. The buffer factor adds additional margin for unexpected downtime (e.g., 1.3 = 30% extra buffer)."
              icon={<Calculator className="w-3.5 h-3.5 text-white" />}
              accentColor="bg-gold/15 text-gold"
              defaultOpen={allCalcOpen}
            />

            {/* h) Monthly Expenses */}
            <FormulaSection
              title="h) Monthly Expenses"
              formula="totalMonthlyExpenses / (dailyHours × 30) × printTimeHours"
              description="Distributes fixed monthly business expenses (rent, software subscriptions, insurance, etc.) across all print hours in a month, then allocates the per-hour share to this print's duration."
              icon={<Calculator className="w-3.5 h-3.5 text-white" />}
              accentColor="bg-diamond/15 text-diamond"
              defaultOpen={allCalcOpen}
            />

            {/* i) Base Cost */}
            <FormulaSection
              title="i) Base Cost"
              formula="materialCost + printerDepreciation + electricity + supervision + postProcessing + design + failureRisk + monthlyExpenses"
              description="The sum of all production costs per unit. This represents the true cost of producing one piece before any profit margin, tax, or logistics are applied."
              icon={<Calculator className="w-3.5 h-3.5 text-white" />}
              accentColor="bg-copper/15 text-copper"
              defaultOpen={allCalcOpen}
            />

            {/* j) Profit */}
            <FormulaSection
              title="j) Profit"
              formula="baseCost × profitMargin × saleTypeMultiplier"
              description="Profit is calculated as a percentage of the base cost, modified by the sale type multiplier. Wholesale reduces profit (×0.6), rush orders increase it (×1.8), and custom allows any value."
              icon={<Calculator className="w-3.5 h-3.5 text-white" />}
              accentColor="bg-sage/15 text-sage"
              defaultOpen={allCalcOpen}
            />

            {/* k) Tax */}
            <FormulaSection
              title="k) Tax"
              formula="(baseCost + profit) × taxRate%"
              description="Applies the tax rate (VAT/sales tax) to the sum of base cost and profit. The tax rate is a percentage that varies by jurisdiction."
              icon={<Calculator className="w-3.5 h-3.5 text-white" />}
              accentColor="bg-gold/15 text-gold"
              defaultOpen={allCalcOpen}
            />

            {/* l) Final Price */}
            <FormulaSection
              title="l) Final Price"
              formula="baseCost + profit + tax + packaging + shipping + extraExpenses + commission"
              description="The complete price per unit, adding all logistics and business costs on top of the taxed production cost. Includes packaging materials, shipping fees, any extra expenses, and platform commissions."
              icon={<Calculator className="w-3.5 h-3.5 text-white" />}
              accentColor="bg-diamond/15 text-diamond"
              defaultOpen={allCalcOpen}
            />

            {/* m) Pricing Tiers */}
            <FormulaSection
              title="m) Pricing Tiers"
              formula="Competitive (25% margin) · Standard (60%) · Premium (120%) · Luxury (200%)"
              description="Four pre-configured profit margin tiers. Competitive targets high-volume, price-sensitive markets. Standard balances profit with competitiveness. Premium positions for quality-conscious buyers. Luxury is for exclusive, bespoke service."
              icon={<Calculator className="w-3.5 h-3.5 text-white" />}
              accentColor="bg-copper/15 text-copper"
              defaultOpen={allCalcOpen}
            />

            {/* n) Sale Types */}
            <FormulaSection
              title="n) Sale Types"
              formula="Wholesale (×0.6) · Retail (×1.0) · Custom (×custom) · Rush (×1.8)"
              description="Sale type multipliers adjust the profit margin based on the sales channel. Wholesale gets a discount for bulk orders. Retail is the standard rate. Custom allows any multiplier. Rush orders carry a premium for priority handling."
              icon={<Calculator className="w-3.5 h-3.5 text-white" />}
              accentColor="bg-sage/15 text-sage"
              defaultOpen={allCalcOpen}
            />
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            Section 6: Danger Zone
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 border border-destructive/20"
        >
          <h2 className="font-display font-bold text-sm text-destructive tracking-wide uppercase mb-3 flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            disabled
            className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium opacity-50 cursor-not-allowed border border-destructive/20"
            title="Coming soon"
          >
            Delete Account
          </button>
          <p className="text-[11px] text-muted-foreground mt-3 italic">
            Account deletion will be available in a future update.
          </p>
        </motion.div>

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>
    </div>
  )
}
