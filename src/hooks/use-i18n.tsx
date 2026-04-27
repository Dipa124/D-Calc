'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Locale, Translations } from '@/lib/i18n'
import { detectLocale, getTranslations } from '@/lib/i18n'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translations
}

const I18nContext = createContext<I18nContextType>({
  locale: 'es',
  setLocale: () => {},
  t: getTranslations('es'),
})

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'es'
  const saved = localStorage.getItem('dcalc-locale') as Locale | null
  if (saved && ['es', 'en', 'zh', 'eu'].includes(saved)) return saved
  return detectLocale()
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('dcalc-locale', newLocale)
  }, [])

  const t = getTranslations(locale)

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
