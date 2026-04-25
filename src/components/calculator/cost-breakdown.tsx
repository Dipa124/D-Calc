'use client'

import type { ProjectPricingResult, SubPieceCostBreakdown } from '@/lib/types'
import { PRICING_TIER_CONFIG } from '@/lib/types'
import { formatCurrency } from '@/lib/calculator'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

interface CostBreakdownProps {
  result: ProjectPricingResult
}

export function CostBreakdown({ result }: CostBreakdownProps) {
  const tierConfig = PRICING_TIER_CONFIG[result.tier]

  return (
    <div className="space-y-4">
      {/* Project summary */}
      <div className="rounded-xl border border-border/60 bg-secondary/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: tierConfig.darkAccent }}
          />
          <h4 className="font-display font-bold text-sm text-foreground">
            Resumen del proyecto — {result.tierLabel}
          </h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryItem label="Coste material" value={result.totalMaterialCost} />
          <SummaryItem label="Coste base" value={result.totalBaseCost} />
          <SummaryItem label="Beneficio" value={result.totalProfit} />
          <SummaryItem label="Precio sin IVA" value={result.totalPriceBeforeTax} />
          <SummaryItem label="IVA" value={result.totalTax} />
          {result.totalPackaging > 0 && <SummaryItem label="Embalaje" value={result.totalPackaging} />}
          {result.totalShipping > 0 && <SummaryItem label="Envío" value={result.totalShipping} />}
          <SummaryItem label="TOTAL" value={result.totalProjectPrice} highlight />
        </div>
      </div>

      {/* Sub-piece breakdowns */}
      <div className="space-y-2">
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
    <div className="rounded-xl border border-border/60 bg-secondary/10 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.div>
          <span className="font-display font-semibold text-sm text-foreground">{breakdown.subPieceName}</span>
          <span className="text-xs text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded-full">×{breakdown.quantity}</span>
        </div>
        <span className="font-mono font-bold text-copper text-sm">
          {formatCurrency(breakdown.totalForQuantity)}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">
              <div className="space-y-0.5 text-sm">
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className={`flex justify-between items-center py-1.5 px-1 rounded-md
                      ${row.highlight ? 'border-t border-border mt-2 pt-2.5 bg-copper/5' : ''}
                      ${row.bold && !row.highlight ? 'bg-secondary/30' : ''}
                    `}
                  >
                    <span className={`${row.bold ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      {row.label}
                    </span>
                    <span className={`font-mono text-sm
                      ${row.highlight ? 'font-bold text-copper' : row.bold ? 'font-bold text-foreground' : 'text-muted-foreground'}`}
                    >
                      {formatCurrency(row.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SummaryItem({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`flex flex-col p-2 rounded-lg ${highlight ? 'bg-copper/10 border border-copper/20' : ''}`}>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className={`font-mono font-bold ${highlight ? 'text-copper text-lg' : 'text-foreground text-sm'}`}>
        {formatCurrency(value)}
      </span>
    </div>
  )
}
