'use client'

import { SessionProvider } from 'next-auth/react'
import { I18nProvider } from '@/hooks/use-i18n'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <SessionProvider>{children}</SessionProvider>
    </I18nProvider>
  )
}
