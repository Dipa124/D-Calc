'use client'

import { motion } from 'framer-motion'
import type { ProjectPricingResult } from '@/lib/types'
import { formatCurrency } from '@/lib/calculator'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'

interface PriceComparisonChartProps {
  results: ProjectPricingResult[]
}

interface ChartData {
  name: string
  base: number
  profit: number
  tax: number
  extras: number
  total: number
  tier: string
}

// CustomTooltip declared outside render to avoid React lint error
function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartData }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="glass-card p-3 shadow-xl border border-border/50 text-xs space-y-1.5">
      <div className="font-display font-bold text-sm text-foreground">{d.name}</div>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Coste base</span>
        <span className="font-mono font-semibold text-foreground">{formatCurrency(d.base)}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Beneficio</span>
        <span className="font-mono font-semibold text-foreground">{formatCurrency(d.profit)}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">IVA</span>
        <span className="font-mono font-semibold text-foreground">{formatCurrency(d.tax)}</span>
      </div>
      {d.extras > 0 && (
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Envío+Emb.</span>
          <span className="font-mono font-semibold text-foreground">{formatCurrency(d.extras)}</span>
        </div>
      )}
      <div className="flex justify-between gap-4 border-t border-border/50 pt-1.5">
        <span className="font-bold text-foreground">Total</span>
        <span className="font-mono font-bold text-copper">{formatCurrency(d.total)}</span>
      </div>
    </div>
  )
}

export function PriceComparisonChart({ results }: PriceComparisonChartProps) {
  const data = results.map(r => ({
    name: r.tierLabel,
    base: Math.round(r.totalBaseCost * 100) / 100,
    profit: Math.round(r.totalProfit * 100) / 100,
    tax: Math.round(r.totalTax * 100) / 100,
    extras: Math.round((r.totalPackaging + r.totalShipping) * 100) / 100,
    total: Math.round(r.totalProjectPrice * 100) / 100,
    tier: r.tier,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-sm text-foreground">
          Comparativa de precios
        </h3>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-sage" /> Base
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-copper" /> Beneficio
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gold" /> IVA
          </span>
        </div>
      </div>

      <div className="h-48 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}€`}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.3 }} />
            <Bar dataKey="base" stackId="a" radius={[0, 0, 0, 0]}>
              {data.map((entry) => (
                <Cell key={`base-${entry.tier}`} fill="#6B9E72" opacity={0.7} />
              ))}
            </Bar>
            <Bar dataKey="profit" stackId="a">
              {data.map((entry) => (
                <Cell key={`profit-${entry.tier}`} fill="#C77D3A" opacity={0.8} />
              ))}
            </Bar>
            <Bar dataKey="tax" stackId="a" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={`tax-${entry.tier}`} fill="#D4A843" opacity={0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
