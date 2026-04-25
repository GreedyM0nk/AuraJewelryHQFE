import React from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { HeroSection } from '@/components/home/HeroSection'
import { TrustBar } from '@/components/home/TrustBar'
import { CategoryStrip } from '@/components/home/CategoryStrip'
import { ProductGrid } from '@/components/home/ProductGrid'
import { AboutSection } from '@/components/home/AboutSection'
import { CTAStrip } from '@/components/home/CTAStrip'
import { SEO } from '@/components/SEO'

const HomePage: React.FC = () => {
  return (
    <PageWrapper>
      <SEO
        title="Handcrafted Jewellery from Kolkata"
        description="Aura Jewellery HQ — Handcrafted charms, bracelets and necklaces rooted in Kolkata's goldsmithing heritage. Discover pieces that tell your story."
      />
      <main>
        <HeroSection />
        <TrustBar />
        <CategoryStrip />
        <ProductGrid />
        <AboutSection />
        <CTAStrip />
      </main>
    </PageWrapper>
  )
}

export default HomePage
