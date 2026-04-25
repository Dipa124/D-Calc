'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/hooks/use-i18n'
import {
  Calculator, Star, Printer, Layers, FileDown, Coins,
  Settings, DollarSign, ArrowRight, UserPlus
} from 'lucide-react'

// ─── Intersection Observer Hook for Scroll Animations ───
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el) } },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return { ref, isVisible }
}

function ScrollReveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollReveal()
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function HomePage() {
  const { t } = useI18n()
  const router = useRouter()

  const features = [
    { icon: <Calculator className="w-6 h-6" />, title: t.featureCalc || 'Precise Calculation', desc: t.featureCalcDesc },
    { icon: <Star className="w-6 h-6" />, title: t.featureTiers || '4 Pricing Tiers', desc: t.featureTiersDesc },
    { icon: <Printer className="w-6 h-6" />, title: t.featureProfiles || 'Printer Profiles', desc: t.featureProfilesDesc },
    { icon: <Layers className="w-6 h-6" />, title: t.featureProjects || 'Project Manager', desc: t.featureProjectsDesc },
    { icon: <FileDown className="w-6 h-6" />, title: t.featureExport || 'PDF Export', desc: t.featureExportDesc },
    { icon: <Coins className="w-6 h-6" />, title: t.featureCurrency || 'Multi-Currency', desc: t.featureCurrencyDesc },
  ]
  const steps = [
    { num: '01', title: t.step1Title || 'Configure', desc: t.step1Desc, icon: <Settings className="w-5 h-5" /> },
    { num: '02', title: t.step2Title || 'Add Pieces', desc: t.step2Desc, icon: <Layers className="w-5 h-5" /> },
    { num: '03', title: t.step3Title || 'Get Price', desc: t.step3Desc, icon: <DollarSign className="w-5 h-5" /> },
  ]

  return (
    <div className="flex-1">
      {/* Hero section — no floating language/theme selectors (they are in navbar) */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="mesh-gradient-bg"><div className="mesh-blob-1" /><div className="mesh-blob-2" /><div className="mesh-blob-3" /><div className="mesh-blob-4" /></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-copper/10 border border-copper/20 mb-8">
              <div className="w-2 h-2 rounded-full bg-copper animate-pulse" />
              <span className="text-sm font-medium text-copper">{t.heroBadge}</span>
            </div>
            <h1 className="text-hero-xl font-display font-black tracking-tight mb-6">
              <span className="text-foreground">{t.heroTitlePrefix}</span><br />
              <span className="text-gradient-hero">{t.heroTitleHighlight}</span>
            </h1>
            <p className="text-hero-sub text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">{t.appDescription}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={() => router.push('/calculadora')}
                className="btn-shimmer flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-copper to-copper-dark text-white font-display font-bold text-base shadow-xl shadow-copper/25 hover:shadow-copper/40 transition-shadow"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t.navCalculator || 'Open Calculator'}<ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={() => router.push('/registro')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-border text-foreground font-display font-semibold text-sm hover:border-copper/40 hover:bg-copper/5 transition-all"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <UserPlus className="w-4 h-4" />{t.register}
              </motion.button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">{t.noRegistrationRequired}</p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-section-title font-display font-bold mb-4">{t.featuresTitle}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t.featuresSubtitle}</p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="glass-card-interactive p-6 h-full group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-copper/15 to-gold/10 flex items-center justify-center text-copper mb-4 group-hover:scale-110 transition-transform">{feat.icon}</div>
                  <h3 className="font-display font-bold text-base mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-secondary/20">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-16"><h2 className="text-section-title font-display font-bold mb-4">{t.howItWorksTitle}</h2></ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <div className="text-center">
                  <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-copper to-gold flex items-center justify-center text-white mb-5 shadow-lg shadow-copper/20">
                    {step.icon}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 border-copper flex items-center justify-center"><span className="text-[9px] font-bold text-copper">{step.num}</span></div>
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-hero-md font-display font-bold mb-4">
              {t.ctaTitlePrefix} <span className="text-gradient-copper">{t.ctaTitleHighlight}</span> {t.ctaTitleSuffix}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">{t.ctaSubtitle}</p>
            <motion.button
              onClick={() => router.push('/calculadora')}
              className="btn-shimmer inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-copper to-copper-dark text-white font-display font-bold shadow-xl shadow-copper/25"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t.navCalculator || 'Open Calculator'} <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </ScrollReveal>
      </section>
    </div>
  )
}
