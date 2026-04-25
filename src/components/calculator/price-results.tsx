'use client'

import { motion } from 'framer-motion'
import type { ProjectPricingResult, PricingTier } from '@/lib/types'
import { PRICING_TIER_CONFIG } from '@/lib/types'
import { formatCurrency } from '@/lib/calculator'
import { TrendingUp, BarChart3, Award, Crown } from 'lucide-react'

const TIER_ICONS: Record<PricingTier, React.ReactNode> = {
  competitive: <TrendingUp className="w-5 h-5" />,
  standard: <BarChart3 className="w-5 h-5" />,
  premium: <Award className="w-5 h-5" />,
  luxury: <Crown className="w-5 h-5" />,
}

const TIER_COLORS: Record<PricingTier, { bg: string; border: string; text: string; glow: string; badge: string }> = {
  competitive: {
    bg: 'bg-sage/10 dark:bg-sage/10',
    border: 'border-sage/40 dark:border-sage/40',
    text: 'text-sage dark:text-sage-light',
    glow: 'shadow-sage/10',
    badge: 'bg-sage/20 text-sage dark:bg-sage/20 dark:text-sage-light',
  },
  standard: {
    bg: 'bg-copper/10 dark:bg-copper/10',
    border: 'border-copper/40 dark:border-copper/40',
    text: 'text-copper dark:text-copper-light',
    glow: 'shadow-copper/10',
    badge: 'bg-copper/20 text-copper dark:bg-copper/20 dark:text-copper-light',
  },
  premium: {
    bg: 'bg-gold/10 dark:bg-gold/10',
    border: 'border-gold/40 dark:border-gold/40',
    text: 'text-gold',
    glow: 'shadow-gold/10',
    badge: 'bg-gold/20 text-gold',
  },
  luxury: {
    bg: 'bg-amber-300/10 dark:bg-amber-300/10',
    border: 'border-amber-300/40 dark:border-amber-300/40',
    text: 'text-amber-300 dark:text-amber-200',
    glow: 'shadow-amber-300/10',
    badge: 'bg-amber-300/20 text-amber-300 dark:text-amber-200',
  },
}

interface PriceResultsProps {
  results: ProjectPricingResult[]
  selectedTier: PricingTier
  onTierSelect: (tier: PricingTier) => void
}

export function PriceResults({ results, selectedTier, onTierSelect }: PriceResultsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200
              ${isSelected
                ? `${colors.bg} ${colors.border} shadow-lg ${colors.glow}`
                : 'border-border bg-card hover:border-border/80 hover:shadow-md'
              }
            `}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Selected indicator */}
            {isSelected && (
              <motion.div
                layoutId="tier-selected"
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: config.darkAccent, color: '#fff' }}
              >
                Seleccionado
              </motion.div>
            )}

            {/* Icon + Label */}
            <div className="flex items-center gap-2 mb-3">
              <div className={isSelected ? colors.text : 'text-muted-foreground'}>
                {TIER_ICONS[result.tier]}
              </div>
              <div>
                <h3 className={`font-display font-bold text-sm ${isSelected ? colors.text : 'text-foreground'}`}>
                  {result.tierLabel}
                </h3>
                <p className="text-[10px] text-muted-foreground">{result.tierDescription}</p>
              </div>
            </div>

            {/* Price */}
            <div className="mb-3">
              <div className={`font-display font-black text-2xl ${isSelected ? colors.text : 'text-foreground'}`}>
                {formatCurrency(result.totalProjectPrice)}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Margen: {(result.profitMargin * 100).toFixed(0)}%
              </div>
            </div>

            {/* Quick breakdown */}
            <div className="space-y-1.5 text-[11px]">
              <BreakdownRow label="Material" value={result.totalMaterialCost} />
              <BreakdownRow label="Base" value={result.totalBaseCost} />
              <BreakdownRow label="Beneficio" value={result.totalProfit} />
              <BreakdownRow label="IVA" value={result.totalTax} />
              {(result.totalPackaging > 0 || result.totalShipping > 0) && (
                <BreakdownRow label="Envío+Emb." value={result.totalPackaging + result.totalShipping} />
              )}
            </div>

            {/* Margin badge */}
            <div className={`mt-3 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${colors.badge}`}>
              +{(result.profitMargin * 100).toFixed(0)}% margen
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium text-foreground">{formatCurrency(value)}</span>
    </div>
  )
}
