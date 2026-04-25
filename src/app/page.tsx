'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useI18n } from '@/hooks/use-i18n'
import { usePersistedProject } from '@/hooks/use-persisted-project'
import { calculateProjectPrice, formatCurrency } from '@/lib/calculator'
import { useToast } from '@/hooks/use-toast'
import type { Project, SubPiece, SaleType, PricingTier, ProjectParams, ProjectPricingResult, SubPieceCostBreakdown, FilamentType, FinishingType } from '@/lib/types'
import { generateId, getDefaultSubPiece, FILAMENT_DEFAULTS, PRICING_TIER_CONFIG, SALE_TYPE_CONFIG, FINISHING_DEFAULTS } from '@/lib/types'
import { CURRENCIES, detectCurrency, type CurrencyCode } from '@/lib/currency'
import { PRINTER_DATABASE, getPrintersByBrand, getPrinterById } from '@/lib/printers'
import { ThemeToggle } from '@/components/calculator/theme-toggle'
import { AuthPanel } from '@/components/calculator/auth-panel'
import { Dashboard } from '@/components/calculator/dashboard'
import { InfoTooltip } from '@/components/calculator/info-tooltip'
import { LOCALE_NAMES, LOCALE_FLAGS, type Locale } from '@/lib/i18n'
import {
  Plus, Printer, Settings, Pencil, Copy, Check, Clock, Weight, Hash, Package,
  RotateCcw, Sparkles, Calculator, Layers, DollarSign, FileDown, X, Save,
  Loader2, LogIn, ShoppingBag, ChevronDown, ChevronRight, Globe, Coins,
  PenTool, Zap, Wrench, Percent, Truck, Eye, EyeOff, Trash2, FileText, Receipt
} from 'lucide-react'

// ─── Animation variants ───
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

