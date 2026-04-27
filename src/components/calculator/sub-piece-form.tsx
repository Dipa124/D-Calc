'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { SubPiece, FilamentType, FinishingType } from '@/lib/types'
import { FILAMENT_DEFAULTS, FINISHING_DEFAULTS, PARAM_TOOLTIPS } from '@/lib/types'
import { Trash2, ChevronDown, Palette, Weight, Clock, Hash, Pencil } from 'lucide-react'
import { FinishTypeSelector } from './finish-type-selector'
import { InfoTooltip } from './info-tooltip'
import { useState } from 'react'

interface SubPieceFormProps {
  subPiece: SubPiece
  index: number
  onChange: (updated: SubPiece) => void
  onRemove: () => void
}

export function SubPieceForm({ subPiece, index, onChange, onRemove }: SubPieceFormProps) {
  const [isExpanded, setIsExpanded] = useState(index === 0)

  const update = (partial: Partial<SubPiece>) => {
    onChange({ ...subPiece, ...partial })
  }

  const handleFilamentChange = (filamentType: FilamentType) => {
    const defaults = FILAMENT_DEFAULTS[filamentType]
    update({
      filamentType,
      filamentCostPerKg: defaults.costPerKg,
    })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div
          className="w-4 h-4 rounded-full border-2 flex-shrink-0"
          style={{ backgroundColor: subPiece.color, borderColor: subPiece.color }}
        />
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <input
            type="text"
            value={subPiece.name}
            onChange={(e) => update({ name: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            className="font-display font-semibold text-foreground bg-transparent border-none outline-none flex-1 text-sm min-w-0"
            placeholder="Nombre de la pieza"
          />
          <Pencil className="w-3 h-3 text-muted-foreground/40 shrink-0" />
        </div>
        <span className="text-xs text-muted-foreground font-mono shrink-0">
          {subPiece.filamentType} · {subPiece.printWeight}g
        </span>
        <motion.button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Color picker + Filament */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Color picker */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" /> Color del filamento
                    <InfoTooltip text={PARAM_TOOLTIPS.color} />
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="color"
                        value={subPiece.color}
                        onChange={(e) => update({ color: e.target.value })}
                        className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer bg-transparent p-0.5"
                      />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{subPiece.color}</span>
                  </div>
                </div>

                {/* Filament type */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Weight className="w-3.5 h-3.5" /> Tipo de filamento
                    <InfoTooltip text={PARAM_TOOLTIPS.filamentType} />
                  </label>
                  <select
                    value={subPiece.filamentType}
                    onChange={(e) => handleFilamentChange(e.target.value as FilamentType)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-copper"
                  >
                    {(Object.entries(FILAMENT_DEFAULTS) as [FilamentType, typeof FILAMENT_DEFAULTS[FilamentType]][]).map(([type, config]) => (
                      <option key={type} value={type}>
                        {type === 'Custom' ? 'Personalizado' : `${type} — ${config.costPerKg}€/kg`}
                      </option>
                    ))}
                  </select>
                  {subPiece.filamentType === 'Custom' && (
                    <input
                      type="text"
                      value={subPiece.customFilamentName}
                      onChange={(e) => update({ customFilamentName: e.target.value })}
                      placeholder="Nombre del filamento"
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-copper"
                    />
                  )}
                </div>
              </div>

              {/* Numeric fields — Row 1 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Weight */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    Peso (g) <InfoTooltip text={PARAM_TOOLTIPS.printWeight} />
                  </label>
                  <input
                    type="number"
                    value={subPiece.printWeight}
                    onChange={(e) => update({ printWeight: Math.max(0, parseFloat(e.target.value) || 0) })}
                    min={0}
                    step={1}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-copper font-mono"
                  />
                </div>

                {/* Filament cost */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    Coste (€/kg) <InfoTooltip text={PARAM_TOOLTIPS.filamentCostPerKg} />
                  </label>
                  <input
                    type="number"
                    value={subPiece.filamentCostPerKg}
                    onChange={(e) => update({ filamentCostPerKg: Math.max(0, parseFloat(e.target.value) || 0) })}
                    min={0}
                    step={0.5}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-copper font-mono"
                  />
                </div>

                {/* Print time hours */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Horas <InfoTooltip text={PARAM_TOOLTIPS.printTime} />
                  </label>
                  <input
                    type="number"
                    value={subPiece.printTimeHours}
                    onChange={(e) => update({ printTimeHours: Math.max(0, parseInt(e.target.value) || 0) })}
                    min={0}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-copper font-mono"
                  />
                </div>

                {/* Print time minutes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Minutos</label>
                  <input
                    type="number"
                    value={subPiece.printTimeMinutes}
                    onChange={(e) => update({ printTimeMinutes: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) })}
                    min={0}
                    max={59}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-copper font-mono"
                  />
                </div>
              </div>

              {/* Numeric fields — Row 2 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Quantity */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Hash className="w-3 h-3" /> Cantidad <InfoTooltip text={PARAM_TOOLTIPS.quantity} />
                  </label>
                  <input
                    type="number"
                    value={subPiece.quantity}
                    onChange={(e) => update({ quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    min={1}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-copper font-mono"
                  />
                </div>

                {/* Waste percentage */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    Desperdicio (%) <InfoTooltip text={PARAM_TOOLTIPS.wastePercentage} />
                  </label>
                  <input
                    type="number"
                    value={subPiece.wastePercentage}
                    onChange={(e) => update({ wastePercentage: Math.max(0, parseFloat(e.target.value) || 0) })}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-copper font-mono"
                  />
                </div>

                {/* Post processing time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    Postprocesado (min) <InfoTooltip text={PARAM_TOOLTIPS.postProcessingTimeMinutes} />
                  </label>
                  <input
                    type="number"
                    value={subPiece.postProcessingTimeMinutes}
                    onChange={(e) => update({ postProcessingTimeMinutes: Math.max(0, parseInt(e.target.value) || 0) })}
                    min={0}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-copper font-mono"
                  />
                </div>

                {/* Labor time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    Mano obra (min) <InfoTooltip text={PARAM_TOOLTIPS.laborTimeMinutes} />
                  </label>
                  <input
                    type="number"
                    value={subPiece.laborTimeMinutes ?? 0}
                    onChange={(e) => update({ laborTimeMinutes: Math.max(0, parseInt(e.target.value) || 0) })}
                    min={0}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-copper font-mono"
                  />
                </div>
              </div>

              {/* Finish type selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  Tipo de acabado <InfoTooltip text={PARAM_TOOLTIPS.finishingType} />
                </label>
                <FinishTypeSelector
                  value={subPiece.finishingType}
                  customCost={subPiece.finishingCostPerPiece}
                  customDescription={subPiece.customFinishingDescription}
                  onChange={(type: FinishingType) => {
                    const config = FINISHING_DEFAULTS[type]
                    update({
                      finishingType: type,
                      finishingCostPerPiece: type === 'custom' ? subPiece.finishingCostPerPiece : config.costPerPiece,
                    })
                  }}
                  onCustomCostChange={(cost: number) => update({ finishingCostPerPiece: cost })}
                  onCustomDescriptionChange={(desc: string) => update({ customFinishingDescription: desc })}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
