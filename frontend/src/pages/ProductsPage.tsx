import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { ProductCard } from '@/components/home/ProductCard'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { Button } from '@/components/ui/Button'
import { ProductCardSkeleton } from '@/components/ui/ProductCardSkeleton'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { RefreshCw } from 'lucide-react'
import { SEO } from '@/components/SEO'

const ProductsPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') ?? undefined
  const search = searchParams.get('search') ?? undefined
  const sort = searchParams.get('sort') ?? undefined

  const { data: categories } = useCategories()
  const { data: products, isLoading, isError, refetch } = useProducts(activeCategory, search, sort)

  const filterTabs = [
    { id: undefined, label: 'All Pieces' },
    ...(categories ?? []).map((c) => ({ id: c.id, label: c.name })),
  ]
  const activeCategoryName = activeCategory
    ? (categories ?? []).find((c) => c.id === activeCategory)?.name ?? 'Selected'
    : null

  const handleTabClick = (categoryId: string | undefined) => {
    const params = new URLSearchParams(searchParams)
    if (categoryId) {
      params.set('category', categoryId)
    } else {
      params.delete('category')
    }
    const query = params.toString()
    navigate(query ? `/shop?${query}` : '/shop', { replace: true })
  }

  return (
    <PageWrapper>
      <SEO
        title="Shop — All Jewellery"
        description="Browse our full collection of handcrafted charms, bracelets, necklaces and rings. Each piece made with love in Kolkata."
      />
      <main className="pt-24 sm:pt-28 pb-16 min-h-screen px-4">
        {/* Page header */}
        <section className="py-8 sm:py-10 text-center">
          <p className="font-accent text-brand-gold/60 text-xs tracking-[0.4em] uppercase mb-4">
            The Full Collection
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-light gold-gradient-text mb-3">
            Shop
          </h1>
          <p className="font-body text-brand-cream/45 text-xs sm:text-sm max-w-md mx-auto mb-6">
            Discover handcrafted pieces designed to be worn today and treasured for years.
          </p>
          <GoldDivider className="max-w-xs mx-auto" />
        </section>

        <div className="max-w-7xl mx-auto sm:px-2 lg:px-4">
          {/* Filter tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mb-1 mb-12" role="tablist">
            {filterTabs.map((tab) => (
              <button
                key={tab.id ?? 'all'}
                role="tab"
                aria-selected={activeCategory === tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`font-accent text-xs tracking-widest uppercase px-5 py-2 border transition-all duration-200 flex-shrink-0 ${
                  activeCategory === tab.id
                    ? 'bg-brand-gold text-brand-black border-brand-gold'
                    : 'bg-transparent text-brand-cream/60 border-brand-cream/20 hover:border-brand-gold hover:text-brand-gold'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
            <div className="flex items-center gap-2 flex-wrap">
              {activeCategoryName && (
                <span className="font-body text-[11px] text-brand-gold border border-brand-gold/30 px-2 py-1 uppercase tracking-widest">
                  {activeCategoryName}
                </span>
              )}
              {search && (
                <span className="font-body text-[11px] text-brand-cream/70 border border-brand-cream/20 px-2 py-1">
                  Search: {search}
                </span>
              )}
              {(activeCategory || sort || search) && (
                <button
                  type="button"
                  onClick={() => navigate('/shop', { replace: true })}
                  className="font-body text-[11px] text-brand-cream/55 hover:text-brand-gold min-h-[32px] px-2"
                >
                  Reset filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
            <label htmlFor="sort" className="font-body text-brand-cream/40 text-xs">Sort by</label>
            <select
              id="sort"
              value={sort ?? ''}
              onChange={(e) => {
                const val = e.target.value
                const params = new URLSearchParams(searchParams)
                if (val) {
                  params.set('sort', val)
                } else {
                  params.delete('sort')
                }
                const query = params.toString()
                navigate(query ? `/shop?${query}` : '/shop', { replace: true })
              }}
              className="bg-brand-charcoal border border-brand-gold/20 text-brand-cream/70 font-body text-xs px-3 py-2 min-h-[44px] focus:outline-none focus:border-brand-gold"
            >
              <option value="">Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-brand-gold/10">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
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
