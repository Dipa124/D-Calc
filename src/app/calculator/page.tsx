'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useI18n } from '@/hooks/use-i18n'
import { usePersistedProject } from '@/hooks/use-persisted-project'
import { calculateProjectPrice, formatCurrency } from '@/lib/calculator'
import { useToast } from '@/hooks/use-toast'
import type { Project, SubPiece, SaleType, PricingTier, ProjectParams, ProjectPricingResult, SubPieceCostBreakdown, FilamentType, PostProcess, PrinterProfile, ExtraExpense, MonthlyExpense } from '@/lib/types'
import { generateId, generateExpenseId, generatePostProcessId, getDefaultSubPiece, FILAMENT_DEFAULTS, PRICING_TIER_CONFIG, SALE_TYPE_CONFIG, printerProfileToParams } from '@/lib/types'
import { CURRENCIES, getCurrencySymbol, type CurrencyCode } from '@/lib/currency'
import { InfoTooltip } from '@/components/calculator/info-tooltip'
import { SharePopup } from '@/components/calculator/share-popup'
import { LOCALE_NAMES, type Locale } from '@/lib/i18n'
import {
  Plus, Printer, Settings, Pencil, Copy, Check, Clock, Weight, Hash, Package,
  RotateCcw, Sparkles, Calculator, Layers, DollarSign, FileDown, X, Save,
  Loader2, LogIn, ShoppingBag, ChevronDown, Coins,
  Zap, Wrench, Percent, Truck, Eye, Trash2, FileText, Receipt,
  Share2, Timer, Building2, ShieldCheck, Tag, BadgePercent, CircleDollarSign,
  Minus, Scissors, Paintbrush, Hammer, Gem, WrenchIcon, Lock
} from 'lucide-react'

// ─── Animation variants ───
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
}
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
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

function calculateAmortizationPerHour(params: ProjectParams): number {
  const totalInvestment = params.printerCost + params.additionalInitialCost
  const totalMonths = params.amortizationMonths || 30
  const dailyHours = params.dailyUsageHours || 8
  const hoursPerMonth = dailyHours * 30
  const monthlyDepreciation = totalInvestment / totalMonths
  const monthlyMaint = params.monthlyMaintenanceCost || 0
  return hoursPerMonth > 0 ? (monthlyDepreciation + monthlyMaint) / hoursPerMonth : 0
}

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

// ─── Shared Components ───

function SummaryStat({ icon, bgClass, label, value }: { icon: React.ReactNode; bgClass: string; label: string; value: string }) {
  return (<div className="flex items-center gap-2 shrink-0"><div className={`w-7 h-7 rounded-md ${bgClass} flex items-center justify-center`}>{icon}</div><div className="flex flex-col leading-tight"><span className="text-[10px] text-muted-foreground">{label}</span><span className="font-display font-bold text-xs text-foreground">{value}</span></div></div>)
}

function Divider() { return <div className="w-px h-7 bg-border/50 shrink-0" /> }

function SettingsField({ icon, label, tooltip, value, onChange, step = 1, min, max }: { icon: React.ReactNode; label: string; tooltip: string; value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number }) {
  return (<div><label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 mb-1">{icon} {label} <InfoTooltip text={tooltip} side="right" /></label><input type="number" value={value} min={min} max={max} step={step} onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v) }} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" /></div>)
}

function BreakdownBar({ result, currency }: { result: ProjectPricingResult; currency: CurrencyCode }) {
  const total = result.totalProjectPrice || 1
  const segments = [
    { pct: (result.totalMaterialCost / total) * 100, color: '#6B9E72', label: 'Material', value: result.totalMaterialCost },
    { pct: ((result.totalBaseCost - result.totalMaterialCost) / total) * 100, color: '#4FC3F7', label: 'Operation', value: result.totalBaseCost - result.totalMaterialCost },
    { pct: (result.totalProfit / total) * 100, color: '#C77D3A', label: 'Profit', value: result.totalProfit },
    { pct: (result.totalTax / total) * 100, color: '#D4A843', label: 'Tax', value: result.totalTax },
    { pct: ((result.totalPackaging + result.totalShipping) / total) * 100, color: '#8A8690', label: 'Ship+Pkg', value: result.totalPackaging + result.totalShipping },
    { pct: (result.totalExtraExpenses / total) * 100, color: '#9C27B0', label: 'Extra', value: result.totalExtraExpenses },
  ].filter(s => s.pct > 0.5)
  return (
    <div className="breakdown-bar">
      {segments.map((seg, i) => (
        <BreakdownSegment key={i} seg={seg} currency={currency} />
      ))}
    </div>
  )
}

