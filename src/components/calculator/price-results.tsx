'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { ProjectPricingResult, PricingTier } from '@/lib/types'
import { PRICING_TIER_CONFIG } from '@/lib/types'
import { formatCurrency } from '@/lib/calculator'
import { TrendingUp, BarChart3, Award, Gem } from 'lucide-react'

const TIER_ICONS: Record<PricingTier, React.ReactNode> = {
  competitive: <TrendingUp className="w-5 h-5" />,
  standard: <BarChart3 className="w-5 h-5" />,
  premium: <Award className="w-5 h-5" />,
  luxury: <Gem className="w-5 h-5" />,
}

const TIER_COLORS: Record<PricingTier, { bg: string; border: string; text: string; glow: string; badge: string; barBg: string; barText: string }> = {
  competitive: {
    bg: 'bg-sage/10 dark:bg-sage/10',
    border: 'border-sage/40 dark:border-sage/40',
    text: 'text-sage dark:text-sage-light',
    glow: 'shadow-sage/10',
    badge: 'bg-sage/20 text-sage dark:bg-sage/20 dark:text-sage-light',
    barBg: '#6B9E72',
    barText: '#fff',
  },
  standard: {
    bg: 'bg-copper/10 dark:bg-copper/10',
    border: 'border-copper/40 dark:border-copper/40',
    text: 'text-copper dark:text-copper-light',
    glow: 'shadow-copper/10',
    badge: 'bg-copper/20 text-copper dark:bg-copper/20 dark:text-copper-light',
    barBg: '#C77D3A',
    barText: '#fff',
  },
  premium: {
    bg: 'bg-gold/10 dark:bg-gold/10',
    border: 'border-gold/40 dark:border-gold/40',
    text: 'text-gold',
    glow: 'shadow-gold/10',
    badge: 'bg-gold/20 text-gold',
    barBg: '#D4A843',
    barText: '#1a1a2e',
  },
  luxury: {
    bg: 'bg-diamond/10 dark:bg-diamond/10',
    border: 'border-diamond/40 dark:border-diamond/40',
    text: 'text-diamond dark:text-diamond-light',
    glow: 'shadow-diamond/10',
    badge: 'bg-diamond/20 text-diamond dark:bg-diamond/20 dark:text-diamond-light',
    barBg: '#4FC3F7',
    barText: '#0C0E14',
  },
}

interface PriceResultsProps {
  results: ProjectPricingResult[]
  selectedTier: PricingTier
  onTierSelect: (tier: PricingTier) => void
}

export function PriceResults({ results, selectedTier, onTierSelect }: PriceResultsProps) {
  const selectedResult = results.find(r => r.tier === selectedTier) ?? results[1]
  const selectedColors = TIER_COLORS[selectedTier]

  return (
    <div className="space-y-5">
      {/* Tier selector cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {results.map((result) => {
          const colors = TIER_COLORS[result.tier]
          const config = PRICING_TIER_CONFIG[result.tier]
          const isSelected = selectedTier === result.tier

          return (
            <motion.div
              key={result.tier}
              layout
              onClick={() => onTierSelect(result.tier)}
              className={`
                relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300
                ${isSelected
                  ? `${colors.bg} ${colors.border} shadow-lg ${colors.glow}`
                  : 'border-border bg-card hover:border-border/80 hover:shadow-md'
                }
              `}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Selected indicator */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.8 }}
                    transition={{ type: 'spring', bounce: 0.4, duration: 0.4 }}
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md"
                    style={{ backgroundColor: config.darkAccent, color: '#fff' }}
                  >
                    Seleccionado
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isSelected ? `${colors.bg}` : 'bg-secondary/50'}`}>
                  <div className={isSelected ? colors.text : 'text-muted-foreground'}>
                    {TIER_ICONS[result.tier]}
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className={`font-display font-bold text-sm leading-tight ${isSelected ? colors.text : 'text-foreground'}`}>
                    {result.tierLabel}
                  </h3>
                  <p className="text-[10px] text-muted-foreground leading-tight truncate">{result.tierDescription}</p>
                </div>
              </div>

              <div className={`font-display font-black text-xl sm:text-2xl leading-none ${isSelected ? colors.text : 'text-foreground'}`}>
                {formatCurrency(result.totalProjectPrice)}
              </div>
              <div className={`mt-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${colors.badge}`}>
                +{(result.profitMargin * 100).toFixed(0)}% margen
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Horizontal breakdown bar for selected tier */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTier}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="glass-card p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: PRICING_TIER_CONFIG[selectedTier].darkAccent }} />
              <h4 className={`font-display font-bold text-sm ${selectedColors.text}`}>
                {selectedResult.tierLabel}
              </h4>
              <span className="text-muted-foreground text-sm">—</span>
              <span className="font-display font-bold text-sm text-foreground">
                {formatCurrency(selectedResult.totalProjectPrice)}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              Margen: {(selectedResult.profitMargin * 100).toFixed(0)}%
            </span>
          </div>

          {/* Horizontal stacked bar */}
          <BreakdownBar result={selectedResult} />

          {/* Legend with amounts */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
            <LegendItem color="#6B9E72" label="Material" value={selectedResult.totalMaterialCost} />
            <LegendItem color="#4FC3F7" label="Operación" value={(selectedResult.totalBaseCost - selectedResult.totalMaterialCost)} />
            <LegendItem color="#C77D3A" label="Beneficio" value={selectedResult.totalProfit} />
            <LegendItem color="#D4A843" label="IVA" value={selectedResult.totalTax} />
            {(selectedResult.totalPackaging > 0 || selectedResult.totalShipping > 0) && (
              <LegendItem color="#8A8690" label="Envío+Emb." value={selectedResult.totalPackaging + selectedResult.totalShipping} />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function BreakdownBar({ result }: { result: ProjectPricingResult }) {
  const total = result.totalProjectPrice
  if (total <= 0) return null

  const otherCosts = result.totalBaseCost - result.totalMaterialCost
  const segments = [
    { value: result.totalMaterialCost, color: '#6B9E72', label: 'Material' },
    { value: otherCosts > 0 ? otherCosts : 0, color: '#4FC3F7', label: 'Operación' },
    { value: result.totalProfit, color: '#C77D3A', label: 'Beneficio' },
    { value: result.totalTax, color: '#D4A843', label: 'IVA' },
    { value: result.totalPackaging + result.totalShipping, color: '#8A8690', label: 'Envío' },
  ].filter(s => s.value > 0)

  return (
    <div className="breakdown-bar">
      {segments.map((seg) => {
        const pct = (seg.value / total) * 100
        return (
          <motion.div
            key={seg.label}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              backgroundColor: seg.color,
              color: pct > 12 ? '#fff' : 'transparent',
            }}
            title={`${seg.label}: ${formatCurrency(seg.value)} (${pct.toFixed(1)}%)`}
          >
            {pct > 12 ? `${pct.toFixed(0)}%` : ''}
          </motion.div>
        )
      })}
    </div>
  )
}

function LegendItem({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
      <div className="flex flex-col leading-tight min-w-0">
        <span className="text-[10px] text-muted-foreground truncate">{label}</span>
        <span className="font-mono font-semibold text-foreground text-[11px]">{formatCurrency(value)}</span>
      </div>
    </div>
  )
}
