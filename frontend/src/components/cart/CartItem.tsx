import React from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useCartStore } from '@/store/cartStore'
import type { CartItem as CartItemType } from '@/types'

interface CartItemProps {
  item: CartItemType
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    price
  )

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart()
  const { product, quantity } = item

  const handleIncrease = () => {
    const currentItems = useCartStore.getState().items
    const current = currentItems.find((i) => i.product.id === product.id)
    if (!current) {
      return
    }
    const maxQty = product.stock_quantity ?? Infinity
    if (current.quantity < maxQty) {
      updateQuantity(product.id, current.quantity + 1)
    }
  }

  const handleDecrease = () => {
    const currentItems = useCartStore.getState().items
    const current = currentItems.find((i) => i.product.id === product.id)
    if (!current) {
      return
    }
    updateQuantity(product.id, current.quantity - 1)
  }

  return (
    <article className="flex gap-4 py-4 border-b border-brand-gold/10" aria-label={product.name}>
      {/* Image */}
      <div className="w-16 h-16 flex-shrink-0 bg-brand-black overflow-hidden border border-brand-gold/20">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-accent text-brand-gold/30 text-sm">AJ</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-accent text-brand-cream text-xs tracking-wider uppercase truncate">
          {product.name}
        </p>
        <p className="font-body text-brand-gold text-sm font-semibold mt-1">
          {formatPrice(product.price)}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-3">
          <button
            aria-label="Decrease quantity"
            className="w-6 h-6 border border-brand-gold/30 text-brand-cream/70 hover:border-brand-gold hover:text-brand-gold flex items-center justify-center transition-colors"
            onClick={handleDecrease}
          >
            <Minus size={10} />
          </button>
          <span className="font-body text-brand-cream text-sm w-6 text-center">{quantity}</span>
          <button
            aria-label="Increase quantity"
            className="w-6 h-6 border border-brand-gold/30 text-brand-cream/70 hover:border-brand-gold hover:text-brand-gold flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={handleIncrease}
            disabled={quantity >= (product.stock_quantity ?? Infinity)}
          >
            <Plus size={10} />
          </button>
        </div>
      </div>

      {/* Subtotal + remove */}
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <p className="font-body text-brand-cream/80 text-sm font-medium">
          {formatPrice(product.price * quantity)}
        </p>
        <button
          aria-label={`Remove ${product.name} from cart`}
          className="text-brand-cream/30 hover:text-red-400 transition-colors duration-200"
          onClick={() => removeItem(product.id)}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  )
}
