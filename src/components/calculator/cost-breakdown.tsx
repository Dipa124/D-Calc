'use client'

import type { ProjectPricingResult, SubPieceCostBreakdown } from '@/lib/types'
import { formatCurrency } from '@/lib/calculator'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface CostBreakdownProps {
  result: ProjectPricingResult
}

export function CostBreakdown({ result }: CostBreakdownProps) {
  return (
    <div className="space-y-4">
      {/* Project summary */}
      <div className="glass-card p-4">
        <h4 className="font-display font-bold text-sm mb-3 text-foreground">
          Resumen del proyecto — {result.tierLabel}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <SummaryItem label="Coste material" value={result.totalMaterialCost} />
          <SummaryItem label="Coste base" value={result.totalBaseCost} />
          <SummaryItem label="Beneficio" value={result.totalProfit} />
          <SummaryItem label="Precio sin IVA" value={result.totalPriceBeforeTax} />
          <SummaryItem label="IVA" value={result.totalTax} />
          <SummaryItem label="Embalaje" value={result.totalPackaging} />
          <SummaryItem label="Envío" value={result.totalShipping} />
          <SummaryItem label="TOTAL" value={result.totalProjectPrice} highlight />
        </div>
      </div>

      {/* Sub-piece breakdowns */}
      <div className="space-y-3">
        {result.subPieceBreakdowns.map((breakdown) => (
          <SubPieceBreakdown key={breakdown.subPieceId} breakdown={breakdown} />
        ))}
      </div>
    </div>
  )
}

function SubPieceBreakdown({ breakdown }: { breakdown: SubPieceCostBreakdown }) {
  const [isOpen, setIsOpen] = useState(false)

  const rows = [
    { label: 'Material', value: breakdown.materialCost },
    { label: 'Depreciación impresora', value: breakdown.printerDepreciation },
    { label: 'Electricidad', value: breakdown.electricityCost },
    { label: 'Mantenimiento', value: breakdown.maintenanceCost },
    { label: 'Mano de obra', value: breakdown.laborCost },
    { label: 'Acabado', value: breakdown.finishingCost },
    { label: 'Riesgo fallo', value: breakdown.failureCost },
    { label: 'Subtotal/unidad', value: breakdown.subtotalPerUnit, bold: true },
    { label: 'Overhead/unidad', value: breakdown.overheadPerUnit },
    { label: 'Coste base/unidad', value: breakdown.baseCostPerUnit, bold: true },
    { label: 'Beneficio/unidad', value: breakdown.profitPerUnit },
    { label: 'Precio sin IVA/unid.', value: breakdown.priceBeforeTaxPerUnit },
    { label: 'IVA/unidad', value: breakdown.taxPerUnit },
    { label: 'Total/unidad', value: breakdown.totalPerUnit, bold: true, highlight: true },
    { label: `Total ×${breakdown.quantity}`, value: breakdown.totalForQuantity, bold: true, highlight: true },
  ]

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.div>
          <span className="font-display font-semibold text-sm text-foreground">{breakdown.subPieceName}</span>
          <span className="text-xs text-muted-foreground">×{breakdown.quantity}</span>
        </div>
        <span className="font-mono font-bold text-copper">
          {formatCurrency(breakdown.totalForQuantity)}
        </span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="px-4 pb-3"
        >
          <div className="space-y-1 text-sm">
            {rows.map((row) => (
              <div
                key={row.label}
                className={`flex justify-between items-center py-1 ${
                  row.highlight ? 'border-t border-border pt-2 mt-1' : ''
                }`}
              >
                <span className={`${row.bold ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                  {row.label}
                </span>
                <span className={`font-mono ${row.bold ? 'font-bold text-foreground' : 'text-muted-foreground'} ${row.highlight ? 'text-copper font-bold' : ''}`}>
                  {formatCurrency(row.value)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function SummaryItem({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`flex flex-col ${highlight ? 'col-span-2 sm:col-span-1' : ''}`}>
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className={`font-mono font-bold ${highlight ? 'text-copper text-lg' : 'text-foreground'}`}>
        {formatCurrency(value)}
      </span>
    </div>
  )
}
