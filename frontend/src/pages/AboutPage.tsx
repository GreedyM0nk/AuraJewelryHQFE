import React from 'react'
import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { CTAStrip } from '@/components/home/CTAStrip'
import { SEO } from '@/components/SEO'

const STORY_SECTIONS = [
  {
    id: 'origin',
    eyebrow: 'Our Origin',
    heading: 'Rooted in Kolkata',
    body: "Aura Jewellery HQ was born on the narrow lanes of Kolkata's jewellery quarter, where three generations of our family have shaped gold into stories. What began as a single workshop bench has grown into a studio that blends heritage craftsmanship with contemporary design.",
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&q=80',
    imageAlt: 'Artisan working with gold',
    reverse: false,
  },
  {
    id: 'craftsmanship',
    eyebrow: 'The Craft',
    heading: 'Made by Hand, Made to Last',
    body: 'Every piece that leaves our workshop passes through the hands of artisans trained in techniques passed down for centuries — filigree, granulation, hand-engraving. We use ethically sourced gold and gemstones, and every detail is finished by hand. No assembly lines, no shortcuts.',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
    imageAlt: 'Close-up of handcrafted gold bracelet',
    reverse: true,
  },
  {
    id: 'sustainability',
    eyebrow: 'Our Promise',
    heading: 'Jewellery That Tells Your Story',
    body: "We believe jewellery is more than adornment — it's memory, identity, love. Each piece is designed to be worn every day and passed down through generations. Whether you're choosing a gift or treating yourself, we're here to help you find the piece that speaks to you.",
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80',
    imageAlt: 'Delicate gold charm on a wrist',
    reverse: false,
  },
]

const STATS = [
  { value: '3', label: 'Generations of craftspeople' },
  { value: '500+', label: 'Unique designs' },
  { value: '22k', label: 'Gold purity standard' },
  { value: '100%', label: 'Handcrafted in Kolkata' },
]

const AboutPage: React.FC = () => {
  return (
    <PageWrapper>
      <SEO
        title="About Us — Aura Jewellery HQ"
        description="Three generations of goldsmiths from Kolkata. Learn the story behind every handcrafted piece at Aura Jewellery HQ."
      />
      <main className="pt-24 pb-0 min-h-screen">
        <section className="py-16 text-center px-4">
          <p className="font-accent text-brand-gold/60 text-xs tracking-[0.4em] uppercase mb-4">Our Story</p>
          <h1 className="font-display text-6xl md:text-7xl font-light gold-gradient-text mb-6">About Us</h1>
          <p className="font-body text-brand-cream/60 text-sm max-w-lg mx-auto mb-8">
            Three generations of Kolkata goldsmiths, one unwavering commitment to the craft.
          </p>
          <GoldDivider className="max-w-xs mx-auto" />
        </section>

        <section className="border-y border-brand-gold/20 py-10 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <p className="font-display text-4xl md:text-5xl font-light gold-gradient-text mb-2">{stat.value}</p>
                <p className="font-accent text-[10px] tracking-widest uppercase text-brand-cream/50">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
          {STORY_SECTIONS.map((section, i) => (
            <motion.section
              key={section.eyebrow}
              id={section.id}
              className={`flex flex-col ${section.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
            >
              <div className="w-full lg:w-1/2 aspect-[4/3] overflow-hidden">
                <img src={section.image} alt={section.imageAlt} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="w-full lg:w-1/2 space-y-6">
                <p className="font-accent text-brand-gold text-xs tracking-[0.35em] uppercase">{section.eyebrow}</p>
                <h2 className="font-display text-4xl md:text-5xl font-light text-brand-cream">{section.heading}</h2>
                <GoldDivider className="max-w-[80px]" />
                <p className="font-body text-brand-cream/65 text-base leading-relaxed">{section.body}</p>
              </div>
            </motion.section>
          ))}

          <section id="careers" className="border border-brand-gold/20 bg-brand-black/40 p-6 md:p-8">
            <p className="font-accent text-brand-gold text-xs tracking-[0.35em] uppercase mb-3">Careers</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-brand-cream mb-3">Join Our Atelier</h2>
            <p className="font-body text-brand-cream/65 text-sm leading-relaxed">
              We are not actively hiring right now. If you are a designer, artisan, or storyteller passionate about handcrafted jewellery, write to us at careers@aurajewelleryhq.com and we will reach out when roles open.
            </p>
          </section>

          <section id="press" className="border border-brand-gold/20 bg-brand-black/40 p-6 md:p-8">
            <p className="font-accent text-brand-gold text-xs tracking-[0.35em] uppercase mb-3">Press</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-brand-cream mb-3">Media & Enquiries</h2>
            <p className="font-body text-brand-cream/65 text-sm leading-relaxed">
              For media kits, founder interviews, and brand assets, please contact press@aurajewelleryhq.com. We are preparing a full press room and will publish updates soon.
            </p>
          </section>
        </div>

        <CTAStrip />
      </main>
    </PageWrapper>
  )
}

export default AboutPage