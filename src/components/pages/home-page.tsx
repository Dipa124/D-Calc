'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '@/hooks/use-i18n'
import type { AppPage } from '@/lib/types'
import {
  Calculator, Layers, Sparkles, UserCircle, FileDown, Globe,
  Settings2, ArrowRight, Printer, Package, DollarSign
} from 'lucide-react'

interface HomePageProps {
  onNavigate: (page: AppPage) => void
}

const features = [
  { icon: Calculator, color: 'copper' },
  { icon: Layers, color: 'gold' },
  { icon: UserCircle, color: 'sage' },
  { icon: Package, color: 'diamond' },
  { icon: FileDown, color: 'copper' },
  { icon: Globe, color: 'sage' },
] as const

const featureKeys = ['featureCalc', 'featureTiers', 'featureProfiles', 'featureProjects', 'featureExport', 'featureCurrency'] as const
const featureDescKeys = ['featureCalcDesc', 'featureTiersDesc', 'featureProfilesDesc', 'featureProjectsDesc', 'featureExportDesc', 'featureCurrencyDesc'] as const

const stepKeys = ['step1Title', 'step2Title', 'step3Title'] as const
const stepDescKeys = ['step1Desc', 'step2Desc', 'step3Desc'] as const
const stepIcons = [Settings2, Printer, DollarSign] as const
const stepColors = ['sage', 'copper', 'gold'] as const

const colorMap: Record<string, string> = {
  copper: 'bg-copper/15 text-copper',
  sage: 'bg-sage/15 text-sage',
  gold: 'bg-gold/15 text-gold',
  diamond: 'bg-diamond/15 text-diamond',
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { t } = useI18n()
  const featuresRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-reveal')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = featuresRef.current?.querySelectorAll('.feature-card')
    elements?.forEach((el) => observer.observe(el))

    const stepElements = stepsRef.current?.querySelectorAll('.step-card')
    stepElements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative">
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Mesh gradient background */}
        <div className="mesh-gradient-bg">
          <div className="mesh-blob mesh-blob-1" />
          <div className="mesh-blob mesh-blob-2" />
          <div className="mesh-blob mesh-blob-3" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card-premium mb-8"
          >
            <Sparkles className="w-4 h-4 text-copper" />
            <span className="text-xs font-display font-semibold text-muted-foreground">
              {t.appSubtitle}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-display font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-none mb-6"
          >
            <span className="text-gradient-copper-gold">{t.heroTitle}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t.heroSubtitle}
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <motion.button
              onClick={() => onNavigate('calculator')}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-copper to-gold text-white font-display font-bold text-lg shadow-xl shadow-copper/25 hover:shadow-2xl hover:shadow-copper/30 transition-shadow cta-glow"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {t.heroCta}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          {/* Floating decorative elements */}
          <motion.div
            className="absolute top-1/4 left-8 sm:left-16 opacity-20"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-copper/30 to-gold/20 border border-copper/20" />
          </motion.div>
          <motion.div
            className="absolute bottom-1/3 right-8 sm:right-16 opacity-15"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage/30 to-sage/10 border border-sage/20" />
          </motion.div>
        </div>
      </section>

      {/* ═══ FEATURES SECTION ═══ */}
      <section className="py-20 sm:py-28 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground mb-4">
              <span className="text-gradient-copper">{t.appName}</span>{' '}
              <span className="text-foreground">{t.featureCalc.split(' ')[0]}</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              {t.appDescription}
            </p>
          </motion.div>

          <div ref={featuresRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon
              const colorClass = colorMap[feature.color]
              return (
                <div
                  key={i}
                  className="feature-card glass-card-premium p-6 hover:scale-[1.02] transition-transform duration-300"
                  style={{ opacity: 0 }}
                >
                  <div className={`w-11 h-11 rounded-xl ${colorClass} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-base text-foreground mb-2">
                    {t[featureKeys[i]]}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t[featureDescKeys[i]]}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-20 sm:py-28 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground mb-4">
              <span className="text-gradient-copper">3</span> {t.step1Title.includes(' ') ? t.step1Title.split(' ').slice(-1)[0] : t.step1Title}
            </h2>
          </motion.div>

          <div ref={stepsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stepKeys.map((key, i) => {
              const Icon = stepIcons[i]
              const stepColor = stepColors[i]
              const colorClass = colorMap[stepColor]
              return (
                <div
                  key={i}
                  className="step-card text-center"
                  style={{ opacity: 0 }}
                >
                  <div className="relative mx-auto mb-6">
                    <div className={`w-16 h-16 rounded-2xl ${colorClass} flex items-center justify-center mx-auto hero-float`} style={{ animationDelay: `${i * 0.5}s` }}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-r from-copper to-gold text-white text-xs font-display font-bold flex items-center justify-center shadow-lg">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">
                    {t[key]}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t[stepDescKeys[i]]}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
