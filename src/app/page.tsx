'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import { useI18n } from '@/hooks/use-i18n'
import { usePersistedProject } from '@/hooks/use-persisted-project'
import { calculateProjectPrice, formatCurrency } from '@/lib/calculator'
import { useToast } from '@/hooks/use-toast'
import type { AppPage, Project, SubPiece, SaleType, PricingTier, ProjectParams, ProjectPricingResult, SubPieceCostBreakdown, FilamentType, FinishingType, PrinterProfile } from '@/lib/types'
import { generateId, getDefaultSubPiece, FILAMENT_DEFAULTS, PRICING_TIER_CONFIG, SALE_TYPE_CONFIG, FINISHING_DEFAULTS, getDefaultPrinterProfile, printerProfileToParams } from '@/lib/types'
import { CURRENCIES, detectCurrency, type CurrencyCode } from '@/lib/currency'
import { InfoTooltip } from '@/components/calculator/info-tooltip'
import { LOCALE_NAMES, LOCALE_FLAGS, type Locale } from '@/lib/i18n'
import {
  Plus, Printer, Settings, Pencil, Copy, Check, Clock, Weight, Hash, Package,
  RotateCcw, Sparkles, Calculator, Layers, DollarSign, FileDown, X, Save,
  Loader2, LogIn, ShoppingBag, ChevronDown, Globe, Coins,
  PenTool, Zap, Wrench, Percent, Truck, Eye, Trash2, FileText, Receipt,
  HomeIcon, BarChart3, UserPlus, User, ArrowRight, Star, Shield, TrendingUp,
  Cpu, Palette, Code, BookOpen, EyeOff, Menu, Lock, Share2
} from 'lucide-react'

// ─── Animation variants ───
const pageVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}
const pageTransition = { duration: 0.35, ease: [0.16, 1, 0.3, 1] }

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
}
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

// ─── Helpers ───
const formatPrintTime = (hours: number) => {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h${m}m`
}
const formatWeight = (grams: number) =>
  grams >= 1000 ? `${(grams / 1000).toFixed(1)} kg` : `${grams.toFixed(0)} g`

// ─── Tier colors ───
const TIER_BAR_COLORS: Record<PricingTier, string> = {
  competitive: '#6B9E72',
  standard: '#C77D3A',
  premium: '#D4A843',
  luxury: '#4FC3F7',
}

const SALE_TYPE_ICONS: Record<SaleType, React.ReactNode> = {
  wholesale: <Package className="w-4 h-4" />,
  retail: <ShoppingBag className="w-4 h-4" />,
  custom: <Settings className="w-4 h-4" />,
  rush: <Zap className="w-4 h-4" />,
}

// ─── Intersection Observer Hook for Scroll Animations ───
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el) } },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}

// ─── ScrollReveal Wrapper ───
function ScrollReveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollReveal()
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════
function NavBar({ currentPage, onNavigate }: { currentPage: AppPage; onNavigate: (p: AppPage) => void }) {
  const { t } = useI18n()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { t: tt } = useI18n()

  const navItems: { page: AppPage; label: string; icon: React.ReactNode }[] = [
    { page: 'home', label: tt.navHome || 'Home', icon: <HomeIcon className="w-4 h-4" /> },
    { page: 'calculator', label: tt.navCalculator || 'Calculator', icon: <Calculator className="w-4 h-4" /> },
    ...(session?.user ? [{ page: 'dashboard' as AppPage, label: tt.navDashboard || 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> }] : []),
  ]

  return (
    <>
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Logo */}
          <motion.button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 shrink-0 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-copper to-gold flex items-center justify-center shadow-lg shadow-copper/20 group-hover:shadow-copper/40 transition-shadow">
              <Printer className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-extrabold text-lg leading-tight">
                D-<span className="text-gradient-copper">Calc</span>
              </h1>
            </div>
          </motion.button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ page, label, icon }) => (
              <motion.button
                key={page}
                onClick={() => onNavigate(page)}
                className={`
                  relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${currentPage === page
                    ? 'text-copper bg-copper/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                  }
                `}
                whileTap={{ scale: 0.97 }}
              >
                {icon}
                {label}
                {currentPage === page && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-copper to-gold"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            {!session?.user ? (
              <motion.button
                onClick={() => onNavigate('auth')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-copper to-copper-dark text-white text-xs font-semibold hover:shadow-lg hover:shadow-copper/20 transition-all"
                whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.login}</span>
              </motion.button>
            ) : (
              <UserMenu onDashboard={() => onNavigate('dashboard')} onAccountSettings={() => {}} />
            )}
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8 h-8 rounded-lg bg-secondary/80 flex items-center justify-center"
            >
              <Menu className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/50 overflow-hidden"
            >
              <div className="px-4 py-2 space-y-1">
                {navItems.map(({ page, label, icon }) => (
                  <button
                    key={page}
                    onClick={() => { onNavigate(page); setMobileMenuOpen(false) }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'text-copper bg-copper/10' : 'text-muted-foreground hover:bg-secondary/80'}`}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

    </>
  )
}

