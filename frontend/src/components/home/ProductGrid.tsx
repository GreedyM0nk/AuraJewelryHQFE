import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { ProductCard } from './ProductCard'
import { GoldDivider } from '@/components/ui/GoldDivider'

const SkeletonCard: React.FC = () => (
  <div className="animate-pulse">
    <div className="aspect-square bg-brand-charcoal/80" />
    <div className="mt-3 h-4 bg-brand-charcoal/80 w-3/4" />
    <div className="mt-2 h-4 bg-brand-charcoal/60 w-1/3" />
  </div>
)

const headingVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export const ProductGrid: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined)
  const { data: categories } = useCategories()
  const { data: products, isLoading, isError, refetch } = useProducts(activeCategory)

  const filterTabs = [
    { id: undefined, label: 'All' },
    ...(categories ?? []).map((c) => ({ id: c.id, label: c.name })),
  ]

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto" aria-label="Product collection" id="collection">
      <motion.div
        className="text-center mb-4"
        variants={headingVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h2 className="font-display text-5xl md:text-6xl font-light gold-gradient-text">Our Collection</h2>
      </motion.div>
      <GoldDivider className="max-w-xs mx-auto mb-10" />

      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 mb-12">
        <div className="flex gap-2 min-w-max pb-1 items-center justify-start sm:justify-center" role="tablist" aria-label="Filter by category">
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
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-20">
          <p className="font-accent text-brand-gold/60 tracking-widest text-sm mb-4">
            UNABLE TO LOAD COLLECTION
          </p>
          <button
            onClick={() => refetch()}
            className="border border-brand-gold/40 text-brand-cream px-6 py-2 font-accent text-xs tracking-widest hover:border-brand-gold transition-colors"
          >
            TRY AGAIN
          </button>
        </div>
      )}

      {!isLoading && !isError && (products ?? []).length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <span className="font-display text-6xl text-brand-gold/20">AJ</span>
          <p className="font-body text-brand-cream/50 text-sm">No pieces found in this category.</p>
        </div>
      )}

      {!isLoading && !isError && (products ?? []).length > 0 && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-brand-gold/10"
          variants={gridVariants}
          initial="hidden"
          animate="visible"
        >
          {(products ?? []).map((product, index) => (
            <motion.div key={product.id} className="bg-brand-black" variants={cardVariants} custom={index}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  )
}
