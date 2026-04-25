'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Printer, ChevronDown,
  Calculator, Layers, DollarSign, FileDown,
  Copy, Check, Clock, Weight, Hash, Package, RotateCcw,
} from 'lucide-react'
import type {
  Project, SubPiece, SaleType, PricingTier, ProjectPricingResult
} from '@/lib/types'
import {
  generateId, generateProjectId, getDefaultProject, getDefaultSubPiece,
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
import { PriceComparisonChart } from '@/components/calculator/price-comparison-chart'

// ─── Section IDs for scroll tracking ───
const SECTION_IDS = [
  'section-project-name',
  'section-sale-type',
  'section-sub-pieces',
  'section-settings',
  'section-price-results',
  'section-price-chart',
  'section-cost-breakdown',
  'section-export',
] as const

const SECTION_LABELS = [
  'Proyecto',
  'Venta',
  'Piezas',
  'Parámetros',
  'Precios',
  'Gráfico',
  'Desglose',
  'Exportar',
] as const

export default function Home() {
  // ─── Persisted State ───
  const { project, setProject, resetProject, hasStoredData } = usePersistedProject()
  const [showSettings, setShowSettings] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeSection, setActiveSection] = useState<string>(SECTION_IDS[0])

  const { toast } = useToast()
  const sectionsRef = useRef<Map<string, HTMLElement>>(new Map())

  // ─── Calculations ───
  const pricingResults = useMemo(
    () => calculateProjectPrice(project),
    [project]
  )

  const selectedResult = useMemo(
    () => pricingResults.find(r => r.tier === project.selectedTier) ?? pricingResults[1],
    [pricingResults, project.selectedTier]
  )

  // ─── Aggregated stats ───
  const totalPieces = useMemo(
    () => project.subPieces.reduce((sum, sp) => sum + sp.quantity, 0),
    [project.subPieces]
  )

  const totalPrintTimeHours = useMemo(
    () => project.subPieces.reduce(
      (sum, sp) => sum + (sp.printTimeHours + sp.printTimeMinutes / 60) * sp.quantity, 0
    ),
    [project.subPieces]
  )

  const totalWeightGrams = useMemo(
    () => project.subPieces.reduce(
      (sum, sp) => sum + sp.printWeight * sp.quantity, 0
    ),
    [project.subPieces]
  )

  // ─── Intersection Observer for scroll tracking ───
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    SECTION_IDS.forEach((id) => {
      const el = sectionsRef.current.get(id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id)
          }
        },
        { rootMargin: '-20% 0px -60% 0px' }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [])

  // ─── Project updates ───
  const updateProject = useCallback((partial: Partial<Project>) => {
    setProject(prev => ({ ...prev, ...partial }))
  }, [setProject])

  const updateParams = useCallback((params: Project['params']) => {
    setProject(prev => ({ ...prev, params }))
  }, [setProject])

  // ─── Sub-piece management ───
  const addSubPiece = useCallback(() => {
    const newPiece: SubPiece = {
      ...getDefaultSubPiece(),
      id: generateId(),
      name: `Pieza ${project.subPieces.length + 1}`,
    }
    setProject(prev => ({
      ...prev,
      subPieces: [...prev.subPieces, newPiece],
    }))
  }, [project.subPieces.length, setProject])

  const updateSubPiece = useCallback((id: string, updated: SubPiece) => {
    setProject(prev => ({
      ...prev,
      subPieces: prev.subPieces.map(sp => sp.id === id ? updated : sp),
    }))
  }, [setProject])

  const removeSubPiece = useCallback((id: string) => {
    setProject(prev => ({
      ...prev,
      subPieces: prev.subPieces.filter(sp => sp.id !== id),
    }))
  }, [setProject])

  // ─── Copy price to clipboard ───
  const handleCopyPrice = useCallback(() => {
    const priceText = formatCurrency(selectedResult.totalProjectPrice)
    navigator.clipboard.writeText(priceText).then(() => {
      setCopied(true)
      toast({
        title: 'Precio copiado',
        description: `${priceText} copiado al portapapeles`,
      })
      setTimeout(() => setCopied(false), 2000)
    })
  }, [selectedResult.totalProjectPrice, toast])

  // ─── Scroll to section ───
  const scrollToSection = useCallback((id: string) => {
    const el = sectionsRef.current.get(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  // ─── Section ref callback ───
  const setSectionRef = useCallback((id: string) => (el: HTMLElement | null) => {
    if (el) {
      sectionsRef.current.set(id, el)
    } else {
      sectionsRef.current.delete(id)
    }
  }, [])

  // ─── Staggered animation variants ───
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  // ─── Format helpers ───
  const formatPrintTime = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    if (h === 0) return `${m}m`
    if (m === 0) return `${h}h`
    return `${h}h ${m}m`
  }

  const formatWeight = (grams: number) => {
    if (grams >= 1000) return `${(grams / 1000).toFixed(1)} kg`
    return `${grams.toFixed(0)} g`
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="blob-copper" style={{ top: '5%', right: '-10%' }} />
      <div className="blob-sage" style={{ bottom: '15%', left: '-8%' }} />
      <div className="blob-gold" style={{ top: '50%', right: '20%' }} />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-copper/15 flex items-center justify-center">
              <Printer className="w-5 h-5 text-copper" />
            </div>
            <div className="flex items-center gap-3">
              <div>
                <h1 className="font-display font-bold text-lg text-foreground leading-tight">
                  Calc<span className="text-copper">FDM</span>
                </h1>
                <p className="text-[10px] text-muted-foreground leading-tight">Calculadora de impresión 3D</p>
              </div>
              {/* Real-time total price in header */}
              <motion.div
                key={selectedResult.totalProjectPrice.toFixed(2)}
                initial={{ scale: 1.08, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-copper/10 border border-copper/20"
              >
                <DollarSign className="w-3.5 h-3.5 text-copper" />
                <span className="font-display font-bold text-sm text-copper">
                  {formatCurrency(selectedResult.totalProjectPrice)}
                </span>
              </motion.div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile total price */}
            <motion.div
              key={`mobile-${selectedResult.totalProjectPrice.toFixed(2)}`}
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="sm:hidden flex items-center gap-1 px-2.5 py-1 rounded-full bg-copper/10 border border-copper/20"
            >
              <span className="font-display font-bold text-xs text-copper">
                {formatCurrency(selectedResult.totalProjectPrice)}
              </span>
            </motion.div>
            {/* Reset button */}
            {hasStoredData && (
              <motion.button
                onClick={resetProject}
                className="w-9 h-9 rounded-lg bg-secondary/80 hover:bg-secondary border border-border flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.05 }}
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

      {/* Summary bar */}
      <div className="sticky top-[57px] z-40 glass-card border-b border-border/30">
        <div className="max-w-5xl mx-auto px-4 py-2.5">
          <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto scrollbar-none">
            {/* Total pieces */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-6 h-6 rounded-md bg-sage/15 flex items-center justify-center">
                <Hash className="w-3 h-3 text-sage" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] text-muted-foreground">Piezas</span>
                <span className="font-display font-bold text-sm text-foreground">{totalPieces}</span>
              </div>
            </div>

            <div className="w-px h-6 bg-border/40 shrink-0" />

            {/* Total print time */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-6 h-6 rounded-md bg-copper/15 flex items-center justify-center">
                <Clock className="w-3 h-3 text-copper" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] text-muted-foreground">Tiempo</span>
                <span className="font-display font-bold text-sm text-foreground">
                  {project.subPieces.length > 0 ? formatPrintTime(totalPrintTimeHours) : '—'}
                </span>
              </div>
            </div>

            <div className="w-px h-6 bg-border/40 shrink-0" />

            {/* Total material weight */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-6 h-6 rounded-md bg-gold/15 flex items-center justify-center">
                <Weight className="w-3 h-3 text-gold" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] text-muted-foreground">Peso</span>
                <span className="font-display font-bold text-sm text-foreground">
                  {project.subPieces.length > 0 ? formatWeight(totalWeightGrams) : '—'}
                </span>
              </div>
            </div>

            <div className="w-px h-6 bg-border/40 shrink-0" />

            {/* Estimated price with copy */}
            <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] text-muted-foreground">Precio ({selectedResult.tierLabel})</span>
                <motion.span
                  key={selectedResult.totalProjectPrice.toFixed(2)}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="font-display font-extrabold text-lg text-copper"
                >
                  {formatCurrency(selectedResult.totalProjectPrice)}
                </motion.span>
              </div>
              <motion.button
                onClick={handleCopyPrice}
                className="w-7 h-7 rounded-md bg-copper/10 hover:bg-copper/20 flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Copiar precio al portapapeles"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Check className="w-3.5 h-3.5 text-sage" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Copy className="w-3.5 h-3.5 text-copper" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <motion.main
        className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 space-y-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* Project name */}
        <motion.section
          id={SECTION_IDS[0]}
          ref={setSectionRef(SECTION_IDS[0])}
          variants={sectionVariants}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-copper/15 flex items-center justify-center">
              <Layers className="w-4 h-4 text-copper" />
            </div>
            <input
              type="text"
              value={project.name}
              onChange={(e) => updateProject({ name: e.target.value })}
              className="font-display font-bold text-2xl text-foreground bg-transparent border-none outline-none flex-1 placeholder:text-muted-foreground"
              placeholder="Nombre del proyecto"
            />
          </div>
        </motion.section>

        {/* Sale type */}
        <motion.section
          id={SECTION_IDS[1]}
          ref={setSectionRef(SECTION_IDS[1])}
          variants={sectionVariants}
          className="glass-card p-5"
        >
          <SectionTitle icon={<DollarSign className="w-4 h-4" />} title="Tipo de venta" />
          <SaleTypeSelector
            value={project.saleType}
            customMultiplier={project.customMultiplier}
            onChange={(saleType: SaleType) => updateProject({ saleType })}
            onCustomMultiplierChange={(customMultiplier: number) => updateProject({ customMultiplier })}
          />
        </motion.section>

        {/* Sub-pieces */}
        <motion.section
          id={SECTION_IDS[2]}
          ref={setSectionRef(SECTION_IDS[2])}
          variants={sectionVariants}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <SectionTitle icon={<Layers className="w-4 h-4" />} title="Piezas del proyecto" />
            <motion.button
              onClick={addSubPiece}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-copper text-primary-foreground font-display font-semibold text-sm
                hover:bg-copper-dark hover:shadow-lg hover:shadow-copper/20 transition-all"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              <Plus className="w-4 h-4" /> Añadir pieza
            </motion.button>
          </div>

          <AnimatePresence mode="popLayout">
            {project.subPieces.map((sp, index) => (
              <SubPieceForm
                key={sp.id}
                subPiece={sp}
                index={index}
                onChange={(updated) => updateSubPiece(sp.id, updated)}
                onRemove={() => removeSubPiece(sp.id)}
              />
            ))}
          </AnimatePresence>

          {/* Better empty state */}
          {project.subPieces.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
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
              <h3 className="font-display font-bold text-lg text-foreground mb-1">
                Sin piezas todavía
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-4">
                Añade la primera pieza a tu proyecto para calcular el precio de impresión 3D.
              </p>
              <motion.button
                onClick={addSubPiece}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-copper text-primary-foreground font-display font-semibold text-sm
                  hover:bg-copper-dark hover:shadow-lg hover:shadow-copper/20 transition-all"
                whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(199, 125, 58, 0.3)' }}
                whileTap={{ scale: 0.97 }}
              >
                <Plus className="w-4 h-4" /> Añadir primera pieza
              </motion.button>
            </motion.div>
          )}
        </motion.section>

        {/* Project settings */}
        <motion.section
          id={SECTION_IDS[3]}
          ref={setSectionRef(SECTION_IDS[3])}
          variants={sectionVariants}
          className="glass-card overflow-hidden"
        >
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-between p-5"
          >
            <SectionTitle icon={<Calculator className="w-4 h-4" />} title="Parámetros de impresión" />
            <motion.div animate={{ rotate: showSettings ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5">
                  <ProjectSettingsForm params={project.params} onChange={updateParams} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Price results */}
        <motion.section
          id={SECTION_IDS[4]}
          ref={setSectionRef(SECTION_IDS[4])}
          variants={sectionVariants}
        >
          <SectionTitle icon={<DollarSign className="w-4 h-4" />} title="Precios sugeridos" />
          <PriceResults
            results={pricingResults}
            selectedTier={project.selectedTier}
            onTierSelect={(tier: PricingTier) => updateProject({ selectedTier: tier })}
          />
        </motion.section>

        {/* Price comparison chart */}
        <motion.section
          id={SECTION_IDS[5]}
          ref={setSectionRef(SECTION_IDS[5])}
          variants={sectionVariants}
        >
          <PriceComparisonChart results={pricingResults} />
        </motion.section>

        {/* Cost breakdown */}
        <motion.section
          id={SECTION_IDS[6]}
          ref={setSectionRef(SECTION_IDS[6])}
          variants={sectionVariants}
          className="glass-card overflow-hidden"
        >
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full flex items-center justify-between p-5"
          >
            <SectionTitle icon={<Calculator className="w-4 h-4" />} title={`Desglose — ${selectedResult.tierLabel}`} />
            <motion.div animate={{ rotate: showBreakdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showBreakdown && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5">
                  <CostBreakdown result={selectedResult} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Export */}
        <motion.section
          id={SECTION_IDS[7]}
          ref={setSectionRef(SECTION_IDS[7])}
          variants={sectionVariants}
          className="glass-card p-5"
        >
          <SectionTitle icon={<FileDown className="w-4 h-4" />} title="Exportar" />
          <ExportOptions project={project} selectedResult={selectedResult} />
        </motion.section>

      </motion.main>

      {/* Scroll-to section navigation (desktop only) */}
      <nav
        className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-2"
        aria-label="Navegación de secciones"
      >
        {SECTION_IDS.map((id, i) => (
          <motion.button
            key={id}
            onClick={() => scrollToSection(id)}
            className="group relative flex items-center justify-end"
            aria-label={`Ir a ${SECTION_LABELS[i]}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {/* Tooltip label */}
            <span className="absolute right-5 whitespace-nowrap px-2 py-1 rounded-md bg-card border border-border/50 text-xs font-display font-semibold text-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
              {SECTION_LABELS[i]}
            </span>
            {/* Dot */}
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                activeSection === id
                  ? 'bg-copper scale-125 shadow-md shadow-copper/30'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          </motion.button>
        ))}
      </nav>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/50 py-4 text-center text-xs text-muted-foreground bg-background/80 backdrop-blur-sm">
        <p>CalcFDM — Calculadora profesional de impresión 3D FDM</p>
        <p className="mt-1 text-[10px]">Los precios son estimaciones basadas en los parámetros introducidos</p>
      </footer>
    </div>
  )
}

// ─── Section title component ───
function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-copper">{icon}</div>
      <h2 className="font-display font-bold text-sm text-foreground">{title}</h2>
    </div>
  )
}
