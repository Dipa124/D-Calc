'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { useI18n } from '@/hooks/use-i18n'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatCurrency } from '@/lib/calculator'
import { PRICING_TIER_CONFIG } from '@/lib/types'
import type { PricingTier, PrinterProfile } from '@/lib/types'
import type { CurrencyCode } from '@/lib/currency'
import {
  DollarSign, Layers, ShoppingBag, TrendingUp, BarChart3,
  Trash2, FolderOpen, Printer, Code2, Settings, User, AlertCircle
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

const DEFAULT_STATS: DashboardStats = {
  totalRevenue: 0,
  totalProjects: 0,
  totalSales: 0,
  avgPrice: 0,
  recentSales: [],
  monthlyBreakdown: [],
  salesByTier: {},
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

export default function DashboardPage() {
  const { data: session } = useSession()
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projects, setProjects] = useState<ProjectInfo[]>([])
  const [profiles, setProfiles] = useState<PrinterProfileInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [currency] = useState<CurrencyCode>('EUR')
  const [activeSection, setActiveSection] = useState<'dashboard' | 'settings'>(
    searchParams.get('tab') === 'settings' ? 'settings' : 'dashboard'
  )

  const fc = (amount: number) => formatCurrency(amount, currency)

  useEffect(() => {
    if (!session?.user?.id) return
    let cancelled = false

    const load = async () => {
      let statsData: DashboardStats = DEFAULT_STATS
      let projectsData: ProjectInfo[] = []
      let profilesData: PrinterProfileInfo[] = []
      let hadError = false

      try {
        const statsRes = await fetch('/api/sales/stats')
        if (statsRes.ok) {
          const rawData = await statsRes.json()
          if (rawData && typeof rawData === 'object') {
            statsData = {
              totalRevenue: typeof rawData.totalRevenue === 'number' ? rawData.totalRevenue : 0,
              totalProjects: typeof rawData.totalProjects === 'number' ? rawData.totalProjects : 0,
              totalSales: typeof rawData.totalSales === 'number' ? rawData.totalSales : 0,
              avgPrice: typeof rawData.avgPrice === 'number' ? rawData.avgPrice : 0,
              recentSales: Array.isArray(rawData.recentSales) ? rawData.recentSales : [],
              monthlyBreakdown: Array.isArray(rawData.monthlyBreakdown) ? rawData.monthlyBreakdown : [],
              salesByTier: rawData.salesByTier && typeof rawData.salesByTier === 'object' ? rawData.salesByTier : {},
            }
          }
        } else {
          hadError = true
        }
      } catch {
        hadError = true
      }

      try {
        const projectsRes = await fetch('/api/projects')
        if (projectsRes.ok) {
          const rawData = await projectsRes.json()
          if (Array.isArray(rawData)) {
            projectsData = rawData.map((p: { id?: string; name?: string; createdAt?: string }) => ({
              id: p.id || '',
              name: p.name || 'Untitled',
              createdAt: p.createdAt || new Date().toISOString(),
            }))
          }
        } else {
          hadError = true
        }
      } catch {
        hadError = true
      }

      try {
        const profilesRes = await fetch('/api/printer-profiles')
        if (profilesRes.ok) {
          const rawData = await profilesRes.json()
          if (Array.isArray(rawData)) {
            profilesData = rawData.map((p: { id?: string; name?: string; model?: string }) => ({
              id: p.id || '',
              name: p.name || 'Untitled',
              model: p.model || '',
            }))
          }
        } else {
          hadError = true
        }
      } catch {
        hadError = true
      }

      if (cancelled) return

      setStats(statsData)
      setProjects(projectsData)
      setProfiles(profilesData)
      setFetchError(hadError)
      setLoading(false)
    }

    load().catch(() => {
      if (!cancelled) {
        setFetchError(true)
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [session?.user?.id])

  const handleDeleteProject = async (id: string) => {
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch {
      // Silently fail - project stays in list
    }
  }

  const handleDeleteProfile = async (id: string) => {
    try {
      await fetch(`/api/printer-profiles/${id}`, { method: 'DELETE' })
      setProfiles(prev => prev.filter(p => p.id !== id))
    } catch {
      // Silently fail - profile stays in list
    }
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t.loginDesc}</p>
          <button onClick={() => router.push('/register')} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-copper to-copper-dark text-white font-semibold">{t.enter}</button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-copper border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 relative">
      {/* Animated mesh background */}
      <div className="mesh-gradient-bg opacity-30">
        <div className="mesh-blob-1" />
        <div className="mesh-blob-2" />
        <div className="mesh-blob-3" />
        <div className="mesh-blob-4" />
      </div>

    <div className="space-y-6 max-w-[1200px] mx-auto px-4 sm:px-6 py-8 relative z-10">
      {/* Header with section tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-copper to-gold flex items-center justify-center shadow-lg shadow-copper/20">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-2xl text-foreground">{t.dashboard}</h1>
            <p className="text-sm text-muted-foreground">{t.appSubtitle}</p>
          </div>
        </div>
        {/* Section tabs */}
        <div className="flex bg-secondary/50 rounded-lg p-1 sm:ml-auto">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeSection === 'dashboard' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <span className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" />{t.dashboard}</span>
          </button>
          <button
            onClick={() => setActiveSection('settings')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeSection === 'settings' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <span className="flex items-center gap-1.5"><Settings className="w-3.5 h-3.5" />{t.accountSettings}</span>
          </button>
        </div>
      </div>

      {/* Fetch error banner */}
      {fetchError && (
        <div className="glass-card p-4 border border-destructive/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-sm text-muted-foreground">Some data could not be loaded. The displayed information may be incomplete.</p>
        </div>
      )}

      {/* Dashboard Section */}
      {activeSection === 'dashboard' && (
        <>
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
                          <div className="text-[11px] text-muted-foreground">{sale.saleType} &middot; {sale.quantity}u &middot; {new Date(sale.soldAt).toLocaleDateString()}</div>
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
        </>
      )}

      {/* Settings Section */}
      {activeSection === 'settings' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Account Info */}
          <div className="glass-card p-6">
            <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-copper" /> {t.accountSettings}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.name}</label>
                <p className="text-sm text-foreground font-medium mt-0.5">{session.user.name || '—'}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">{t.email}</label>
                <p className="text-sm text-foreground font-medium mt-0.5">{session.user.email || '—'}</p>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="glass-card p-6">
            <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase mb-5 flex items-center gap-2">
              <Settings className="w-4 h-4 text-sage" /> {t.theme}
            </h2>
            <p className="text-sm text-muted-foreground">{t.changeData}</p>
            <p className="text-xs text-muted-foreground mt-2 italic">
              More settings coming soon — currency defaults, notification preferences, and account management.
            </p>
          </div>

          {/* Quick Stats Summary */}
          <div className="glass-card p-6">
            <h2 className="font-display font-bold text-sm text-foreground tracking-wide uppercase mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-gold" /> Quick Summary
            </h2>
            {stats ? (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="font-display font-extrabold text-xl text-foreground">{stats.totalProjects}</div>
                  <div className="text-[11px] text-muted-foreground">{t.activeProjects}</div>
                </div>
                <div>
                  <div className="font-display font-extrabold text-xl text-foreground">{stats.totalSales}</div>
                  <div className="text-[11px] text-muted-foreground">{t.totalSales}</div>
                </div>
                <div>
                  <div className="font-display font-extrabold text-xl text-foreground">{fc(stats.totalRevenue)}</div>
                  <div className="text-[11px] text-muted-foreground">{t.totalRevenue}</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
    </div>
  )
}
