import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  lastAddedAt: number
  lastAddedProductName: string | null
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      lastAddedAt: 0,
      lastAddedProductName: null,

      addItem: (product, quantity = 1) =>
        set((state) => {
          const safeQty = Math.max(1, Math.floor(Number(quantity)))
          const maxQty = product.stock_quantity ?? Infinity
          const existing = state.items.find((i) => i.product.id === product.id)
          if (existing) {
            const newQty = Math.min(existing.quantity + safeQty, maxQty)
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: newQty }
                  : i
              ),
              isOpen: true,
              lastAddedAt: Date.now(),
              lastAddedProductName: product.name,
            }
          }
          return {
            items: [...state.items, { product, quantity: Math.min(safeQty, maxQty) }],
            isOpen: true,
            lastAddedAt: Date.now(),
            lastAddedProductName: product.name,
          }
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.product.id !== productId) }
          }
          return {
            items: state.items.map((i) => {
              if (i.product.id !== productId) {
                return i
              }
              const maxQty = i.product.stock_quantity ?? Infinity
              return { ...i, quantity: Math.min(quantity, maxQty) }
            }),
          }
        }),

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'aura-cart',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return
        }
        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        state.items = state.items.filter((item) => UUID_REGEX.test(item.product.id))
      },
    }
  )
)
