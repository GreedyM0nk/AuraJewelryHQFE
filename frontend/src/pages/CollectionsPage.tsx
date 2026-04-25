import React, { useState } from 'react'
import { Link } from 'react-router-dom'
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

const CollectionsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined)

  const { data: categories, isLoading: catsLoading } = useCategories()
  const { data: products, isLoading, isError, refetch } = useProducts(activeCategory)

  const filterTabs = [
    { id: undefined, label: 'All Collections' },
    ...(categories ?? []).map((c) => ({ id: c.id, label: c.name })),
  ]

  return (
    <PageWrapper>
      <SEO
        title="Collections — Aura Jewellery HQ"
        description="Explore our curated collections — from delicate charms to statement necklaces. Each piece handcrafted in Kolkata."
      />
      <main className="pt-24 pb-16 min-h-screen">
        <section className="py-16 text-center px-4">
          <p className="font-accent text-brand-gold/60 text-xs tracking-[0.4em] uppercase mb-4">
            Curated for You
          </p>
          <h1 className="font-display text-6xl md:text-7xl font-light gold-gradient-text mb-6">
            Collections
          </h1>
          <p className="font-body text-brand-cream/60 text-sm max-w-md mx-auto mb-8">
            Every piece is born from Kolkata's centuries-old goldsmithing tradition —
            handcrafted by artisans who pour their heritage into every detail.
          </p>
          <GoldDivider className="max-w-xs mx-auto" />
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!activeCategory && !catsLoading && (categories ?? []).length > 0 && (
            <section className="mb-16">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-brand-gold/10">
                {(categories ?? []).map((cat) => (
                  <motion.button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="group relative overflow-hidden aspect-square bg-brand-black text-left"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.25 }}
                  >
                    <img
                      src={cat.image_url ?? 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&q=80'}
                      alt={cat.name}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      <span className="font-display text-2xl md:text-3xl font-light text-brand-cream group-hover:text-brand-gold transition-colors duration-200">
                        {cat.name}
                      </span>
                      <span className="font-accent text-[10px] tracking-widest uppercase text-brand-gold/60 mt-2">
                        View Collection
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </section>
          )}

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

          {isLoading && (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-6 py-20 text-center">
              <p className="font-body text-brand-cream/50 text-sm">Could not load products.</p>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw size={14} /> Retry
              </Button>
            </div>
          )}

          {!isLoading && !isError && (products ?? []).length === 0 && (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <span className="font-display text-6xl text-brand-gold/20">AJ</span>
              <p className="font-body text-brand-cream/50 text-sm">No pieces found.</p>
            </div>
          )}

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

          {activeCategory && (
            <div className="flex justify-center mt-12">
              <Link
                to="/shop"
                className="font-accent text-xs tracking-widest uppercase px-8 py-3 border border-brand-gold/40 text-brand-gold hover:bg-brand-gold hover:text-brand-black transition-all duration-200"
              >
                Browse All Pieces
              </Link>
            </div>
          )}
        </div>
      </main>
    </PageWrapper>
  )
}

export default CollectionsPage
