'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { SaleType } from '@/lib/types'
import { SALE_TYPE_CONFIG, PARAM_TOOLTIPS } from '@/lib/types'
import { Package, Store, Settings, Zap } from 'lucide-react'
import { InfoTooltip } from './info-tooltip'

const SALE_ICONS: Record<SaleType, React.ReactNode> = {
  wholesale: <Package className="w-5 h-5" />,
  retail: <Store className="w-5 h-5" />,
  custom: <Settings className="w-5 h-5" />,
  rush: <Zap className="w-5 h-5" />,
}

interface SaleTypeSelectorProps {
  value: SaleType
  customMultiplier: number
  onChange: (type: SaleType) => void
  onCustomMultiplierChange: (value: number) => void
}

export function SaleTypeSelector({ value, customMultiplier, onChange, onCustomMultiplierChange }: SaleTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.entries(SALE_TYPE_CONFIG) as [SaleType, typeof SALE_TYPE_CONFIG[SaleType]][]).map(([type, config]) => {
          const isSelected = value === type
          return (
            <motion.button
              key={type}
              onClick={() => onChange(type)}
              className={`
                relative flex flex-col items-center gap-2 p-4 rounded-xl border-2
                transition-all duration-200 cursor-pointer text-center
                ${isSelected
                  ? 'border-copper bg-copper/10 dark:border-copper dark:bg-copper/15 shadow-lg shadow-copper/10'
                  : 'border-border bg-card hover:border-copper/40 hover:bg-copper/5'
                }
              `}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className={`${isSelected ? 'text-copper' : 'text-muted-foreground'}`}>
                {SALE_ICONS[type]}
              </div>
              <span className="font-display font-semibold text-sm">{config.label}</span>
              <span className="text-[11px] text-muted-foreground leading-tight">{config.description}</span>
              <span className={`text-[10px] font-mono font-bold mt-0.5 px-2 py-0.5 rounded-full
                ${type === 'custom'
                  ? 'bg-copper/15 text-copper'
                  : 'bg-secondary text-muted-foreground'
                }`}
              >
                {config.subtitle}
              </span>
              {isSelected && (
                <motion.div
                  layoutId="sale-type-indicator"
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-copper border-2 border-background"
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Custom multiplier input — number input with no artificial cap */}
      <AnimatePresence>
        {value === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-copper/10 dark:bg-copper/10 border border-copper/20"
          >
            <label className="text-sm font-medium text-foreground whitespace-nowrap flex items-center gap-1.5">
              Multiplicador
              <InfoTooltip text={PARAM_TOOLTIPS.customMultiplier} side="right" />
            </label>
            <input
              type="number"
              min={0.01}
              step={0.1}
              value={customMultiplier}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                if (!isNaN(val) && val > 0) {
                  onCustomMultiplierChange(val)
                }
              }}
              className="flex-1 max-w-[120px] px-3 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground font-mono
                focus:outline-none focus:ring-2 focus:ring-copper"
            />
            <span className="font-mono font-bold text-copper min-w-[3rem] text-right">
              ×{customMultiplier.toFixed(1)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
