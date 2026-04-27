import React from 'react'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { SEO } from '@/components/SEO'

const InvestorRelationsPage: React.FC = () => {
  return (
    <PageWrapper>
      <SEO
        title="Investor Relations"
        description="Investor relations updates, ESG priorities, and annual reporting highlights for Aura Jewellery HQ."
      />

      <main className="pt-24 pb-16 min-h-screen px-4">
        <section className="max-w-5xl mx-auto text-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl text-brand-cream mb-3">Investor Relations</h1>
          <p className="font-accent text-brand-gold text-xs tracking-[0.35em] uppercase mb-6">Live Performance Dashboard</p>
          <p className="font-body text-brand-cream/70 max-w-3xl mx-auto leading-relaxed">
            Our live analytics dashboard is currently being configured. It will provide real-time visibility into revenue performance, customer lifetime value, order fulfillment metrics, and inventory health — powered directly by our production data.
          </p>
        </section>

        <section id="annual" className="max-w-5xl mx-auto border border-brand-gold/20 p-6 rounded-sm bg-brand-charcoal mb-8 scroll-mt-28">
          <h2 className="font-display text-3xl text-brand-cream mb-4 flex items-center">
            Annual Performance
            <span className="font-accent text-xs text-brand-gold/60 tracking-widest ml-3 border border-brand-gold/20 px-2 py-0.5">
              COMING SOON
            </span>
          </h2>
          <p className="font-body text-brand-cream/70 leading-relaxed">
            This section will publish audited annual revenue, growth performance, and trend-level business highlights for stakeholders and analysts.
          </p>
        </section>

        <section id="esg" className="max-w-5xl mx-auto border border-brand-gold/20 p-6 rounded-sm bg-brand-charcoal mb-8 scroll-mt-28">
          <h2 className="font-display text-3xl text-brand-cream mb-4 flex items-center">
            ESG Report
            <span className="font-accent text-xs text-brand-gold/60 tracking-widest ml-3 border border-brand-gold/20 px-2 py-0.5">
              COMING SOON
            </span>
          </h2>
          <p className="font-body text-brand-cream/70 leading-relaxed">
            This section will outline sustainability commitments, ethical sourcing initiatives, and governance disclosures across operations.
          </p>
        </section>

        <section className="max-w-5xl mx-auto mt-12">
          <GoldDivider />
          <p className="font-body text-brand-cream/30 text-xs italic mt-4 text-center">
            Financial disclosures prepared in accordance with applicable Indian corporate governance standards. Data sourced from live production systems.
          </p>
        </section>
      </main>
    </PageWrapper>
  )
}

export default InvestorRelationsPage
