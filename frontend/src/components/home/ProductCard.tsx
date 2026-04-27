import React from 'react'
import { ShoppingBag, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { useCart } from '@/hooks/useCart'
import { useWishlistStore } from '@/store/wishlistStore'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    price
  )

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem, toggleCart } = useCart()
  const { toggleItem, isWishlisted } = useWishlistStore()
  const wishlisted = isWishlisted(product.id)
  const lowStock = product.stock_quantity > 0 && product.stock_quantity < 5

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    toggleCart?.()
  }

  return (
    <article className="group relative overflow-hidden rounded-none border border-transparent hover:border-brand-gold/40 transition-all duration-500 hover:shadow-[0_8px_40px_rgba(201,168,76,0.15)] flex flex-col bg-brand-charcoal">
      {/* Image */}
      <div className="overflow-hidden aspect-square relative bg-brand-black">
        {/* Gold top border on hover */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center z-10" />

        <Link to={`/products/${product.id}`} aria-label={`View ${product.name}`}>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-accent text-brand-gold/20 text-4xl">AJ</span>
            </div>
          )}
        </Link>

        {product.isNew && (
          <span className="absolute top-3 left-3 z-10 bg-brand-gold text-brand-black font-accent text-[10px] tracking-widest px-2 py-1 uppercase">
            New
          </span>
        )}

        {/* Low stock badge */}
        {lowStock && (
          <div className={`absolute left-3 z-10 ${product.isNew ? 'top-10' : 'top-3'}`}>
            <Badge variant="danger">Only {product.stock_quantity} left</Badge>
          </div>
        )}

        {/* Wishlist button — appears on hover */}
        <button
          aria-label={`Wishlist ${product.name}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleItem(product) }}
          className={`absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center ${
            wishlisted ? 'text-red-400' : 'text-brand-cream/40 hover:text-red-400'
          }`}
        >
          <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Add to Cart overlay — slides up from bottom on group hover */}
        <button
          className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-[400ms] ease-out bg-brand-gold px-4 py-3 flex items-center justify-center gap-2 cursor-pointer z-10"
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to cart`}
          disabled={product.stock_quantity === 0}
        >
          <ShoppingBag size={14} className="text-brand-black" />
          <span className="font-accent text-xs tracking-widest text-brand-black">ADD TO CART</span>
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1 flex-1">
        <Link
          to={`/products/${product.id}`}
          className="font-accent text-brand-cream text-xs tracking-widest uppercase truncate hover:text-brand-gold"
        >
          {product.name}
        </Link>
        {product.description && (
          <p className="font-body text-brand-cream/50 text-xs line-clamp-2 mt-0.5">
            {product.description}
          </p>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="font-body text-brand-gold font-semibold text-sm">
            {formatPrice(product.price)}
          </span>
          {product.stock_quantity === 0 && (
            <Badge variant="neutral">Sold Out</Badge>
          )}
        </div>
      </div>

      {/* Visible add-to-cart button (non-hover, accessible) */}
      <div className="px-4 pb-4 group-hover:opacity-0 transition-opacity duration-200">
        <button
          className="w-full border border-brand-gold/30 text-brand-gold/70 font-accent text-xs tracking-widest uppercase py-2 hover:bg-brand-gold hover:text-brand-black transition-all duration-200"
          onClick={handleAddToCart}
          disabled={product.stock_quantity === 0}
          aria-label={`Add ${product.name} to cart`}
        >
          {product.stock_quantity === 0 ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>
    </article>
  )
}
