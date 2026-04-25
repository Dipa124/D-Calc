'use client'

import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { Sun, Moon } from 'lucide-react'

const emptySubscribe = () => () => {}
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  if (!mounted) {
    return <div className="w-12 h-12" />
  }

  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-12 h-12 rounded-full flex items-center justify-center
        bg-secondary/80 hover:bg-secondary border border-border
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper
        dark:focus-visible:ring-sage transition-colors"
      whileTap={{ scale: 0.9 }}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {/* Slicer ring animation */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-1 rounded-full"
          style={{
            borderTopWidth: 2,
            borderRightWidth: 2,
            borderBottomWidth: 2,
            borderLeftWidth: 2,
            borderTopStyle: 'solid',
            borderRightStyle: 'solid',
            borderBottomStyle: 'solid',
            borderLeftStyle: 'solid',
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent',
          }}
          animate={isDark ? {
            borderTopColor: '#C77D3A',
            borderRightColor: '#C77D3A',
            borderBottomColor: '#C77D3A',
            borderLeftColor: '#C77D3A',
            rotate: 360,
          } : {
            borderTopColor: '#D4A843',
            borderRightColor: '#D4A843',
            borderBottomColor: '#D4A843',
            borderLeftColor: '#D4A843',
            rotate: 0,
          }}
          transition={{
            rotate: { duration: 0.8, ease: 'easeInOut' },
            borderTopColor: { duration: 0.4, ease: 'easeInOut' },
            borderRightColor: { duration: 0.4, ease: 'easeInOut', delay: 0.1 },
            borderBottomColor: { duration: 0.4, ease: 'easeInOut', delay: 0.2 },
            borderLeftColor: { duration: 0.4, ease: 'easeInOut', delay: 0.3 },
          }}
        />
      </div>

      {/* Icon */}
      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? 0 : 180,
          scale: isDark ? 1 : 0,
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="absolute"
      >
        <Moon className="w-5 h-5 text-copper" />
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? -180 : 0,
          scale: isDark ? 0 : 1,
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="absolute"
      >
        <Sun className="w-5 h-5 text-gold" />
      </motion.div>
    </motion.button>
  )
}
