import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '@/hooks/useCart'
import { CartItem } from './CartItem'
import { GoldDivider } from '@/components/ui/GoldDivider'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    price
  )

export const CartDrawer: React.FC = () => {
  const { isOpen, toggleCart, items, subtotal, clearCart } = useCart()
  const closeRef = useRef<HTMLButtonElement>(null)

  // Focus trap — focus close button when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) toggleCart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, toggleCart])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[420px] bg-brand-charcoal border-l border-brand-gold/20 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-gold/15">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} className="text-brand-gold" />
                <h2 className="font-accent text-brand-gold text-sm tracking-widest uppercase">
                  Your Cart
                </h2>
                {items.length > 0 && (
                  <span className="text-brand-gold/60 font-body text-xs">({items.length})</span>
                )}
              </div>
              <button
                ref={closeRef}
                aria-label="Close cart"
                onClick={toggleCart}
                className="text-brand-cream/50 hover:text-brand-gold transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag size={48} className="text-brand-gold/30" />
                  <p className="font-display text-2xl font-light text-brand-cream/40 italic">
                    Your cart is empty
                  </p>
                  <p className="font-body text-brand-cream/30 text-sm">
                    Explore our collection and find a piece that speaks to you.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-brand-gold/10">
                  {items.map((item) => (
                    <CartItem key={item.product.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 ? (
              <div className="px-6 py-5 border-t border-brand-gold/15 space-y-4">
                <GoldDivider />
                <div className="flex items-center justify-between">
                  <span className="font-body text-brand-cream text-sm">Subtotal</span>
                  <span className="font-accent text-brand-gold text-lg">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="font-body text-brand-cream/40 text-xs">
                  Shipping &amp; taxes calculated at checkout
                </p>
                <Link
                  to="/checkout"
                  onClick={toggleCart}
                  className="block w-full bg-brand-gold text-brand-black text-center font-accent tracking-widest text-xs uppercase py-3 hover:bg-brand-gold-light transition-colors duration-200"
                >
                  Proceed to Checkout
                </Link>
                <button
                  className="w-full text-center font-body text-brand-cream/30 text-xs hover:text-red-400 transition-colors py-1"
                  onClick={clearCart}
                >
                  Clear cart
                </button>
              </div>
            ) : (
              <div className="px-6 py-5 border-t border-brand-gold/15">
                <button
                  className="w-full text-center font-body text-xs text-brand-cream/50 hover:text-brand-gold transition-colors py-2"
                  onClick={toggleCart}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