// ─── User Menu with Dropdown ───
function UserMenu({ onDashboard, onAccountSettings }: { onDashboard: () => void; onAccountSettings: () => void }) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const { t } = useI18n()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (!session?.user) return null
  const initial = (session.user.name || session.user.email || 'U')[0].toUpperCase()

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-secondary/80 transition-colors"
        whileTap={{ scale: 0.97 }}
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-copper to-gold flex items-center justify-center text-[11px] font-bold text-white">{initial}</div>
        <span className="text-sm font-medium text-foreground hidden sm:inline max-w-[120px] truncate">{session.user.name || session.user.email?.split('@')[0]}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 w-52 glass-card p-1.5 border border-border/50 shadow-lg z-50"
          >
            <button
              onClick={() => { onDashboard(); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary/80 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-copper" />
              {t.dashboard}
            </button>
            <button
              onClick={() => { onAccountSettings(); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary/80 transition-colors"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              {t.accountSettings}
            </button>
            <div className="h-px bg-border/50 my-1" />
            <button
              onClick={() => { signOut(); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              {t.logout}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════
function HomePage({ onNavigate }: { onNavigate: (p: AppPage) => void }) {
  const { t } = useI18n()

  const features = [
    { icon: <Calculator className="w-6 h-6" />, title: t.featureCalc || 'Precise Calculation', desc: t.featureCalcDesc || 'Material, energy, depreciation, labor — all calculated automatically' },
    { icon: <Star className="w-6 h-6" />, title: t.featureTiers || '4 Pricing Tiers', desc: t.featureTiersDesc || 'Competitive, Standard, Premium, and Luxury pricing strategies' },
    { icon: <Printer className="w-6 h-6" />, title: t.featureProfiles || 'Printer Profiles', desc: t.featureProfilesDesc || 'Create custom printer profiles with your own specs' },
    { icon: <Layers className="w-6 h-6" />, title: t.featureProjects || 'Project Manager', desc: t.featureProjectsDesc || 'Save, load, and manage multiple projects' },
    { icon: <FileDown className="w-6 h-6" />, title: t.featureExport || 'PDF Export', desc: t.featureExportDesc || 'Generate professional invoices and producer reports' },
    { icon: <Coins className="w-6 h-6" />, title: t.featureCurrency || 'Multi-Currency', desc: t.featureCurrencyDesc || '10 currencies with auto-detection' },
  ]

  const steps = [
    { num: '01', title: t.step1Title || 'Configure', desc: t.step1Desc || 'Set your printer, material, and project parameters', icon: <Settings className="w-5 h-5" /> },
    { num: '02', title: t.step2Title || 'Add Pieces', desc: t.step2Desc || 'Define each piece with weight, time, and finishing', icon: <Layers className="w-5 h-5" /> },
    { num: '03', title: t.step3Title || 'Get Price', desc: t.step3Desc || 'Instantly see 4 pricing tiers and export reports', icon: <DollarSign className="w-5 h-5" /> },
  ]

  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Mesh gradient background */}
        <div className="mesh-gradient-bg">
          <div className="mesh-blob-1" />
          <div className="mesh-blob-2" />
          <div className="mesh-blob-3" />
          <div className="mesh-blob-4" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-copper/10 border border-copper/20 mb-8">
              <div className="w-2 h-2 rounded-full bg-copper animate-pulse" />
              <span className="text-sm font-medium text-copper">{t.heroBadge}</span>
            </div>

            <h1 className="text-hero-xl font-display font-black tracking-tight mb-6">
              <span className="text-foreground">{t.heroTitlePrefix}</span><br />
              <span className="text-gradient-hero">{t.heroTitleHighlight}</span>
            </h1>

            <p className="text-hero-sub text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              {t.appDescription}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={() => onNavigate('calculator')}
                className="btn-shimmer flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-copper to-copper-dark text-white font-display font-bold text-base shadow-xl shadow-copper/25 hover:shadow-copper/40 transition-shadow"
                whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}
              >
                {t.navCalculator || 'Open Calculator'}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={() => onNavigate('auth')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-border text-foreground font-display font-semibold text-sm hover:border-copper/40 hover:bg-copper/5 transition-all"
                whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
              >
                <UserPlus className="w-4 h-4" />
                {t.register}
              </motion.button>
            </div>
          </motion.div>

          {/* Floating decorative elements */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-full max-w-3xl">
            <div className="h-32 bg-gradient-to-t from-background to-transparent" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-section-title font-display font-bold mb-4">
              {t.featuresTitle}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t.featuresSubtitle}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="glass-card-premium p-6 h-full group hover:border-copper/30 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-copper/15 to-gold/10 flex items-center justify-center text-copper mb-4 group-hover:scale-110 transition-transform">
                    {feat.icon}
                  </div>
                  <h3 className="font-display font-bold text-base mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-secondary/20">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-section-title font-display font-bold mb-4">
              {t.howItWorksTitle}
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <div className="text-center">
                  <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-copper to-gold flex items-center justify-center text-white mb-5 shadow-lg shadow-copper/20">
                    {step.icon}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 border-copper flex items-center justify-center">
                      <span className="text-[9px] font-bold text-copper">{step.num}</span>
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center glass-card-premium p-12">
            <h2 className="text-hero-md font-display font-bold mb-4">
              {t.ctaTitlePrefix} <span className="text-gradient-copper">{t.ctaTitleHighlight}</span> {t.ctaTitleSuffix}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              {t.ctaSubtitle}
            </p>
            <motion.button
              onClick={() => onNavigate('calculator')}
              className="btn-shimmer inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-copper to-copper-dark text-white font-display font-bold shadow-xl shadow-copper/25"
              whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}
            >
              {t.navCalculator || 'Open Calculator'} <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </ScrollReveal>
      </section>
    </div>
  )
}

// ═══════════════════════════════════════════
// AUTH PAGE
// ═══════════════════════════════════════════
function AuthPage({ onNavigate }: { onNavigate: (p: AppPage) => void }) {
  const { t } = useI18n()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const res = await fetch('/api/auth/callback/credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        if (!res.ok) { setError(t.incorrectCredentials); return }
        window.location.reload()
      } else {
        if (password.length < 6) { setError(t.minPassword); return }
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error || t.registerError); return }
        const loginRes = await fetch('/api/auth/callback/credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        if (loginRes.ok) { window.location.reload() } else { setIsLogin(true) }
      }
    } catch {
      setError(isLogin ? t.loginError : t.registerError)
    } finally { setLoading(false) }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
      <div className="mesh-gradient-bg opacity-30"><div className="mesh-blob-1" /><div className="mesh-blob-2" /></div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card-premium p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-copper to-gold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-copper/20">
              {isLogin ? <User className="w-6 h-6 text-white" /> : <UserPlus className="w-6 h-6 text-white" />}
            </div>
            <h1 className="text-hero-md font-display font-bold">
              {isLogin ? (t.welcomeBack || t.login) : (t.createYourAccount || t.register)}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {isLogin ? t.loginDesc : t.registerDesc}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex bg-secondary/50 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError('') }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${isLogin ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >{t.login}</button>
            <button
              onClick={() => { setIsLogin(false); setError('') }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${!isLogin ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >{t.register}</button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t.nameOptional}</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t.name} autoComplete="name"
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-copper/30" />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t.email}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required autoComplete={isLogin ? 'email' : 'email'}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-copper/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t.password}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={isLogin ? '••••••' : t.minPassword} required minLength={isLogin ? undefined : 6} autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-copper/30" />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-sm text-destructive">{error}</motion.p>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-copper to-copper-dark text-white font-display font-bold text-sm shadow-lg shadow-copper/20 hover:shadow-copper/30 transition-shadow disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : isLogin ? t.enter : t.createAccount}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            {isLogin ? t.noAccount : t.hasAccount}{' '}
            <button onClick={() => { setIsLogin(!isLogin); setError('') }} className="text-copper hover:underline font-medium">
              {isLogin ? t.register : t.login}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════
// CALCULATOR PAGE
// ═══════════════════════════════════════════
function CalculatorPage() {
  const { data: session } = useSession()
  const { locale, setLocale, t } = useI18n()
  const tierNameMap: Record<string, string> = {
    competitive: t.competitive, standard: t.standard, premium: t.premium, luxury: t.luxury,
  }
  const { project, setProject, resetProject, hasStoredData } = usePersistedProject()
  const { toast } = useToast()

  const [breakdownOpen, setBreakdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [savingProject, setSavingProject] = useState(false)
  const [recordingSale, setRecordingSale] = useState(false)
  const [sharingReport, setSharingReport] = useState(false)
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false)
  const [printerProfiles, setPrinterProfiles] = useState<PrinterProfile[]>([])
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [editingProfile, setEditingProfile] = useState<PrinterProfile | null>(null)

  const projectNameRef = useRef<HTMLInputElement>(null)

  // ─── Calculations ───
  const pricingResults = useMemo(() => calculateProjectPrice(project), [project])
  const selectedResult = useMemo(
    () => pricingResults.find(r => r.tier === project.selectedTier) ?? pricingResults[1],
    [pricingResults, project.selectedTier]
  )
  const totalPieces = useMemo(() => project.subPieces.reduce((sum, sp) => sum + sp.quantity, 0), [project.subPieces])
  const totalPrintTimeHours = useMemo(() => project.subPieces.reduce((sum, sp) => sum + (sp.printTimeHours + sp.printTimeMinutes / 60) * sp.quantity, 0), [project.subPieces])
  const totalWeightGrams = useMemo(() => project.subPieces.reduce((sum, sp) => sum + sp.printWeight * sp.quantity, 0), [project.subPieces])

  // ─── Load printer profiles ───
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/printer-profiles').then(r => r.ok ? r.json() : []).then(setPrinterProfiles).catch(() => {})
    } else {
      // Guest: use local storage profiles or default
      const local = localStorage.getItem('dcalc-printer-profiles')
      if (local) { try { setPrinterProfiles(JSON.parse(local)) } catch {} }
    }
  }, [session?.user?.id])

  // ─── Project update helpers ───
  const updateProject = useCallback((partial: Partial<Project>) => {
    setProject(prev => ({ ...prev, ...partial }))
  }, [setProject])

  const updateParams = useCallback((partial: Partial<ProjectParams>) => {
    setProject(prev => ({ ...prev, params: { ...prev.params, ...partial } }))
  }, [setProject])

  const addSubPiece = useCallback(() => {
    const n = project.subPieces.length + 1
    setProject(prev => ({ ...prev, subPieces: [...prev.subPieces, { ...getDefaultSubPiece(), id: generateId(), name: `Piece ${n}` }] }))
  }, [project.subPieces.length, setProject])

  const updateSubPiece = useCallback((id: string, updated: SubPiece) => {
    setProject(prev => ({ ...prev, subPieces: prev.subPieces.map(sp => sp.id === id ? updated : sp) }))
  }, [setProject])

  const removeSubPiece = useCallback((id: string) => {
    setProject(prev => ({ ...prev, subPieces: prev.subPieces.filter(sp => sp.id !== id) }))
  }, [setProject])

  // ─── Copy price ───
  const handleCopyPrice = useCallback(() => {
    const priceText = formatCurrency(selectedResult.totalProjectPrice, project.currency)
    navigator.clipboard.writeText(priceText).then(() => {
      setCopied(true)
      toast({ title: t.priceCopied, description: `${priceText} ${t.priceCopiedDesc}` })
      setTimeout(() => setCopied(false), 2000)
    })
  }, [selectedResult.totalProjectPrice, project.currency, toast, t])

  // ─── Save project ───
  const handleSaveProject = useCallback(async () => {
    if (!session?.user?.id) return
    setSavingProject(true)
    try {
      const listRes = await fetch('/api/projects')
      if (listRes.ok) {
        const projects = await listRes.json()
        const existing = projects.find((p: { data: string }) => { try { return JSON.parse(p.data).id === project.id } catch { return false } })
        if (existing) {
          await fetch(`/api/projects/${existing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: project.name, data: project }) })
          toast({ title: t.projectUpdated })
        } else {
          await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: project.name, data: project }) })
          toast({ title: t.projectSaved })
        }
      }
    } catch { toast({ title: t.errorSaving, variant: 'destructive' }) }
    finally { setSavingProject(false) }
  }, [session?.user?.id, project, toast, t])

  // ─── Record sale ───
  const handleRecordSale = useCallback(async () => {
    if (!session?.user?.id) return
    setRecordingSale(true)
    try {
      const listRes = await fetch('/api/projects')
      let projectId = ''
      if (listRes.ok) {
        const projects = await listRes.json()
        const existing = projects.find((p: { data: string }) => { try { return JSON.parse(p.data).id === project.id } catch { return false } })
        if (existing) {
          projectId = existing.id
          await fetch(`/api/projects/${existing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: project.name, data: project }) })
        } else {
          const createRes = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: project.name, data: project }) })
          if (createRes.ok) projectId = (await createRes.json()).id
        }
      }
      if (!projectId) throw new Error()
      await fetch('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, projectName: project.name, tier: project.selectedTier, saleType: project.saleType, quantity: totalPieces, unitPrice: selectedResult.totalProjectPrice / (totalPieces || 1), totalPrice: selectedResult.totalProjectPrice }) })
      toast({ title: t.saleRecorded, description: `${formatCurrency(selectedResult.totalProjectPrice, project.currency)} — ${project.name}` })
    } catch { toast({ title: t.errorRecording, variant: 'destructive' }) }
    finally { setRecordingSale(false) }
  }, [session?.user?.id, project, selectedResult, totalPieces, toast, t])

  // ─── Printer profile select ───
  const handlePrinterProfileSelect = useCallback((profileId: string) => {
    if (profileId === 'custom') {
      updateParams({ printerProfileId: 'custom' })
      return
    }
    const profile = printerProfiles.find(p => p.id === profileId)
    if (profile) {
      const params = printerProfileToParams(profile)
      updateParams(params)
    }
  }, [printerProfiles, updateParams])

  // ─── Share report ───
  const handleShareReport = useCallback(async (reportType: 'producer' | 'invoice') => {
    setSharingReport(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          projectData: project,
          pricingData: selectedResult,
          currency: project.currency,
          userId: session?.user?.id || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to create shared report')
      const data = await res.json()
      const shareUrl = `${window.location.origin}${data.url}`
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: t.shareLinkCopied || 'Share link copied!',
        description: shareUrl,
      })
    } catch {
      toast({
        title: t.errorSharing || 'Failed to share report',
        variant: 'destructive',
      })
    } finally {
      setSharingReport(false)
    }
  }, [project, selectedResult, session?.user?.id, toast, t])

  return (
    <motion.main
      className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-6 relative z-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Summary Bar */}
      <div className="glass-card border border-border/30 rounded-xl p-3 mb-6">
        <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto">
          <SummaryStat icon={<Hash className="w-3 h-3 text-sage" />} bgClass="bg-sage/15" label={t.pieces} value={totalPieces.toString()} />
          <Divider />
          <SummaryStat icon={<Clock className="w-3 h-3 text-copper" />} bgClass="bg-copper/15" label={t.time} value={project.subPieces.length > 0 ? formatPrintTime(totalPrintTimeHours) : '—'} />
          <Divider />
          <SummaryStat icon={<Weight className="w-3 h-3 text-gold" />} bgClass="bg-gold/15" label={t.weight} value={project.subPieces.length > 0 ? formatWeight(totalWeightGrams) : '—'} />
          <Divider />
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-muted-foreground">{tierNameMap[selectedResult.tier]}</span>
              <motion.span key={selectedResult.totalProjectPrice.toFixed(2)} initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }} className="font-display font-extrabold text-lg text-copper">
                {formatCurrency(selectedResult.totalProjectPrice, project.currency)}
              </motion.span>
            </div>
            <motion.button onClick={handleCopyPrice} className="w-7 h-7 rounded-md bg-copper/10 hover:bg-copper/20 flex items-center justify-center transition-colors" whileTap={{ scale: 0.9 }}>
              <AnimatePresence mode="wait">
                {copied ? <motion.div key="ck" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check className="w-3.5 h-3.5 text-sage" /></motion.div>
                  : <motion.div key="cp" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy className="w-3.5 h-3.5 text-copper" /></motion.div>}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="lg:col-span-7 space-y-5">

          {/* Project name + save */}
          <motion.section variants={sectionVariants}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-copper/15 flex items-center justify-center shrink-0"><Layers className="w-4 h-4 text-copper" /></div>
              <div className="flex items-center flex-1 min-w-0">
                <input ref={projectNameRef} type="text" value={project.name} onChange={(e) => updateProject({ name: e.target.value })}
                  className="font-display font-extrabold text-xl sm:text-2xl text-foreground bg-transparent border-none outline-none flex-1 min-w-0 placeholder:text-muted-foreground" placeholder={t.pieceName} />
                <button onClick={() => { projectNameRef.current?.focus(); projectNameRef.current?.select() }} className="ml-0.5 p-1 rounded-md hover:bg-secondary/80 transition-colors shrink-0" aria-label="Edit name">
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground" />
                </button>
              </div>
              {session?.user && (
                <motion.button onClick={handleSaveProject} disabled={savingProject} className="w-8 h-8 rounded-lg bg-sage/15 hover:bg-sage/25 border border-sage/30 flex items-center justify-center transition-colors disabled:opacity-50" whileTap={{ scale: 0.9 }}>
                  {savingProject ? <Loader2 className="w-3.5 h-3.5 animate-spin text-sage" /> : <Save className="w-3.5 h-3.5 text-sage" />}
                </motion.button>
              )}
              {hasStoredData && (
                <motion.button onClick={resetProject} className="w-8 h-8 rounded-lg bg-secondary/80 hover:bg-secondary border border-border flex items-center justify-center transition-colors" whileTap={{ scale: 0.9 }}>
                  <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                </motion.button>
              )}
            </div>
          </motion.section>

          {/* Sale type */}
          <motion.section variants={sectionVariants} className="glass-card section-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-copper" />
              <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">{t.saleType}</h2>
              <InfoTooltip text={t.tooltipSaleType} />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(Object.entries(SALE_TYPE_CONFIG) as [SaleType, typeof SALE_TYPE_CONFIG[SaleType]][]).map(([type, config]) => {
                const isSelected = project.saleType === type
                return (
                  <motion.button key={type} onClick={() => updateProject({ saleType: type })}
                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer text-center ${isSelected ? 'border-copper bg-copper/10 shadow-md shadow-copper/10' : 'border-border bg-card hover:border-copper/40 hover:bg-copper/5'}`}
                    whileTap={{ scale: 0.97 }}>
                    <div className={isSelected ? 'text-copper' : 'text-muted-foreground'}>{SALE_TYPE_ICONS[type]}</div>
                    <span className="font-display font-semibold text-[11px] leading-tight">{type === 'wholesale' ? t.wholesale : type === 'retail' ? t.retail : type === 'custom' ? t.customSale : t.rush}</span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${type === 'custom' ? 'bg-copper/15 text-copper' : 'bg-secondary text-muted-foreground'}`}>{config.subtitle}</span>
                  </motion.button>
                )
              })}
            </div>
            <AnimatePresence>
              {project.saleType === 'custom' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 flex items-center gap-3 p-3 rounded-lg bg-copper/10 border border-copper/20">
                  <label className="text-xs font-medium text-foreground whitespace-nowrap flex items-center gap-1.5">{t.customize}<InfoTooltip text={t.tooltipCustomMultiplier} side="right" /></label>
                  <input type="number" min={0.01} step={0.1} value={project.customMultiplier} onChange={(e) => { const val = parseFloat(e.target.value); if (!isNaN(val) && val > 0) updateProject({ customMultiplier: val }) }}
                    className="flex-1 max-w-[100px] px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
                  <span className="font-mono font-bold text-copper text-sm">×{project.customMultiplier.toFixed(1)}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Printer Profile */}
          <motion.section variants={sectionVariants} className="glass-card section-card p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-copper" />
              <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">{t.printParameters}</h2>
              <InfoTooltip text={t.tooltipPrinterModel} />
            </div>

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
                  <Printer className="w-3.5 h-3.5" /> {t.printerModel}
                </label>
                <select value={project.params.printerProfileId} onChange={(e) => handlePrinterProfileSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-copper">
                  <option value="custom">{t.printerDefaults}</option>
                  {printerProfiles.map(p => <option key={p.id} value={p.id}>{p.name} ({p.model})</option>)}
                </select>
              </div>
              <div className="relative">
                <motion.button
                  onClick={() => { if (session?.user) { setEditingProfile(null); setShowProfileModal(true) } }}
                  className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    session?.user
                      ? 'bg-copper/10 border-copper/30 text-copper hover:bg-copper/20 cursor-pointer'
                      : 'bg-secondary/50 border-border text-muted-foreground opacity-50 pointer-events-none cursor-not-allowed'
                  }`}
                  whileTap={session?.user ? { scale: 0.97 } : undefined}>
                  {session?.user ? <Plus className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />} {t.createProfile || 'New Profile'}
                </motion.button>
                {!session?.user && (
                  <InfoTooltip text={t.signInToCreateProfiles} side="top" />
                )}
              </div>
            </div>

            {/* Core parameters grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <SettingsField icon={<Printer className="w-3.5 h-3.5" />} label={t.printerCost} tooltip={t.tooltipPrinterCost} value={project.params.printerCost} onChange={(v) => updateParams({ printerCost: v })} step={10} />
              <SettingsField icon={<Clock className="w-3.5 h-3.5" />} label={t.printerLifespan} tooltip={t.tooltipLifespan} value={project.params.printerLifespanHours} onChange={(v) => updateParams({ printerLifespanHours: v })} step={500} min={100} />
              <SettingsField icon={<Wrench className="w-3.5 h-3.5" />} label={t.maintenance} tooltip={t.tooltipMaintenance} value={project.params.maintenanceCostPerHour} onChange={(v) => updateParams({ maintenanceCostPerHour: v })} step={0.01} />
              <SettingsField icon={<Zap className="w-3.5 h-3.5" />} label={t.powerConsumption} tooltip={t.tooltipPower} value={project.params.powerConsumptionWatts} onChange={(v) => updateParams({ powerConsumptionWatts: v })} step={10} />
              <SettingsField icon={<DollarSign className="w-3.5 h-3.5" />} label={t.electricityCost} tooltip={t.tooltipElectricity} value={project.params.electricityCostPerKWh} onChange={(v) => updateParams({ electricityCostPerKWh: v })} step={0.01} />
              <SettingsField icon={<Eye className="w-3.5 h-3.5" />} label={t.supervisionRate} tooltip={t.tooltipSupervision} value={project.params.supervisionCostPerHour} onChange={(v) => updateParams({ supervisionCostPerHour: v })} step={0.5} />
            </div>

            {/* Advanced toggle */}
            <button onClick={() => setAdvancedSettingsOpen(!advancedSettingsOpen)} className="flex items-center gap-2 text-xs font-medium text-copper hover:text-copper-dark transition-colors w-full">
              <Settings className="w-3.5 h-3.5" />{advancedSettingsOpen ? t.hideAdvanced : t.showAdvanced}
              <motion.div animate={{ rotate: advancedSettingsOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="ml-auto"><ChevronDown className="w-3.5 h-3.5" /></motion.div>
            </button>
            <AnimatePresence>
              {advancedSettingsOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                    <SettingsField icon={<Percent className="w-3.5 h-3.5" />} label={t.failureRate} tooltip={t.tooltipFailureRate} value={project.params.failureRate} onChange={(v) => updateParams({ failureRate: v })} step={1} max={100} />
                    <SettingsField icon={<Percent className="w-3.5 h-3.5" />} label={t.overhead} tooltip={t.tooltipOverhead} value={project.params.overheadPercentage} onChange={(v) => updateParams({ overheadPercentage: v })} step={1} max={100} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Logistics & Business */}
          <motion.section variants={sectionVariants} className="glass-card section-card p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-copper" />
              <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">{t.logisticsBusiness}</h2>
              <InfoTooltip text={t.tooltipLogisticsBusiness} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <SettingsField icon={<Percent className="w-3.5 h-3.5" />} label={t.taxRate} tooltip={t.tooltipTaxRate} value={project.params.taxRate} onChange={(v) => updateParams({ taxRate: v })} step={1} max={100} />
              <SettingsField icon={<Package className="w-3.5 h-3.5" />} label={t.packaging} tooltip={t.tooltipPackaging} value={project.params.packagingCostPerProject} onChange={(v) => updateParams({ packagingCostPerProject: v })} step={0.1} />
              <SettingsField icon={<Truck className="w-3.5 h-3.5" />} label={t.shipping} tooltip={t.tooltipShipping} value={project.params.shippingCostPerProject} onChange={(v) => updateParams({ shippingCostPerProject: v })} step={0.5} />
            </div>
          </motion.section>

          {/* Sub-pieces */}
          <motion.section variants={sectionVariants} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-copper" /><h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">{t.projectPieces}</h2></div>
              <motion.button onClick={addSubPiece} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-copper text-primary-foreground font-display font-semibold text-xs hover:bg-copper-dark hover:shadow-lg hover:shadow-copper/20 transition-all" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                <Plus className="w-3.5 h-3.5" /> {t.add}
              </motion.button>
            </div>

            <AnimatePresence mode="popLayout">
              {project.subPieces.map((sp, index) => (
                <PieceCard key={sp.id} subPiece={sp} index={index} currency={project.currency} onChange={(updated) => updateSubPiece(sp.id, updated)} onRemove={() => removeSubPiece(sp.id)} t={t} />
              ))}
            </AnimatePresence>

            {project.subPieces.length === 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 flex flex-col items-center justify-center text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-copper/20 to-gold/10 flex items-center justify-center"><Package className="w-8 h-8 text-copper/60" /></div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-sage/15 flex items-center justify-center"><Plus className="w-3.5 h-3.5 text-sage" /></div>
                </div>
                <h3 className="font-display font-bold text-base text-foreground mb-1">{t.noPiecesYet}</h3>
                <p className="text-sm text-muted-foreground max-w-xs mb-4">{t.noPiecesDesc}</p>
                <motion.button onClick={addSubPiece} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-copper text-primary-foreground font-display font-semibold text-sm hover:bg-copper-dark transition-all" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                  <Plus className="w-4 h-4" /> {t.addFirstPiece}
                </motion.button>
              </motion.div>
            )}
          </motion.section>
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="lg:col-span-5 space-y-5">
          {!session?.user && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 border border-copper/20 bg-copper/5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-copper/15 flex items-center justify-center shrink-0 mt-0.5"><LogIn className="w-4 h-4 text-copper" /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground">{t.saveYourProjects}</p><p className="text-xs text-muted-foreground mt-0.5">{t.saveProjectsDesc}</p></div>
              </div>
            </motion.div>
          )}

          {/* Price tier cards */}
          <motion.section variants={sectionVariants}>
            <div className="flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-copper" /><h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">{t.suggestedPrices}</h2></div>
            <div className="grid grid-cols-2 gap-3">
              {pricingResults.map((result) => {
                const isSelected = project.selectedTier === result.tier
                const color = TIER_BAR_COLORS[result.tier]
                return (
                  <motion.div key={result.tier} layout onClick={() => updateProject({ selectedTier: result.tier })}
                    className={`relative cursor-pointer rounded-xl border-2 p-3 transition-all duration-300 ${isSelected ? 'border-copper bg-copper/10 shadow-lg shadow-copper/10' : 'border-border bg-card hover:border-border/80 hover:shadow-md'}`}
                    whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                    {isSelected && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-md text-white" style={{ backgroundColor: color }}>{t.selected}</motion.div>}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className={`font-display font-bold text-xs leading-tight ${isSelected ? 'text-copper' : 'text-foreground'}`}>{tierNameMap[result.tier]}</span>
                    </div>
                    <div className={`font-display font-black text-lg leading-none ${isSelected ? 'text-copper' : 'text-foreground'}`}>{formatCurrency(result.totalProjectPrice, project.currency)}</div>
                    <div className="mt-1.5 inline-block px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ backgroundColor: `${color}20`, color }}>+{(result.profitMargin * 100).toFixed(0)}% {t.margin}</div>
                  </motion.div>
                )
              })}
            </div>
          </motion.section>

          {/* Breakdown bar */}
          <motion.section variants={sectionVariants}>
            <AnimatePresence mode="wait">
              <motion.div key={project.selectedTier} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="glass-card section-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: TIER_BAR_COLORS[project.selectedTier] }} />
                    <span className="font-display font-bold text-sm text-copper">{tierNameMap[selectedResult.tier]}</span>
                    <span className="text-muted-foreground text-xs">—</span>
                    <span className="font-display font-bold text-sm text-foreground">{formatCurrency(selectedResult.totalProjectPrice, project.currency)}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{t.margin}: {(selectedResult.profitMargin * 100).toFixed(0)}%</span>
                </div>
                <BreakdownBar result={selectedResult} currency={project.currency} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  <LegendItem color="#6B9E72" label={t.material} value={selectedResult.totalMaterialCost} currency={project.currency} />
                  <LegendItem color="#4FC3F7" label={t.operation} value={selectedResult.totalBaseCost - selectedResult.totalMaterialCost} currency={project.currency} />
                  <LegendItem color="#C77D3A" label={t.profit} value={selectedResult.totalProfit} currency={project.currency} />
                  <LegendItem color="#D4A843" label={t.taxIncluded} value={selectedResult.totalTax} currency={project.currency} />
                  {(selectedResult.totalPackaging > 0 || selectedResult.totalShipping > 0) && <LegendItem color="#8A8690" label={t.shippingPackage} value={selectedResult.totalPackaging + selectedResult.totalShipping} currency={project.currency} />}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.section>

          {/* Cost breakdown (collapsible) */}
          <motion.section variants={sectionVariants} className="glass-card section-card overflow-hidden">
            <button onClick={() => setBreakdownOpen(!breakdownOpen)} className="w-full flex items-center justify-between p-4">
              <div className="flex items-center gap-2"><Calculator className="w-4 h-4 text-copper" /><h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">{t.costBreakdown} — {tierNameMap[selectedResult.tier]}</h2></div>
              <motion.div animate={{ rotate: breakdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="w-4 h-4 text-muted-foreground" /></motion.div>
            </button>
            <AnimatePresence>
              {breakdownOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <BreakdownSummaryItem label={t.totalMaterial} value={selectedResult.totalMaterialCost} currency={project.currency} />
                      <BreakdownSummaryItem label={t.totalBase} value={selectedResult.totalBaseCost} currency={project.currency} />
                      <BreakdownSummaryItem label={t.totalProfitLabel} value={selectedResult.totalProfit} currency={project.currency} />
                      <BreakdownSummaryItem label={t.priceBeforeTax} value={selectedResult.totalPriceBeforeTax} currency={project.currency} />
                      <BreakdownSummaryItem label={t.taxIncluded} value={selectedResult.totalTax} currency={project.currency} />
                      <BreakdownSummaryItem label={t.projectTotal} value={selectedResult.totalProjectPrice} currency={project.currency} highlight />
                    </div>
                    {selectedResult.subPieceBreakdowns.map((bd) => (
                      <SubPieceBreakdown key={bd.subPieceId} breakdown={bd} currency={project.currency} t={t} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Export + Share */}
          <motion.section variants={sectionVariants} className="space-y-3">
            <div className="flex gap-3">
              <motion.button onClick={() => generateReport(project, selectedResult, t, 'producer')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm font-medium hover:bg-secondary/80 transition-colors" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                <FileText className="w-4 h-4" /> {t.producerReport}
              </motion.button>
              <motion.button onClick={() => generateReport(project, selectedResult, t, 'invoice')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-copper/10 border border-copper/30 text-copper text-sm font-medium hover:bg-copper/20 transition-colors" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                <Receipt className="w-4 h-4" /> {t.buyerTicket}
              </motion.button>
            </div>
            <div className="flex gap-3">
              <motion.button onClick={() => handleShareReport('producer')} disabled={sharingReport}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-diamond/10 border border-diamond/30 text-diamond text-sm font-medium hover:bg-diamond/20 transition-colors disabled:opacity-50" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                {sharingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} {t.shareProducer || 'Share Report'}
              </motion.button>
              <motion.button onClick={() => handleShareReport('invoice')} disabled={sharingReport}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sage/10 border border-sage/30 text-sage text-sm font-medium hover:bg-sage/20 transition-colors disabled:opacity-50" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                {sharingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} {t.shareInvoice || 'Share Invoice'}
              </motion.button>
            </div>
          </motion.section>

          {session?.user && (
            <motion.button onClick={handleRecordSale} disabled={recordingSale}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sage to-sage-dark text-white text-sm font-semibold hover:shadow-lg hover:shadow-sage/20 transition-all disabled:opacity-50" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
              {recordingSale ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />} {t.recordSale}
            </motion.button>
          )}
        </div>
      </div>

      {/* Printer Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <PrinterProfileModal
            profile={editingProfile}
            onClose={() => { setShowProfileModal(false); setEditingProfile(null) }}
            onSave={async (profile) => {
              if (session?.user?.id) {
                if (profile.id && profile.id !== 'custom') {
                  await fetch(`/api/printer-profiles/${profile.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) })
                } else {
                  const res = await fetch('/api/printer-profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) })
                  if (res.ok) { const newProfile = await res.json(); setPrinterProfiles(prev => [...prev, newProfile]) }
                }
                const profiles = await (await fetch('/api/printer-profiles')).json()
                setPrinterProfiles(profiles)
              } else {
                // Guest: save to localStorage
                const local = [...printerProfiles, { ...profile, id: `local_${Date.now()}` }]
                setPrinterProfiles(local)
                localStorage.setItem('dcalc-printer-profiles', JSON.stringify(local))
              }
              setShowProfileModal(false); setEditingProfile(null)
            }}
            onDelete={async (id) => {
              if (session?.user?.id) {
                await fetch(`/api/printer-profiles/${id}`, { method: 'DELETE' })
              } else {
                const local = printerProfiles.filter(p => p.id !== id)
                setPrinterProfiles(local)
                localStorage.setItem('dcalc-printer-profiles', JSON.stringify(local))
              }
              setShowProfileModal(false); setEditingProfile(null)
            }}
            t={t}
          />
        )}
      </AnimatePresence>
    </motion.main>
  )
}

