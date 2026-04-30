import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { GoldDivider } from '@/components/ui/GoldDivider'

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
  'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&q=80',
  'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=600&q=80',
  'https://images.unsplash.com/photo-1573408301185-9519f94b4e15?w=600&q=80',
]

export const AboutSection: React.FC = () => {
  const shouldReduce = useReducedMotion()

  return (
    <section
      id="about"
      className="py-24 px-4 max-w-7xl mx-auto"
      aria-label="About Aura Jewellery"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Text column */}
        <motion.div
          initial={{ opacity: 0, x: shouldReduce ? 0 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, delay: 0 }}
        >
          <span className="font-accent text-xs tracking-[0.4em] text-brand-gold uppercase mb-3 block">
            Our Story
          </span>
          <h2 className="font-display text-5xl md:text-6xl font-light text-brand-cream mb-6 leading-tight">
            Rooted in Kolkata's
            <br />
            <span className="italic gold-gradient-text">Golden Craft</span>
          </h2>
          <GoldDivider className="mb-8" />

          <div className="space-y-5 font-body text-brand-cream/65 text-base leading-relaxed">
            <p>
              Born in the heart of Kolkata's Bow Bazar — India's oldest jewellery district — Aura
              Jewellery HQ was founded on the belief that every piece of jewellery should carry a soul.
            </p>
            <p>
              Our master artisans draw on generations of goldsmithing knowledge, blending ancient
              techniques like <em className="text-brand-cream/80">meenakari</em> and filigree with
              contemporary design sensibilities.
            </p>

            {/* Pull quote */}
            <blockquote className="border-l-2 border-brand-gold pl-6 py-2 my-8">
              <p className="font-display text-2xl font-light italic text-brand-cream/90 leading-snug">
                "We don't just make jewellery. We craft heirlooms that travel through time."
              </p>
              <cite className="font-accent text-brand-gold/60 text-xs tracking-widest uppercase mt-3 block not-italic">
                — Founder, Aura Jewellery HQ
              </cite>
            </blockquote>

            <p>
              From delicate charm bracelets to statement bangles, every creation is a collaboration
              between our designers' vision and the deft hands of craftsmen who have spent decades
              perfecting their art.
            </p>
          </div>
        </motion.div>

        {/* Image grid column — asymmetric editorial layout */}
        <motion.div
          initial={{ opacity: 0, x: shouldReduce ? 0 : 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 grid-rows-2 gap-3 h-[480px]"
        >
          {/* Tall left image spanning 2 rows */}
          <div className="row-span-2 overflow-hidden border border-brand-gold/20 relative">
            <img
              src={PLACEHOLDER_IMAGES[0]}
              alt="Master artisan hand-finishing a gold bracelet under warm studio light"
              loading="lazy"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-black/40 to-transparent" />
          </div>
          {/* Top right image */}
          <div className="overflow-hidden border border-brand-gold/20">
            <img
              src={PLACEHOLDER_IMAGES[1]}
              alt="Close-up of a gemstone-set ring showing detailed filigree work"
              loading="lazy"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          {/* Bottom-right split tile to preserve all 4 images */}
          <div className="grid grid-rows-2 gap-3 min-h-0">
            <div className="overflow-hidden border border-brand-gold/20 relative">
              <img
                src={PLACEHOLDER_IMAGES[2]}
                alt="Traditional meenakari enamel pattern being applied on jewellery"
                loading="lazy"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="overflow-hidden border border-brand-gold/20 relative">
              <img
                src={PLACEHOLDER_IMAGES[3]}
                alt="Curated display of handcrafted necklaces in Aura Jewellery atelier"
                loading="lazy"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-brand-gold/10" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
