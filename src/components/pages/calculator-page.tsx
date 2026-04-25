'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useI18n } from '@/hooks/use-i18n'
import { usePersistedProject } from '@/hooks/use-persisted-project'
import { calculateProjectPrice, formatCurrency } from '@/lib/calculator'
import { useToast } from '@/hooks/use-toast'
import type { Project, SubPiece, SaleType, PricingTier, ProjectParams, FilamentType, FinishingType, PrinterProfile } from '@/lib/types'
import { generateId, getDefaultSubPiece, FILAMENT_DEFAULTS, PRICING_TIER_CONFIG, SALE_TYPE_CONFIG, FINISHING_DEFAULTS, getDefaultPrinterProfile, printerProfileToParams } from '@/lib/types'
import { CURRENCIES, type CurrencyCode } from '@/lib/currency'
import { LOCALE_NAMES, LOCALE_FLAGS, type Locale } from '@/lib/i18n'
import { useTheme } from 'next-themes'
import { InfoTooltip } from '@/components/calculator/info-tooltip'
import { ExportOptions } from '@/components/calculator/export-options'
import {
  Plus, Printer, Settings, Pencil, Copy, Check, Clock, Weight, Hash, Package,
  Sparkles, Calculator, Layers, DollarSign, X, Save,
  Loader2, LogIn, ShoppingBag, ChevronDown, Zap, Wrench, Percent,
  Truck, Eye, PenTool, Trash2, FileText, Receipt, UserPlus, RotateCcw,
  Sun, Moon, Globe, Coins
} from 'lucide-react'

