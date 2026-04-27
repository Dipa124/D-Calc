'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import { useI18n } from '@/hooks/use-i18n'
import { useTheme } from 'next-themes'
import { usePathname, useRouter } from 'next/navigation'
import { LOCALE_NAMES, type Locale } from '@/lib/i18n'
import {
  Printer, Settings, Calculator, BarChart3, LogIn,
  Menu, ChevronDown, Sun, Moon, HomeIcon
} from 'lucide-react'

// ─── Animated Theme Toggle ───
function AnimatedThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <div className="w-8 h-8" />

  const isDark = theme === 'dark'
  return (
    <motion.button
      onClick={() => {
        document.body.classList.add('theme-transition')
        setTheme(isDark ? 'light' : 'dark')
        setTimeout(() => document.body.classList.remove('theme-transition'), 500)
      }}
      className="w-8 h-8 rounded-lg bg-secondary/80 hover:bg-secondary border border-border flex items-center justify-center transition-colors overflow-hidden"
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? 'dark' : 'light'}
          initial={{ rotate: -90, opacity: 0, scale: 0 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {isDark ? <Moon className="w-4 h-4 text-copper" /> : <Sun className="w-4 h-4 text-gold" />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  )
}

// ─── User Menu ───
function UserMenu() {
  const { data: session } = useSession()
  const { t } = useI18n()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (!session?.user) return null
  const initial = (session.user.name || session.user.email || 'U')[0].toUpperCase()

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-secondary/80 transition-colors"
        whileTap={{ scale: 0.97 }}
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-copper to-gold flex items-center justify-center text-[11px] font-bold text-white">
          {initial}
        </div>
        <span className="text-sm font-medium text-foreground hidden sm:inline max-w-[120px] truncate">
          {session.user.name || session.user.email?.split('@')[0]}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 w-52 glass-card p-1.5 border border-border/50 shadow-lg z-50"
          >
            <button
              onClick={() => { router.push('/dashboard'); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary/80 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-copper" />{t.dashboard}
            </button>
            <button
              onClick={() => { router.push('/dashboard'); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary/80 transition-colors"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />{t.accountSettings}
            </button>
            <div className="h-px bg-border/50 my-1" />
            <button
              onClick={() => { signOut(); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogIn className="w-4 h-4" />{t.logout}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Route map for nav ───
const ROUTE_MAP: Record<string, string> = {
  '/home': 'home',
  '/calculator': 'calculator',
  '/register': 'auth',
  '/dashboard': 'dashboard',
}

// ═══════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════
export function NavBar() {
  const { locale, setLocale, t } = useI18n()
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const currentPage = ROUTE_MAP[pathname] || 'home'

  const navItems: { path: string; label: string; icon: React.ReactNode }[] = [
    { path: '/home', label: t.navHome || 'Home', icon: <HomeIcon className="w-4 h-4" /> },
    { path: '/calculator', label: t.navCalculator || 'Calculator', icon: <Calculator className="w-4 h-4" /> },
    ...(session?.user ? [{ path: '/dashboard', label: t.navDashboard || 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-border/50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <motion.button
          onClick={() => router.push('/home')}
          className="flex items-center gap-2.5 shrink-0 group"
          style={{ flexShrink: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-copper to-gold flex items-center justify-center shadow-lg shadow-copper/20 group-hover:shadow-copper/40 transition-shadow">
            <Printer className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-display font-extrabold text-lg leading-tight">
              D-<span className="text-gradient-copper">Calc</span>
            </h1>
          </div>
        </motion.button>

        <nav className="hidden md:flex flex-1 items-center justify-center gap-1">
          {navItems.map(({ path, label, icon }) => (
            <motion.button
              key={path}
              onClick={() => router.push(path)}
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === ROUTE_MAP[path] ? 'text-copper bg-copper/10' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'}`}
              whileTap={{ scale: 0.97 }}
            >
              {icon}{label}
              {currentPage === ROUTE_MAP[path] && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-copper to-gold"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Language selector — names only, no flags */}
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="px-2 py-1 rounded-md bg-secondary/80 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-copper"
          >
            {Object.entries(LOCALE_NAMES).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>

          {/* Animated theme toggle */}
          <AnimatedThemeToggle />

          {!session?.user ? (
            <motion.button
              onClick={() => router.push('/register')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-copper to-copper-dark text-white text-xs font-semibold hover:shadow-lg hover:shadow-copper/20 transition-all"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              <LogIn className="w-3.5 h-3.5" /><span className="hidden sm:inline">{t.login}</span>
            </motion.button>
          ) : (
            <UserMenu />
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 rounded-lg bg-secondary/80 flex items-center justify-center"
          >
            <Menu className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 overflow-hidden"
          >
            <div className="px-4 py-2 space-y-1">
              {navItems.map(({ path, label, icon }) => (
                <button
                  key={path}
                  onClick={() => { router.push(path); setMobileMenuOpen(false) }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === ROUTE_MAP[path] ? 'text-copper bg-copper/10' : 'text-muted-foreground hover:bg-secondary/80'}`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
