'use client'

import { motion } from 'framer-motion'
import type { FinishingType } from '@/lib/types'
import { FINISHING_DEFAULTS } from '@/lib/types'
import { CircleOff, Paintbrush, PaintBucket, SprayCan, Sparkles, Cloud, Droplets, Wrench } from 'lucide-react'

const FINISH_ICONS: Record<FinishingType, React.ReactNode> = {
  none: <CircleOff className="w-4 h-4" />,
  lightSanding: <Paintbrush className="w-4 h-4" />,
  fullSanding: <Paintbrush className="w-4 h-4" />,
  primerPaint: <SprayCan className="w-4 h-4" />,
  fullPaint: <PaintBucket className="w-4 h-4" />,
  vaporSmoothing: <Cloud className="w-4 h-4" />,
  epoxyCoating: <Droplets className="w-4 h-4" />,
  custom: <Wrench className="w-4 h-4" />,
}

interface FinishTypeSelectorProps {
  value: FinishingType
  customCost: number
  customDescription: string
  onChange: (type: FinishingType) => void
  onCustomCostChange: (cost: number) => void
  onCustomDescriptionChange: (desc: string) => void
}

export function FinishTypeSelector({
  value, customCost, customDescription, onChange, onCustomCostChange, onCustomDescriptionChange
}: FinishTypeSelectorProps) {
  const finishEntries = Object.entries(FINISHING_DEFAULTS) as [FinishingType, typeof FINISHING_DEFAULTS[FinishingType]][]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {finishEntries.map(([type, config]) => {
          const isSelected = value === type
          return (
            <motion.button
              key={type}
              onClick={() => onChange(type)}
              className={`
                relative flex flex-col items-center gap-1.5 p-3 rounded-lg border-2
                transition-all duration-200 cursor-pointer text-center
                ${isSelected
                  ? 'border-copper bg-copper/10 dark:border-copper dark:bg-copper/15'
                  : 'border-border bg-card hover:border-copper/40 hover:bg-copper/5'
                }
              `}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className={`${isSelected ? 'text-copper' : 'text-muted-foreground'}`}>
                {FINISH_ICONS[type]}
              </div>
              <span className="font-display font-semibold text-xs">{config.description.split(',')[0]}</span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full
                ${type === 'custom'
                  ? 'bg-copper/15 text-copper'
                  : config.subtitle
                    ? 'bg-secondary text-muted-foreground'
                    : ''
                }`}
              >
                {config.subtitle || 'Gratis'}
              </span>
              {isSelected && (
                <motion.div
                  layoutId="finish-type-indicator"
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-copper border-2 border-background"
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Custom finish inputs */}
      {value === 'custom' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 p-3 rounded-lg bg-copper/10 dark:bg-copper/10 border border-copper/20"
        >
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-foreground whitespace-nowrap">
              Coste por pieza:
            </label>
            <div className="flex items-center gap-1 flex-1">
              <input
                type="range"
                min={0}
                max={50}
                step={0.5}
                value={customCost}
                onChange={(e) => onCustomCostChange(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="font-mono font-bold text-copper min-w-[4rem] text-right">
                {customCost.toFixed(1)} €
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Descripción del acabado:</label>
            <input
              type="text"
              value={customDescription}
              onChange={(e) => onCustomDescriptionChange(e.target.value)}
              placeholder="Ej: Pulido con llama, recubrimiento cerámico..."
              className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-copper"
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}
