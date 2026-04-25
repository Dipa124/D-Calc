'use client'

import { useI18n } from '@/hooks/use-i18n'

export function Footer() {
  const { t } = useI18n()
  return (
    <footer className="mt-auto border-t border-border/30 py-4 px-4">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{t.footerText}</span>
        <span>&copy; {new Date().getFullYear()}</span>
      </div>
    </footer>
  )
}