// ═══════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════
function DashboardPage({ onNavigate }: { onNavigate: (p: AppPage) => void }) {
  const { data: session } = useSession()
  const { t } = useI18n()
  const [stats, setStats] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [printerProfiles, setPrinterProfiles] = useState<PrinterProfile[]>([])

  useEffect(() => {
    if (!session?.user?.id) return
    const fetchAll = async () => {
      try {
        const [statsRes, projRes, profRes] = await Promise.all([
          fetch('/api/sales/stats'),
          fetch('/api/projects'),
          fetch('/api/printer-profiles'),
        ])
        if (statsRes.ok) setStats(await statsRes.json())
        if (projRes.ok) setProjects(await projRes.json())
        if (profRes.ok) setPrinterProfiles(await profRes.json())
      } catch {} finally { setLoading(false) }
    }
    fetchAll()
  }, [session?.user?.id])

  if (!session?.user) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="font-display font-bold text-xl mb-2">{t.login}</h2>
          <p className="text-muted-foreground mb-4">{t.loginDesc}</p>
          <button onClick={() => onNavigate('auth')} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-copper to-copper-dark text-white font-semibold">{t.enter}</button>
        </div>
      </div>
    )
  }

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-copper" /></div>

  const fc = (amount: number) => formatCurrency(amount, 'EUR')

  return (
    <div className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-8">
      <h1 className="font-display font-extrabold text-2xl mb-6">{t.dashboard}</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<DollarSign className="w-5 h-5" />} label={t.totalRevenue} value={fc(stats.totalRevenue)} bgClass="bg-copper/15" iconColor="text-copper" />
          <StatCard icon={<Layers className="w-5 h-5" />} label={t.totalSales} value={stats.totalSales.toString()} bgClass="bg-sage/15" iconColor="text-sage" />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label={t.avgPrice} value={fc(stats.avgPrice)} bgClass="bg-gold/15" iconColor="text-gold" />
          <StatCard icon={<ShoppingBag className="w-5 h-5" />} label={t.recentSales} value={stats.recentSales?.length.toString() || '0'} bgClass="bg-diamond/15" iconColor="text-diamond" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects */}
        <div className="glass-card p-5">
          <h2 className="font-display font-bold text-sm tracking-wide uppercase mb-4 flex items-center gap-2"><Layers className="w-4 h-4 text-copper" /> {t.myProjects || 'Projects'}</h2>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t.noProjectsYet || 'No projects yet'}</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {projects.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                  <div className="flex-1 min-w-0"><div className="font-display font-semibold text-sm truncate">{p.name}</div><div className="text-[11px] text-muted-foreground">{new Date(p.updatedAt).toLocaleDateString()}</div></div>
                  <button onClick={async () => { await fetch(`/api/projects/${p.id}`, { method: 'DELETE' }); setProjects(prev => prev.filter((x: any) => x.id !== p.id)) }} className="w-7 h-7 rounded-md hover:bg-destructive/10 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-destructive/60" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Printer Profiles */}
        <div className="glass-card p-5">
          <h2 className="font-display font-bold text-sm tracking-wide uppercase mb-4 flex items-center gap-2"><Printer className="w-4 h-4 text-copper" /> {t.printerProfiles || 'Printer Profiles'}</h2>
          {printerProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t.noProfilesYet || 'No profiles yet'}</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {printerProfiles.map((p: PrinterProfile) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                  <div className="flex-1 min-w-0"><div className="font-display font-semibold text-sm truncate">{p.name}</div><div className="text-[11px] text-muted-foreground">{p.model} · {p.price}€</div></div>
                  {p.isDefault && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-copper/15 text-copper">Default</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Info */}
        <div className="glass-card p-5 lg:col-span-2">
          <h2 className="font-display font-bold text-sm tracking-wide uppercase mb-4 flex items-center gap-2"><Code className="w-4 h-4 text-copper" /> {t.apiInfo || 'API Info'}</h2>
          <div className="bg-background rounded-lg p-4 font-mono text-xs text-muted-foreground border border-border">
            <p className="text-foreground mb-2">Endpoints:</p>
            <p>GET  /api/projects</p>
            <p>POST /api/projects</p>
            <p>GET  /api/printer-profiles</p>
            <p>POST /api/printer-profiles</p>
            <p>GET  /api/sales/stats</p>
            <p className="mt-2 text-foreground">{t.apiKeyDesc || 'Authentication required via NextAuth session'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════

function SummaryStat({ icon, bgClass, label, value }: { icon: React.ReactNode; bgClass: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className={`w-7 h-7 rounded-md ${bgClass} flex items-center justify-center`}>{icon}</div>
      <div className="flex flex-col leading-tight"><span className="text-[10px] text-muted-foreground">{label}</span><span className="font-display font-bold text-xs text-foreground">{value}</span></div>
    </div>
  )
}

function Divider() { return <div className="w-px h-7 bg-border/50 shrink-0" /> }

function SettingsField({ icon, label, tooltip, value, onChange, step = 1, min, max }: {
  icon: React.ReactNode; label: string; tooltip: string; value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number
}) {
  return (
    <div>
      <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
        {icon} {label} <InfoTooltip text={tooltip} side="right" />
      </label>
      <input type="number" value={value} min={min} max={max} step={step}
        onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v) }}
        className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
    </div>
  )
}

function BreakdownBar({ result, currency }: { result: ProjectPricingResult; currency: CurrencyCode }) {
  const total = result.totalProjectPrice || 1
  const segments = [
    { pct: (result.totalMaterialCost / total) * 100, color: '#6B9E72', label: 'Material' },
    { pct: ((result.totalBaseCost - result.totalMaterialCost) / total) * 100, color: '#4FC3F7', label: 'Operation' },
    { pct: (result.totalProfit / total) * 100, color: '#C77D3A', label: 'Profit' },
    { pct: (result.totalTax / total) * 100, color: '#D4A843', label: 'Tax' },
    { pct: ((result.totalPackaging + result.totalShipping) / total) * 100, color: '#8A8690', label: 'Ship+Pkg' },
  ].filter(s => s.pct > 0.5)

  return (
    <div className="breakdown-bar">
      {segments.map((seg, i) => (
        <div key={i} style={{ width: `${seg.pct}%`, backgroundColor: seg.color }} title={`${seg.label}: ${seg.pct.toFixed(1)}%`} />
      ))}
    </div>
  )
}

function LegendItem({ color, label, value, currency }: { color: string; label: string; value: number; currency: CurrencyCode }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-[10px] font-mono font-bold text-foreground ml-auto">{formatCurrency(value, currency)}</span>
    </div>
  )
}

