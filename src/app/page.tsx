'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Printer, ChevronDown,
  Calculator, Layers, DollarSign, FileDown,
  Copy, Check, Clock, Weight, Hash, Package, RotateCcw,
  Sparkles,
} from 'lucide-react'
import type {
  Project, SubPiece, SaleType, PricingTier, ProjectPricingResult
} from '@/lib/types'
import {
  generateId, getDefaultProject, getDefaultSubPiece,
} from '@/lib/types'
import { calculateProjectPrice, formatCurrency } from '@/lib/calculator'
import { useToast } from '@/hooks/use-toast'
import { usePersistedProject } from '@/hooks/use-persisted-project'
import { ThemeToggle } from '@/components/calculator/theme-toggle'
import { SaleTypeSelector } from '@/components/calculator/sale-type-selector'
import { SubPieceForm } from '@/components/calculator/sub-piece-form'
import { ProjectSettingsForm } from '@/components/calculator/project-settings-form'
import { PriceResults } from '@/components/calculator/price-results'
import { CostBreakdown } from '@/components/calculator/cost-breakdown'
import { ExportOptions } from '@/components/calculator/export-options'

// ─── Floating particles config ───
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 15}s`,
  type: (['copper', 'sage', 'gold', 'diamond'] as const)[i % 4],
  size: 2 + Math.random() * 2,
}))

export default function Home() {
  const { project, setProject, resetProject, hasStoredData } = usePersistedProject()
  const [showSettings, setShowSettings] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [copied, setCopied] = useState(false)

  const { toast } = useToast()

  // ─── Calculations ───
  const pricingResults = useMemo(() => calculateProjectPrice(project), [project])
  const selectedResult = useMemo(
    () => pricingResults.find(r => r.tier === project.selectedTier) ?? pricingResults[1],
    [pricingResults, project.selectedTier]
  )

  const totalPieces = useMemo(
    () => project.subPieces.reduce((sum, sp) => sum + sp.quantity, 0), [project.subPieces]
  )
  const totalPrintTimeHours = useMemo(
    () => project.subPieces.reduce((sum, sp) => sum + (sp.printTimeHours + sp.printTimeMinutes / 60) * sp.quantity, 0),
    [project.subPieces]
  )
  const totalWeightGrams = useMemo(
    () => project.subPieces.reduce((sum, sp) => sum + sp.printWeight * sp.quantity, 0),
    [project.subPieces]
  )

  // ─── Project updates ───
  const updateProject = useCallback((partial: Partial<Project>) => {
    setProject(prev => ({ ...prev, ...partial }))
  }, [setProject])

  const updateParams = useCallback((params: Project['params']) => {
    setProject(prev => ({ ...prev, params }))
  }, [setProject])

  const addSubPiece = useCallback(() => {
    const newPiece: SubPiece = {
      ...getDefaultSubPiece(), id: generateId(),
      name: `Pieza ${project.subPieces.length + 1}`,
    }
    setProject(prev => ({ ...prev, subPieces: [...prev.subPieces, newPiece] }))
  }, [project.subPieces.length, setProject])

  const updateSubPiece = useCallback((id: string, updated: SubPiece) => {
    setProject(prev => ({ ...prev, subPieces: prev.subPieces.map(sp => sp.id === id ? updated : sp) }))
  }, [setProject])

  const removeSubPiece = useCallback((id: string) => {
    setProject(prev => ({ ...prev, subPieces: prev.subPieces.filter(sp => sp.id !== id) }))
  }, [setProject])

  const handleCopyPrice = useCallback(() => {
    const priceText = formatCurrency(selectedResult.totalProjectPrice)
    navigator.clipboard.writeText(priceText).then(() => {
      setCopied(true)
      toast({ title: 'Precio copiado', description: `${priceText} copiado al portapapeles` })
      setTimeout(() => setCopied(false), 2000)
    })
  }, [selectedResult.totalProjectPrice, toast])

  // ─── Animation variants ───
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  }
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  }

  const formatPrintTime = (hours: number) => {
    const h = Math.floor(hours); const m = Math.round((hours - h) * 60)
    if (h === 0) return `${m}m`; if (m === 0) return `${h}h`; return `${h}h ${m}m`
  }
  const formatWeight = (grams: number) => grams >= 1000 ? `${(grams / 1000).toFixed(1)} kg` : `${grams.toFixed(0)} g`

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-grid-animated">
      {/* Ambient blobs */}
      <div className="blob-copper" style={{ top: '5%', right: '-5%' }} />
      <div className="blob-sage" style={{ bottom: '10%', left: '-5%' }} />
      <div className="blob-gold" style={{ top: '45%', right: '15%' }} />
      <div className="blob-diamond" style={{ bottom: '30%', right: '-3%' }} />

      {/* Floating particles */}
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className={`particle particle-${p.type}`}
          style={{ left: p.left, animationDelay: p.delay, width: p.size, height: p.size }}
        />
      ))}

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-copper to-gold flex items-center justify-center shadow-lg shadow-copper/20"
              whileHover={{ rotate: 10 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Printer className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="font-display font-extrabold text-xl text-foreground leading-tight">
                Calc<span className="text-gradient-copper">FDM</span>
              </h1>
              <p className="text-[10px] text-muted-foreground leading-tight hidden sm:block">
                Calculadora profesional de impresión 3D
              </p>
            </div>
            {/* Desktop price pill */}
            <motion.div
              key={selectedResult.totalProjectPrice.toFixed(2)}
              initial={{ scale: 1.1, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              className="hidden md:flex items-center gap-1.5 ml-3 px-3 py-1.5 rounded-full bg-copper/10 border border-copper/20 pulse-glow-copper"
            >
              <DollarSign className="w-3.5 h-3.5 text-copper" />
              <span className="font-display font-bold text-sm text-copper">
                {formatCurrency(selectedResult.totalProjectPrice)}
              </span>
            </motion.div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile price */}
            <motion.div
              key={`m-${selectedResult.totalProjectPrice.toFixed(2)}`}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="md:hidden flex items-center gap-1 px-2.5 py-1 rounded-full bg-copper/10 border border-copper/20"
            >
              <span className="font-display font-bold text-xs text-copper">
                {formatCurrency(selectedResult.totalProjectPrice)}
              </span>
            </motion.div>
            {hasStoredData && (
              <motion.button
                onClick={resetProject}
                className="w-9 h-9 rounded-lg bg-secondary/80 hover:bg-secondary border border-border flex items-center justify-center transition-colors"
                whileTap={{ scale: 0.9 }}
                aria-label="Restablecer proyecto"
                title="Restablecer proyecto"
              >
                <RotateCcw className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ─── Summary Bar ─── */}
      <div className="sticky top-[57px] z-40 glass-card border-b border-border/30 shimmer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto">
            <SummaryStat icon={<Hash className="w-3 h-3 text-sage" />} bgClass="bg-sage/15" label="Piezas" value={totalPieces.toString()} />
            <Divider />
            <SummaryStat icon={<Clock className="w-3 h-3 text-copper" />} bgClass="bg-copper/15" label="Tiempo" value={project.subPieces.length > 0 ? formatPrintTime(totalPrintTimeHours) : '—'} />
            <Divider />
            <SummaryStat icon={<Weight className="w-3 h-3 text-gold" />} bgClass="bg-gold/15" label="Peso" value={project.subPieces.length > 0 ? formatWeight(totalWeightGrams) : '—'} />
            <Divider />
            <div className="flex items-center gap-2 ml-auto shrink-0">
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] text-muted-foreground">{selectedResult.tierLabel}</span>
                <motion.span
                  key={selectedResult.totalProjectPrice.toFixed(2)}
                  initial={{ scale: 1.05 }} animate={{ scale: 1 }}
                  className="font-display font-extrabold text-lg text-copper"
                >
                  {formatCurrency(selectedResult.totalProjectPrice)}
                </motion.span>
              </div>
              <motion.button
                onClick={handleCopyPrice}
                className="w-7 h-7 rounded-md bg-copper/10 hover:bg-copper/20 flex items-center justify-center transition-colors"
                whileTap={{ scale: 0.9 }}
                aria-label="Copiar precio"
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

      {/* ─── Main Content: 2-column on desktop, 1-column on mobile ─── */}
      <motion.main
        className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero title */}
        <motion.section variants={sectionVariants} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-copper/15 flex items-center justify-center">
              <Layers className="w-4 h-4 text-copper" />
            </div>
            <input
              type="text"
              value={project.name}
              onChange={(e) => updateProject({ name: e.target.value })}
              className="font-display font-extrabold text-2xl sm:text-3xl text-foreground bg-transparent border-none outline-none flex-1 placeholder:text-muted-foreground animated-underline"
              placeholder="Nombre del proyecto"
            />
          </div>
        </motion.section>

        {/* Desktop: 2-column layout. Mobile: stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ─── LEFT COLUMN (inputs) ─── */}
          <div className="lg:col-span-5 space-y-5">

            {/* Sale type */}
            <motion.section variants={sectionVariants} className="glass-card section-card p-5">
              <SectionTitle icon={<DollarSign className="w-4 h-4" />} title="Tipo de venta" />
              <SaleTypeSelector
                value={project.saleType}
                customMultiplier={project.customMultiplier}
                onChange={(saleType: SaleType) => updateProject({ saleType })}
                onCustomMultiplierChange={(customMultiplier: number) => updateProject({ customMultiplier })}
              />
            </motion.section>

            {/* Sub-pieces */}
            <motion.section variants={sectionVariants} className="space-y-3">
              <div className="flex items-center justify-between">
                <SectionTitle icon={<Layers className="w-4 h-4" />} title="Piezas del proyecto" />
                <motion.button
                  onClick={addSubPiece}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-copper text-primary-foreground font-display font-semibold text-sm
                    hover:bg-copper-dark hover:shadow-lg hover:shadow-copper/20 transition-all"
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                >
                  <Plus className="w-4 h-4" /> Añadir
                </motion.button>
              </div>

              <AnimatePresence mode="popLayout">
                {project.subPieces.map((sp, index) => (
                  <SubPieceForm
                    key={sp.id} subPiece={sp} index={index}
                    onChange={(updated) => updateSubPiece(sp.id, updated)}
                    onRemove={() => removeSubPiece(sp.id)}
                  />
                ))}
              </AnimatePresence>

              {project.subPieces.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-8 flex flex-col items-center justify-center text-center"
                >
                  <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-copper/20 to-gold/10 flex items-center justify-center">
                      <Package className="w-10 h-10 text-copper/60" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-sage/15 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-sage" />
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-1">Sin piezas todavía</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mb-4">
                    Añade la primera pieza para calcular el precio de impresión 3D.
                  </p>
                  <motion.button
                    onClick={addSubPiece}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-copper text-primary-foreground font-display font-semibold text-sm
                      hover:bg-copper-dark hover:shadow-lg hover:shadow-copper/20 transition-all"
                    whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                  >
                    <Plus className="w-4 h-4" /> Añadir primera pieza
                  </motion.button>
                </motion.div>
              )}
            </motion.section>

            {/* Settings */}
            <motion.section variants={sectionVariants} className="glass-card section-card overflow-hidden">
              <button onClick={() => setShowSettings(!showSettings)} className="w-full flex items-center justify-between p-5">
                <SectionTitle icon={<Calculator className="w-4 h-4" />} title="Parámetros de impresión" />
                <motion.div animate={{ rotate: showSettings ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              </button>
              <AnimatePresence>
                {showSettings && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-5 pb-5">
                      <ProjectSettingsForm params={project.params} onChange={updateParams} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          </div>

          {/* ─── RIGHT COLUMN (results) ─── */}
          <div className="lg:col-span-7 space-y-5">

            {/* Price results + horizontal breakdown bar */}
            <motion.section variants={sectionVariants}>
              <SectionTitle icon={<Sparkles className="w-4 h-4" />} title="Precios sugeridos" />
              <PriceResults
                results={pricingResults}
                selectedTier={project.selectedTier}
                onTierSelect={(tier: PricingTier) => updateProject({ selectedTier: tier })}
              />
            </motion.section>

            {/* Cost breakdown */}
            <motion.section variants={sectionVariants} className="glass-card section-card overflow-hidden">
              <button onClick={() => setShowBreakdown(!showBreakdown)} className="w-full flex items-center justify-between p-5">
                <SectionTitle icon={<Calculator className="w-4 h-4" />} title={`Desglose — ${selectedResult.tierLabel}`} />
                <motion.div animate={{ rotate: showBreakdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              </button>
              <AnimatePresence>
                {showBreakdown && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-5 pb-5">
                      <CostBreakdown result={selectedResult} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* Export */}
            <motion.section variants={sectionVariants} className="glass-card section-card p-5">
              <SectionTitle icon={<FileDown className="w-4 h-4" />} title="Exportar" />
              <ExportOptions project={project} selectedResult={selectedResult} />
            </motion.section>
          </div>
        </div>
      </motion.main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/50 py-4 text-center text-xs text-muted-foreground bg-background/80 backdrop-blur-sm">
        <p className="font-display">Calc<span className="text-copper">FDM</span> — Calculadora profesional de impresión 3D FDM</p>
        <p className="mt-1 text-[10px]">Los precios son estimaciones basadas en los parámetros introducidos</p>
      </footer>
    </div>
  )
}

// ─── Sub-components ───

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="text-copper">{icon}</div>
      <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase">{title}</h2>
    </div>
  )
}

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
