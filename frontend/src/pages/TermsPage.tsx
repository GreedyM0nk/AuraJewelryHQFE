import React from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { GoldDivider } from '@/components/ui/GoldDivider'

const TermsPage: React.FC = () => {
  return (
    <PageWrapper>
      <main className="pt-28 pb-16 min-h-screen px-4">
        <section className="max-w-3xl mx-auto border border-brand-gold/20 bg-brand-black/50 p-6">
          <p className="font-accent text-brand-gold/70 text-xs tracking-[0.35em] uppercase text-center mb-2">
            Terms of Service
          </p>
          <h1 className="font-display text-4xl text-center gold-gradient-text mb-3">Terms</h1>
          <GoldDivider className="max-w-xs mx-auto" />
          <div className="mt-6 space-y-4 text-brand-cream/80 leading-relaxed">
            <p>
              Products sold by Aura Jewellery HQ are handcrafted and may include slight variations that are
              part of the design character.
            </p>
            <p>
              Orders are delivered within India only. Standard delivery windows are shared during checkout.
            </p>
            <p>
              Eligible items can be returned within 30 days from delivery date, subject to condition and
              verification.
            </p>
          </div>
        </section>
      </main>
    </PageWrapper>
  )
}

export default TermsPage
