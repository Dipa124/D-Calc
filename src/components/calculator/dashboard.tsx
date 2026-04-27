'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  DollarSign, Layers, ShoppingBag, TrendingUp, BarChart3,
  ChevronRight, Calendar, Loader2, X,
} from 'lucide-react'
import { formatCurrency } from '@/lib/calculator'
import { PRICING_TIER_CONFIG } from '@/lib/types'
import type { PricingTier } from '@/lib/types'
import type { CurrencyCode } from '@/lib/currency'

interface DashboardStats {
  totalRevenue: number
  totalProjects: number
  totalSales: number
  avgPrice: number
  recentSales: {
    id: string
    projectName: string
    tier: string
    saleType: string
    quantity: number
    unitPrice: number
    totalPrice: number
    soldAt: string
  }[]
  monthlyBreakdown: { month: string; revenue: number; count: number }[]
  salesByTier: Record<string, { revenue: number; count: number }>
}

interface DashboardProps {
  onClose: () => void
  currency?: CurrencyCode
}

const TIER_DOT_COLORS: Record<string, string> = {
  competitive: '#6B9E72',
  standard: '#C77D3A',
  premium: '#D4A843',
  luxury: '#4FC3F7',
}

export function Dashboard({ onClose, currency = 'EUR' }: DashboardProps) {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fc = (amount: number) => formatCurrency(amount, currency)

  useEffect(() => {
    if (!session?.user?.id) return
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/sales/stats')
        if (!res.ok) throw new Error('Error loading stats')
        setStats(await res.json())
      } catch {
        setError('Error loading stats')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [session?.user?.id])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-copper to-gold flex items-center justify-center shadow-lg shadow-copper/20">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">D-Calc — Sales statistics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-secondary/80 hover:bg-secondary border border-border flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-copper" />
            <span className="ml-3 text-muted-foreground">Loading...</span>
          </div>
        )}

        {error && (
          <div className="glass-card p-6 text-center text-destructive">{error}</div>
        )}

        {stats && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<DollarSign className="w-5 h-5" />} label="Total Revenue" value={fc(stats.totalRevenue)} bgClass="bg-copper/15" iconColor="text-copper" />
              <StatCard icon={<Layers className="w-5 h-5" />} label="Projects" value={stats.totalProjects.toString()} bgClass="bg-sage/15" iconColor="text-sage" />
              <StatCard icon={<ShoppingBag className="w-5 h-5" />} label="Sales" value={stats.totalSales.toString()} bgClass="bg-gold/15" iconColor="text-gold" />
              <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Avg. Price" value={fc(stats.avgPrice)} bgClass="bg-diamond/15" iconColor="text-diamond" />
            </div>

            {/* Monthly Revenue */}
            {stats.monthlyBreakdown.length > 0 && (
              <div className="glass-card section-card p-5">
                <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-copper" /> Monthly Revenue
                </h2>
                <div className="space-y-3">
                  {stats.monthlyBreakdown.map((month) => {
                    const maxRevenue = Math.max(...stats.monthlyBreakdown.map(m => m.revenue), 1)
                    const pct = (month.revenue / maxRevenue) * 100
                    return (
                      <div key={month.month} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{month.month}</span>
                          <span className="font-display font-bold text-foreground">
                            {fc(month.revenue)}
                            <span className="text-xs text-muted-foreground ml-2">({month.count} sales)</span>
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-copper to-gold"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
                {stats.monthlyBreakdown.every(m => m.revenue === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">No sales recorded yet</p>
                )}
              </div>
            )}

            {/* Sales by Tier */}
            {Object.keys(stats.salesByTier).length > 0 && (
              <div className="glass-card section-card p-5">
                <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-gold" /> Sales by Tier
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {Object.entries(stats.salesByTier).map(([tier, data]) => {
                    const tierConfig = PRICING_TIER_CONFIG[tier as PricingTier]
                    const dotColor = TIER_DOT_COLORS[tier] || '#8A8690'
                    return (
                      <div key={tier} className="rounded-lg border border-border/50 p-3 bg-card/50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }} />
                          <span className="font-display font-semibold text-sm text-foreground">{tierConfig?.label || tier}</span>
                        </div>
                        <div className="font-display font-bold text-lg text-foreground">{fc(data.revenue)}</div>
                        <div className="text-[11px] text-muted-foreground">{data.count} sales</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Recent Sales */}
            <div className="glass-card section-card p-5">
              <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-sage" /> Recent Sales
              </h2>
              {stats.recentSales.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No sales recorded yet. Record your first sale from the calculator.</p>
              ) : (
                <div className="space-y-2">
                  {stats.recentSales.map((sale) => {
                    const dotColor = TIER_DOT_COLORS[sale.tier] || '#8A8690'
                    return (
                      <div key={sale.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                        <div className="flex-1 min-w-0">
                          <div className="font-display font-semibold text-sm text-foreground truncate">{sale.projectName}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {sale.saleType} · {sale.quantity}u · {new Date(sale.soldAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-display font-bold text-sm text-foreground">{fc(sale.totalPrice)}</div>
                          <div className="text-[11px] text-muted-foreground">{fc(sale.unitPrice)}/u</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

function StatCard({ icon, label, value, bgClass, iconColor }: { icon: React.ReactNode; label: string; value: string; bgClass: string; iconColor: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card section-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg ${bgClass} flex items-center justify-center ${iconColor}`}>{icon}</div>
        <span className="text-xs text-muted-foreground uppercase tracking-wide font-display">{label}</span>
      </div>
      <div className="font-display font-extrabold text-2xl text-foreground">{value}</div>
    </motion.div>
  )
}
