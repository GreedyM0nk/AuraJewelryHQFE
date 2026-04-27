import React from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: 'easeOut' },
})

const fadeIn = (delay: number) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.8, delay },
})

export const HeroSection: React.FC = () => {
  const shouldReduce = useReducedMotion()
  const motionProps = (delay: number) => (shouldReduce ? fadeIn(delay) : fadeUp(delay))
  const handleOurStoryClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === '/') {
      event.preventDefault()
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-black"
      aria-label="Hero"
    >
      {/* Radial gold glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(201,168,76,0.12) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
        aria-hidden="true"
      />

      {/* Shimmer layer */}
      <div className="absolute inset-0 shimmer pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Decorative gold line above eyebrow */}
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-brand-gold to-transparent mx-auto mb-6" />

        <motion.p
          className="font-accent text-brand-gold/60 text-xs tracking-[0.4em] uppercase mb-6"
          {...motionProps(0)}
        >
          Kolkata · Est. 2018
        </motion.p>

        {/* Shimmer glow blob behind headline */}
        <div
          className="absolute w-[600px] h-[200px] -translate-x-1/2 left-1/2 bg-brand-gold/5 blur-[80px] rounded-full animate-pulse pointer-events-none"
          aria-hidden="true"
        />

        <motion.h1
          className="font-display font-light text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-none mb-6 gold-gradient-text"
          {...motionProps(0.2)}
        >
          Adorn
          <br />
          <span className="italic">Your Story</span>
        </motion.h1>

        <motion.p
          className="font-body text-brand-cream/60 text-lg md:text-xl tracking-wide mb-10 max-w-xl mx-auto"
          {...motionProps(0.45)}
        >
          Handcrafted Charms &amp; Bracelets — Kolkata, India
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          {...motionProps(0.65)}
        >
          <Button variant="primary" size="lg" as={Link} to="/shop">
            Explore Collection
          </Button>
          <Button variant="ghost" size="lg" as={Link} to="/#about" onClick={handleOurStoryClick}>
            Our Story
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce pointer-events-none"
        aria-hidden="true"
      >
        <span className="font-accent text-xs tracking-[0.3em] text-brand-gold/60">SCROLL</span>
        <div className="w-px h-8 bg-gradient-to-b from-brand-gold/60 to-transparent" />
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-black to-transparent pointer-events-none"
        aria-hidden="true"
      />
    </section>
  )
}
