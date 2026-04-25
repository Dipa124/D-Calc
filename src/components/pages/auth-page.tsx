'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import { useI18n } from '@/hooks/use-i18n'
import { LogIn, UserPlus, LogOut, LayoutDashboard, User, Loader2, Mail, Lock, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function AuthPage() {
  const { data: session, status } = useSession()
  const { t } = useI18n()
  const [isLogin, setIsLogin] = useState(true)

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Register form
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState('')

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-copper" />
      </div>
    )
  }

  if (session?.user) {
    const initial = (session.user.name || session.user.email || 'U')[0].toUpperCase()
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card-premium p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-copper to-gold flex items-center justify-center text-2xl font-display font-bold text-white mx-auto mb-4 shadow-xl shadow-copper/20">
            {initial}
          </div>
          <h2 className="font-display font-extrabold text-2xl text-foreground mb-1">{session.user.name || session.user.email?.split('@')[0]}</h2>
          <p className="text-sm text-muted-foreground mb-6">{session.user.email}</p>
          <Button onClick={() => signOut({ callbackUrl: '/' })} variant="outline" className="gap-2 border-copper/30 text-copper hover:bg-copper/10">
            <LogOut className="w-4 h-4" /> {t.logout}
          </Button>
        </motion.div>
      </div>
    )
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await fetch('/api/auth/callback/credentials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: loginEmail, password: loginPassword }) })
      if (!res.ok) { setLoginError(t.incorrectCredentials); return }
      window.location.reload()
    } catch { setLoginError(t.loginError) } finally { setLoginLoading(false) }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError('')
    if (regPassword.length < 6) { setRegisterError(t.minPassword); return }
    setRegisterLoading(true)
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: regEmail, password: regPassword, name: regName }) })
      const data = await res.json()
      if (!res.ok) { setRegisterError(data.error || t.registerError); return }
      const loginRes = await fetch('/api/auth/callback/credentials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: regEmail, password: regPassword }) })
      if (loginRes.ok) window.location.reload()
      else setIsLogin(true)
    } catch { setRegisterError(t.registerError) } finally { setRegisterLoading(false) }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4 py-12">
      <div className="mesh-gradient-bg">
        <div className="mesh-blob mesh-blob-1" />
        <div className="mesh-blob mesh-blob-2" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card-premium p-8 w-full max-w-md relative z-10">
        {/* Toggle */}
        <div className="flex rounded-xl bg-secondary/50 p-1 mb-8">
          <button onClick={() => { setIsLogin(true); setLoginError(''); setRegisterError('') }}
            className={`flex-1 py-2.5 rounded-lg font-display font-semibold text-sm transition-all ${isLogin ? 'bg-gradient-to-r from-copper to-gold text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}>
            {t.login}
          </button>
          <button onClick={() => { setIsLogin(false); setLoginError(''); setRegisterError('') }}
            className={`flex-1 py-2.5 rounded-lg font-display font-semibold text-sm transition-all ${!isLogin ? 'bg-gradient-to-r from-copper to-gold text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}>
            {t.register}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleLogin} className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="font-display font-extrabold text-2xl text-foreground">{t.welcomeBack}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t.loginDesc}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2"><Mail className="w-4 h-4 text-copper" /> {t.email}</label>
                <Input type="email" placeholder="tu@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2"><Lock className="w-4 h-4 text-copper" /> {t.password}</label>
                <Input type="password" placeholder="••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required autoComplete="current-password" />
              </div>
              <AnimatePresence>{loginError && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-sm text-destructive">{loginError}</motion.p>}</AnimatePresence>
              <Button type="submit" className="w-full bg-gradient-to-r from-copper to-gold text-white font-display font-bold hover:shadow-lg hover:shadow-copper/20 transition-shadow" disabled={loginLoading}>
                {loginLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />} {t.enter}
              </Button>
            </motion.form>
          ) : (
            <motion.form key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleRegister} className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="font-display font-extrabold text-2xl text-foreground">{t.createYourAccount}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t.registerDesc}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2"><UserCircle className="w-4 h-4 text-copper" /> {t.nameOptional}</label>
                <Input type="text" placeholder="Tu nombre" value={regName} onChange={(e) => setRegName(e.target.value)} autoComplete="name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2"><Mail className="w-4 h-4 text-copper" /> {t.email}</label>
                <Input type="email" placeholder="tu@email.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2"><Lock className="w-4 h-4 text-copper" /> {t.password}</label>
                <Input type="password" placeholder={t.minPassword} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
              </div>
              <AnimatePresence>{registerError && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-sm text-destructive">{registerError}</motion.p>}</AnimatePresence>
              <Button type="submit" className="w-full bg-gradient-to-r from-copper to-gold text-white font-display font-bold hover:shadow-lg hover:shadow-copper/20 transition-shadow" disabled={registerLoading}>
                {registerLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />} {t.createAccount}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