// ─── Main Page ───
export default function Home() {
  const { data: session } = useSession()
  const { locale, setLocale, t } = useI18n()
  const tierNameMap: Record<string, string> = {
    competitive: t.competitive,
    standard: t.standard,
    premium: t.premium,
    luxury: t.luxury,
  }
  const { project, setProject, resetProject, hasStoredData } = usePersistedProject()
  const { toast } = useToast()

  // Local state
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [breakdownOpen, setBreakdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [savingProject, setSavingProject] = useState(false)
  const [recordingSale, setRecordingSale] = useState(false)
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(true)

  // Refs for pencil focus
  const projectNameRef = useRef<HTMLInputElement>(null)

  // ─── Calculations ───
  const pricingResults = useMemo(() => calculateProjectPrice(project), [project])
  const selectedResult = useMemo(
    () => pricingResults.find(r => r.tier === project.selectedTier) ?? pricingResults[1],
    [pricingResults, project.selectedTier]
  )
  const totalPieces = useMemo(
    () => project.subPieces.reduce((sum, sp) => sum + sp.quantity, 0),
    [project.subPieces]
  )
  const totalPrintTimeHours = useMemo(
    () => project.subPieces.reduce((sum, sp) => sum + (sp.printTimeHours + sp.printTimeMinutes / 60) * sp.quantity, 0),
    [project.subPieces]
  )
  const totalWeightGrams = useMemo(
    () => project.subPieces.reduce((sum, sp) => sum + sp.printWeight * sp.quantity, 0),
    [project.subPieces]
  )

  // ─── Project update helpers ───
  const updateProject = useCallback((partial: Partial<Project>) => {
    setProject(prev => ({ ...prev, ...partial }))
  }, [setProject])

  const updateParams = useCallback((partial: Partial<ProjectParams>) => {
    setProject(prev => ({ ...prev, params: { ...prev.params, ...partial } }))
  }, [setProject])

  const addSubPiece = useCallback(() => {
    const n = project.subPieces.length + 1
    const newPiece: SubPiece = { ...getDefaultSubPiece(), id: generateId(), name: `Piece ${n}` }
    setProject(prev => ({ ...prev, subPieces: [...prev.subPieces, newPiece] }))
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
        const existing = projects.find((p: { data: string }) => {
          try { return JSON.parse(p.data).id === project.id } catch { return false }
        })
        if (existing) {
          const res = await fetch(`/api/projects/${existing.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: project.name, data: project }),
          })
          if (!res.ok) throw new Error()
          toast({ title: t.projectUpdated })
        } else {
          const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: project.name, data: project }),
          })
          if (!res.ok) throw new Error()
          toast({ title: t.projectSaved })
        }
      }
    } catch {
      toast({ title: t.errorSaving, variant: 'destructive' })
    } finally {
      setSavingProject(false)
    }
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
        const existing = projects.find((p: { data: string }) => {
          try { return JSON.parse(p.data).id === project.id } catch { return false }
        })
        if (existing) {
          projectId = existing.id
          await fetch(`/api/projects/${existing.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: project.name, data: project }),
          })
        } else {
          const createRes = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: project.name, data: project }),
          })
          if (createRes.ok) projectId = (await createRes.json()).id
        }
      }
      if (!projectId) throw new Error()
      const saleRes = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          projectName: project.name,
          tier: project.selectedTier,
          saleType: project.saleType,
          quantity: totalPieces,
          unitPrice: selectedResult.totalProjectPrice / (totalPieces || 1),
          totalPrice: selectedResult.totalProjectPrice,
        }),
      })
      if (!saleRes.ok) throw new Error()
      toast({
        title: t.saleRecorded,
        description: `${formatCurrency(selectedResult.totalProjectPrice, project.currency)} — ${project.name}`,
      })
    } catch {
      toast({ title: t.errorRecording, variant: 'destructive' })
    } finally {
      setRecordingSale(false)
    }
  }, [session?.user?.id, project, selectedResult, totalPieces, toast, t])

  // ─── Printer auto-fill ───
  const handlePrinterSelect = useCallback((printerId: string) => {
    if (printerId === 'custom') {
      updateParams({ printerModel: 'custom' })
      return
    }
    const printer = getPrinterById(printerId)
    if (printer) {
      updateParams({
        printerModel: printer.id,
        printerCost: printer.price,
        printerLifespanHours: printer.lifespanHours,
        powerConsumptionWatts: printer.powerConsumptionWatts,
        maintenanceCostPerHour: printer.maintenancePerHour,
        failureRate: printer.failureRate,
      })
    }
  }, [updateParams])

  const printersByBrand = useMemo(() => getPrintersByBrand(), [])

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Ambient glows */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      {/* ═══════════ HEADER ═══════════ */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Logo + Name */}
          <div className="flex items-center gap-2.5 shrink-0">
            <motion.div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-copper to-gold flex items-center justify-center shadow-lg shadow-copper/20"
              whileHover={{ rotate: 10 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Printer className="w-4.5 h-4.5 text-white" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="font-display font-extrabold text-lg text-foreground leading-tight">
                D-<span className="text-gradient-copper">Calc</span>
              </h1>
              <p className="text-[10px] text-muted-foreground leading-tight">{t.appSubtitle}</p>
            </div>
            <div className="sm:hidden">
              <h1 className="font-display font-extrabold text-base text-foreground leading-tight">
                D-<span className="text-gradient-copper">Calc</span>
              </h1>
            </div>
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-1.5">
            {/* Save */}
            {session?.user && (
              <motion.button
                onClick={handleSaveProject}
                disabled={savingProject}
                className="w-8 h-8 rounded-lg bg-sage/15 hover:bg-sage/25 border border-sage/30 flex items-center justify-center transition-colors disabled:opacity-50"
                whileTap={{ scale: 0.9 }}
                aria-label={t.saveProject}
                title={t.saveProject}
              >
                {savingProject ? <Loader2 className="w-3.5 h-3.5 animate-spin text-sage" /> : <Save className="w-3.5 h-3.5 text-sage" />}
              </motion.button>
            )}

            {/* Reset */}
            {hasStoredData && (
              <motion.button
                onClick={resetProject}
                className="w-8 h-8 rounded-lg bg-secondary/80 hover:bg-secondary border border-border flex items-center justify-center transition-colors"
                whileTap={{ scale: 0.9 }}
                aria-label={t.resetProject}
                title={t.resetProject}
              >
                <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
              </motion.button>
            )}

            {/* Settings gear (only display prefs) */}
            <motion.button
              onClick={() => setSettingsOpen(true)}
              className="w-8 h-8 rounded-lg bg-secondary/80 hover:bg-secondary border border-border flex items-center justify-center transition-colors"
              whileTap={{ scale: 0.9 }}
              aria-label={t.parameters}
              title={t.parameters}
            >
              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
            </motion.button>

            <ThemeToggle />
            <AuthPanel onDashboardClick={() => setShowDashboard(true)} />
          </div>
        </div>
      </header>

      {/* ═══════════ SUMMARY BAR ═══════════ */}
      <div className="sticky top-[49px] z-40 glass-card border-b border-border/30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2">
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
                <motion.span
                  key={selectedResult.totalProjectPrice.toFixed(2)}
                  initial={{ scale: 1.08 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="font-display font-extrabold text-lg text-copper"
                >
                  {formatCurrency(selectedResult.totalProjectPrice, project.currency)}
                </motion.span>
              </div>
              <motion.button
                onClick={handleCopyPrice}
                className="w-7 h-7 rounded-md bg-copper/10 hover:bg-copper/20 flex items-center justify-center transition-colors"
                whileTap={{ scale: 0.9 }}
                aria-label={t.copyPrice}
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div key="ck" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Check className="w-3.5 h-3.5 text-sage" />
                    </motion.div>
                  ) : (
                    <motion.div key="cp" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Copy className="w-3.5 h-3.5 text-copper" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <motion.main
        className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ═══ LEFT COLUMN ═══ */}
          <div className="lg:col-span-7 space-y-5">

            {/* Project name */}
            <motion.section variants={sectionVariants}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-copper/15 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-copper" />
                </div>
                <div className="flex items-center flex-1 min-w-0">
                  <input
                    ref={projectNameRef}
                    type="text"
                    value={project.name}
                    onChange={(e) => updateProject({ name: e.target.value })}
                    className="font-display font-extrabold text-xl sm:text-2xl text-foreground bg-transparent border-none outline-none flex-1 min-w-0 placeholder:text-muted-foreground"
                    placeholder={t.pieceName}
                  />
                  <button
                    onClick={() => { projectNameRef.current?.focus(); projectNameRef.current?.select() }}
                    className="ml-0.5 p-1 rounded-md hover:bg-secondary/80 transition-colors shrink-0"
                    aria-label="Edit project name"
                  >
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground" />
                  </button>
                </div>
              </div>
            </motion.section>

            {/* Sale type selector */}
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
                    <motion.button
                      key={type}
                      onClick={() => updateProject({ saleType: type })}
                      className={`
                        relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2
                        transition-all duration-200 cursor-pointer text-center
                        ${isSelected
                          ? 'border-copper bg-copper/10 dark:border-copper dark:bg-copper/15 shadow-md shadow-copper/10'
                          : 'border-border bg-card hover:border-copper/40 hover:bg-copper/5'
                        }
                      `}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className={`${isSelected ? 'text-copper' : 'text-muted-foreground'}`}>
                        {SALE_TYPE_ICONS[type]}
                      </div>
                      <span className="font-display font-semibold text-[11px] leading-tight">
                        {type === 'wholesale' ? t.wholesale : type === 'retail' ? t.retail : type === 'custom' ? t.customSale : t.rush}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full
                        ${type === 'custom' ? 'bg-copper/15 text-copper' : 'bg-secondary text-muted-foreground'}`}
                      >
                        {config.subtitle}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
              {/* Custom multiplier */}
              <AnimatePresence>
                {project.saleType === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 flex items-center gap-3 p-3 rounded-lg bg-copper/10 border border-copper/20"
                  >
                    <label className="text-xs font-medium text-foreground whitespace-nowrap flex items-center gap-1.5">
                      {t.customize}
                      <InfoTooltip text={t.tooltipCustomMultiplier} side="right" />
                    </label>
                    <input
                      type="number"
                      min={0.01}
                      step={0.1}
                      value={project.customMultiplier}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        if (!isNaN(val) && val > 0) updateProject({ customMultiplier: val })
                      }}
                      className="flex-1 max-w-[100px] px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper"
                    />
                    <span className="font-mono font-bold text-copper text-sm">
                      ×{project.customMultiplier.toFixed(1)}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* ═══ Printer Configuration (IN MAIN LAYOUT) ═══ */}
            <motion.section variants={sectionVariants} className="glass-card section-card p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-copper" />
                <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">{t.printParameters}</h2>
                <InfoTooltip text={t.tooltipPrinterModel} />
              </div>

              {/* Printer model selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5" /> {t.printerModel}
                </label>
                <select
                  value={project.params.printerModel}
                  onChange={(e) => handlePrinterSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-copper"
                >
                  <option value="custom">{t.printerDefaults}</option>
                  {Object.entries(printersByBrand).map(([brand, printers]) => (
                    <optgroup key={brand} label={brand}>
                      {printers.map(p => (
                        <option key={p.id} value={p.id}>{p.model}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Core parameters grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <SettingsField icon={<Printer className="w-3.5 h-3.5" />} label={t.printerCost} tooltip={t.tooltipPrinterCost} value={project.params.printerCost} onChange={(v) => updateParams({ printerCost: v })} step={10} />
                <SettingsField icon={<Clock className="w-3.5 h-3.5" />} label={t.printerLifespan} tooltip={t.tooltipLifespan} value={project.params.printerLifespanHours} onChange={(v) => updateParams({ printerLifespanHours: v })} step={500} min={100} />
                <SettingsField icon={<Wrench className="w-3.5 h-3.5" />} label={t.maintenance} tooltip={t.tooltipMaintenance} value={project.params.maintenanceCostPerHour} onChange={(v) => updateParams({ maintenanceCostPerHour: v })} step={0.01} />
                <SettingsField icon={<Zap className="w-3.5 h-3.5" />} label={t.powerConsumption} tooltip={t.tooltipPower} value={project.params.powerConsumptionWatts} onChange={(v) => updateParams({ powerConsumptionWatts: v })} step={10} />
                <SettingsField icon={<DollarSign className="w-3.5 h-3.5" />} label={t.electricityCost} tooltip={t.tooltipElectricity} value={project.params.electricityCostPerKWh} onChange={(v) => updateParams({ electricityCostPerKWh: v })} step={0.01} />
                <SettingsField icon={<Clock className="w-3.5 h-3.5" />} label={t.laborRate} tooltip={t.tooltipLaborRate} value={project.params.laborCostPerHour} onChange={(v) => updateParams({ laborCostPerHour: v })} step={1} />
              </div>

              {/* Advanced toggle */}
              <button
                onClick={() => setAdvancedSettingsOpen(!advancedSettingsOpen)}
                className="flex items-center gap-2 text-xs font-medium text-copper hover:text-copper-dark transition-colors w-full"
              >
                <Settings className="w-3.5 h-3.5" />
                {advancedSettingsOpen ? t.hideAdvanced : t.showAdvanced}
                <motion.div animate={{ rotate: advancedSettingsOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="ml-auto">
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.div>
              </button>

              <AnimatePresence>
                {advancedSettingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                      <SettingsField icon={<Eye className="w-3.5 h-3.5" />} label={t.supervisionRate} tooltip={t.tooltipSupervision} value={project.params.supervisionCostPerHour} onChange={(v) => updateParams({ supervisionCostPerHour: v })} step={1} />
                      <SettingsField icon={<EyeOff className="w-3.5 h-3.5" />} label={t.additionalLabor} tooltip={t.tooltipAdditionalLabor} value={project.params.additionalLaborCostPerHour} onChange={(v) => updateParams({ additionalLaborCostPerHour: v })} step={1} />
                      <SettingsField icon={<Percent className="w-3.5 h-3.5" />} label={t.failureRate} tooltip={t.tooltipFailureRate} value={project.params.failureRate} onChange={(v) => updateParams({ failureRate: v })} step={1} max={100} />
                      <SettingsField icon={<Percent className="w-3.5 h-3.5" />} label={t.overhead} tooltip={t.tooltipOverhead} value={project.params.overheadPercentage} onChange={(v) => updateParams({ overheadPercentage: v })} step={1} max={100} />
                      <SettingsField icon={<Percent className="w-3.5 h-3.5" />} label={t.taxRate} tooltip={t.tooltipTaxRate} value={project.params.taxRate} onChange={(v) => updateParams({ taxRate: v })} step={1} max={100} />
                      <SettingsField icon={<Package className="w-3.5 h-3.5" />} label={t.packaging} tooltip={t.tooltipPackaging} value={project.params.packagingCostPerProject} onChange={(v) => updateParams({ packagingCostPerProject: v })} step={0.1} />
                      <SettingsField icon={<Truck className="w-3.5 h-3.5" />} label={t.shipping} tooltip={t.tooltipShipping} value={project.params.shippingCostPerProject} onChange={(v) => updateParams({ shippingCostPerProject: v })} step={0.5} />
                      <SettingsField icon={<PenTool className="w-3.5 h-3.5" />} label={t.designTime} tooltip={t.tooltipDesignTime} value={project.params.designTimeMinutes} onChange={(v) => updateParams({ designTimeMinutes: v })} step={5} />
                      <SettingsField icon={<DollarSign className="w-3.5 h-3.5" />} label={t.designRate} tooltip={t.tooltipDesignRate} value={project.params.designHourlyRate} onChange={(v) => updateParams({ designHourlyRate: v })} step={5} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* Sub-pieces */}
            <motion.section variants={sectionVariants} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-copper" />
                  <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">{t.projectPieces}</h2>
                </div>
                <motion.button
                  onClick={addSubPiece}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-copper text-primary-foreground font-display font-semibold text-xs hover:bg-copper-dark hover:shadow-lg hover:shadow-copper/20 transition-all"
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                >
                  <Plus className="w-3.5 h-3.5" /> {t.add}
                </motion.button>
              </div>

              <AnimatePresence mode="popLayout">
                {project.subPieces.map((sp, index) => (
                  <PieceCard
                    key={sp.id}
                    subPiece={sp}
                    index={index}
                    currency={project.currency}
                    onChange={(updated) => updateSubPiece(sp.id, updated)}
                    onRemove={() => removeSubPiece(sp.id)}
                    t={t}
                  />
                ))}
              </AnimatePresence>

              {project.subPieces.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-8 flex flex-col items-center justify-center text-center"
                >
                  <div className="relative mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-copper/20 to-gold/10 flex items-center justify-center">
                      <Package className="w-8 h-8 text-copper/60" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-sage/15 flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5 text-sage" />
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-base text-foreground mb-1">{t.noPiecesYet}</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mb-4">{t.noPiecesDesc}</p>
                  <motion.button
                    onClick={addSubPiece}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-copper text-primary-foreground font-display font-semibold text-sm hover:bg-copper-dark transition-all"
                    whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                  >
                    <Plus className="w-4 h-4" /> {t.addFirstPiece}
                  </motion.button>
                </motion.div>
              )}
            </motion.section>
          </div>

          {/* ═══ RIGHT COLUMN ═══ */}
          <div className="lg:col-span-5 space-y-5">

            {/* Guest banner */}
            {!session?.user && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 border border-copper/20 bg-copper/5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-copper/15 flex items-center justify-center shrink-0 mt-0.5">
                    <LogIn className="w-4 h-4 text-copper" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{t.saveYourProjects}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.saveProjectsDesc}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Price tier cards */}
            <motion.section variants={sectionVariants}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-copper" />
                <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">{t.suggestedPrices}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {pricingResults.map((result) => {
                  const isSelected = project.selectedTier === result.tier
                  const color = TIER_BAR_COLORS[result.tier]
                  return (
                    <motion.div
                      key={result.tier}
                      layout
                      onClick={() => updateProject({ selectedTier: result.tier })}
                      className={`
                        relative cursor-pointer rounded-xl border-2 p-3 transition-all duration-300
                        ${isSelected
                          ? 'border-copper bg-copper/10 shadow-lg shadow-copper/10'
                          : 'border-border bg-card hover:border-border/80 hover:shadow-md'
                        }
                      `}
                      whileHover={{ y: -2, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-md text-white"
                          style={{ backgroundColor: color }}
                        >
                          {t.selected}
                        </motion.div>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className={`font-display font-bold text-xs leading-tight ${isSelected ? 'text-copper' : 'text-foreground'}`}>
                          {tierNameMap[result.tier]}
                        </span>
                      </div>
                      <div className={`font-display font-black text-lg leading-none ${isSelected ? 'text-copper' : 'text-foreground'}`}>
                        {formatCurrency(result.totalProjectPrice, project.currency)}
                      </div>
                      <div className="mt-1.5 inline-block px-2 py-0.5 rounded-full text-[9px] font-bold"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        +{(result.profitMargin * 100).toFixed(0)}% {t.margin}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.section>

            {/* Breakdown bar */}
            <motion.section variants={sectionVariants}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={project.selectedTier}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card section-card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: TIER_BAR_COLORS[project.selectedTier] }} />
                      <span className="font-display font-bold text-sm text-copper">{tierNameMap[selectedResult.tier]}</span>
                      <span className="text-muted-foreground text-xs">—</span>
                      <span className="font-display font-bold text-sm text-foreground">
                        {formatCurrency(selectedResult.totalProjectPrice, project.currency)}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {t.margin}: {(selectedResult.profitMargin * 100).toFixed(0)}%
                    </span>
                  </div>

                  <BreakdownBar result={selectedResult} currency={project.currency} />

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    <LegendItem color="#6B9E72" label={t.material} value={selectedResult.totalMaterialCost} currency={project.currency} />
                    <LegendItem color="#4FC3F7" label={t.operation} value={selectedResult.totalBaseCost - selectedResult.totalMaterialCost} currency={project.currency} />
                    <LegendItem color="#C77D3A" label={t.profit} value={selectedResult.totalProfit} currency={project.currency} />
                    <LegendItem color="#D4A843" label={t.taxIncluded} value={selectedResult.totalTax} currency={project.currency} />
                    {(selectedResult.totalPackaging > 0 || selectedResult.totalShipping > 0) && (
                      <LegendItem color="#8A8690" label={t.shippingPackage} value={selectedResult.totalPackaging + selectedResult.totalShipping} currency={project.currency} />
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.section>

            {/* Cost breakdown (collapsible) */}
            <motion.section variants={sectionVariants} className="glass-card section-card overflow-hidden">
              <button onClick={() => setBreakdownOpen(!breakdownOpen)} className="w-full flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-copper" />
                  <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">
                    {t.costBreakdown} — {tierNameMap[selectedResult.tier]}
                  </h2>
                </div>
                <motion.div animate={{ rotate: breakdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </motion.div>
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
                      {selectedResult.subPieceBreakdowns.map(b => (
                        <SubPieceBreakdown key={b.subPieceId} breakdown={b} currency={project.currency} t={t} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* ═══ Export Section ═══ */}
            <motion.section variants={sectionVariants} className="glass-card section-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileDown className="w-4 h-4 text-copper" />
                <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">{t.exportSection}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Producer Report */}
                <motion.button
                  onClick={() => {
                    const html = generateProducerReport(project, selectedResult, tierNameMap, t)
                    printHtml(html, `D-Calc_Report_${project.name}`)
                  }}
                  className="flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sage/10 border border-sage/25 text-sage font-display font-semibold text-xs hover:bg-sage/20 hover:shadow-lg hover:shadow-sage/10 transition-all"
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                >
                  <FileText className="w-5 h-5" />
                  {t.producerReport}
                </motion.button>
                {/* Invoice */}
                <motion.button
                  onClick={() => {
                    const html = generateInvoice(project, selectedResult, t)
                    printHtml(html, `D-Calc_Invoice_${project.name}`)
                  }}
                  className="flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-xl bg-copper/10 border border-copper/25 text-copper font-display font-semibold text-xs hover:bg-copper/20 hover:shadow-lg hover:shadow-copper/10 transition-all"
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                >
                  <Receipt className="w-5 h-5" />
                  {t.buyerTicket}
                </motion.button>
              </div>
            </motion.section>

            {/* Record Sale */}
            {session?.user && project.subPieces.length > 0 && (
              <motion.section variants={sectionVariants}>
                <motion.button
                  onClick={handleRecordSale}
                  disabled={recordingSale}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-sage to-sage/80 text-white font-display font-semibold text-sm hover:shadow-lg hover:shadow-sage/20 transition-all disabled:opacity-50"
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                >
                  {recordingSale ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
                  {t.recordSale}
                </motion.button>
              </motion.section>
            )}
          </div>
        </div>
      </motion.main>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="mt-auto border-t border-border/50 py-3 text-center text-xs text-muted-foreground bg-background/80 backdrop-blur-sm">
        <p className="font-display">D-<span className="text-copper">Calc</span> — {t.appSubtitle}</p>
        <p className="mt-0.5 text-[10px]">{t.footerDisclaimer}</p>
      </footer>

      {/* ═══════════ SETTINGS DRAWER (Currency, Language, Theme ONLY) ═══════════ */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
              onClick={() => setSettingsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-background border-l border-border shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-copper" />
                  <h2 className="font-display font-bold text-lg text-foreground">{t.parameters}</h2>
                </div>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="w-8 h-8 rounded-lg bg-secondary/80 hover:bg-secondary border border-border flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="p-5 space-y-6">
                {/* Currency */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5" /> {t.currency}
                  </label>
                  <select
                    value={project.currency}
                    onChange={(e) => updateProject({ currency: e.target.value as CurrencyCode })}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-copper"
                  >
                    {Object.entries(CURRENCIES).map(([code, info]) => (
                      <option key={code} value={code}>
                        {info.symbol} {code} — {info.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> {t.language}
                  </label>
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as Locale)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-copper"
                  >
                    {Object.entries(LOCALE_NAMES).map(([code, name]) => (
                      <option key={code} value={code}>
                        {LOCALE_FLAGS[code as Locale]} {name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Theme */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Theme
                  </label>
                  <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <span className="text-sm text-foreground font-medium">Light / Dark</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════ DASHBOARD OVERLAY ═══════════ */}
      <AnimatePresence>
        {showDashboard && session?.user && (
          <Dashboard onClose={() => setShowDashboard(false)} currency={project.currency} />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────

function SummaryStat({ icon, bgClass, label, value }: { icon: React.ReactNode; bgClass: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <div className={`w-6 h-6 rounded-md ${bgClass} flex items-center justify-center`}>{icon}</div>
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="font-display font-bold text-sm text-foreground">{value}</span>
      </div>
    </div>
  )
}

function Divider() {
  return <div className="w-px h-6 bg-border/40 shrink-0" />
}

// ─── Settings field ───
function SettingsField({
  icon, label, tooltip, value, onChange, min = 0, max, step = 1
}: {
  icon: React.ReactNode
  label: string
  tooltip: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
        {icon} <span className="truncate">{label}</span>
        {tooltip && <InfoTooltip text={tooltip} />}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.max(min, parseFloat(e.target.value) || 0))}
        min={min}
        max={max}
        step={step}
        className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-copper font-mono"
      />
    </div>
  )
}

// ─── Piece Card ───
function PieceCard({
  subPiece, index, currency, onChange, onRemove, t
}: {
  subPiece: SubPiece
  index: number
  currency: CurrencyCode
  onChange: (updated: SubPiece) => void
  onRemove: () => void
  t: Record<string, string>
}) {
  const [isExpanded, setIsExpanded] = useState(index === 0)
  const nameRef = useRef<HTMLInputElement>(null)

  const update = (partial: Partial<SubPiece>) => {
    onChange({ ...subPiece, ...partial })
  }

  const handleFilamentChange = (filamentType: FilamentType) => {
    const defaults = FILAMENT_DEFAULTS[filamentType]
    update({ filamentType, filamentCostPerKg: defaults.costPerKg })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16, scale: 0.95 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 cursor-pointer select-none" onClick={() => setIsExpanded(!isExpanded)}>
        <div
          className="w-3.5 h-3.5 rounded-full shrink-0 border-2"
          style={{ backgroundColor: subPiece.color, borderColor: subPiece.color }}
        />
        <div className="flex items-center gap-0.5 flex-1 min-w-0">
          <input
            ref={nameRef}
            type="text"
            value={subPiece.name}
            onChange={(e) => update({ name: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            className="font-display font-semibold text-foreground bg-transparent border-none outline-none text-sm min-w-0 truncate"
            placeholder={t.pieceName}
          />
          <button
            onClick={(e) => { e.stopPropagation(); nameRef.current?.focus() }}
            className="p-0.5 rounded hover:bg-secondary/80 transition-colors shrink-0"
            aria-label="Edit piece name"
          >
            <Pencil className="w-3 h-3 text-muted-foreground/40" />
          </button>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
          {subPiece.filamentType} · {subPiece.printWeight}g
        </span>
        <motion.button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </motion.button>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </motion.div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3">
              {/* Color + Filament */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">{t.filamentColor}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={subPiece.color}
                      onChange={(e) => update({ color: e.target.value })}
                      className="w-8 h-8 rounded-lg border-2 border-border cursor-pointer bg-transparent p-0.5"
                    />
                    <span className="font-mono text-[10px] text-muted-foreground">{subPiece.color}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">{t.filamentType}</label>
                  <select
                    value={subPiece.filamentType}
                    onChange={(e) => handleFilamentChange(e.target.value as FilamentType)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-copper"
                  >
                    {(Object.entries(FILAMENT_DEFAULTS) as [FilamentType, typeof FILAMENT_DEFAULTS[FilamentType]][]).map(([type]) => (
                      <option key={type} value={type}>
                        {type === 'Custom' ? t.custom : type}
                      </option>
                    ))}
                  </select>
                  {subPiece.filamentType === 'Custom' && (
                    <input
                      type="text"
                      value={subPiece.customFilamentName}
                      onChange={(e) => update({ customFilamentName: e.target.value })}
                      placeholder={t.customFilamentName}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-copper"
                    />
                  )}
                </div>
              </div>

              {/* Row 1: Weight | Cost | Hours | Minutes */}
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">{t.weightGrams}</label>
                  <input
                    type="number"
                    value={subPiece.printWeight}
                    onChange={(e) => update({ printWeight: Math.max(0, parseFloat(e.target.value) || 0) })}
                    min={0} step={1}
                    className="w-full px-2 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-copper font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">{t.costPerKg}</label>
                  <input
                    type="number"
                    value={subPiece.filamentCostPerKg}
                    onChange={(e) => update({ filamentCostPerKg: Math.max(0, parseFloat(e.target.value) || 0) })}
                    min={0} step={0.5}
                    className="w-full px-2 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-copper font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">{t.hours}</label>
                  <input
                    type="number"
                    value={subPiece.printTimeHours}
                    onChange={(e) => update({ printTimeHours: Math.max(0, parseInt(e.target.value) || 0) })}
                    min={0}
                    className="w-full px-2 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-copper font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">{t.minutes}</label>
                  <input
                    type="number"
                    value={subPiece.printTimeMinutes}
                    onChange={(e) => update({ printTimeMinutes: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) })}
                    min={0} max={59}
                    className="w-full px-2 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-copper font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Quantity | Waste | Post-processing | Labor */}
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">{t.quantity}</label>
                  <input
                    type="number"
                    value={subPiece.quantity}
                    onChange={(e) => update({ quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    min={1}
                    className="w-full px-2 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-copper font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">{t.waste}</label>
                  <input
                    type="number"
                    value={subPiece.wastePercentage}
                    onChange={(e) => update({ wastePercentage: Math.max(0, parseFloat(e.target.value) || 0) })}
                    min={0} max={100} step={1}
                    className="w-full px-2 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-copper font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">{t.postProcessing}</label>
                  <input
                    type="number"
                    value={subPiece.postProcessingTimeMinutes}
                    onChange={(e) => update({ postProcessingTimeMinutes: Math.max(0, parseInt(e.target.value) || 0) })}
                    min={0}
                    className="w-full px-2 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-copper font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">{t.laborTime}</label>
                  <input
                    type="number"
                    value={subPiece.laborTimeMinutes ?? 0}
                    onChange={(e) => update({ laborTimeMinutes: Math.max(0, parseInt(e.target.value) || 0) })}
                    min={0}
                    className="w-full px-2 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-copper font-mono"
                  />
                </div>
              </div>

              {/* Finish type */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">{t.finishType}</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(Object.entries(FINISHING_DEFAULTS) as [FinishingType, typeof FINISHING_DEFAULTS[FinishingType]][]).map(([type, config]) => {
                    const isSelected = subPiece.finishingType === type
                    const label = type === 'none' ? t.noFinish : type === 'lightSanding' ? t.lightSanding : type === 'fullSanding' ? t.fullSanding : type === 'primerPaint' ? t.primerPaint : type === 'fullPaint' ? t.fullPaint : type === 'vaporSmoothing' ? t.vaporSmoothing : type === 'epoxyCoating' ? t.epoxyCoating : t.customFinish
                    return (
                      <motion.button
                        key={type}
                        onClick={() => {
                          update({
                            finishingType: type,
                            finishingCostPerPiece: type === 'custom' ? subPiece.finishingCostPerPiece : config.costPerPiece,
                          })
                        }}
                        className={`p-2 rounded-lg border text-center transition-all
                          ${isSelected ? 'border-copper bg-copper/10' : 'border-border bg-card hover:border-copper/40'}
                        `}
                        whileTap={{ scale: 0.97 }}
                      >
                        <span className="text-[10px] font-semibold block truncate">{label}</span>
                        <span className="text-[9px] text-muted-foreground">
                          {config.costPerPiece === 0 ? t.free : `${config.costPerPiece}${t.perPiece}`}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
                {subPiece.finishingType === 'custom' && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="number"
                      value={subPiece.finishingCostPerPiece}
                      onChange={(e) => update({ finishingCostPerPiece: Math.max(0, parseFloat(e.target.value) || 0) })}
                      min={0} step={0.5}
                      placeholder={t.costPerKg}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-copper font-mono"
                    />
                    <input
                      type="text"
                      value={subPiece.customFinishingDescription}
                      onChange={(e) => update({ customFinishingDescription: e.target.value })}
                      placeholder={t.customFinishDesc}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-copper"
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Breakdown Bar ───
function BreakdownBar({ result, currency }: { result: ProjectPricingResult; currency: CurrencyCode }) {
  const total = result.totalProjectPrice
  if (total <= 0) return null

  const otherCosts = result.totalBaseCost - result.totalMaterialCost
  const segments = [
    { value: result.totalMaterialCost, color: '#6B9E72' },
    { value: otherCosts > 0 ? otherCosts : 0, color: '#4FC3F7' },
    { value: result.totalProfit, color: '#C77D3A' },
    { value: result.totalTax, color: '#D4A843' },
    { value: result.totalPackaging + result.totalShipping, color: '#8A8690' },
  ].filter(s => s.value > 0)

  return (
    <div className="breakdown-bar">
      {segments.map((seg, i) => {
        const pct = (seg.value / total) * 100
        return (
          <motion.div
            key={i}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ backgroundColor: seg.color, color: pct > 12 ? '#fff' : 'transparent' }}
          >
            {pct > 12 ? `${pct.toFixed(0)}%` : ''}
          </motion.div>
        )
      })}
    </div>
  )
}

function LegendItem({ color, label, value, currency }: { color: string; label: string; value: number; currency: CurrencyCode }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
      <div className="flex flex-col leading-tight min-w-0">
        <span className="text-[9px] text-muted-foreground truncate">{label}</span>
        <span className="font-mono font-semibold text-foreground text-[10px]">{formatCurrency(value, currency)}</span>
      </div>
    </div>
  )
}

function BreakdownSummaryItem({ label, value, currency, highlight }: { label: string; value: number; currency: CurrencyCode; highlight?: boolean }) {
  return (
    <div className={`flex flex-col p-2 rounded-lg ${highlight ? 'bg-copper/10 border border-copper/20' : 'bg-secondary/20'}`}>
      <span className="text-[9px] text-muted-foreground uppercase tracking-wider truncate">{label}</span>
      <span className={`font-mono font-bold text-xs ${highlight ? 'text-copper text-sm' : 'text-foreground'}`}>
        {formatCurrency(value, currency)}
      </span>
    </div>
  )
}

// ─── Sub-piece breakdown (detailed) ───
function SubPieceBreakdown({ breakdown, currency, t }: { breakdown: SubPieceCostBreakdown; currency: CurrencyCode; t: Record<string, string> }) {
  const [isOpen, setIsOpen] = useState(false)

  const rows = [
    { label: t.materialWithWaste, value: breakdown.materialCost },
    { label: t.printerDepreciation, value: breakdown.printerDepreciation },
    { label: t.electricity, value: breakdown.electricityCost },
    { label: t.maintenanceCost, value: breakdown.maintenanceCost },
    { label: t.labor, value: breakdown.laborCost },
    { label: t.finishing, value: breakdown.finishingCost },
    { label: t.failureRisk, value: breakdown.failureCost },
    { label: t.subtotal, value: breakdown.subtotalPerUnit, bold: true },
    { label: t.overheadCost, value: breakdown.overheadPerUnit },
    { label: t.baseCost, value: breakdown.baseCostPerUnit, bold: true },
    { label: t.profitPerUnit, value: breakdown.profitPerUnit },
    { label: t.priceBeforeTax, value: breakdown.priceBeforeTaxPerUnit },
    { label: t.taxPerUnit, value: breakdown.taxPerUnit },
    { label: t.totalPerUnit, value: breakdown.totalPerUnit, bold: true, highlight: true },
    { label: t.totalForQty.replace('{qty}', String(breakdown.quantity)), value: breakdown.totalForQuantity, bold: true, highlight: true },
  ]

  return (
    <div className="rounded-lg border border-border/60 bg-secondary/10 overflow-hidden mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2.5 hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </motion.div>
          <span className="font-display font-semibold text-xs text-foreground">{breakdown.subPieceName}</span>
          <span className="text-[10px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded-full">×{breakdown.quantity}</span>
        </div>
        <span className="font-mono font-bold text-copper text-xs">
          {formatCurrency(breakdown.totalForQuantity, currency)}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 space-y-0.5 text-xs">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className={`flex justify-between items-center py-1 px-1 rounded
                    ${row.highlight ? 'border-t border-border mt-1 pt-2 bg-copper/5' : ''}
                    ${row.bold && !row.highlight ? 'bg-secondary/30' : ''}
                  `}
                >
                  <span className={`${row.bold ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                    {row.label}
                  </span>
                  <span className={`font-mono
                    ${row.highlight ? 'font-bold text-copper' : row.bold ? 'font-bold text-foreground' : 'text-muted-foreground'}`}
                  >
                    {formatCurrency(row.value, currency)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Generate Producer Report HTML ───
function generateProducerReport(
  project: Project,
  selectedResult: ProjectPricingResult,
  tierNameMap: Record<string, string>,
  t: Record<string, string>
) {
  const now = new Date()
  const date = now.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  const reportId = `RPT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`

  const printer = project.params.printerModel !== 'custom' ? getPrinterById(project.params.printerModel) : null

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>D-Calc — Producer Report — ${project.name}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'DM Sans',system-ui,sans-serif;background:#fff;color:#1a1a2e;padding:32px;line-height:1.6;max-width:750px;margin:0 auto;font-size:13px}
    .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #C77D3A;padding-bottom:16px;margin-bottom:20px}
    .logo{font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700;color:#C77D3A}
    .logo span{color:#6B9E72}
    .report-type{font-size:11px;color:#6B6572;text-transform:uppercase;letter-spacing:1.5px;margin-top:2px}
    .report-id{font-family:'Space Grotesk',monospace;font-size:11px;color:#6B6572;text-align:right}
    h2{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;color:#C77D3A;margin:20px 0 10px;padding-bottom:6px;border-bottom:1px solid #E8E2DA}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .item{padding:8px 12px;background:#f8f6f3;border-radius:8px}
    .item-label{font-size:10px;color:#6B6572;text-transform:uppercase;letter-spacing:0.5px}
    .item-value{font-family:'Space Grotesk',monospace;font-weight:600;font-size:14px;color:#1a1a2e}
    .piece-section{margin:16px 0;padding:12px;border:1px solid #E8E2DA;border-radius:10px}
    .piece-header{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:14px;color:#1a1a2e;margin-bottom:8px}
    .cost-row{display:flex;justify-content:space-between;align-items:center;padding:4px 8px;font-size:12px}
    .cost-row.alt{background:#f8f6f3;border-radius:4px}
    .cost-row .label{color:#6B6572}
    .cost-row .value{font-family:'Space Grotesk',monospace;font-weight:600;color:#1a1a2e}
    .cost-row.bold .label{font-weight:700;color:#1a1a2e}
    .cost-row.bold .value{font-weight:700;color:#C77D3A}
    .cost-row.highlight{background:#C77D3A10;border-radius:6px;padding:6px 8px;margin-top:4px}
    .cost-row.highlight .label{font-weight:700;color:#1a1a2e}
    .cost-row.highlight .value{font-weight:700;color:#C77D3A;font-size:14px}
    .total-bar{text-align:center;padding:16px;background:#C77D3A10;border-radius:12px;margin-top:20px}
    .total-label{font-size:11px;color:#6B6572;text-transform:uppercase;letter-spacing:1px}
    .total-price{font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;color:#C77D3A;margin-top:4px}
    .footer{margin-top:24px;text-align:center;font-size:10px;color:#6B6572;border-top:1px solid #E8E2DA;padding-top:12px}
    .param-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
    .param-item{padding:6px 10px;background:#f8f6f3;border-radius:6px;font-size:11px}
    .param-item .pl{font-size:9px;color:#6B6572;text-transform:uppercase;letter-spacing:0.5px}
    .param-item .pv{font-family:'Space Grotesk',monospace;font-weight:600;font-size:12px;color:#1a1a2e}
    @media print{body{padding:20px}}
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">D-<span>Calc</span></div>
      <div class="report-type">${t.producerReportTitle}</div>
    </div>
    <div>
      <div class="report-id">${reportId}</div>
      <div style="font-size:11px;color:#6B6572">${date}</div>
    </div>
  </div>

  <h2>${t.projectSummary}</h2>
  <div class="grid">
    <div class="item"><div class="item-label">Project</div><div class="item-value">${project.name}</div></div>
    <div class="item"><div class="item-label">${t.saleType}</div><div class="item-value">${project.saleType === 'wholesale' ? t.wholesale : project.saleType === 'retail' ? t.retail : project.saleType === 'custom' ? t.customSale : t.rush}</div></div>
    <div class="item"><div class="item-label">Tier</div><div class="item-value">${tierNameMap[selectedResult.tier]}</div></div>
    <div class="item"><div class="item-label">Margin</div><div class="item-value">${(selectedResult.profitMargin * 100).toFixed(0)}%</div></div>
  </div>

  <h2>${t.printParametersLabel}</h2>
  <div class="param-grid">
    <div class="param-item"><div class="pl">Printer</div><div class="pv">${printer ? printer.model : 'Custom'}</div></div>
    <div class="param-item"><div class="pl">${t.printerCost}</div><div class="pv">${formatCurrency(project.params.printerCost, project.currency)}</div></div>
    <div class="param-item"><div class="pl">${t.printerLifespan}</div><div class="pv">${project.params.printerLifespanHours}h</div></div>
    <div class="param-item"><div class="pl">${t.powerConsumption}</div><div class="pv">${project.params.powerConsumptionWatts}W</div></div>
    <div class="param-item"><div class="pl">${t.electricityCost}</div><div class="pv">${project.params.electricityCostPerKWh}</div></div>
    <div class="param-item"><div class="pl">${t.laborRate}</div><div class="pv">${formatCurrency(project.params.laborCostPerHour, project.currency)}/h</div></div>
    <div class="param-item"><div class="pl">${t.maintenance}</div><div class="pv">${formatCurrency(project.params.maintenanceCostPerHour, project.currency)}/h</div></div>
    <div class="param-item"><div class="pl">${t.failureRate}</div><div class="pv">${project.params.failureRate}%</div></div>
    <div class="param-item"><div class="pl">${t.overhead}</div><div class="pv">${project.params.overheadPercentage}%</div></div>
    <div class="param-item"><div class="pl">${t.taxRate}</div><div class="pv">${project.params.taxRate}%</div></div>
    <div class="param-item"><div class="pl">${t.packaging}</div><div class="pv">${formatCurrency(project.params.packagingCostPerProject, project.currency)}</div></div>
    <div class="param-item"><div class="pl">${t.shipping}</div><div class="pv">${formatCurrency(project.params.shippingCostPerProject, project.currency)}</div></div>
  </div>

  <h2>${t.subpieceBreakdown}</h2>
  ${selectedResult.subPieceBreakdowns.map(b => `
  <div class="piece-section">
    <div class="piece-header">${b.subPieceName} ×${b.quantity}</div>
    <div class="cost-row"><span class="label">${t.materialWithWaste}</span><span class="value">${formatCurrency(b.materialCost, project.currency)}</span></div>
    <div class="cost-row alt"><span class="label">${t.printerDepreciation}</span><span class="value">${formatCurrency(b.printerDepreciation, project.currency)}</span></div>
    <div class="cost-row"><span class="label">${t.electricity}</span><span class="value">${formatCurrency(b.electricityCost, project.currency)}</span></div>
    <div class="cost-row alt"><span class="label">${t.maintenanceCost}</span><span class="value">${formatCurrency(b.maintenanceCost, project.currency)}</span></div>
    <div class="cost-row"><span class="label">${t.labor}</span><span class="value">${formatCurrency(b.laborCost, project.currency)}</span></div>
    <div class="cost-row alt"><span class="label">${t.finishing}</span><span class="value">${formatCurrency(b.finishingCost, project.currency)}</span></div>
    <div class="cost-row"><span class="label">${t.failureRisk}</span><span class="value">${formatCurrency(b.failureCost, project.currency)}</span></div>
    <div class="cost-row bold"><span class="label">${t.subtotal}</span><span class="value">${formatCurrency(b.subtotalPerUnit, project.currency)}</span></div>
    <div class="cost-row"><span class="label">${t.overheadCost}</span><span class="value">${formatCurrency(b.overheadPerUnit, project.currency)}</span></div>
    <div class="cost-row bold"><span class="label">${t.baseCost}</span><span class="value">${formatCurrency(b.baseCostPerUnit, project.currency)}</span></div>
    <div class="cost-row"><span class="label">${t.profitPerUnit}</span><span class="value">${formatCurrency(b.profitPerUnit, project.currency)}</span></div>
    <div class="cost-row bold"><span class="label">${t.totalPerUnit}</span><span class="value">${formatCurrency(b.totalPerUnit, project.currency)}</span></div>
    <div class="cost-row highlight"><span class="label">${t.totalForQty.replace('{qty}', String(b.quantity))}</span><span class="value">${formatCurrency(b.totalForQuantity, project.currency)}</span></div>
  </div>`).join('')}

  <h2>${t.projectTotal}</h2>
  <div class="grid">
    <div class="item"><div class="item-label">${t.totalMaterial}</div><div class="item-value">${formatCurrency(selectedResult.totalMaterialCost, project.currency)}</div></div>
    <div class="item"><div class="item-label">${t.totalBase}</div><div class="item-value">${formatCurrency(selectedResult.totalBaseCost, project.currency)}</div></div>
    <div class="item"><div class="item-label">${t.totalProfitLabel}</div><div class="item-value">${formatCurrency(selectedResult.totalProfit, project.currency)}</div></div>
    <div class="item"><div class="item-label">${t.priceBeforeTax}</div><div class="item-value">${formatCurrency(selectedResult.totalPriceBeforeTax, project.currency)}</div></div>
    <div class="item"><div class="item-label">${t.taxIncluded}</div><div class="item-value">${formatCurrency(selectedResult.totalTax, project.currency)}</div></div>
    ${(selectedResult.totalPackaging > 0 || selectedResult.totalShipping > 0) ? `
    <div class="item"><div class="item-label">${t.packagingAndShipping}</div><div class="item-value">${formatCurrency(selectedResult.totalPackaging + selectedResult.totalShipping, project.currency)}</div></div>` : ''}
  </div>
  <div class="total-bar">
    <div class="total-label">${t.projectTotal}</div>
    <div class="total-price">${formatCurrency(selectedResult.totalProjectPrice, project.currency)}</div>
  </div>

  <div class="footer">${t.generatedBy} · ${date}</div>
</body>
</html>`
}

// ─── Generate Invoice HTML ───
function generateInvoice(
  project: Project,
  selectedResult: ProjectPricingResult,
  t: Record<string, string>
) {
  const now = new Date()
  const date = now.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
  const subtotal = selectedResult.totalPriceBeforeTax
  const tax = selectedResult.totalTax
  const packagingShipping = selectedResult.totalPackaging + selectedResult.totalShipping
  const total = selectedResult.totalProjectPrice

  const isEs = t.appSubtitle.includes('impresión') || t.appSubtitle.includes('inprimaketa')
  const invoiceTitle = isEs ? 'Factura' : 'Invoice'

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>D-Calc — ${invoiceTitle} — ${project.name}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'DM Sans',system-ui,sans-serif;background:#fff;color:#1a1a2e;padding:40px;line-height:1.6;max-width:600px;margin:0 auto}
    .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #C77D3A;padding-bottom:20px;margin-bottom:25px}
    .logo{font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;color:#C77D3A}
    .logo span{color:#6B9E72}
    .invoice-label{font-size:11px;color:#6B6572;text-transform:uppercase;letter-spacing:1.5px;margin-top:2px}
    .invoice-meta{text-align:right;font-size:12px;color:#6B6572}
    .invoice-meta .inv-num{font-family:'Space Grotesk',monospace;font-weight:700;font-size:14px;color:#1a1a2e}
    .project-name{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:#1a1a2e;margin:20px 0 5px}
    .date-line{font-size:12px;color:#6B6572}
    table{width:100%;border-collapse:collapse;margin:20px 0}
    th{text-align:left;font-size:10px;color:#6B6572;text-transform:uppercase;letter-spacing:0.5px;padding:8px 12px;border-bottom:2px solid #E8E2DA}
    th:last-child{text-align:right}
    td{padding:10px 12px;border-bottom:1px solid #E8E2DA;font-size:13px}
    td:last-child{text-align:right;font-family:'Space Grotesk',monospace;font-weight:600}
    .item-name{font-weight:600}
    .item-detail{font-size:11px;color:#6B6572}
    .summary-section{margin-top:15px}
    .summary-row{display:flex;justify-content:space-between;align-items:center;padding:8px 16px;font-size:13px}
    .summary-row.alt{background:#f8f6f3}
    .summary-row .label{color:#6B6572}
    .summary-row .value{font-family:'Space Grotesk',monospace;font-weight:600;color:#1a1a2e}
    .summary-row.total{background:#C77D3A10;border-radius:10px;padding:12px 16px;margin-top:8px}
    .summary-row.total .label{font-weight:700;color:#1a1a2e;text-transform:uppercase;letter-spacing:0.5px;font-size:11px}
    .summary-row.total .value{font-weight:700;color:#C77D3A;font-size:20px}
    .footer{margin-top:30px;text-align:center;font-size:11px;color:#6B6572;border-top:1px solid #E8E2DA;padding-top:15px}
    @media print{body{padding:20px}}
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">D-<span>Calc</span></div>
      <div class="invoice-label">${invoiceTitle}</div>
    </div>
    <div class="invoice-meta">
      <div class="inv-num">${invoiceNumber}</div>
      <div>${date}</div>
    </div>
  </div>

  <div class="project-name">${project.name}</div>
  <div class="date-line">${t.validFor30} ${date}</div>

  <table>
    <thead>
      <tr>
        <th>${t.projectPieces}</th>
        <th>${t.quantity}</th>
        <th>${t.unitPrice}</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${selectedResult.subPieceBreakdowns.map(b => `
      <tr>
        <td><div class="item-name">${b.subPieceName}</div><div class="item-detail">${b.subPieceName}</div></td>
        <td>${b.quantity}</td>
        <td>${formatCurrency(b.totalPerUnit, project.currency)}</td>
        <td>${formatCurrency(b.totalForQuantity, project.currency)}</td>
      </tr>`).join('')}
      ${(packagingShipping > 0) ? `
      <tr>
        <td><div class="item-name">${t.packagingAndShipping}</div></td>
        <td>1</td>
        <td>${formatCurrency(packagingShipping, project.currency)}</td>
        <td>${formatCurrency(packagingShipping, project.currency)}</td>
      </tr>` : ''}
    </tbody>
  </table>

  <div class="summary-section">
    <div class="summary-row alt"><span class="label">Subtotal</span><span class="value">${formatCurrency(subtotal, project.currency)}</span></div>
    <div class="summary-row"><span class="label">${t.taxIncluded} (${project.params.taxRate}%)</span><span class="value">${formatCurrency(tax, project.currency)}</span></div>
    ${packagingShipping > 0 ? `<div class="summary-row alt"><span class="label">${t.packagingAndShipping}</span><span class="value">${formatCurrency(packagingShipping, project.currency)}</span></div>` : ''}
    <div class="summary-row total">
      <span class="label">Total</span>
      <span class="value">${formatCurrency(total, project.currency)}</span>
    </div>
  </div>

  <div class="footer">${t.generatedBy} · ${t.validFor30} ${date}</div>
</body>
</html>`
}

// ─── Print / Download helpers ───
function printHtml(html: string, title: string) {
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
  iframe.title = title
  document.body.appendChild(iframe)
  const doc = iframe.contentWindow?.document
  if (!doc) { document.body.removeChild(iframe); downloadHtml(html, title); return }
  doc.open(); doc.write(html); doc.close()
  setTimeout(() => {
    try { iframe.contentWindow?.focus(); iframe.contentWindow?.print() }
    catch { downloadHtml(html, title) }
    setTimeout(() => { try { document.body.removeChild(iframe) } catch {} }, 1000)
  }, 400)
}

function downloadHtml(html: string, title: string) {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `${title}.html`; a.click()
  URL.revokeObjectURL(url)
}
