'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
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
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return { ref, isVisible }
}

function ScrollReveal({ children, className = '', delay = 0, direction = 'up' }: {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'left' | 'right' | 'scale'
}) {
  const { ref, isVisible } = useScrollReveal()
  const variants = {
    up: { opacity: 0, y: 40 },
    left: { opacity: 0, x: -40 },
    right: { opacity: 0, x: 40 },
    scale: { opacity: 0, scale: 0.92 },
  }
  const animateTo = {
    up: { opacity: 1, y: 0 },
    left: { opacity: 1, x: 0 },
    right: { opacity: 1, x: 0 },
    scale: { opacity: 1, scale: 1 },
  }
  return (
    <motion.div
      ref={ref}
      initial={variants[direction]}
      animate={isVisible ? animateTo[direction] : variants[direction]}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Animated Gradient Blob Component ───
function GradientBlob({
  color1,
  color2,
  size,
  initialX,
  initialY,
  duration,
  delay,
}: {
  color1: string
  color2: string
  size: number
  initialX: string
  initialY: string
  duration: number
  delay: number
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: initialX,
        top: initialY,
        background: `radial-gradient(circle, ${color1} 0%, ${color2} 60%, transparent 70%)`,
        filter: 'blur(100px)',
        willChange: 'transform',
      }}
      animate={{
        x: [0, 80, -60, 40, -30, 0],
        y: [0, -50, 60, -30, 40, 0],
        scale: [1, 1.15, 0.9, 1.1, 0.95, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  )
}

// ─── Floating Particle Component ───
function FloatingParticle({ delay, duration, startX, startY, size, color }: {
  delay: number
  duration: number
  startX: number
  startY: number
  size: number
  color: string
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${startX}%`,
        top: `${startY}%`,
        background: color,
        willChange: 'transform, opacity',
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        x: [0, 30, -20, 40, -10, 0],
        y: [0, -40, 20, -30, 50, 0],
        opacity: [0, 0.6, 0.4, 0.7, 0.3, 0],
        scale: [0, 1, 0.8, 1.1, 0.7, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  )
}

// ─── Hero Background with Parallax ───
function HeroBackground({ scrollY }: { scrollY: ReturnType<typeof useScroll>['scrollY'] }) {
  const blobY1 = useTransform(scrollY, [0, 800], [0, -150])
  const blobY2 = useTransform(scrollY, [0, 800], [0, -100])
  const blobY3 = useTransform(scrollY, [0, 800], [0, -200])
  const blobY4 = useTransform(scrollY, [0, 800], [0, -80])

  // Generate particles with useMemo to avoid re-renders
  const particles = useMemo(() => {
    const colors = [
      'rgba(199, 125, 58, 0.5)',
      'rgba(212, 168, 67, 0.4)',
      'rgba(107, 158, 114, 0.35)',
      'rgba(79, 195, 247, 0.3)',
      'rgba(199, 125, 58, 0.25)',
    ]
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      delay: i * 0.8,
      duration: 8 + Math.random() * 6,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      size: 2 + Math.random() * 4,
      color: colors[i % colors.length],
    }))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient blobs with parallax */}
      <motion.div style={{ y: blobY1 }} className="absolute inset-0">
        <GradientBlob
          color1="rgba(199, 125, 58, 0.3)"
          color2="rgba(199, 125, 58, 0.08)"
          size={550}
          initialX="60%"
          initialY="-10%"
          duration={22}
          delay={0}
        />
      </motion.div>
      <motion.div style={{ y: blobY2 }} className="absolute inset-0">
        <GradientBlob
          color1="rgba(107, 158, 114, 0.2)"
          color2="rgba(107, 158, 114, 0.04)"
          size={480}
          initialX="-5%"
          initialY="60%"
          duration={26}
          delay={2}
        />
      </motion.div>
      <motion.div style={{ y: blobY3 }} className="absolute inset-0">
        <GradientBlob
          color1="rgba(212, 168, 67, 0.18)"
          color2="rgba(212, 168, 67, 0.03)"
          size={400}
          initialX="35%"
          initialY="30%"
          duration={20}
          delay={4}
        />
      </motion.div>
      <motion.div style={{ y: blobY4 }} className="absolute inset-0">
        <GradientBlob
          color1="rgba(79, 195, 247, 0.12)"
          color2="rgba(79, 195, 247, 0.02)"
          size={350}
          initialX="15%"
          initialY="10%"
          duration={28}
          delay={1}
        />
      </motion.div>

      {/* Floating particles */}
      {particles.map((p) => (
        <FloatingParticle key={p.id} {...p} />
      ))}

      {/* Subtle grid overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  )
}

// ─── Section Background Gradient ───
function SectionGradient({ variant = 'default' }: { variant?: 'default' | 'alt' | 'cta' }) {
  const gradients = {
    default: 'bg-gradient-to-b from-transparent via-copper/[0.02] to-transparent',
    alt: 'bg-gradient-to-b from-secondary/20 via-sage/[0.03] to-secondary/20',
    cta: 'bg-gradient-to-b from-transparent via-copper/[0.04] to-transparent',
  }
  return <div className={`absolute inset-0 pointer-events-none ${gradients[variant]}`} />
}

export default function HomePage() {
  const { t } = useI18n()
  const router = useRouter()
  const { scrollY } = useScroll()

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

  // Parallax for hero text
  const heroTextY = useTransform(scrollY, [0, 600], [0, 80])

  return (
    <div className="flex-1 relative">
      {/* Animated background spanning entire page */}
      <HeroBackground scrollY={scrollY} />

      {/* Hero section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">

        <motion.div
          style={{ y: heroTextY }}
          className="relative z-10 max-w-4xl mx-auto px-4 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-copper/10 border border-copper/20 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-2 h-2 rounded-full bg-copper animate-pulse" />
              <span className="text-sm font-medium text-copper">{t.heroBadge}</span>
            </motion.div>
            <motion.h1
              className="text-hero-xl font-display font-black tracking-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-foreground">{t.heroTitlePrefix}</span><br />
              <span className="text-gradient-hero">{t.heroTitleHighlight}</span>
            </motion.h1>
            <motion.p
              className="text-hero-sub text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {t.appDescription}
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.button
                onClick={() => router.push('/calculator')}
                className="btn-shimmer flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-copper to-copper-dark text-white font-display font-bold text-base shadow-xl shadow-copper/25 hover:shadow-copper/40 transition-shadow"
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {t.navCalculator || 'Open Calculator'}<ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={() => router.push('/register')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-border text-foreground font-display font-semibold text-sm hover:border-copper/40 hover:bg-copper/5 transition-all"
                whileHover={{ y: -1, borderColor: 'rgba(199, 125, 58, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <UserPlus className="w-4 h-4" />{t.register}
              </motion.button>
            </motion.div>
            <motion.p
              className="text-xs text-muted-foreground mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              {t.noRegistrationRequired}
            </motion.p>
          </motion.div>
        </motion.div>


      </section>

      {/* Features */}
      <section className="py-24 px-4 relative">
        <SectionGradient variant="default" />
        <div className="max-w-6xl mx-auto relative z-10">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-section-title font-display font-bold mb-4">{t.featuresTitle}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t.featuresSubtitle}</p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <ScrollReveal key={i} delay={i * 0.08} direction={i % 3 === 0 ? 'left' : i % 3 === 2 ? 'right' : 'up'}>
                <motion.div
                  className="glass-card-interactive p-6 h-full group cursor-default"
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <motion.div
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-copper/15 to-gold/10 flex items-center justify-center text-copper mb-4"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    {feat.icon}
                  </motion.div>
                  <h3 className="font-display font-bold text-base mb-2 group-hover:text-copper transition-colors duration-300">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 relative">
        <SectionGradient variant="alt" />
        <div className="max-w-5xl mx-auto relative z-10">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-section-title font-display font-bold mb-4">{t.howItWorksTitle}</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 0.15} direction="scale">
                <motion.div
                  className="text-center"
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <motion.div
                    className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-copper to-gold flex items-center justify-center text-white mb-5 shadow-lg shadow-copper/20"
                    whileHover={{ scale: 1.08, rotate: 3 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    {step.icon}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 border-copper flex items-center justify-center">
                      <span className="text-[9px] font-bold text-copper">{step.num}</span>
                    </div>
                  </motion.div>
                  <h3 className="font-display font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>

          {/* Connecting line between steps (desktop) */}
          <div className="hidden md:block absolute top-[calc(50%+2rem)] left-1/2 -translate-x-1/2 w-2/3 h-px">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-copper/30 to-transparent" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 relative">
        <SectionGradient variant="cta" />
        <div className="relative z-10">
          <ScrollReveal direction="scale">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-hero-md font-display font-bold mb-4">
                {t.ctaTitlePrefix} <span className="text-gradient-copper">{t.ctaTitleHighlight}</span> {t.ctaTitleSuffix}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">{t.ctaSubtitle}</p>
              <motion.button
                onClick={() => router.push('/calculator')}
                className="btn-shimmer inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-copper to-copper-dark text-white font-display font-bold shadow-xl shadow-copper/25"
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {t.navCalculator || 'Open Calculator'} <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
