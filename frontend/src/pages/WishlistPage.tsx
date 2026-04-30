import React from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useWishlistStore } from '@/store/wishlistStore'
import { ProductCard } from '@/components/home/ProductCard'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { SEO } from '@/components/SEO'
import { useCart } from '@/hooks/useCart'

const WishlistPage: React.FC = () => {
  const { items, clearWishlist, toggleItem } = useWishlistStore()
  const { addItem, toggleCart } = useCart()

  return (
    <PageWrapper>
      <SEO
        title="Your Wishlist"
        description="Your saved jewellery pieces from Aura Jewellery HQ. Handcrafted charms, bracelets and necklaces from Kolkata."
      />
      <main className="pt-24 sm:pt-28 pb-16 min-h-screen px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 sm:mb-12 gap-3">
            <div>
              <p className="font-accent text-brand-gold/60 text-xs tracking-[0.35em] uppercase mb-3">Saved Pieces</p>
              <h1 className="font-display text-4xl sm:text-5xl gold-gradient-text">Your Wishlist</h1>
              <p className="font-body text-brand-cream/45 text-xs sm:text-sm mt-2">
                {items.length} saved {items.length === 1 ? 'piece' : 'pieces'}
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={clearWishlist}
                className="font-body text-brand-cream/30 text-xs hover:text-red-400 transition-colors min-h-[44px] px-2"
              >
                Clear all
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-5 py-16 sm:py-24 text-center border border-brand-gold/15 bg-brand-black/35">
              <Heart size={48} className="text-brand-gold/20" />
              <p className="font-display text-2xl text-brand-cream/40 italic">Your wishlist is empty</p>
              <Link to="/shop" className="font-accent text-xs text-brand-gold tracking-widest hover:underline uppercase">
                Browse Collection {'->'}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-brand-gold/10">
              {items.map((product) => (
                <div key={product.id} className="bg-brand-black flex flex-col">
                  <ProductCard product={product} />
                  <button
                    onClick={() => {
                      addItem(product, 1)
                      toggleItem(product)
                      toggleCart?.()
                    }}
                    className="w-full font-accent text-xs tracking-widest uppercase py-2.5 border-t border-brand-gold/20 text-brand-gold/70 hover:bg-brand-gold hover:text-brand-black transition-all duration-200"
                  >
                    Move to Cart {'->'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </PageWrapper>
  )
}

export default WishlistPage