const formatPrintTime = (hours: number) => {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h${m}m`
}
const formatWeight = (grams: number) =>
  grams >= 1000 ? `${(grams / 1000).toFixed(1)} kg` : `${grams.toFixed(0)} g`

const TIER_BAR_COLORS: Record<PricingTier, string> = {
  competitive: '#6B9E72',
  standard: '#C77D3A',
  premium: '#D4A843',
  luxury: '#4FC3F7',
}

const TIER_BORDER: Record<PricingTier, string> = {
  competitive: 'border-sage',
  standard: 'border-copper',
  premium: 'border-gold',
  luxury: 'border-diamond',
}

const TIER_BG: Record<PricingTier, string> = {
  competitive: 'bg-sage/10',
  standard: 'bg-copper/10',
  premium: 'bg-gold/10',
  luxury: 'bg-diamond/10',
}

const SALE_TYPE_ICONS: Record<SaleType, React.ReactNode> = {
  wholesale: <Package className="w-4 h-4" />,
  retail: <ShoppingBag className="w-4 h-4" />,
  custom: <Settings className="w-4 h-4" />,
  rush: <Zap className="w-4 h-4" />,
}

// ─── Settings Field ───
function SettingsField({ icon, label, tooltip, value, onChange, step = 1, min = 0, max }: {
  icon: React.ReactNode; label: string; tooltip: string; value: number; onChange: (v: number) => void
  step?: number; min?: number; max?: number
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
        {icon} {label} <InfoTooltip text={tooltip} side="right" />
      </label>
      <input
        type="number" min={min} max={max} step={step} value={value}
        onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v) }}
        className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper"
      />
    </div>
  )
}

// ─── Breakdown Bar ───
function BreakdownBar({ result, currency }: { result: { totalMaterialCost: number; totalBaseCost: number; totalProfit: number; totalTax: number; totalPackaging: number; totalShipping: number }; currency: CurrencyCode }) {
  const total = result.totalBaseCost + result.totalProfit + result.totalTax + result.totalPackaging + result.totalShipping
  if (total === 0) return null
  const pct = (v: number) => Math.max((v / total) * 100, 0)
  return (
    <div className="breakdown-bar">
      <div style={{ width: `${pct(result.totalMaterialCost)}%`, background: '#6B9E72' }} />
      <div style={{ width: `${pct(result.totalBaseCost - result.totalMaterialCost)}%`, background: '#4FC3F7' }} />
      <div style={{ width: `${pct(result.totalProfit)}%`, background: '#C77D3A' }} />
      <div style={{ width: `${pct(result.totalTax)}%`, background: '#D4A843' }} />
      {(result.totalPackaging > 0 || result.totalShipping > 0) && (
        <div style={{ width: `${pct(result.totalPackaging + result.totalShipping)}%`, background: '#8A8690' }} />
      )}
    </div>
  )
}

// ─── Legend Item ───
function LegendItem({ color, label, value, currency }: { color: string; label: string; value: number; currency: CurrencyCode }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <div className="min-w-0">
        <div className="text-[10px] text-muted-foreground truncate">{label}</div>
        <div className="font-display font-bold text-xs text-foreground">{formatCurrency(value, currency)}</div>
      </div>
    </div>
  )
}

// ─── Piece Card ───
function PieceCard({ subPiece, index, currency, onChange, onRemove, t }: {
  subPiece: SubPiece; index: number; currency: CurrencyCode
  onChange: (updated: SubPiece) => void; onRemove: () => void; t: Record<string, string>
}) {
  const [open, setOpen] = useState(false)
  const update = (partial: Partial<SubPiece>) => onChange({ ...subPiece, ...partial })

  const handleFilamentTypeChange = (newType: FilamentType) => {
    const costPerKg = newType === 'Custom' ? subPiece.filamentCostPerKg : FILAMENT_DEFAULTS[newType].costPerKg
    update({ filamentType: newType, filamentCostPerKg: costPerKg })
  }

  const finishingOptions: FinishingType[] = ['none', 'lightSanding', 'fullSanding', 'primerPaint', 'fullPaint', 'vaporSmoothing', 'epoxyCoating', 'custom']
  const finishingKeyMap: Record<FinishingType, string> = {
    none: 'noFinish', lightSanding: 'lightSanding', fullSanding: 'fullSanding',
    primerPaint: 'primerPaint', fullPaint: 'fullPaint', vaporSmoothing: 'vaporSmoothing',
    epoxyCoating: 'epoxyCoating', custom: 'customFinish'
  }
  const filamentTypes: FilamentType[] = ['PLA', 'PLA+', 'ABS', 'PETG', 'TPU', 'Nylon', 'CarbonFiber', 'WoodFill', 'MetalFill', 'HIPS', 'PVA', 'ASA', 'PC', 'Custom']

  return (
    <motion.div layout className="glass-card overflow-hidden group hover:shadow-md hover:shadow-copper/5 transition-shadow" style={{ borderLeft: `3px solid ${subPiece.color}` }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-4">
        <div className="w-3 h-3 rounded-full shrink-0 transition-transform group-hover:scale-125" style={{ backgroundColor: subPiece.color }} />
        <span className="font-display font-bold text-sm text-foreground flex-1 text-left truncate">{subPiece.name}</span>
        <span className="text-xs text-muted-foreground font-mono">{subPiece.quantity}u · {subPiece.printWeight}g</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
              {/* Name + Color + Remove */}
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    {t.pieceName} <InfoTooltip text={t.tooltipPrintWeight} side="right" />
                  </label>
                  <input type="text" value={subPiece.name} onChange={(e) => update({ name: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-copper" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    {t.filamentColor} <InfoTooltip text={t.tooltipColor} side="right" />
                  </label>
                  <input type="color" value={subPiece.color} onChange={(e) => update({ color: e.target.value })}
                    className="w-10 h-9 rounded-lg border border-border cursor-pointer" />
                </div>
                <button onClick={onRemove} className="mt-5 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Filament type (no price shown) */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  {t.filamentType} <InfoTooltip text={t.tooltipFilamentType} side="right" />
                </label>
                <select value={subPiece.filamentType} onChange={(e) => handleFilamentTypeChange(e.target.value as FilamentType)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-copper">
                  {filamentTypes.map(ft => <option key={ft} value={ft}>{ft}</option>)}
                </select>
              </div>

              {subPiece.filamentType === 'Custom' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    {t.customFilamentName} <InfoTooltip text={t.tooltipCustomFilament} side="right" />
                  </label>
                  <input type="text" value={subPiece.customFilamentName} onChange={(e) => update({ customFilamentName: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-copper" />
                </div>
              )}

              {/* Parameters grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <SettingsField icon={<Weight className="w-3.5 h-3.5" />} label={t.weightGrams} tooltip={t.tooltipPrintWeight} value={subPiece.printWeight} onChange={(v) => update({ printWeight: v })} step={1} />
                <SettingsField icon={<DollarSign className="w-3.5 h-3.5" />} label={t.costPerKg} tooltip={t.tooltipFilamentCost} value={subPiece.filamentCostPerKg} onChange={(v) => update({ filamentCostPerKg: v })} step={1} />
                <SettingsField icon={<Hash className="w-3.5 h-3.5" />} label={t.quantity} tooltip={t.tooltipQuantity} value={subPiece.quantity} onChange={(v) => update({ quantity: v })} step={1} min={1} />
                <SettingsField icon={<Clock className="w-3.5 h-3.5" />} label={t.hours} tooltip={t.tooltipPrintTime} value={subPiece.printTimeHours} onChange={(v) => update({ printTimeHours: v })} step={1} />
                <SettingsField icon={<Clock className="w-3.5 h-3.5" />} label={t.minutes} tooltip={t.tooltipPrintTime} value={subPiece.printTimeMinutes} onChange={(v) => update({ printTimeMinutes: v })} step={5} />
                <SettingsField icon={<Percent className="w-3.5 h-3.5" />} label={t.waste} tooltip={t.tooltipWaste} value={subPiece.wastePercentage} onChange={(v) => update({ wastePercentage: v })} step={1} max={100} />
                <SettingsField icon={<Clock className="w-3.5 h-3.5" />} label={t.postProcessing} tooltip={t.tooltipPostProcessing} value={subPiece.postProcessingTimeMinutes} onChange={(v) => update({ postProcessingTimeMinutes: v })} step={5} />
                <SettingsField icon={<Clock className="w-3.5 h-3.5" />} label={t.laborTime} tooltip={t.tooltipLaborTime} value={subPiece.laborTimeMinutes} onChange={(v) => update({ laborTimeMinutes: v })} step={5} />
              </div>

              {/* Finishing */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    {t.finishType} <InfoTooltip text={t.tooltipFinishingType} side="right" />
                  </label>
                  <select value={subPiece.finishingType} onChange={(e) => {
                    const ft = e.target.value as FinishingType
                    const cost = FINISHING_DEFAULTS[ft].costPerPiece
                    update({ finishingType: ft, finishingCostPerPiece: cost })
                  }} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-copper">
                    {finishingOptions.map(ft => <option key={ft} value={ft}>{t[finishingKeyMap[ft]]}</option>)}
                  </select>
                </div>
                <SettingsField icon={<DollarSign className="w-3.5 h-3.5" />} label={`${t.custom} (€/u)`} tooltip={t.tooltipFinishingCost} value={subPiece.finishingCostPerPiece} onChange={(v) => update({ finishingCostPerPiece: v })} step={0.5} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Breakdown Summary Item ───
function BreakdownSummaryItem({ label, value, currency, highlight }: { label: string; value: number; currency: CurrencyCode; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-2.5 ${highlight ? 'bg-copper/10 border border-copper/20' : 'bg-secondary/30'}`}>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={`font-display font-bold text-sm ${highlight ? 'text-copper' : 'text-foreground'}`}>{formatCurrency(value, currency)}</div>
    </div>
  )
}

