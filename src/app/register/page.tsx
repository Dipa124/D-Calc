'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@/hooks/use-i18n'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { User, UserPlus, Loader2 } from 'lucide-react'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function RegistroPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Client-side validation for all fields
    if (!email.trim()) {
      setError(t.fieldRequired)
      return
    }
    if (!isValidEmail(email)) {
      setError(t.emailInvalid)
      return
    }
    if (!password) {
      setError(t.fieldRequired)
      return
    }
    if (password.length < 6) {
      setError(t.minPasswordBoth)
      return
    }

    if (!isLogin && !name.trim()) {
      setError(t.fieldRequired)
      return
    }

    setLoading(true)

    try {
      if (isLogin) {
        // Use NextAuth's signIn for credentials provider
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
        })
        if (result?.error) {
          setError(t.incorrectCredentials)
        } else if (result?.ok) {
          router.push('/home')
        } else {
          setError(t.loginError)
        }
      } else {
        // Register
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || t.registerError)
          return
        }
        // Auto-login after registration
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
        })
        if (result?.ok) {
          router.push('/home')
        } else {
          // Switch to login tab so they can try manually
          setIsLogin(true)
          setError('')
        }
      }
    } catch {
      setError(isLogin ? t.loginError : t.registerError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
      <div className="mesh-gradient-bg opacity-30">
        <div className="mesh-blob-1" />
        <div className="mesh-blob-2" />
        <div className="mesh-blob-3" />
        <div className="mesh-blob-4" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card-premium p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-copper to-gold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-copper/20">
              {isLogin ? <User className="w-6 h-6 text-white" /> : <UserPlus className="w-6 h-6 text-white" />}
            </div>
            <h1 className="text-hero-md font-display font-bold">
              {isLogin ? (t.welcomeBack || t.login) : (t.createYourAccount || t.register)}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {isLogin ? t.loginDesc : t.registerDesc}
            </p>
          </div>

          <div className="flex bg-secondary/50 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError('') }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${isLogin ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              {t.login}
            </button>
            <button
              onClick={() => { setIsLogin(false); setError('') }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${!isLogin ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              {t.register}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  {t.nameRequired} <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t.name}
                  required
                  autoComplete="name"
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-copper/30"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {t.email} <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoComplete={isLogin ? 'email' : 'email'}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-copper/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {t.password} <span className="text-destructive">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={isLogin ? '\u2022\u2022\u2022\u2022\u2022\u2022' : t.minPassword}
                required
                minLength={6}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-copper/30"
              />
              <p className="text-[11px] text-muted-foreground mt-1">{t.minPasswordBoth}</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm text-destructive"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-copper to-copper-dark text-white font-display font-bold text-sm shadow-lg shadow-copper/20 hover:shadow-copper/30 transition-shadow disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : isLogin ? (
                t.enter
              ) : (
                t.createAccount
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            {isLogin ? t.noAccount : t.hasAccount}{' '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError('') }}
              className="text-copper hover:underline font-medium"
            >
              {isLogin ? t.register : t.login}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
