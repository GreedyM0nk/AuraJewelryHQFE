import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { ProductCard } from '@/components/home/ProductCard'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { RefreshCw } from 'lucide-react'
import { SEO } from '@/components/SEO'

const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') ?? undefined
  const [activeCategory, setActiveCategory] = useState<string | undefined>(initialCategory)

  const { data: categories } = useCategories()
  const { data: products, isLoading, isError, refetch } = useProducts(activeCategory)

  const filterTabs = [
    { id: undefined, label: 'All Pieces' },
    ...(categories ?? []).map((c) => ({ id: c.id, label: c.name })),
  ]

  return (
    <PageWrapper>
      <SEO
        title="Shop — All Jewellery"
        description="Browse our full collection of handcrafted charms, bracelets, necklaces and rings. Each piece made with love in Kolkata."
      />
      <main className="pt-24 pb-16 min-h-screen">
        {/* Page header */}
        <section className="py-16 text-center px-4">
          <p className="font-accent text-brand-gold/60 text-xs tracking-[0.4em] uppercase mb-4">
            The Full Collection
          </p>
          <h1 className="font-display text-6xl md:text-7xl font-light gold-gradient-text mb-6">
            Shop
          </h1>
          <GoldDivider className="max-w-xs mx-auto" />
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12" role="tablist">
            {filterTabs.map((tab) => (
              <button
                key={tab.id ?? 'all'}
                role="tab"
                aria-selected={activeCategory === tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`font-accent text-xs tracking-widest uppercase px-5 py-2 border transition-all duration-200 ${
                  activeCategory === tab.id
                    ? 'bg-brand-gold text-brand-black border-brand-gold'
                    : 'bg-transparent text-brand-cream/60 border-brand-cream/20 hover:border-brand-gold hover:text-brand-gold'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="flex flex-col items-center gap-6 py-20 text-center">
              <p className="font-body text-brand-cream/50 text-sm">
                Could not load products. Please try again.
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw size={14} />
                Retry
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && (products ?? []).length === 0 && (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <span className="font-display text-6xl text-brand-gold/20">AJ</span>
              <p className="font-body text-brand-cream/50 text-sm">
                No pieces found in this category.
              </p>
            </div>
          )}

          {/* Grid */}
          {!isLoading && !isError && (products ?? []).length > 0 && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-brand-gold/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {(products ?? []).map((product) => (
                <div key={product.id} className="bg-brand-black">
                  <ProductCard product={product} />
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </PageWrapper>
  )
}

export default ProductsPage