// ─── Printer Profile Modal ───
function PrinterProfileModal({ open, onClose, onSave, editProfile, t }: {
  open: boolean; onClose: () => void
  onSave: (profile: Omit<PrinterProfile, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void
  editProfile?: PrinterProfile | null; t: Record<string, string>
}) {
  const [name, setName] = useState(editProfile?.name || '')
  const [model, setModel] = useState(editProfile?.model || '')
  const [price, setPrice] = useState(editProfile?.price || 300)
  const [lifespanYears, setLifespanYears] = useState(editProfile?.expectedLifespanYears || 2.5)
  const [power, setPower] = useState(editProfile?.powerConsumptionWatts || 200)
  const [failureRate, setFailureRate] = useState(editProfile?.failureRate || 5)
  const [maintenance, setMaintenance] = useState(editProfile?.maintenanceCostPerHour || 0.1)
  const [isDefault, setIsDefault] = useState(editProfile?.isDefault || false)

  if (!open) return null

  const handleSave = () => {
    onSave({ name, model, price, expectedLifespanYears: lifespanYears, powerConsumptionWatts: power, failureRate, maintenanceCostPerHour: maintenance, isDefault })
    onClose()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-foreground">{editProfile ? t.editProfile : t.createProfile}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary/80"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{t.profileName}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-copper" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{t.profileModel}</label>
              <input type="text" value={model} onChange={(e) => setModel(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-copper" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{t.profilePrice}</label>
              <input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{t.profileLifespanYears}</label>
              <input type="number" step={0.5} value={lifespanYears} onChange={(e) => setLifespanYears(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{t.profilePower}</label>
              <input type="number" value={power} onChange={(e) => setPower(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{t.profileFailureRate}</label>
              <input type="number" value={failureRate} onChange={(e) => setFailureRate(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{t.profileMaintenance}</label>
              <input type="number" step={0.01} value={maintenance} onChange={(e) => setMaintenance(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="rounded" />
            {t.profileDefault}
          </label>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg bg-secondary text-foreground font-display font-semibold text-sm hover:bg-secondary/80 transition-colors">{t.custom}</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-copper to-gold text-white font-display font-bold text-sm hover:shadow-lg transition-shadow">{editProfile ? t.editProfile : t.createProfile}</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ═══ CALCULATOR PAGE ═══
export function CalculatorPage() {
  const { data: session } = useSession()
  const { locale, setLocale, t } = useI18n()
  const { theme, setTheme } = useTheme()
  const { project, setProject, resetProject, hasStoredData } = usePersistedProject()
  const { toast } = useToast()

  const tierNameMap: Record<string, string> = {
    competitive: t.competitive,
    standard: t.standard,
    premium: t.premium,
    luxury: t.luxury,
  }

  const [breakdownOpen, setBreakdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [savingProject, setSavingProject] = useState(false)
  const [recordingSale, setRecordingSale] = useState(false)
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<PrinterProfile | null>(null)
  const [printerProfiles, setPrinterProfiles] = useState<PrinterProfile[]>([])
  const [priceGlow, setPriceGlow] = useState(false)
  const projectNameRef = useRef<HTMLInputElement>(null)
  const prevPriceRef = useRef(selectedResult.totalProjectPrice)

  // ─── Calculations ───
  const pricingResults = useMemo(() => calculateProjectPrice(project), [project])
  const selectedResult = useMemo(
    () => pricingResults.find(r => r.tier === project.selectedTier) ?? pricingResults[1],
    [pricingResults, project.selectedTier]
  )
  const totalPieces = useMemo(() => project.subPieces.reduce((sum, sp) => sum + sp.quantity, 0), [project.subPieces])
  const totalPrintTimeHours = useMemo(
    () => project.subPieces.reduce((sum, sp) => sum + (sp.printTimeHours + sp.printTimeMinutes / 60) * sp.quantity, 0),
    [project.subPieces]
  )
  const totalWeightGrams = useMemo(
    () => project.subPieces.reduce((sum, sp) => sum + sp.printWeight * sp.quantity, 0),
    [project.subPieces]
  )

  // ─── Price change animation ───
  useEffect(() => {
    if (prevPriceRef.current !== selectedResult.totalProjectPrice) {
      prevPriceRef.current = selectedResult.totalProjectPrice
      setPriceGlow(true)
      const timer = setTimeout(() => setPriceGlow(false), 600)
      return () => clearTimeout(timer)
    }
  }, [selectedResult.totalProjectPrice])

  // ─── Load printer profiles ───
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/printer-profiles').then(r => r.json()).then(setPrinterProfiles).catch(() => {})
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
    navigator.clipboard.writeText(formatCurrency(selectedResult.totalProjectPrice, project.currency)).then(() => {
      setCopied(true)
      toast({ title: t.priceCopied, description: `${formatCurrency(selectedResult.totalProjectPrice, project.currency)} ${t.priceCopiedDesc}` })
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
          const res = await fetch(`/api/projects/${existing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: project.name, data: project }) })
          if (!res.ok) throw new Error()
          toast({ title: t.projectUpdated })
        } else {
          const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: project.name, data: project }) })
          if (!res.ok) throw new Error()
          toast({ title: t.projectSaved })
        }
      }
    } catch { toast({ title: t.errorSaving, variant: 'destructive' }) } finally { setSavingProject(false) }
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
      const saleRes = await fetch('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, projectName: project.name, tier: project.selectedTier, saleType: project.saleType, quantity: totalPieces, unitPrice: selectedResult.totalProjectPrice / (totalPieces || 1), totalPrice: selectedResult.totalProjectPrice }) })
      if (!saleRes.ok) throw new Error()
      toast({ title: t.saleRecorded, description: `${formatCurrency(selectedResult.totalProjectPrice, project.currency)} — ${project.name}` })
    } catch { toast({ title: t.errorRecording, variant: 'destructive' }) } finally { setRecordingSale(false) }
  }, [session?.user?.id, project, selectedResult, totalPieces, toast, t])

  // ─── Printer profile select ───
  const handleProfileSelect = useCallback((profileId: string) => {
    if (profileId === 'custom') {
      updateParams({ printerProfileId: 'custom' })
      return
    }
    const profile = printerProfiles.find(p => p.id === profileId)
    if (profile) {
      const params = printerProfileToParams(profile)
      updateParams({ ...params, printerProfileId: profile.id })
    }
  }, [printerProfiles, updateParams])

  // ─── Save printer profile ───
  const handleSaveProfile = useCallback(async (profileData: Omit<PrinterProfile, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      if (editingProfile) {
        const res = await fetch(`/api/printer-profiles/${editingProfile.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profileData) })
        if (res.ok) { const updated = await res.json(); setPrinterProfiles(prev => prev.map(p => p.id === editingProfile.id ? updated : p)) }
      } else {
        const res = await fetch('/api/printer-profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profileData) })
        if (res.ok) { const newProfile = await res.json(); setPrinterProfiles(prev => [...prev, newProfile]) }
      }
    } catch { toast({ title: t.errorSaving, variant: 'destructive' }) }
    setEditingProfile(null)
  }, [editingProfile, toast, t])

  return (
    <div className="relative">
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      {/* ═══ SUMMARY BAR ═══ */}
      <div className="glass-card border-b border-border/30 mb-6">
        <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto py-2.5 px-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-sage/15 flex items-center justify-center"><Hash className="w-3 h-3 text-sage" /></div>
            <div><div className="text-[9px] text-muted-foreground">{t.pieces}</div><div className="font-display font-bold text-sm text-foreground">{totalPieces}</div></div>
          </div>
          <div className="w-px h-8 bg-border/50" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-copper/15 flex items-center justify-center"><Clock className="w-3 h-3 text-copper" /></div>
            <div><div className="text-[9px] text-muted-foreground">{t.time}</div><div className="font-display font-bold text-sm text-foreground">{project.subPieces.length > 0 ? formatPrintTime(totalPrintTimeHours) : '—'}</div></div>
          </div>
          <div className="w-px h-8 bg-border/50" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-gold/15 flex items-center justify-center"><Weight className="w-3 h-3 text-gold" /></div>
            <div><div className="text-[9px] text-muted-foreground">{t.weight}</div><div className="font-display font-bold text-sm text-foreground">{project.subPieces.length > 0 ? formatWeight(totalWeightGrams) : '—'}</div></div>
          </div>

          {/* Settings row: Currency, Language, Theme */}
          <div className="w-px h-8 bg-border/50 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-copper/70" />
              <select
                value={project.currency}
                onChange={(e) => setProject(prev => ({ ...prev, currency: e.target.value as CurrencyCode }))}
                className="compact-select"
              >
                {Object.entries(CURRENCIES).map(([code, info]) => (
                  <option key={code} value={code}>{info.symbol} {code}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-copper/70" />
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                className="compact-select"
              >
                {(['es', 'en', 'zh', 'eu'] as Locale[]).map((loc) => (
                  <option key={loc} value={loc}>{LOCALE_FLAGS[loc]} {LOCALE_NAMES[loc]}</option>
                ))}
              </select>
            </div>
            <motion.button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-6 h-6 rounded-md bg-secondary/80 hover:bg-secondary border border-border flex items-center justify-center transition-colors"
              whileTap={{ scale: 0.85 }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Moon className="w-3 h-3 text-copper" /> : <Sun className="w-3 h-3 text-gold" />}
            </motion.button>
          </div>

          {/* Price display with sparkle + glow */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <div className="flex flex-col leading-tight items-end price-sparkle">
              <span className="text-[10px] text-muted-foreground">{tierNameMap[selectedResult.tier]}</span>
              <motion.span
                key={selectedResult.totalProjectPrice.toFixed(2)}
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={`font-display font-extrabold text-xl text-copper ${priceGlow ? 'price-glow' : ''}`}
              >
                {formatCurrency(selectedResult.totalProjectPrice, project.currency)}
              </motion.span>
              {priceGlow && (
                <>
                  <span className="sparkle-dot" />
                  <span className="sparkle-dot" />
                  <span className="sparkle-dot" />
                </>
              )}
            </div>
            <motion.button onClick={handleCopyPrice} className="w-8 h-8 rounded-lg bg-copper/10 hover:bg-copper/20 flex items-center justify-center transition-colors hover:shadow-md hover:shadow-copper/10" whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
              {copied ? <Check className="w-3.5 h-3.5 text-sage" /> : <Copy className="w-3.5 h-3.5 text-copper" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile settings row */}
        <div className="flex sm:hidden items-center gap-2 px-2 pb-2 pt-0.5 border-t border-border/30">
          <div className="flex items-center gap-1 flex-1">
            <Coins className="w-3 h-3 text-copper/70" />
            <select
              value={project.currency}
              onChange={(e) => setProject(prev => ({ ...prev, currency: e.target.value as CurrencyCode }))}
              className="compact-select flex-1"
            >
              {Object.entries(CURRENCIES).map(([code, info]) => (
                <option key={code} value={code}>{info.symbol} {code}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1 flex-1">
            <Globe className="w-3 h-3 text-copper/70" />
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="compact-select flex-1"
            >
              {(['es', 'en', 'zh', 'eu'] as Locale[]).map((loc) => (
                <option key={loc} value={loc}>{LOCALE_FLAGS[loc]} {LOCALE_NAMES[loc]}</option>
              ))}
            </select>
          </div>
          <motion.button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-6 h-6 rounded-md bg-secondary/80 hover:bg-secondary border border-border flex items-center justify-center transition-colors"
            whileTap={{ scale: 0.85 }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Moon className="w-3 h-3 text-copper" /> : <Sun className="w-3 h-3 text-gold" />}
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="lg:col-span-7 space-y-5">
          {/* Project name + actions */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-copper/15 flex items-center justify-center shrink-0"><Layers className="w-4 h-4 text-copper" /></div>
            <div className="flex items-center flex-1 min-w-0">
              <input ref={projectNameRef} type="text" value={project.name} onChange={(e) => updateProject({ name: e.target.value })}
                className="font-display font-extrabold text-xl sm:text-2xl text-foreground bg-transparent border-none outline-none flex-1 min-w-0" />
              <button onClick={() => { projectNameRef.current?.focus(); projectNameRef.current?.select() }} className="ml-0.5 p-1 rounded-md hover:bg-secondary/80 transition-colors shrink-0">
                <Pencil className="w-3.5 h-3.5 text-muted-foreground/60" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
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
          </div>

          {/* Sale type */}
          <div className="glass-card p-4 section-card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-copper/15 flex items-center justify-center"><DollarSign className="w-3.5 h-3.5 text-copper" /></div>
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
                    <span className="font-display font-semibold text-[11px]">
                      {type === 'wholesale' ? t.wholesale : type === 'retail' ? t.retail : type === 'custom' ? t.customSale : t.rush}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${type === 'custom' ? 'bg-copper/15 text-copper' : 'bg-secondary text-muted-foreground'}`}>
                      {config.subtitle}
                    </span>
                  </motion.button>
                )
              })}
            </div>
            <AnimatePresence>
              {project.saleType === 'custom' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mt-3 flex items-center gap-3 p-3 rounded-lg bg-copper/10 border border-copper/20">
                  <label className="text-xs font-medium text-foreground whitespace-nowrap flex items-center gap-1.5">{t.customize} <InfoTooltip text={t.tooltipCustomMultiplier} side="right" /></label>
                  <input type="number" min={0.01} step={0.1} value={project.customMultiplier} onChange={(e) => { const val = parseFloat(e.target.value); if (!isNaN(val) && val > 0) updateProject({ customMultiplier: val }) }}
                    className="flex-1 max-w-[100px] px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
                  <span className="font-mono font-bold text-copper text-sm">×{project.customMultiplier.toFixed(1)}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Printer configuration */}
          <div className="glass-card p-4 space-y-4 section-card">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-copper/15 flex items-center justify-center"><Printer className="w-3.5 h-3.5 text-copper" /></div>
              <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">{t.printParameters}</h2>
              <InfoTooltip text={t.tooltipPrinterModel} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5"><Printer className="w-3.5 h-3.5" /> {t.printerModel}</label>
              <div className="flex gap-2">
                <select value={project.params.printerProfileId} onChange={(e) => handleProfileSelect(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-copper">
                  <option value="custom">{t.profileGeneric}</option>
                  {printerProfiles.map(p => <option key={p.id} value={p.id}>{p.name} ({p.model})</option>)}
                </select>
                <button onClick={() => { setEditingProfile(null); setProfileModalOpen(true) }}
                  className="px-3 py-2 rounded-lg bg-copper/15 hover:bg-copper/25 border border-copper/30 text-copper font-display font-semibold text-xs transition-colors whitespace-nowrap">
                  + {t.createProfile}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <SettingsField icon={<Printer className="w-3.5 h-3.5" />} label={t.printerCost} tooltip={t.tooltipPrinterCost} value={project.params.printerCost} onChange={(v) => updateParams({ printerCost: v })} step={10} />
              <SettingsField icon={<Clock className="w-3.5 h-3.5" />} label={t.printerLifespan} tooltip={t.tooltipLifespan} value={project.params.printerLifespanHours} onChange={(v) => updateParams({ printerLifespanHours: v })} step={500} min={100} />
              <SettingsField icon={<Wrench className="w-3.5 h-3.5" />} label={t.maintenance} tooltip={t.tooltipMaintenance} value={project.params.maintenanceCostPerHour} onChange={(v) => updateParams({ maintenanceCostPerHour: v })} step={0.01} />
              <SettingsField icon={<Zap className="w-3.5 h-3.5" />} label={t.powerConsumption} tooltip={t.tooltipPower} value={project.params.powerConsumptionWatts} onChange={(v) => updateParams({ powerConsumptionWatts: v })} step={10} />
              <SettingsField icon={<DollarSign className="w-3.5 h-3.5" />} label={t.electricityCost} tooltip={t.tooltipElectricity} value={project.params.electricityCostPerKWh} onChange={(v) => updateParams({ electricityCostPerKWh: v })} step={0.01} />
            </div>
            <button onClick={() => setAdvancedSettingsOpen(!advancedSettingsOpen)} className="flex items-center gap-2 text-xs font-medium text-copper hover:text-copper-dark transition-colors w-full">
              <Settings className="w-3.5 h-3.5" />{advancedSettingsOpen ? t.hideAdvanced : t.showAdvanced}
              <motion.div animate={{ rotate: advancedSettingsOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="ml-auto"><ChevronDown className="w-3.5 h-3.5" /></motion.div>
            </button>
            <AnimatePresence>
              {advancedSettingsOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                    <SettingsField icon={<Eye className="w-3.5 h-3.5" />} label={t.supervisionRate} tooltip={t.tooltipSupervision} value={project.params.supervisionCostPerHour} onChange={(v) => updateParams({ supervisionCostPerHour: v })} step={1} />
                    <SettingsField icon={<Percent className="w-3.5 h-3.5" />} label={t.failureRate} tooltip={t.tooltipFailureRate} value={project.params.failureRate} onChange={(v) => updateParams({ failureRate: v })} step={1} max={100} />
                    <SettingsField icon={<Percent className="w-3.5 h-3.5" />} label={t.overhead} tooltip={t.tooltipOverhead} value={project.params.overheadPercentage} onChange={(v) => updateParams({ overheadPercentage: v })} step={1} max={100} />
                    <SettingsField icon={<Percent className="w-3.5 h-3.5" />} label={t.taxRate} tooltip={t.tooltipTaxRate} value={project.params.taxRate} onChange={(v) => updateParams({ taxRate: v })} step={1} max={100} />
                    <SettingsField icon={<Package className="w-3.5 h-3.5" />} label={t.packaging} tooltip={t.tooltipPackaging} value={project.params.packagingCostPerProject} onChange={(v) => updateParams({ packagingCostPerProject: v })} step={0.1} />
                    <SettingsField icon={<Truck className="w-3.5 h-3.5" />} label={t.shipping} tooltip={t.tooltipShipping} value={project.params.shippingCostPerProject} onChange={(v) => updateParams({ shippingCostPerProject: v })} step={0.5} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Decorative divider */}
          <div className="section-divider my-2" />

          {/* Sub-pieces */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-copper/15 flex items-center justify-center"><Layers className="w-3.5 h-3.5 text-copper" /></div>
                <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">{t.projectPieces}</h2>
              </div>
              <motion.button onClick={addSubPiece} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-copper text-primary-foreground font-display font-semibold text-xs hover:bg-copper-dark hover:shadow-lg hover:shadow-copper/20 transition-all"
                whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                <Plus className="w-3.5 h-3.5" /> {t.add}
              </motion.button>
            </div>
            <AnimatePresence mode="popLayout">
              {project.subPieces.map((sp, index) => (
                <PieceCard key={sp.id} subPiece={sp} index={index} currency={project.currency} onChange={(updated) => updateSubPiece(sp.id, updated)} onRemove={() => removeSubPiece(sp.id)} t={t as unknown as Record<string, string>} />
              ))}
            </AnimatePresence>
            {project.subPieces.length === 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-copper/5 via-transparent to-gold/5" />
                <div className="relative z-10">
                  <motion.div
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-copper/20 to-gold/10 flex items-center justify-center mb-5 mx-auto border border-copper/20"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Package className="w-9 h-9 text-copper/60" />
                  </motion.div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">{t.noPiecesYet}</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mb-5">{t.noPiecesDesc}</p>
                  <motion.button onClick={addSubPiece} className="btn-shimmer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-copper to-copper-dark text-primary-foreground font-display font-semibold text-sm hover:shadow-lg hover:shadow-copper/20 transition-all" whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Plus className="w-4 h-4" /> {t.addFirstPiece}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="lg:col-span-5 space-y-5">
          {/* Guest banner */}
          {!session?.user && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 border border-copper/20 bg-copper/5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-copper/15 flex items-center justify-center shrink-0 mt-0.5"><LogIn className="w-4 h-4 text-copper" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{t.saveYourProjects}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.saveProjectsDesc}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Price tier cards */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-copper/15 flex items-center justify-center"><Sparkles className="w-3.5 h-3.5 text-copper" /></div>
              <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">{t.suggestedPrices}</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {pricingResults.map((result) => {
                const isSelected = project.selectedTier === result.tier
                const color = TIER_BAR_COLORS[result.tier]
                const borderClass = TIER_BORDER[result.tier]
                const bgClass = TIER_BG[result.tier]
                return (
                  <motion.div key={result.tier} layout onClick={() => updateProject({ selectedTier: result.tier })}
                    className={`relative cursor-pointer rounded-xl border-2 p-3 transition-all duration-300 ${isSelected ? `tier-card-active ${bgClass} shadow-lg` : `border-border bg-card hover:border-border/80 hover:shadow-md`}`}
                    whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                    {isSelected && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-md text-white" style={{ backgroundColor: color }}>
                        {t.selected}
                      </motion.div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className={`font-display font-bold text-xs leading-tight ${isSelected ? 'text-foreground' : 'text-foreground'}`}>{tierNameMap[result.tier]}</span>
                    </div>
                    <div className={`font-display font-black text-lg leading-none ${isSelected ? 'text-foreground' : 'text-foreground'}`}>{formatCurrency(result.totalProjectPrice, project.currency)}</div>
                    <div className="mt-1.5 inline-block px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ backgroundColor: `${color}20`, color }}>
                      +{(result.profitMargin * 100).toFixed(0)}% {t.margin}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Breakdown bar */}
          <div className="section-divider my-1" />
          <AnimatePresence mode="wait">
            <motion.div key={project.selectedTier} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="glass-card p-4 space-y-3">
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
                {(selectedResult.totalPackaging > 0 || selectedResult.totalShipping > 0) && (
                  <LegendItem color="#8A8690" label={t.shippingPackage} value={selectedResult.totalPackaging + selectedResult.totalShipping} currency={project.currency} />
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Cost breakdown */}
          <div className="glass-card overflow-hidden section-card">
            <button onClick={() => setBreakdownOpen(!breakdownOpen)} className="w-full flex items-center justify-between p-4 hover:bg-copper/5 transition-colors">
              <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-copper/15 flex items-center justify-center"><Calculator className="w-3.5 h-3.5 text-copper" /></div><h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">{t.costBreakdown} — {tierNameMap[selectedResult.tier]}</h2></div>
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Export + Record sale */}
          <div className="space-y-3">
            <ExportOptions project={project} selectedResult={selectedResult} />
            {session?.user && (
              <motion.button onClick={handleRecordSale} disabled={recordingSale}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sage/15 border border-sage/30 text-sage dark:text-sage-light font-display font-semibold text-sm hover:bg-sage/25 hover:shadow-lg hover:shadow-sage/10 transition-all disabled:opacity-50"
                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                {recordingSale ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
                {t.recordSale}
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Printer Profile Modal */}
      <AnimatePresence>
        {profileModalOpen && (
          <PrinterProfileModal open={profileModalOpen} onClose={() => { setProfileModalOpen(false); setEditingProfile(null) }} onSave={handleSaveProfile} editProfile={editingProfile} t={t as unknown as Record<string, string>} />
        )}
      </AnimatePresence>
    </div>
  )
}
