import React from 'react'
import { Award, Sparkles, RefreshCw, Truck } from 'lucide-react'

const trustItems = [
  {
    icon: Award,
    label: 'Hallmark Certified',
    sublabel: 'Verified quality and authenticity',
  },
  {
    icon: Sparkles,
    label: 'Handcrafted in Kolkata',
    sublabel: 'Made by master local artisans',
  },
  {
    icon: RefreshCw,
    label: '30-Day Returns',
    sublabel: 'Hassle-free return support',
  },
  {
    icon: Truck,
    label: 'Free Shipping above ₹2,000',
    sublabel: 'Secure insured delivery across India',
  },
]

export const TrustBar: React.FC = () => {
  return (
    <section className="bg-brand-charcoal border-y border-brand-gold/15 px-4" aria-label="Trust highlights">
      <div className="max-w-7xl mx-auto py-5 grid grid-cols-2 md:flex md:items-center md:justify-around gap-4 md:gap-6">
        {trustItems.map(({ icon: Icon, label, sublabel }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon size={18} className="text-brand-gold flex-shrink-0" />
            <div>
              <p className="font-accent text-xs tracking-widest text-brand-cream uppercase">{label}</p>
              <p className="font-body text-xs text-brand-cream/50 mt-0.5">{sublabel}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
