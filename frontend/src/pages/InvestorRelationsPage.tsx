import React from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { SEO } from '@/components/SEO'

const KPI_ITEMS = [
  { label: 'Annual Revenue', value: '₹90.9L' },
  { label: 'Total Orders', value: '293' },
  { label: 'Active Customers', value: '30' },
  { label: 'Products', value: '12' },
]

const InvestorRelationsPage: React.FC = () => {
  return (
    <PageWrapper>
      <SEO
        title="Investor Relations"
        description="Investor relations updates, ESG priorities, and annual reporting highlights for Aura Jewellery HQ."
      />

      <main className="pt-24 pb-16 min-h-screen px-4">
        <section className="max-w-6xl mx-auto text-center mb-12">
          <p className="font-accent text-brand-gold/70 text-xs tracking-[0.35em] uppercase mb-3">Corporate Updates</p>
          <h1 className="font-display text-5xl md:text-6xl gold-gradient-text mb-3">Investor Relations</h1>
          <p className="font-body text-brand-cream/70 max-w-2xl mx-auto">
            Transparent updates for long-term stakeholders across performance, governance, and sustainability.
          </p>
          <GoldDivider className="max-w-xs mx-auto mt-6" />
        </section>

        <section className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {KPI_ITEMS.map((item) => (
            <div key={item.label} className="border border-brand-gold/20 bg-brand-black/50 p-4 text-center">
              <p className="font-display text-3xl gold-gradient-text">{item.value}</p>
              <p className="font-accent text-[10px] tracking-widest uppercase text-brand-cream/55 mt-1">{item.label}</p>
            </div>
          ))}
        </section>

        <section id="esg" className="max-w-5xl mx-auto border border-brand-gold/20 bg-brand-black/40 p-6 md:p-8 mb-10 scroll-mt-28">
          <p className="font-accent text-brand-gold text-xs tracking-[0.35em] uppercase mb-2">ESG</p>
          <h2 className="font-display text-3xl text-brand-cream mb-4">Environmental, Social, and Governance</h2>
          <div className="space-y-3 text-brand-cream/80 leading-relaxed font-body">
            <p>
              Aura Jewellery HQ follows responsible sourcing standards for precious materials, with a preference for vetted
              partners and transparent supply-chain documentation.
            </p>
            <p>
              Our social priorities include artisan development, fair compensation, and preservation of Kolkata craftsmanship.
              Governance practices emphasize control on inventory, order lifecycle visibility, and audit-ready data trails.
            </p>
          </div>
        </section>

        <section id="annual" className="max-w-5xl mx-auto border border-brand-gold/20 bg-brand-black/40 p-6 md:p-8 scroll-mt-28">
          <p className="font-accent text-brand-gold text-xs tracking-[0.35em] uppercase mb-2">Annual Report</p>
          <h2 className="font-display text-3xl text-brand-cream mb-4">Annual Performance Highlights</h2>
          <div className="space-y-3 text-brand-cream/80 leading-relaxed font-body">
            <p>
              The current annual cycle reflects consistent multi-channel growth, with stronger conversion from online and
              in-store channels and improved fulfillment progression through delivered orders.
            </p>
            <p>
              Product mix concentration and inventory risk are monitored through live analytics, enabling proactive restocking
              and pricing decisions. Detailed financial documents are shared with stakeholders through controlled channels.
            </p>
          </div>
        </section>
      </main>
    </PageWrapper>
  )
}

export default InvestorRelationsPage
