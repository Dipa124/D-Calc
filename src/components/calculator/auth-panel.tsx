'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, UserPlus, LogOut, LayoutDashboard, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AuthPanelProps {
  onDashboardClick: () => void
}

export function AuthPanel({ onDashboardClick }: AuthPanelProps) {
  const { data: session, status } = useSession()
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [registerError, setRegisterError] = useState('')

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })

      if (!res.ok) {
        setLoginError('Email o contraseña incorrectos')
        return
      }

      // Reload session
      window.location.reload()
    } catch {
      setLoginError('Error al iniciar sesión')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError('')

    if (regPassword.length < 6) {
      setRegisterError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setRegisterLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, password: regPassword, name: regName }),
      })

      const data = await res.json()

      if (!res.ok) {
        setRegisterError(data.error || 'Error al registrarse')
        return
      }

      // Auto-login after registration
      const loginRes = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, password: regPassword }),
      })

      if (loginRes.ok) {
        window.location.reload()
      } else {
        setRegisterOpen(false)
        setLoginOpen(true)
        setLoginEmail(regEmail)
      }
    } catch {
      setRegisterError('Error al crear la cuenta')
    } finally {
      setRegisterLoading(false)
    }
  }

  const openLogin = () => {
    setLoginError('')
    setLoginEmail('')
    setLoginPassword('')
    setLoginOpen(true)
  }

  const openRegister = () => {
    setRegisterError('')
    setRegName('')
    setRegEmail('')
    setRegPassword('')
    setRegisterOpen(true)
  }

  const switchToRegister = () => {
    setLoginOpen(false)
    setTimeout(() => openRegister(), 150)
  }

  const switchToLogin = () => {
    setRegisterOpen(false)
    setTimeout(() => openLogin(), 150)
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Authenticated state
  if (session?.user) {
    const initial = (session.user.name || session.user.email || 'U')[0].toUpperCase()

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-secondary/80 transition-colors">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-copper to-gold flex items-center justify-center text-[11px] font-bold text-white">
                {initial}
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:inline max-w-[120px] truncate">
                {session.user.name || session.user.email?.split('@')[0]}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {session.user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDashboardClick} className="cursor-pointer">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: '/' })}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    )
  }

  // Not authenticated state
  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={openLogin}
          className="text-xs gap-1.5"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Iniciar sesión</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={openRegister}
          className="text-xs gap-1.5 border-copper/30 text-copper hover:bg-copper/10"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Registrarse</span>
        </Button>
      </div>

      {/* Login Dialog */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-copper/15 flex items-center justify-center">
                <User className="w-4 h-4 text-copper" />
              </div>
              Iniciar sesión
            </DialogTitle>
            <DialogDescription>
              Accede a tu cuenta para guardar proyectos y ver estadísticas
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Contraseña</label>
              <Input
                type="password"
                placeholder="••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <AnimatePresence>
              {loginError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm text-destructive"
                >
                  {loginError}
                </motion.p>
              )}
            </AnimatePresence>

            <Button type="submit" className="w-full" disabled={loginLoading}>
              {loginLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <LogIn className="w-4 h-4 mr-2" />
              )}
              Entrar
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={switchToRegister}
                className="text-copper hover:underline font-medium"
              >
                Regístrate
              </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sage/15 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-sage" />
              </div>
              Crear cuenta
            </DialogTitle>
            <DialogDescription>
              Guarda tus proyectos y accede a estadísticas de ventas
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nombre (opcional)</label>
              <Input
                type="text"
                placeholder="Tu nombre"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Contraseña</label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <AnimatePresence>
              {registerError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm text-destructive"
                >
                  {registerError}
                </motion.p>
              )}
            </AnimatePresence>

            <Button type="submit" className="w-full" disabled={registerLoading}>
              {registerLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Crear cuenta
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={switchToLogin}
                className="text-copper hover:underline font-medium"
              >
                Inicia sesión
              </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
