import React from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { GoldDivider } from '@/components/ui/GoldDivider'

const PrivacyPolicyPage: React.FC = () => {
  return (
    <PageWrapper>
      <main className="pt-28 pb-16 min-h-screen px-4">
        <section className="max-w-3xl mx-auto border border-brand-gold/20 bg-brand-black/50 p-6">
          <p className="font-accent text-brand-gold/70 text-xs tracking-[0.35em] uppercase text-center mb-2">
            Privacy Policy
          </p>
          <h1 className="font-display text-4xl text-center gold-gradient-text mb-3">Your Privacy</h1>
          <GoldDivider className="max-w-xs mx-auto" />
          <div className="mt-6 space-y-4 text-brand-cream/80 leading-relaxed">
            <p>
              Aura Jewellery HQ collects customer name, email, phone, and country only to process orders,
              provide updates, and support deliveries.
            </p>
            <p>
              We do not sell your personal data. Order and account details are used only for service
              operations and customer communication.
            </p>
            <p>
              If you want your data removed, contact us at hello@aurajewellery.in and we will process your
              request.
            </p>
          </div>
        </section>
      </main>
    </PageWrapper>
  )
}

export default PrivacyPolicyPage
