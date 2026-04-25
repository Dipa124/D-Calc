'use client'

import type { ProjectParams } from '@/lib/types'
import { Settings, Printer, Zap, Wrench, Clock, DollarSign, Percent, Package, Truck, PenTool } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProjectSettingsFormProps {
  params: ProjectParams
  onChange: (params: ProjectParams) => void
}

export function ProjectSettingsForm({ params, onChange }: ProjectSettingsFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const update = (partial: Partial<ProjectParams>) => {
    onChange({ ...params, ...partial })
  }

  return (
    <div className="space-y-4">
      {/* Main parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <ParamField
          icon={<Printer className="w-3.5 h-3.5" />}
          label="Coste impresora (€)"
          value={params.printerCost}
          onChange={(v) => update({ printerCost: v })}
          min={0}
          step={10}
        />
        <ParamField
          icon={<Clock className="w-3.5 h-3.5" />}
          label="Vida útil (horas)"
          value={params.printerLifespanHours}
          onChange={(v) => update({ printerLifespanHours: v })}
          min={100}
          step={500}
        />
        <ParamField
          icon={<Wrench className="w-3.5 h-3.5" />}
          label="Mant. (€/h)"
          value={params.maintenanceCostPerHour}
          onChange={(v) => update({ maintenanceCostPerHour: v })}
          min={0}
          step={0.01}
        />
        <ParamField
          icon={<Zap className="w-3.5 h-3.5" />}
          label="Consumo (W)"
          value={params.powerConsumptionWatts}
          onChange={(v) => update({ powerConsumptionWatts: v })}
          min={0}
          step={10}
        />
        <ParamField
          icon={<DollarSign className="w-3.5 h-3.5" />}
          label="Electricidad (€/kWh)"
          value={params.electricityCostPerKWh}
          onChange={(v) => update({ electricityCostPerKWh: v })}
          min={0}
          step={0.01}
        />
        <ParamField
          icon={<Clock className="w-3.5 h-3.5" />}
          label="Mano obra (€/h)"
          value={params.laborCostPerHour}
          onChange={(v) => update({ laborCostPerHour: v })}
          min={0}
          step={1}
        />
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-xs font-medium text-copper hover:text-copper-dark transition-colors"
      >
        <Settings className="w-3.5 h-3.5" />
        {showAdvanced ? 'Ocultar ajustes avanzados' : 'Mostrar ajustes avanzados'}
      </button>

      {/* Advanced parameters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
              <ParamField
                icon={<Percent className="w-3.5 h-3.5" />}
                label="Tasa fallo (%)"
                value={params.failureRate}
                onChange={(v) => update({ failureRate: v })}
                min={0}
                max={100}
                step={1}
              />
              <ParamField
                icon={<Percent className="w-3.5 h-3.5" />}
                label="Overhead (%)"
                value={params.overheadPercentage}
                onChange={(v) => update({ overheadPercentage: v })}
                min={0}
                max={100}
                step={1}
              />
              <ParamField
                icon={<Percent className="w-3.5 h-3.5" />}
                label="IVA (%)"
                value={params.taxRate}
                onChange={(v) => update({ taxRate: v })}
                min={0}
                max={100}
                step={1}
              />
              <ParamField
                icon={<Package className="w-3.5 h-3.5" />}
                label="Embalaje (€)"
                value={params.packagingCostPerProject}
                onChange={(v) => update({ packagingCostPerProject: v })}
                min={0}
                step={0.1}
              />
              <ParamField
                icon={<Truck className="w-3.5 h-3.5" />}
                label="Envío (€)"
                value={params.shippingCostPerProject}
                onChange={(v) => update({ shippingCostPerProject: v })}
                min={0}
                step={0.5}
              />
              <ParamField
                icon={<PenTool className="w-3.5 h-3.5" />}
                label="Diseño (min)"
                value={params.designTimeMinutes}
                onChange={(v) => update({ designTimeMinutes: v })}
                min={0}
                step={5}
              />
              <ParamField
                icon={<DollarSign className="w-3.5 h-3.5" />}
                label="Tarifa diseño (€/h)"
                value={params.designHourlyRate}
                onChange={(v) => update({ designHourlyRate: v })}
                min={0}
                step={5}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Reusable parameter field component
function ParamField({
  icon, label, value, onChange, min = 0, max, step = 1
}: {
  icon: React.ReactNode
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        {icon} {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.max(min, parseFloat(e.target.value) || 0))}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-copper font-mono"
      />
    </div>
  )
}
