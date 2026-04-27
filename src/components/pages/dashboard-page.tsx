'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { useI18n } from '@/hooks/use-i18n'
import { formatCurrency } from '@/lib/calculator'
import { PRICING_TIER_CONFIG } from '@/lib/types'
import type { PricingTier } from '@/lib/types'
import type { CurrencyCode } from '@/lib/currency'
import {
  DollarSign, Layers, ShoppingBag, TrendingUp, BarChart3,
  Calendar, Loader2, Trash2, FolderOpen, Printer, Code2, Key
} from 'lucide-react'

interface DashboardStats {
  totalRevenue: number
  totalProjects: number
  totalSales: number
  avgPrice: number
  recentSales: { id: string; projectName: string; tier: string; saleType: string; quantity: number; unitPrice: number; totalPrice: number; soldAt: string }[]
  monthlyBreakdown: { month: string; revenue: number; count: number }[]
  salesByTier: Record<string, { revenue: number; count: number }>
}

interface ProjectInfo {
  id: string
  name: string
  createdAt: string
}

interface PrinterProfileInfo {
  id: string
  name: string
  model: string
}

const TIER_DOT_COLORS: Record<string, string> = {
  competitive: '#6B9E72', standard: '#C77D3A', premium: '#D4A843', luxury: '#4FC3F7',
}

export function DashboardPage() {
  const { data: session } = useSession()
  const { t } = useI18n()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projects, setProjects] = useState<ProjectInfo[]>([])
  const [profiles, setProfiles] = useState<PrinterProfileInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState<CurrencyCode>('EUR')

  const fc = (amount: number) => formatCurrency(amount, currency)

  useEffect(() => {
    if (!session?.user?.id) {
      return
    }
    let cancelled = false
    Promise.all([
      fetch('/api/sales/stats').then(r => r.json()),
      fetch('/api/projects').then(r => r.json()),
      fetch('/api/printer-profiles').then(r => r.json()),
    ]).then(([statsData, projectsData, profilesData]) => {
      if (cancelled) return
      setStats(statsData)
      setProjects(projectsData.map((p: { id: string; name: string; createdAt: string }) => ({ id: p.id, name: p.name, createdAt: p.createdAt })))
      setProfiles(profilesData.map((p: { id: string; name: string; model: string }) => ({ id: p.id, name: p.name, model: p.model })))
    }).catch(() => {
      // ignore errors
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [session?.user?.id])

  const handleDeleteProject = async (id: string) => {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  const handleDeleteProfile = async (id: string) => {
    await fetch(`/api/printer-profiles/${id}`, { method: 'DELETE' })
    setProfiles(prev => prev.filter(p => p.id !== id))
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">{t.loginDesc}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-copper" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-copper to-gold flex items-center justify-center shadow-lg shadow-copper/20">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display font-extrabold text-2xl text-foreground">{t.dashboard}</h1>
          <p className="text-sm text-muted-foreground">{t.appSubtitle}</p>
        </div>
      </div>

      {stats && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<DollarSign className="w-5 h-5" />} label={t.totalRevenue} value={fc(stats.totalRevenue)} bgClass="bg-copper/15" iconColor="text-copper" />
          <StatCard icon={<Layers className="w-5 h-5" />} label={t.activeProjects} value={stats.totalProjects.toString()} bgClass="bg-sage/15" iconColor="text-sage" />
          <StatCard icon={<ShoppingBag className="w-5 h-5" />} label={t.totalSales} value={stats.totalSales.toString()} bgClass="bg-gold/15" iconColor="text-gold" />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label={t.avgPrice} value={fc(stats.avgPrice)} bgClass="bg-diamond/15" iconColor="text-diamond" />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects */}
        <div className="glass-card p-5">
          <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase mb-4 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-copper" /> {t.myProjects}
          </h2>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t.noProjectsYet}</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {projects.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                  <FolderOpen className="w-4 h-4 text-copper shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-sm text-foreground truncate">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</div>
                  </div>
                  <button onClick={() => handleDeleteProject(p.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Printer Profiles */}
        <div className="glass-card p-5">
          <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase mb-4 flex items-center gap-2">
            <Printer className="w-4 h-4 text-sage" /> {t.printerProfiles}
          </h2>
          {profiles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t.noProfilesYet}</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {profiles.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                  <Printer className="w-4 h-4 text-sage shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-sm text-foreground truncate">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground">{p.model}</div>
                  </div>
                  <button onClick={() => handleDeleteProfile(p.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sales by Tier */}
      {stats && Object.keys(stats.salesByTier).length > 0 && (
        <div className="glass-card p-5">
          <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gold" /> {t.salesByTier}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(stats.salesByTier).map(([tier, data]) => {
              const dotColor = TIER_DOT_COLORS[tier] || '#8A8690'
              const tierConfig = PRICING_TIER_CONFIG[tier as PricingTier]
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
      {stats && (
        <div className="glass-card p-5">
          <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-sage" /> {t.recentSales}
          </h2>
          {stats.recentSales.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No sales recorded yet</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.recentSales.map((sale) => {
                const dotColor = TIER_DOT_COLORS[sale.tier] || '#8A8690'
                return (
                  <div key={sale.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-semibold text-sm text-foreground truncate">{sale.projectName}</div>
                      <div className="text-[11px] text-muted-foreground">{sale.saleType} · {sale.quantity}u · {new Date(sale.soldAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display font-bold text-sm text-foreground">{fc(sale.totalPrice)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* API Info */}
      <div className="glass-card p-5">
        <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase mb-4 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-diamond" /> {t.apiInfo}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">{t.apiKeyDesc}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-secondary/30 border border-border">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Projects API</div>
            <code className="text-xs text-copper font-mono">GET /api/projects</code>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30 border border-border">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Sales API</div>
            <code className="text-xs text-copper font-mono">GET /api/sales/stats</code>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30 border border-border">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Profiles API</div>
            <code className="text-xs text-copper font-mono">GET /api/printer-profiles</code>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30 border border-border">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Auth</div>
            <code className="text-xs text-copper font-mono">NextAuth v4</code>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, bgClass, iconColor }: { icon: React.ReactNode; label: string; value: string; bgClass: string; iconColor: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg ${bgClass} flex items-center justify-center ${iconColor}`}>{icon}</div>
        <span className="text-xs text-muted-foreground uppercase tracking-wide font-display">{label}</span>
      </div>
      <div className="font-display font-extrabold text-2xl text-foreground">{value}</div>
    </motion.div>
  )
}