function BreakdownSummaryItem({ label, value, currency, highlight }: { label: string; value: number; currency: CurrencyCode; highlight?: boolean }) {
  return (
    <div className={`p-2.5 rounded-lg ${highlight ? 'bg-copper/10 border border-copper/20' : 'bg-secondary/30'}`}>
      <div className="text-[10px] text-muted-foreground mb-0.5">{label}</div>
      <div className={`font-display font-bold text-sm ${highlight ? 'text-copper' : 'text-foreground'}`}>{formatCurrency(value, currency)}</div>
    </div>
  )
}

function SubPieceBreakdown({ breakdown, currency, t }: { breakdown: SubPieceCostBreakdown; currency: CurrencyCode; t: any }) {
  const [open, setOpen] = useState(false)
  const rows = [
    { label: t.materialWithWaste, value: breakdown.materialCost },
    { label: t.printerDepreciation, value: breakdown.printerDepreciation },
    { label: t.electricity, value: breakdown.electricityCost },
    { label: t.maintenanceCost, value: breakdown.maintenanceCost },
    { label: t.labor, value: breakdown.laborCost + breakdown.supervisionCost },
    { label: t.finishing, value: breakdown.finishingCost },
    { label: t.designCost, value: breakdown.designCost },
    { label: t.failureRisk, value: breakdown.failureCost },
    { label: t.overheadCost, value: breakdown.overheadPerUnit },
    { label: t.profitPerUnit, value: breakdown.profitPerUnit },
    { label: t.taxPerUnit, value: breakdown.taxPerUnit },
  ]

  return (
    <div className="border border-border/50 rounded-lg mb-2 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 hover:bg-secondary/30 transition-colors">
        <div className="flex items-center gap-2"><span className="font-display font-semibold text-sm">{breakdown.subPieceName}</span><span className="text-[11px] text-muted-foreground">×{breakdown.quantity}</span></div>
        <div className="flex items-center gap-2"><span className="font-display font-bold text-sm text-copper">{formatCurrency(breakdown.totalForQuantity, currency)}</span><motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="w-3 h-3 text-muted-foreground" /></motion.div></div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 space-y-1">
              {rows.map((row, i) => row.value > 0 && (
                <div key={i} className="flex items-center justify-between text-xs"><span className="text-muted-foreground">{row.label}</span><span className="font-mono text-foreground">{formatCurrency(row.value, currency)}</span></div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Piece Card ───
function PieceCard({ subPiece, index, currency, onChange, onRemove, t }: {
  subPiece: SubPiece; index: number; currency: CurrencyCode; onChange: (sp: SubPiece) => void; onRemove: () => void; t: any
}) {
  const [expanded, setExpanded] = useState(true)
  const update = (partial: Partial<SubPiece>) => onChange({ ...subPiece, ...partial })

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card section-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-3">
        <input type="color" value={subPiece.color} onChange={(e) => update({ color: e.target.value })} className="w-6 h-6 rounded cursor-pointer border-0" />
        <input type="text" value={subPiece.name} onChange={(e) => update({ name: e.target.value })} className="font-display font-semibold text-sm text-foreground bg-transparent border-none outline-none flex-1 min-w-0" />
        <span className="text-[10px] text-muted-foreground font-mono">×{subPiece.quantity}</span>
        <button onClick={() => setExpanded(!expanded)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-secondary/80"><motion.div animate={{ rotate: expanded ? 0 : 180 }} transition={{ duration: 0.2 }}><ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /></motion.div></button>
        <button onClick={onRemove} className="w-6 h-6 rounded flex items-center justify-center hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5 text-destructive/60" /></button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-3 pb-3 space-y-3">
              {/* Row 1: Filament */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">{t.filamentType} <InfoTooltip text={t.tooltipFilamentType} /></label>
                  <select value={subPiece.filamentType} onChange={(e) => {
                    const type = e.target.value as FilamentType
                    update({ filamentType: type, filamentCostPerKg: FILAMENT_DEFAULTS[type].costPerKg })
                  }} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-copper">
                    {Object.keys(FILAMENT_DEFAULTS).map(ft => <option key={ft} value={ft}>{ft}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">{t.weightGrams} <InfoTooltip text={t.tooltipPrintWeight} /></label>
                  <input type="number" min={0} step={1} value={subPiece.printWeight} onChange={(e) => update({ printWeight: parseFloat(e.target.value) || 0 })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">{t.costPerKg} <InfoTooltip text={t.tooltipFilamentCost} /></label>
                  <input type="number" min={0} step={0.5} value={subPiece.filamentCostPerKg} onChange={(e) => update({ filamentCostPerKg: parseFloat(e.target.value) || 0 })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
                </div>
              </div>

              {/* Row 2: Time + Quantity */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">{t.hours} <InfoTooltip text={t.tooltipPrintTime} /></label>
                  <input type="number" min={0} step={1} value={subPiece.printTimeHours} onChange={(e) => update({ printTimeHours: parseInt(e.target.value) || 0 })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">{t.minutes}</label>
                  <input type="number" min={0} max={59} step={5} value={subPiece.printTimeMinutes} onChange={(e) => update({ printTimeMinutes: parseInt(e.target.value) || 0 })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">{t.quantity} <InfoTooltip text={t.tooltipQuantity} /></label>
                  <input type="number" min={1} step={1} value={subPiece.quantity} onChange={(e) => update({ quantity: parseInt(e.target.value) || 1 })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">{t.waste} <InfoTooltip text={t.tooltipWaste} /></label>
                  <input type="number" min={0} max={100} step={1} value={subPiece.wastePercentage} onChange={(e) => update({ wastePercentage: parseFloat(e.target.value) || 0 })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
                </div>
              </div>

              {/* Row 3: Finishing + Processing */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">{t.finishType} <InfoTooltip text={t.tooltipFinishingType} /></label>
                  <select value={subPiece.finishingType} onChange={(e) => {
                    const ft = e.target.value as FinishingType
                    update({ finishingType: ft, finishingCostPerPiece: FINISHING_DEFAULTS[ft].costPerPiece })
                  }} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-copper">
                    {Object.entries(FINISHING_DEFAULTS).map(([key, val]) => <option key={key} value={key}>{key === 'none' ? t.noFinish : key === 'lightSanding' ? t.lightSanding : key === 'fullSanding' ? t.fullSanding : key === 'primerPaint' ? t.primerPaint : key === 'fullPaint' ? t.fullPaint : key === 'vaporSmoothing' ? t.vaporSmoothing : key === 'epoxyCoating' ? t.epoxyCoating : t.customFinish}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">{t.postProcessing} <InfoTooltip text={t.tooltipPostProcessing} /></label>
                  <input type="number" min={0} step={5} value={subPiece.postProcessingTimeMinutes} onChange={(e) => update({ postProcessingTimeMinutes: parseFloat(e.target.value) || 0 })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">{t.laborTime} <InfoTooltip text={t.tooltipLaborTime} /></label>
                  <input type="number" min={0} step={5} value={subPiece.laborTimeMinutes} onChange={(e) => update({ laborTimeMinutes: parseFloat(e.target.value) || 0 })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
                </div>
              </div>

              {/* Row 4: Labor Rate + Design */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">{t.pieceLaborRate} <InfoTooltip text={t.tooltipPieceLaborRate} /></label>
                  <input type="number" min={0} step={1} value={subPiece.laborCostPerHour} onChange={(e) => update({ laborCostPerHour: parseFloat(e.target.value) || 0 })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">{t.pieceDesignTime} <InfoTooltip text={t.tooltipPieceDesignTime} /></label>
                  <input type="number" min={0} step={5} value={subPiece.designTimeMinutes} onChange={(e) => update({ designTimeMinutes: parseFloat(e.target.value) || 0 })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">{t.pieceDesignRate} <InfoTooltip text={t.tooltipPieceDesignRate} /></label>
                  <input type="number" min={0} step={5} value={subPiece.designHourlyRate} onChange={(e) => update({ designHourlyRate: parseFloat(e.target.value) || 0 })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Printer Profile Modal ───
function PrinterProfileModal({ profile, onClose, onSave, onDelete, t }: {
  profile: PrinterProfile | null; onClose: () => void; onSave: (p: PrinterProfile) => void; onDelete: (id: string) => void; t: any
}) {
  const [form, setForm] = useState<PrinterProfile>(profile || { id: '', name: '', model: '', price: 300, expectedLifespanYears: 2.5, powerConsumptionWatts: 200, failureRate: 5, maintenanceCostPerHour: 0.10, isDefault: false })
  const updateForm = (partial: Partial<PrinterProfile>) => setForm(prev => ({ ...prev, ...partial }))

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg z-[70] glass-card-premium p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-lg">{profile ? (t.editProfile || 'Edit Profile') : (t.createProfile || 'New Profile')}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-secondary/80 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.profileName || 'Profile Name'}</label>
              <input type="text" value={form.name} onChange={e => updateForm({ name: e.target.value })} placeholder="My Bambu P1S" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.profileModel || 'Model'}</label>
              <input type="text" value={form.model} onChange={e => updateForm({ model: e.target.value })} placeholder="Bambu Lab P1S" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.profilePrice || 'Price (€)'}</label>
              <input type="number" min={0} step={10} value={form.price} onChange={e => updateForm({ price: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground font-mono" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.profileLifespanYears || 'Lifespan (years)'}</label>
              <input type="number" min={0.5} step={0.5} value={form.expectedLifespanYears} onChange={e => updateForm({ expectedLifespanYears: parseFloat(e.target.value) || 1 })} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.profilePower || 'Power (W)'}</label>
              <input type="number" min={0} step={10} value={form.powerConsumptionWatts} onChange={e => updateForm({ powerConsumptionWatts: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground font-mono" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.profileFailureRate || 'Failure %'}</label>
              <input type="number" min={0} max={100} step={0.5} value={form.failureRate} onChange={e => updateForm({ failureRate: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground font-mono" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.profileMaintenance || 'Maint. (€/h)'}</label>
              <input type="number" min={0} step={0.01} value={form.maintenanceCostPerHour} onChange={e => updateForm({ maintenanceCostPerHour: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground font-mono" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="profileDefault" checked={form.isDefault} onChange={e => updateForm({ isDefault: e.target.checked })} className="rounded" />
            <label htmlFor="profileDefault" className="text-xs text-muted-foreground">{t.profileDefault || 'Set as default'}</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => onSave(form)} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-copper to-copper-dark text-white font-display font-bold text-sm">{t.saveProject || 'Save'}</button>
            {profile && profile.id !== 'custom' && (
              <button onClick={() => onDelete(profile.id)} className="px-4 py-2.5 rounded-xl border border-destructive/30 text-destructive text-sm hover:bg-destructive/10">{t.deleteProfile || 'Delete'}</button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ─── Stat Card ───
function StatCard({ icon, label, value, bgClass, iconColor }: { icon: React.ReactNode; label: string; value: string; bgClass: string; iconColor: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card section-card p-5">
      <div className="flex items-center gap-3 mb-3"><div className={`w-9 h-9 rounded-lg ${bgClass} flex items-center justify-center ${iconColor}`}>{icon}</div><span className="text-xs text-muted-foreground uppercase tracking-wide font-display">{label}</span></div>
      <div className="font-display font-extrabold text-2xl text-foreground">{value}</div>
    </motion.div>
  )
}

// ─── Report Generator ───
function generateReport(project: Project, result: ProjectPricingResult, t: any, type: 'producer' | 'invoice') {
  const isInvoice = type === 'invoice'
  const title = isInvoice ? t.buyerTicketTitle : t.producerReportTitle
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title><style>
    body{font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:40px 20px;color:#1a1a1a}
    h1{color:#C77D3A;font-size:24px;margin-bottom:4px}h2{color:#C77D3A;font-size:16px;margin:20px 0 10px;border-bottom:2px solid #C77D3A;padding-bottom:4px}
    table{width:100%;border-collapse:collapse;margin:10px 0}th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #e5e5e5;font-size:13px}
    th{background:#f8f6f3;font-weight:600;color:#666}.total-row{font-weight:bold;background:#f8f6f3}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px}
    .badge{display:inline-block;background:#C77D3A;color:white;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:600}
    .footer{margin-top:40px;padding-top:20px;border-top:1px solid #e5e5e5;font-size:11px;color:#999}
  </style></head><body>
    <div class="header"><div><h1>D-Calc</h1><p style="color:#666;font-size:12px;margin:0">${t.appSubtitle}</p></div><div class="badge">${isInvoice ? t.buyerTicket : t.producerReport}</div></div>
    <h1>${title}</h1>
    <p><strong>${t.projectPieces}:</strong> ${project.name} &nbsp;|&nbsp; <strong>${t.saleType}:</strong> ${project.saleType} &nbsp;|&nbsp; <strong>${t.margin}:</strong> ${(result.profitMargin * 100).toFixed(0)}%</p>
    ${isInvoice ? '' : `<h2>${t.printParametersLabel}</h2><table><tr><th>${t.printerCost}</th><th>${t.printerLifespan}</th><th>${t.powerConsumption}</th><th>${t.electricityCost}</th></tr>
    <tr><td>${formatCurrency(project.params.printerCost, project.currency)}</td><td>${project.params.printerLifespanHours}h</td><td>${project.params.powerConsumptionWatts}W</td><td>${project.params.electricityCostPerKWh}€/kWh</td></tr></table>`}
    <h2>${t.subpieceBreakdown}</h2>
    <table><tr><th>Pieza</th><th>Cant.</th>${isInvoice ? '' : `<th>${t.material}</th><th>${t.electricity}</th><th>${t.labor}</th>`}<th>${t.totalPerUnit}</th><th>Total</th></tr>
    ${result.subPieceBreakdowns.map(bd => `<tr><td>${bd.subPieceName}</td><td>${bd.quantity}</td>${isInvoice ? '' : `<td>${formatCurrency(bd.materialCost, project.currency)}</td><td>${formatCurrency(bd.electricityCost, project.currency)}</td><td>${formatCurrency(bd.laborCost + bd.supervisionCost, project.currency)}</td>`}<td>${formatCurrency(bd.totalPerUnit, project.currency)}</td><td>${formatCurrency(bd.totalForQuantity, project.currency)}</td></tr>`).join('')}
    </table>
    <h2>${t.projectSummary}</h2>
    <table>
    <tr><td>${t.totalBase}</td><td>${formatCurrency(result.totalBaseCost, project.currency)}</td></tr>
    <tr><td>${t.totalProfitLabel}</td><td>${formatCurrency(result.totalProfit, project.currency)}</td></tr>
    <tr><td>${t.priceBeforeTax}</td><td>${formatCurrency(result.totalPriceBeforeTax, project.currency)}</td></tr>
    <tr><td>${t.taxIncluded} (${project.params.taxRate}%)</td><td>${formatCurrency(result.totalTax, project.currency)}</td></tr>
    ${result.totalPackaging > 0 ? `<tr><td>${t.packaging}</td><td>${formatCurrency(result.totalPackaging, project.currency)}</td></tr>` : ''}
    ${result.totalShipping > 0 ? `<tr><td>${t.shipping}</td><td>${formatCurrency(result.totalShipping, project.currency)}</td></tr>` : ''}
    <tr class="total-row"><td>${t.projectTotal}</td><td>${formatCurrency(result.totalProjectPrice, project.currency)}</td></tr>
    </table>
    <div class="footer"><p>${t.generatedBy} · ${new Date().toLocaleDateString()} · ${t.validFor30} ${new Date().toLocaleDateString()}</p></div>
  </body></html>`

  const w = window.open('', '_blank')
  if (w) { w.document.write(html); w.document.close() }
}

// ─── Footer ───
function Footer() {
  const { t } = useI18n()
  return (
    <footer className="mt-auto border-t border-border/30 py-4 px-4">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{t.footerText}</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  )
}

// ═══════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════
export default function Home() {
  const [currentPage, setCurrentPage] = useState<AppPage>('calculator')

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Ambient glows */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      <NavBar currentPage={currentPage} onNavigate={setCurrentPage} />

      <AnimatePresence mode="wait">
        <motion.div key={currentPage} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTransition} className="flex flex-col flex-1">
          {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
          {currentPage === 'calculator' && <CalculatorPage />}
          {currentPage === 'auth' && <AuthPage onNavigate={setCurrentPage} />}
          {currentPage === 'dashboard' && <DashboardPage onNavigate={setCurrentPage} />}
        </motion.div>
      </AnimatePresence>

      <Footer />
    </div>
  )
}
