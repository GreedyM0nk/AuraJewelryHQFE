import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import axiosClient from '@/api/axiosClient'
import { Spinner } from '@/components/ui/Spinner'

export const CTAStrip: React.FC = () => {
  const [email, setEmail] = useState('')
  const [subState, setSubState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubscribe = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim()) {
      setSubState('error')
      return
    }

    setSubState('loading')
    try {
      await axiosClient.post('/newsletter', { email: email.trim() })
      setSubState('success')
    } catch {
      setSubState('error')
    }
  }

  return (
    <motion.section
      className="py-16 px-4 bg-gradient-to-r from-brand-black via-brand-charcoal to-brand-black"
      aria-label="Newsletter and WhatsApp signup"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7 }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <p className="font-accent text-xs tracking-[0.4em] text-brand-gold uppercase mb-3">Stay Connected</p>
        <h2 className="font-display text-4xl text-brand-cream mb-4">
          Get Exclusive Offers & New Arrivals
        </h2>
        <p className="font-body text-brand-cream/60 mb-8 max-w-md mx-auto">
          Join our community for early access to new collections, festival offers, and behind-the-scenes
          craftsmanship stories.
        </p>

        <div className="flex gap-4 justify-center flex-wrap items-center">
          {subState === 'success' ? (
            <p className="text-brand-gold font-accent text-xs tracking-widest">You are on the list!</p>
          ) : (
            <form className="flex flex-col items-center" onSubmit={handleSubscribe}>
              <div className="flex gap-3 flex-wrap justify-center">
                <input
                  type="email"
                  id="newsletter-email"
                  name="newsletter-email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  className="bg-transparent border border-brand-gold/40 text-brand-cream px-4 py-3 text-sm font-body placeholder:text-brand-cream/30 focus:outline-none focus:border-brand-gold w-64"
                  aria-label="Email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={subState === 'loading'}
                />
                <button
                  type="submit"
                  className="bg-brand-gold text-brand-black px-6 py-3 font-accent text-xs tracking-widest hover:bg-brand-gold-light transition-colors min-w-32"
                  disabled={subState === 'loading'}
                >
                  {subState === 'loading' ? <Spinner size="sm" /> : 'SUBSCRIBE'}
                </button>
              </div>
              {subState === 'error' && (
                <p className="text-red-400 text-sm mt-2">Please enter a valid email</p>
              )}
            </form>
          )}

          <a
            href="https://wa.me/919000000000?text=Hi!%20I%27m%20interested%20in%20Aura%20Jewellery"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-brand-gold/40 text-brand-cream px-6 py-3 hover:border-brand-gold hover:text-brand-gold transition-all font-accent text-xs tracking-widest"
          >
            <MessageCircle size={14} /> WHATSAPP US
          </a>
        </div>
      </div>
    </motion.section>
  )
}