function BreakdownSegment({ seg, currency }: { seg: { pct: number; color: string; label: string; value: number }; currency: CurrencyCode }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
      className="relative cursor-pointer"
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-popover border border-border text-[10px] font-mono shadow-md whitespace-nowrap z-10"
          >
            <span className="font-semibold text-foreground">{seg.label}</span>{' '}
            <span className="text-muted-foreground">{seg.pct.toFixed(1)}%</span>{' '}
            <span className="text-copper">{formatCurrency(seg.value, currency)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function LegendItem({ color, label, value, currency }: { color: string; label: string; value: number; currency: CurrencyCode }) {
  return (<div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} /><span className="text-[10px] text-muted-foreground">{label}</span><span className="text-[10px] font-mono font-bold text-foreground ml-auto">{formatCurrency(value, currency)}</span></div>)
}

function BreakdownSummaryItem({ label, value, currency, highlight }: { label: string; value: number; currency: CurrencyCode; highlight?: boolean }) {
  return (<div className={`p-2.5 rounded-lg ${highlight ? 'bg-copper/10 border border-copper/20' : 'bg-secondary/30'}`}><div className="text-[10px] text-muted-foreground mb-0.5">{label}</div><div className={`font-display font-bold text-sm ${highlight ? 'text-copper' : 'text-foreground'}`}>{formatCurrency(value, currency)}</div></div>)
}

function SubPieceBreakdown({ breakdown, currency, t }: { breakdown: SubPieceCostBreakdown; currency: CurrencyCode; t: Record<string, string> }) {
  const [open, setOpen] = useState(false)
  const rows = [
    { label: t.materialWithWaste, value: breakdown.materialCost },
    { label: t.printerDepreciation, value: breakdown.printerDepreciation },
    { label: t.electricity, value: breakdown.electricityCost },
    { label: t.supervisionCost || 'Supervision', value: breakdown.supervisionCost },
    { label: t.postProcessCost || 'Post-process', value: breakdown.postProcessCost },
    { label: t.designCost, value: breakdown.designCost },
    { label: t.extraExpensesLabel || 'Extra', value: breakdown.extraExpensesCost },
    { label: t.failureRisk, value: breakdown.failureCost },
    { label: t.overheadCost, value: breakdown.overheadPerUnit },
    { label: t.profitPerUnit, value: breakdown.profitPerUnit },
    { label: t.taxPerUnit, value: breakdown.taxPerUnit },
  ]
  return (
    <div className="border border-border/50 rounded-lg mb-2 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 hover:bg-secondary/30 transition-colors">
        <div className="flex items-center gap-2"><span className="font-display font-semibold text-sm">{breakdown.subPieceName}</span><span className="text-[11px] text-muted-foreground">&times;{breakdown.quantity}</span></div>
        <div className="flex items-center gap-2"><span className="font-display font-bold text-sm text-copper">{formatCurrency(breakdown.totalForQuantity, currency)}</span><motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="w-3 h-3 text-muted-foreground" /></motion.div></div>
      </button>
      <AnimatePresence>{open && (<motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden"><div className="px-3 pb-3 space-y-1">{rows.map((row, i) => row.value > 0 && (<div key={i} className="flex items-center justify-between text-xs"><span className="text-muted-foreground">{row.label}</span><span className="font-mono text-foreground">{formatCurrency(row.value, currency)}</span></div>))}</div></motion.div>)}</AnimatePresence>
    </div>
  )
}

// ─── Piece Card ───
function PieceCard({ subPiece, index, currency, onChange, onRemove, t }: {
  subPiece: SubPiece; index: number; currency: CurrencyCode; onChange: (sp: SubPiece) => void; onRemove: () => void; t: Record<string, string>
}) {
  const [expanded, setExpanded] = useState(true)
  const safeExtraExpenses = subPiece.extraExpenses || []
  const safePostProcesses = subPiece.postProcesses || []
  const update = (partial: Partial<SubPiece>) => onChange({ ...subPiece, extraExpenses: subPiece.extraExpenses || [], postProcesses: subPiece.postProcesses || [], ...partial })

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card section-card overflow-hidden">
      <div className="flex items-center gap-2 p-3">
        <input type="color" value={subPiece.color} onChange={(e) => update({ color: e.target.value })} className="w-6 h-6 rounded cursor-pointer border-0" />
        <div className="flex items-center flex-1 min-w-0">
          <input type="text" value={subPiece.name} onChange={(e) => update({ name: e.target.value })} className="font-display font-semibold text-sm text-foreground bg-transparent border-none outline-none flex-1 min-w-0" />
          <Pencil className="w-3 h-3 text-muted-foreground/40 shrink-0 ml-1" />
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">&times;{subPiece.quantity}</span>
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
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">{t.filamentType} <InfoTooltip text={t.tooltipFilamentType} side="right" /></label>
                  <select value={subPiece.filamentType} onChange={(e) => { const type = e.target.value as FilamentType; update({ filamentType: type, filamentCostPerKg: FILAMENT_DEFAULTS[type].costPerKg }) }} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-copper">
                    {Object.keys(FILAMENT_DEFAULTS).map(ft => <option key={ft} value={ft}>{ft}</option>)}
                  </select>
                </div>
                <div><label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">{t.weightGrams} <InfoTooltip text={t.tooltipPrintWeight} side="right" /></label><input type="number" min={0} step={1} value={subPiece.printWeight} onChange={(e) => update({ printWeight: parseFloat(e.target.value) || 0 })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" /></div>
                <div><label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">{t.costPerKg} <InfoTooltip text={t.tooltipFilamentCost} side="right" /></label><input type="number" min={0} step={0.5} value={subPiece.filamentCostPerKg} onChange={(e) => update({ filamentCostPerKg: parseFloat(e.target.value) || 0 })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" /></div>
              </div>

              {/* Row 2: Time + Quantity */}
              <div className="grid grid-cols-4 gap-2">
                <div><label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">{t.hours} <InfoTooltip text={t.tooltipPrintTime} side="right" /></label><input type="number" min={0} step={1} value={subPiece.printTimeHours} onChange={(e) => update({ printTimeHours: parseInt(e.target.value) || 0 })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" /></div>
                <div><label className="text-[11px] font-medium text-muted-foreground mb-1 block">{t.minutes}</label><input type="number" min={0} max={59} step={5} value={subPiece.printTimeMinutes} onChange={(e) => update({ printTimeMinutes: parseInt(e.target.value) || 0 })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" /></div>
                <div><label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">{t.quantity} <InfoTooltip text={t.tooltipQuantity} side="right" /></label><input type="number" min={1} step={1} value={subPiece.quantity} onChange={(e) => update({ quantity: parseInt(e.target.value) || 1 })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" /></div>
                <div><label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">{t.waste} <InfoTooltip text={t.tooltipWaste} side="right" /></label><input type="number" min={0} max={100} step={1} value={subPiece.wastePercentage} onChange={(e) => update({ wastePercentage: parseFloat(e.target.value) || 0 })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" /></div>
              </div>

              {/* Post-processing steps */}
              <div className="border-t border-border/50 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Paintbrush className="w-3 h-3" /> {t.postProcessing || 'Post-processing'}</span>
                  <button onClick={() => { const newPP: PostProcess = { id: generatePostProcessId(), name: '', timeMinutes: 0, ratePerHour: 15 }; update({ postProcesses: [...safePostProcesses, newPP] }) }} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-copper/10 text-copper text-[10px] font-semibold hover:bg-copper/20 transition-colors"><Plus className="w-3 h-3" /> {t.addPostProcess || 'Add step'}</button>
                </div>
                {safePostProcesses.length > 0 && (
                  <div className="space-y-2">
                    {safePostProcesses.map((pp, idx) => (
                      <div key={pp.id} className="flex items-center gap-2">
                        <input type="text" value={pp.name} onChange={(e) => { const updated = [...safePostProcesses]; updated[idx] = { ...updated[idx], name: e.target.value }; update({ postProcesses: updated }) }} placeholder={t.postProcessName || 'Step name'} className="flex-1 px-2 py-1 rounded-md bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-copper" />
                        <div className="flex items-center gap-1">
                          <input type="number" min={0} step={5} value={pp.timeMinutes} onChange={(e) => { const updated = [...safePostProcesses]; updated[idx] = { ...updated[idx], timeMinutes: parseFloat(e.target.value) || 0 }; update({ postProcesses: updated }) }} placeholder="min" className="w-16 px-2 py-1 rounded-md bg-background border border-border text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
                          <span className="text-[10px] text-muted-foreground">min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <input type="number" min={0} step={1} value={pp.ratePerHour} onChange={(e) => { const updated = [...safePostProcesses]; updated[idx] = { ...updated[idx], ratePerHour: parseFloat(e.target.value) || 0 }; update({ postProcesses: updated }) }} placeholder="€/h" className="w-16 px-2 py-1 rounded-md bg-background border border-border text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
                          <span className="text-[10px] text-muted-foreground">€/h</span>
                        </div>
                        <button onClick={() => update({ postProcesses: safePostProcesses.filter(p => p.id !== pp.id) })} className="w-6 h-6 rounded flex items-center justify-center hover:bg-destructive/10 shrink-0"><Minus className="w-3 h-3 text-destructive/60" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Design */}
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">{t.pieceDesignTime} <InfoTooltip text={t.tooltipPieceDesignTime} side="right" /></label><input type="number" min={0} step={5} value={subPiece.designTimeMinutes} onChange={(e) => update({ designTimeMinutes: parseFloat(e.target.value) || 0 })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" /></div>
                <div><label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1">{t.pieceDesignRate} <InfoTooltip text={t.tooltipPieceDesignRate} side="right" /></label><input type="number" min={0} step={5} value={subPiece.designHourlyRate} onChange={(e) => update({ designHourlyRate: parseFloat(e.target.value) || 0 })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" /></div>
              </div>

              {/* Extra Expenses */}
              <div className="border-t border-border/50 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Coins className="w-3 h-3" /> {t.extraExpenses}</span>
                  <button onClick={() => { const newExpense: ExtraExpense = { id: generateExpenseId(), description: '', price: 0 }; update({ extraExpenses: [...safeExtraExpenses, newExpense] }) }} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-copper/10 text-copper text-[10px] font-semibold hover:bg-copper/20 transition-colors"><Plus className="w-3 h-3" /> {t.addExpense}</button>
                </div>
                {safeExtraExpenses.length > 0 && (
                  <div className="space-y-2">
                    {safeExtraExpenses.map((expense, idx) => (
                      <div key={expense.id} className="flex items-center gap-2">
                        <input type="text" value={expense.description} onChange={(e) => { const updated = [...safeExtraExpenses]; updated[idx] = { ...updated[idx], description: e.target.value }; update({ extraExpenses: updated }) }} placeholder={t.expenseDescription} className="flex-1 px-2 py-1 rounded-md bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-copper" />
                        <input type="number" min={0} step={0.5} value={expense.price} onChange={(e) => { const updated = [...safeExtraExpenses]; updated[idx] = { ...updated[idx], price: parseFloat(e.target.value) || 0 }; update({ extraExpenses: updated }) }} placeholder={t.expensePrice} className="w-20 px-2 py-1 rounded-md bg-background border border-border text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
                        <button onClick={() => update({ extraExpenses: safeExtraExpenses.filter(e => e.id !== expense.id) })} className="w-6 h-6 rounded flex items-center justify-center hover:bg-destructive/10 shrink-0"><Minus className="w-3 h-3 text-destructive/60" /></button>
                      </div>
                    ))}
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

// ─── Printer Profile Modal ───
function PrinterProfileModal({ profile, onClose, onSave, onDelete, t }: { profile: PrinterProfile | null; onClose: () => void; onSave: (p: PrinterProfile) => void; onDelete: (id: string) => void; t: Record<string, string> }) {
  const [form, setForm] = useState<PrinterProfile>(profile || { id: '', name: '', model: '', price: 300, expectedLifespanYears: 2.5, powerConsumptionWatts: 200, failureRate: 5, isDefault: false })
  const updateForm = (partial: Partial<PrinterProfile>) => setForm(prev => ({ ...prev, ...partial }))
  return (
    <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/50" onClick={onClose} /><motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg z-[70] glass-card-premium p-6 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6"><h2 className="font-display font-bold text-lg">{profile ? (t.editProfile || 'Edit Profile') : (t.createProfile || 'New Profile')}</h2><button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-secondary/80 flex items-center justify-center"><X className="w-4 h-4" /></button></div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">{t.profileName || 'Profile Name'}</label><input type="text" value={form.name} onChange={e => updateForm({ name: e.target.value })} placeholder="My Bambu P1S" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground" /></div>
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">{t.profileModel || 'Model'}</label><input type="text" value={form.model} onChange={e => updateForm({ model: e.target.value })} placeholder="Bambu Lab P1S" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">{t.profilePrice || 'Price (\u20AC)'}</label><input type="number" min={0} step={10} value={form.price} onChange={e => updateForm({ price: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground font-mono" /></div>
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">{t.profileLifespanYears || 'Lifespan (years)'}</label><input type="number" min={0.5} step={0.5} value={form.expectedLifespanYears} onChange={e => updateForm({ expectedLifespanYears: parseFloat(e.target.value) || 1 })} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground font-mono" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">{t.profilePower || 'Power (W)'}</label><input type="number" min={0} step={10} value={form.powerConsumptionWatts} onChange={e => updateForm({ powerConsumptionWatts: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground font-mono" /></div>
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">{t.profileFailureRate || 'Failure %'}</label><input type="number" min={0} max={100} step={0.5} value={form.failureRate} onChange={e => updateForm({ failureRate: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground font-mono" /></div>
        </div>
        <div className="flex items-center gap-2"><input type="checkbox" id="profileDefault" checked={form.isDefault} onChange={e => updateForm({ isDefault: e.target.checked })} className="rounded" /><label htmlFor="profileDefault" className="text-xs text-muted-foreground">{t.profileDefault || 'Set as default'}</label></div>
        <div className="flex gap-3 pt-2">
          <button onClick={() => onSave(form)} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-copper to-copper-dark text-white font-display font-bold text-sm">{t.saveProject || 'Save'}</button>
          {profile && profile.id !== 'custom' && (<button onClick={() => onDelete(profile.id)} className="px-4 py-2.5 rounded-xl border border-destructive/30 text-destructive text-sm hover:bg-destructive/10">{t.deleteProfile || 'Delete'}</button>)}
        </div>
      </div>
    </motion.div></>
  )
}

// ─── Stat Card ───
function StatCard({ icon, label, value, bgClass, iconColor }: { icon: React.ReactNode; label: string; value: string; bgClass: string; iconColor: string }) {
  return (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card section-card p-5"><div className="flex items-center gap-3 mb-3"><div className={`w-9 h-9 rounded-lg ${bgClass} flex items-center justify-center ${iconColor}`}>{icon}</div><span className="text-xs text-muted-foreground uppercase tracking-wide font-display">{label}</span></div><div className="font-display font-extrabold text-2xl text-foreground">{value}</div></motion.div>)
}

// ─── Report Generator ───
function generateReport(project: Project, result: ProjectPricingResult, t: Record<string, string>, type: 'producer' | 'invoice') {
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
    @media print{body{padding:20px}}
  </style></head><body>
    <div class="header"><div><h1>D-Calc</h1><p style="color:#666;font-size:12px;margin:0">${t.appSubtitle}</p></div><div class="badge">${isInvoice ? t.buyerTicket : t.producerReport}</div></div>
    <h1>${title}</h1>
    <p><strong>${t.projectPieces}:</strong> ${project.name} &nbsp;|&nbsp; <strong>${t.saleType}:</strong> ${project.saleType} &nbsp;|&nbsp; <strong>${t.margin}:</strong> ${(result.profitMargin * 100).toFixed(0)}%</p>
    ${isInvoice ? '' : `<h2>${t.printParametersLabel}</h2><table><tr><th>${t.printerCost}</th><th>${t.printerLifespan}</th><th>${t.powerConsumption}</th><th>${t.electricityCost}</th></tr>
    <tr><td>${formatCurrency(project.params.printerCost, project.currency)}</td><td>${project.params.printerLifespanHours}h</td><td>${project.params.powerConsumptionWatts}W</td><td>${project.params.electricityCostPerKWh}\u20AC/kWh</td></tr></table>`}
    <h2>${t.subpieceBreakdown}</h2>
    <table><tr><th>Pieza</th><th>Cant.</th>${isInvoice ? '' : `<th>${t.material}</th><th>${t.electricity}</th><th>${t.postProcessCost || 'Post-process'}</th>`}<th>${t.totalPerUnit}</th><th>Total</th></tr>
    ${result.subPieceBreakdowns.map(bd => `<tr><td>${bd.subPieceName}</td><td>${bd.quantity}</td>${isInvoice ? '' : `<td>${formatCurrency(bd.materialCost, project.currency)}</td><td>${formatCurrency(bd.electricityCost, project.currency)}</td><td>${formatCurrency(bd.postProcessCost, project.currency)}</td>`}<td>${formatCurrency(bd.totalPerUnit, project.currency)}</td><td>${formatCurrency(bd.totalForQuantity, project.currency)}</td></tr>`).join('')}
    </table>
    <h2>${t.projectSummary}</h2>
    <table>
    ${isInvoice ? '' : `<tr><td>${t.totalBase}</td><td>${formatCurrency(result.totalBaseCost, project.currency)}</td></tr>
    <tr><td>${t.totalProfitLabel}</td><td>${formatCurrency(result.totalProfit, project.currency)}</td></tr>`}
    <tr><td>${t.priceBeforeTax}</td><td>${formatCurrency(result.totalPriceBeforeTax, project.currency)}</td></tr>
    <tr><td>${t.taxIncluded} (${project.params.taxRate}%)</td><td>${formatCurrency(result.totalTax, project.currency)}</td></tr>
    ${isInvoice ? `<tr><td>${t.priceWithIva || 'Precio con IVA'}</td><td>${formatCurrency(result.totalPriceBeforeTax + result.totalTax, project.currency)}</td></tr>` : ''}
    ${isInvoice ? '' : `${result.totalPackaging > 0 ? `<tr><td>${t.packaging}</td><td>${formatCurrency(result.totalPackaging, project.currency)}</td></tr>` : ''}`}
    ${result.totalShipping > 0 ? `<tr><td>${t.shipping}</td><td>${formatCurrency(result.totalShipping, project.currency)}</td></tr>` : ''}
    ${isInvoice ? '' : `${result.totalExtraExpenses > 0 ? `<tr><td>${t.extraExpensesLabel || 'Extra'}</td><td>${formatCurrency(result.totalExtraExpenses, project.currency)}</td></tr>` : ''}`}
    <tr class="total-row"><td>${t.projectTotal}</td><td>${formatCurrency(result.totalProjectPrice, project.currency)}</td></tr>
    </table>
    <div class="footer"><p>${t.generatedBy} &middot; ${new Date().toLocaleDateString()}</p></div>
  </body></html>`

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)
  const doc = iframe.contentWindow?.document
  if (doc) {
    doc.open()
    doc.write(html)
    doc.close()
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
      } catch {}
      setTimeout(() => { document.body.removeChild(iframe) }, 2000)
    }, 500)
  }
}

// ═══════════════════════════════════════════
// CALCULATOR PAGE
// ═══════════════════════════════════════════
export default function CalculatorPage() {
  const { data: session } = useSession()
  const { locale, setLocale, t } = useI18n()
  const { project, setProject, resetProject, hasStoredData } = usePersistedProject()
  const { toast } = useToast()

  const [breakdownOpen, setBreakdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [savingProject, setSavingProject] = useState(false)
  const [recordingSale, setRecordingSale] = useState(false)
  const [sharingReport, setSharingReport] = useState(false)
  const [printerProfiles, setPrinterProfiles] = useState<PrinterProfile[]>([])
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [editingProfile, setEditingProfile] = useState<PrinterProfile | null>(null)
  const [sharePopupUrl, setSharePopupUrl] = useState<string | null>(null)
  const projectNameRef = useRef<HTMLInputElement>(null)

  const tierNameMap: Record<string, string> = { competitive: t.competitive, standard: t.standard, premium: t.premium, luxury: t.luxury }

  const pricingResults = useMemo(() => calculateProjectPrice(project), [project])
  const selectedResult = useMemo(() => pricingResults.find(r => r.tier === project.selectedTier) ?? pricingResults[1], [pricingResults, project.selectedTier])
  const totalPieces = useMemo(() => project.subPieces.reduce((sum, sp) => sum + sp.quantity, 0), [project.subPieces])
  const totalPrintTimeHours = useMemo(() => project.subPieces.reduce((sum, sp) => sum + (sp.printTimeHours + sp.printTimeMinutes / 60) * sp.quantity, 0), [project.subPieces])
  const totalWeightGrams = useMemo(() => project.subPieces.reduce((sum, sp) => sum + sp.printWeight * sp.quantity, 0), [project.subPieces])
  const amortizationPerHour = useMemo(() => calculateAmortizationPerHour(project.params), [project.params])

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/printer-profiles').then(r => r.ok ? r.json() : []).then(setPrinterProfiles).catch(() => {})
    } else {
      const local = localStorage.getItem('dcalc-printer-profiles')
      if (local) { try { setPrinterProfiles(JSON.parse(local)) } catch {} }
    }
  }, [session?.user?.id])

  const updateProject = useCallback((partial: Partial<Project>) => { setProject(prev => ({ ...prev, ...partial })) }, [setProject])
  const updateParams = useCallback((partial: Partial<ProjectParams>) => { setProject(prev => ({ ...prev, params: { ...prev.params, ...partial } })) }, [setProject])
  const addSubPiece = useCallback(() => { const n = project.subPieces.length + 1; setProject(prev => ({ ...prev, subPieces: [...prev.subPieces, { ...getDefaultSubPiece(), id: generateId(), name: `Piece ${n}` }] })) }, [project.subPieces.length, setProject])
  const updateSubPiece = useCallback((id: string, updated: SubPiece) => { setProject(prev => ({ ...prev, subPieces: prev.subPieces.map(sp => sp.id === id ? updated : sp) })) }, [setProject])
  const removeSubPiece = useCallback((id: string) => { setProject(prev => ({ ...prev, subPieces: prev.subPieces.filter(sp => sp.id !== id) })) }, [setProject])

  const handleCopyPrice = useCallback(() => {
    const priceText = formatCurrency(selectedResult.totalProjectPrice, project.currency)
    navigator.clipboard.writeText(priceText).then(() => { setCopied(true); toast({ title: t.priceCopied, description: `${priceText} ${t.priceCopiedDesc}` }); setTimeout(() => setCopied(false), 2000) })
  }, [selectedResult.totalProjectPrice, project.currency, toast, t])

  const handleSaveProject = useCallback(async () => {
    if (!session?.user?.id) return; setSavingProject(true)
    try {
      const listRes = await fetch('/api/projects')
      if (listRes.ok) {
        const projects = await listRes.json()
        const existing = projects.find((p: { data: string }) => { try { return JSON.parse(p.data).id === project.id } catch { return false } })
        if (existing) { await fetch(`/api/projects/${existing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: project.name, data: project }) }); toast({ title: t.projectUpdated }) }
        else { await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: project.name, data: project }) }); toast({ title: t.projectSaved }) }
      }
    } catch { toast({ title: t.errorSaving, variant: 'destructive' }) } finally { setSavingProject(false) }
  }, [session?.user?.id, project, toast, t])

  const handleRecordSale = useCallback(async () => {
    if (!session?.user?.id) return; setRecordingSale(true)
    try {
      const listRes = await fetch('/api/projects'); let projectId = ''
      if (listRes.ok) {
        const projects = await listRes.json()
        const existing = projects.find((p: { data: string }) => { try { return JSON.parse(p.data).id === project.id } catch { return false } })
        if (existing) { projectId = existing.id; await fetch(`/api/projects/${existing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: project.name, data: project }) }) }
        else { const createRes = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: project.name, data: project }) }); if (createRes.ok) projectId = (await createRes.json()).id }
      }
      if (!projectId) throw new Error()
      await fetch('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, projectName: project.name, tier: project.selectedTier, saleType: project.saleType, quantity: totalPieces, unitPrice: selectedResult.totalProjectPrice / (totalPieces || 1), totalPrice: selectedResult.totalProjectPrice }) })
      toast({ title: t.saleRecorded, description: `${formatCurrency(selectedResult.totalProjectPrice, project.currency)} \u2014 ${project.name}` })
    } catch { toast({ title: t.errorRecording, variant: 'destructive' }) } finally { setRecordingSale(false) }
  }, [session?.user?.id, project, selectedResult, totalPieces, toast, t])

  const handlePrinterProfileSelect = useCallback((profileId: string) => {
    if (profileId === 'custom') { updateParams({ printerProfileId: 'custom' }); return }
    const profile = printerProfiles.find(p => p.id === profileId)
    if (profile) updateParams(printerProfileToParams(profile))
  }, [printerProfiles, updateParams])

  const handleShareReport = useCallback(async (reportType: 'producer' | 'invoice') => {
    setSharingReport(true)
    try {
      const res = await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reportType, projectData: project, pricingData: selectedResult, currency: project.currency, userId: session?.user?.id || null }) })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setSharePopupUrl(`${window.location.origin}${data.url}`)
    } catch { toast({ title: t.errorSharing, variant: 'destructive' }) } finally { setSharingReport(false) }
  }, [project, selectedResult, session?.user?.id, toast, t])

  return (
    <motion.main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-6 relative z-10" variants={containerVariants} initial="hidden" animate="visible">
      {/* Animated mesh gradient background */}
      <div className="mesh-gradient-bg opacity-30">
        <div className="mesh-blob-1" />
        <div className="mesh-blob-2" />
        <div className="mesh-blob-3" />
        <div className="mesh-blob-4" />
      </div>
      {/* Summary Bar — currency only (language/theme in navbar) */}
      <div className="glass-card border border-border/30 rounded-xl p-3 mb-6">
        <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto">
          <SummaryStat icon={<Hash className="w-3 h-3 text-sage" />} bgClass="bg-sage/15" label={t.pieces} value={totalPieces.toString()} />
          <Divider />
          <SummaryStat icon={<Clock className="w-3 h-3 text-copper" />} bgClass="bg-copper/15" label={t.time} value={project.subPieces.length > 0 ? formatPrintTime(totalPrintTimeHours) : '\u2014'} />
          <Divider />
          <SummaryStat icon={<Weight className="w-3 h-3 text-gold" />} bgClass="bg-gold/15" label={t.weight} value={project.subPieces.length > 0 ? formatWeight(totalWeightGrams) : '\u2014'} />
          <Divider />
          <SummaryStat icon={<Timer className="w-3 h-3 text-diamond" />} bgClass="bg-diamond/15" label={t.amortizationPerHour} value={`${amortizationPerHour.toFixed(3)}`} />
          <Divider />
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {/* Currency selector */}
            <select value={project.currency} onChange={(e) => updateProject({ currency: e.target.value as CurrencyCode })}
              className="px-1.5 py-1 rounded-md bg-secondary/80 border border-border text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-copper">
              {Object.entries(CURRENCIES).map(([code, info]) => (<option key={code} value={code}>{info.symbol} {code}</option>))}
            </select>
            <div className="w-px h-7 bg-border/50" />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-muted-foreground">{tierNameMap[selectedResult.tier]}</span>
              <motion.span key={selectedResult.totalProjectPrice.toFixed(2)} initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }} className="font-display font-extrabold text-lg text-copper">
                {formatCurrency(selectedResult.totalProjectPrice, project.currency)}
              </motion.span>
            </div>
            <motion.button onClick={handleCopyPrice} className="w-7 h-7 rounded-md bg-copper/10 hover:bg-copper/20 flex items-center justify-center transition-colors" whileTap={{ scale: 0.9 }}>
              <AnimatePresence mode="wait">{copied ? <motion.div key="ck" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check className="w-3.5 h-3.5 text-sage" /></motion.div> : <motion.div key="cp" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy className="w-3.5 h-3.5 text-copper" /></motion.div>}</AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-5">
          {/* Project name + save */}
          <motion.section variants={sectionVariants}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-copper/15 flex items-center justify-center shrink-0"><Layers className="w-4 h-4 text-copper" /></div>
              <div className="flex items-center flex-1 min-w-0">
                <input ref={projectNameRef} type="text" value={project.name} onChange={(e) => updateProject({ name: e.target.value })} className="font-display font-extrabold text-xl sm:text-2xl text-foreground bg-transparent border-none outline-none flex-1 min-w-0 placeholder:text-muted-foreground" placeholder={t.pieceName} />
                <button onClick={() => { projectNameRef.current?.focus(); projectNameRef.current?.select() }} className="ml-0.5 p-1 rounded-md hover:bg-secondary/80 transition-colors shrink-0" aria-label="Edit name"><Pencil className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground" /></button>
              </div>
              {session?.user && (<motion.button onClick={handleSaveProject} disabled={savingProject} className="w-8 h-8 rounded-lg bg-sage/15 hover:bg-sage/25 border border-sage/30 flex items-center justify-center transition-colors disabled:opacity-50" whileTap={{ scale: 0.9 }}>{savingProject ? <Loader2 className="w-3.5 h-3.5 animate-spin text-sage" /> : <Save className="w-3.5 h-3.5 text-sage" />}</motion.button>)}
              {hasStoredData && (<motion.button onClick={resetProject} className="w-8 h-8 rounded-lg bg-secondary/80 hover:bg-secondary border border-border flex items-center justify-center transition-colors" whileTap={{ scale: 0.9 }}><RotateCcw className="w-3.5 h-3.5 text-muted-foreground" /></motion.button>)}
            </div>
          </motion.section>

          {/* Sale type */}
          <motion.section variants={sectionVariants} className="glass-card section-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-copper" />
              <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">{t.saleType}</h2>
              <InfoTooltip text={t.tooltipSaleType} side="right" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(Object.entries(SALE_TYPE_CONFIG) as [SaleType, typeof SALE_TYPE_CONFIG[SaleType]][]).map(([type, config]) => {
                const isSelected = project.saleType === type
                return (
                  <motion.button key={type} onClick={() => updateProject({ saleType: type })} className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer text-center ${isSelected ? 'border-copper bg-copper/10 shadow-md shadow-copper/10' : 'border-border bg-card hover:border-copper/40 hover:bg-copper/5'}`} whileTap={{ scale: 0.97 }}>
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
                  <input type="number" min={0.01} step={0.1} value={project.customMultiplier} onChange={(e) => { const val = parseFloat(e.target.value); if (!isNaN(val) && val > 0) updateProject({ customMultiplier: val }) }} className="flex-1 max-w-[100px] px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
                  <span className="font-mono font-bold text-copper text-sm">&times;{project.customMultiplier.toFixed(1)}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Printer Profile */}
          {session?.user && (
            <motion.section variants={sectionVariants} className="glass-card section-card p-4 space-y-4">
              <div className="flex items-center gap-2"><Printer className="w-4 h-4 text-copper" /><h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">{t.printParameters}</h2><InfoTooltip text={t.tooltipPrinterModel} side="right" /></div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5"><Printer className="w-3.5 h-3.5" /> {t.printerModel}</label>
                  <select value={project.params.printerProfileId} onChange={(e) => handlePrinterProfileSelect(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-copper">
                    <option value="custom">{t.printerDefaults}</option>
                    {printerProfiles.map(p => <option key={p.id} value={p.id}>{p.name} ({p.model})</option>)}
                  </select>
                </div>
                <div className="relative">
                  <motion.button onClick={() => { setEditingProfile(null); setShowProfileModal(true) }} className="px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors bg-copper/10 border-copper/30 text-copper hover:bg-copper/20 cursor-pointer" whileTap={{ scale: 0.97 }}>
                    <Plus className="w-3.5 h-3.5" /> {t.createProfile || 'New Profile'}
                  </motion.button>
                </div>
              </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <SettingsField icon={<Printer className="w-3.5 h-3.5" />} label={t.printerCost} tooltip={t.tooltipPrinterCost} value={project.params.printerCost} onChange={(v) => updateParams({ printerCost: v })} step={10} />
              <SettingsField icon={<Clock className="w-3.5 h-3.5" />} label={t.printerLifespan} tooltip={t.tooltipLifespan} value={project.params.printerLifespanHours} onChange={(v) => updateParams({ printerLifespanHours: v })} step={500} min={100} />
              <SettingsField icon={<Zap className="w-3.5 h-3.5" />} label={t.powerConsumption} tooltip={t.tooltipPower} value={project.params.powerConsumptionWatts} onChange={(v) => updateParams({ powerConsumptionWatts: v })} step={10} />
              <SettingsField icon={<DollarSign className="w-3.5 h-3.5" />} label={t.electricityCost} tooltip={t.tooltipElectricity} value={project.params.electricityCostPerKWh} onChange={(v) => updateParams({ electricityCostPerKWh: v })} step={0.01} />
              <SettingsField icon={<Percent className="w-3.5 h-3.5" />} label={t.failureRate} tooltip={t.tooltipFailureRate} value={project.params.failureRate} onChange={(v) => updateParams({ failureRate: v })} step={1} max={100} />
              <SettingsField icon={<Wrench className="w-3.5 h-3.5" />} label={t.monthlyMaintenance} tooltip={t.tooltipMonthlyMaintenance} value={project.params.monthlyMaintenanceCost} onChange={(v) => updateParams({ monthlyMaintenanceCost: v })} step={1} />
            </div>
            </motion.section>
          )}

          {/* Logistics & Business */}
          <motion.section variants={sectionVariants} className="glass-card section-card p-4 space-y-4">
            <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-copper" /><h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">{t.logisticsBusiness}</h2><InfoTooltip text={t.tooltipLogisticsBusiness} side="right" /></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <SettingsField icon={<Percent className="w-3.5 h-3.5" />} label={t.taxRate} tooltip={t.tooltipTaxRate} value={project.params.taxRate} onChange={(v) => updateParams({ taxRate: v })} step={1} max={100} />
              <SettingsField icon={<Package className="w-3.5 h-3.5" />} label={t.packaging} tooltip={t.tooltipPackaging} value={project.params.packagingCostPerProject} onChange={(v) => updateParams({ packagingCostPerProject: v })} step={0.1} />
              <SettingsField icon={<Truck className="w-3.5 h-3.5" />} label={t.shipping} tooltip={t.tooltipShipping} value={project.params.shippingCostPerProject} onChange={(v) => updateParams({ shippingCostPerProject: v })} step={0.5} />
              <SettingsField icon={<Eye className="w-3.5 h-3.5" />} label={t.supervisionRate} tooltip={t.tooltipSupervision} value={project.params.supervisionCostPerHour} onChange={(v) => updateParams({ supervisionCostPerHour: v })} step={0.5} />
            </div>
            {/* Monthly Expenses */}
            <div className="border-t border-border/50 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Receipt className="w-3 h-3" /> {t.monthlyExpenses} <InfoTooltip text={t.tooltipMonthlyExpenses} side="right" /></span>
                <button onClick={() => { const newExpense: MonthlyExpense = { id: generateExpenseId(), description: '', amount: 0 }; updateParams({ monthlyExpenses: [...(project.params.monthlyExpenses || []), newExpense] }) }} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-copper/10 text-copper text-[10px] font-semibold hover:bg-copper/20 transition-colors"><Plus className="w-3 h-3" /> {t.addMonthlyExpense}</button>
              </div>
              {(project.params.monthlyExpenses || []).length > 0 && (
                <div className="space-y-2">
                  {(project.params.monthlyExpenses || []).map((expense, idx) => (
                    <div key={expense.id} className="flex items-center gap-2">
                      <input type="text" value={expense.description} onChange={(e) => { const updated = [...(project.params.monthlyExpenses || [])]; updated[idx] = { ...updated[idx], description: e.target.value }; updateParams({ monthlyExpenses: updated }) }} placeholder={t.expenseDescription} className="flex-1 px-2 py-1 rounded-md bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-copper" />
                      <input type="number" min={0} step={1} value={expense.amount} onChange={(e) => { const updated = [...(project.params.monthlyExpenses || [])]; updated[idx] = { ...updated[idx], amount: parseFloat(e.target.value) || 0 }; updateParams({ monthlyExpenses: updated }) }} placeholder={t.monthlyAmount} className="w-24 px-2 py-1 rounded-md bg-background border border-border text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-copper" />
                      <button onClick={() => updateParams({ monthlyExpenses: (project.params.monthlyExpenses || []).filter(e => e.id !== expense.id) })} className="w-6 h-6 rounded flex items-center justify-center hover:bg-destructive/10 shrink-0"><Minus className="w-3 h-3 text-destructive/60" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-border/50 pt-3">
              <div className="flex items-center gap-2 mb-3"><Building2 className="w-3.5 h-3.5 text-diamond" /><span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t.amortizationPerHour}</span></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <SettingsField icon={<Clock className="w-3.5 h-3.5" />} label={t.dailyUsageHours} tooltip={t.tooltipDailyUsage} value={project.params.dailyUsageHours} onChange={(v) => updateParams({ dailyUsageHours: v })} step={1} min={1} />
                <SettingsField icon={<Timer className="w-3.5 h-3.5" />} label={t.amortizationMonths} tooltip={t.tooltipAmortization} value={project.params.amortizationMonths} onChange={(v) => updateParams({ amortizationMonths: v })} step={1} min={1} />
                <SettingsField icon={<DollarSign className="w-3.5 h-3.5" />} label={t.additionalInitialCost} tooltip={t.tooltipAdditionalCost} value={project.params.additionalInitialCost} onChange={(v) => updateParams({ additionalInitialCost: v })} step={10} />
                <SettingsField icon={<ShieldCheck className="w-3.5 h-3.5" />} label={t.bufferFactor} tooltip={t.tooltipBufferFactor} value={project.params.bufferFactor} onChange={(v) => updateParams({ bufferFactor: Math.min(2.0, Math.max(1.0, v)) })} step={0.1} min={1.0} max={2.0} />
                <SettingsField icon={<Percent className="w-3.5 h-3.5" />} label={t.commissionPct} tooltip={t.tooltipCommissionPct} value={project.params.commissionPercentage} onChange={(v) => updateParams({ commissionPercentage: v })} step={0.5} max={100} />
                <SettingsField icon={<CircleDollarSign className="w-3.5 h-3.5" />} label={t.commissionFixed} tooltip={t.tooltipCommissionFixed} value={project.params.commissionFixed} onChange={(v) => updateParams({ commissionFixed: v })} step={0.5} />
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 mb-1"><Tag className="w-3.5 h-3.5" /> {t.priceRounding} <InfoTooltip text={t.tooltipPriceRounding} side="right" /></label>
                  <select value={project.params.priceRounding} onChange={(e) => updateParams({ priceRounding: e.target.value as 'none' | '0.99' | '0.50' | '1.00' })} className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-copper">
                    <option value="none">{t.noRounding}</option>
                    <option value="0.99">{t.round99}</option>
                    <option value="0.50">{t.round50}</option>
                    <option value="1.00">{t.round100}</option>
                  </select>
                </div>
                <SettingsField icon={<BadgePercent className="w-3.5 h-3.5" />} label={t.minimumOrder} tooltip={t.tooltipMinimumOrder} value={project.params.minimumOrderPrice} onChange={(v) => updateParams({ minimumOrderPrice: v })} step={1} min={0} />
              </div>
              <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-diamond/10 border border-diamond/20">
                <Timer className="w-4 h-4 text-diamond" />
                <span className="text-xs font-medium text-foreground">{t.amortizationPerHour}:</span>
                <span className="font-display font-bold text-sm text-diamond">{getCurrencySymbol(project.currency)}{amortizationPerHour.toFixed(4)}/h</span>
              </div>
            </div>
          </motion.section>

          {/* Sub-pieces */}
          <motion.section variants={sectionVariants} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-copper" /><h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">{t.projectPieces}</h2></div>
              <motion.button onClick={addSubPiece} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-copper text-primary-foreground font-display font-semibold text-xs hover:bg-copper-dark hover:shadow-lg hover:shadow-copper/20 transition-all" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}><Plus className="w-3.5 h-3.5" /> {t.add}</motion.button>
            </div>
            <AnimatePresence mode="popLayout">
              {project.subPieces.map((sp, index) => (
                <PieceCard key={sp.id} subPiece={sp} index={index} currency={project.currency} onChange={(updated) => updateSubPiece(sp.id, updated)} onRemove={() => removeSubPiece(sp.id)} t={t as Record<string, string>} />
              ))}
            </AnimatePresence>
            {project.subPieces.length === 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 flex flex-col items-center justify-center text-center">
                <div className="relative mb-4"><div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-copper/20 to-gold/10 flex items-center justify-center"><Package className="w-8 h-8 text-copper/60" /></div><div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-sage/15 flex items-center justify-center"><Plus className="w-3.5 h-3.5 text-sage" /></div></div>
                <h3 className="font-display font-bold text-base text-foreground mb-1">{t.noPiecesYet}</h3>
                <p className="text-sm text-muted-foreground max-w-xs mb-4">{t.noPiecesDesc}</p>
                <motion.button onClick={addSubPiece} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-copper text-primary-foreground font-display font-semibold text-sm hover:bg-copper-dark transition-all" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}><Plus className="w-4 h-4" /> {t.addFirstPiece}</motion.button>
              </motion.div>
            )}
          </motion.section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 space-y-5">
          {!session?.user && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 border border-copper/20 bg-copper/5">
              <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-copper/15 flex items-center justify-center shrink-0 mt-0.5"><LogIn className="w-4 h-4 text-copper" /></div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground">{t.saveYourProjects}</p><p className="text-xs text-muted-foreground mt-0.5">{t.saveProjectsDesc}</p></div></div>
            </motion.div>
          )}

          {/* Price tier cards */}
          <motion.section variants={sectionVariants}>
            <div className="flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-copper" /><h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">{t.suggestedPrices}</h2></div>
            <div className="grid grid-cols-2 gap-3">
              {pricingResults.map((result) => {
                const isSelected = project.selectedTier === result.tier
                const color = TIER_BAR_COLORS[result.tier]
                const tierConfig = PRICING_TIER_CONFIG[result.tier]
                return (
                  <motion.div key={result.tier} layout onClick={() => updateProject({ selectedTier: result.tier })}
                    className={`relative cursor-pointer rounded-xl border-2 p-3 transition-all duration-300 ${isSelected ? `border-[${color}] bg-[${color}]/10 shadow-lg` : 'border-border bg-card hover:border-border/80 hover:shadow-md'}`}
                    style={isSelected ? { borderColor: color, backgroundColor: `${color}10`, boxShadow: `0 8px 30px ${color}15` } : {}}
                    whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                    {isSelected && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-md text-white" style={{ backgroundColor: color }}>{t.selected}</motion.div>}
                    <div className="flex items-center gap-2 mb-2"><div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} /><span className="font-display font-bold text-xs leading-tight" style={{ color: isSelected ? color : undefined }}>{tierNameMap[result.tier]}</span></div>
                    <div className="font-display font-black text-lg leading-none" style={{ color: isSelected ? color : undefined }}>{formatCurrency(result.totalProjectPrice, project.currency)}</div>
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
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: TIER_BAR_COLORS[project.selectedTier] }} /><span className="font-display font-bold text-sm text-copper">{tierNameMap[selectedResult.tier]}</span><span className="text-muted-foreground text-xs">&mdash;</span><span className="font-display font-bold text-sm text-foreground">{formatCurrency(selectedResult.totalProjectPrice, project.currency)}</span></div>
                  <span className="text-[10px] text-muted-foreground font-mono">{t.margin}: {(selectedResult.profitMargin * 100).toFixed(0)}%</span>
                </div>
                <BreakdownBar result={selectedResult} currency={project.currency} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  <LegendItem color="#6B9E72" label={t.material} value={selectedResult.totalMaterialCost} currency={project.currency} />
                  <LegendItem color="#4FC3F7" label={t.operation} value={selectedResult.totalBaseCost - selectedResult.totalMaterialCost} currency={project.currency} />
                  <LegendItem color="#C77D3A" label={t.profit} value={selectedResult.totalProfit} currency={project.currency} />
                  <LegendItem color="#D4A843" label={t.taxIncluded} value={selectedResult.totalTax} currency={project.currency} />
                  {(selectedResult.totalPackaging > 0 || selectedResult.totalShipping > 0) && <LegendItem color="#8A8690" label={t.shippingPackage} value={selectedResult.totalPackaging + selectedResult.totalShipping} currency={project.currency} />}
                  {(selectedResult.totalExtraExpenses > 0) && <LegendItem color="#9C27B0" label={t.extraExpensesLabel} value={selectedResult.totalExtraExpenses} currency={project.currency} />}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.section>

          {/* Cost breakdown */}
          <motion.section variants={sectionVariants} className="glass-card section-card overflow-hidden">
            <button onClick={() => setBreakdownOpen(!breakdownOpen)} className="w-full flex items-center justify-between p-4">
              <div className="flex items-center gap-2"><Calculator className="w-4 h-4 text-copper" /><h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">{t.costBreakdown} &mdash; {tierNameMap[selectedResult.tier]}</h2></div>
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
                    {selectedResult.subPieceBreakdowns.map((bd) => (<SubPieceBreakdown key={bd.subPieceId} breakdown={bd} currency={project.currency} t={t as Record<string, string>} />))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Export + Share */}
          <motion.section variants={sectionVariants} className="space-y-3">
            <div className="flex gap-3">
              <motion.button onClick={() => generateReport(project, selectedResult, t as Record<string, string>, 'producer')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm font-medium hover:bg-secondary/80 transition-colors" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}><FileText className="w-4 h-4" /> {t.downloadPDF}</motion.button>
              <motion.button onClick={() => generateReport(project, selectedResult, t as Record<string, string>, 'invoice')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-copper/10 border border-copper/30 text-copper text-sm font-medium hover:bg-copper/20 transition-colors" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}><Receipt className="w-4 h-4" /> {t.buyerTicket}</motion.button>
            </div>
            <div className="flex gap-3">
              <motion.button onClick={() => handleShareReport('producer')} disabled={sharingReport} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-diamond/10 border border-diamond/30 text-diamond text-sm font-medium hover:bg-diamond/20 transition-colors disabled:opacity-50" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>{sharingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} {t.shareProducer || 'Share Report'}</motion.button>
              <motion.button onClick={() => handleShareReport('invoice')} disabled={sharingReport} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sage/10 border border-sage/30 text-sage text-sm font-medium hover:bg-sage/20 transition-colors disabled:opacity-50" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>{sharingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} {t.shareInvoice || 'Share Invoice'}</motion.button>
            </div>
          </motion.section>

          {session?.user && (
            <motion.button onClick={handleRecordSale} disabled={recordingSale} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sage to-sage-dark text-white text-sm font-semibold hover:shadow-lg hover:shadow-sage/20 transition-all disabled:opacity-50" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
              {recordingSale ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />} {t.recordSale}
            </motion.button>
          )}
        </div>
      </div>

      {/* Share Popup */}
      <SharePopup url={sharePopupUrl || ''} title={project.name} open={!!sharePopupUrl} onClose={() => setSharePopupUrl(null)} />

      {/* Printer Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (<PrinterProfileModal profile={editingProfile} onClose={() => { setShowProfileModal(false); setEditingProfile(null) }} onSave={async (profile) => {
          if (session?.user?.id) {
            if (profile.id && profile.id !== 'custom') { await fetch(`/api/printer-profiles/${profile.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) }) }
            else { const res = await fetch('/api/printer-profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) }); if (res.ok) { const newProfile = await res.json(); setPrinterProfiles(prev => [...prev, newProfile]) } }
            const profiles = await (await fetch('/api/printer-profiles')).json(); setPrinterProfiles(profiles)
          } else { const local = [...printerProfiles, { ...profile, id: `local_${Date.now()}` }]; setPrinterProfiles(local); localStorage.setItem('dcalc-printer-profiles', JSON.stringify(local)) }
          setShowProfileModal(false); setEditingProfile(null)
        }} onDelete={async (id) => {
          if (session?.user?.id) { await fetch(`/api/printer-profiles/${id}`, { method: 'DELETE' }) }
          else { const local = printerProfiles.filter(p => p.id !== id); setPrinterProfiles(local); localStorage.setItem('dcalc-printer-profiles', JSON.stringify(local)) }
          setShowProfileModal(false); setEditingProfile(null)
        }} t={t as Record<string, string>} />)}
      </AnimatePresence>
    </motion.main>
  )
}
