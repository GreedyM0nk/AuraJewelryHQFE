import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/types'

interface WishlistState {
  items: Product[]
  toggleItem: (product: Product) => void
  isWishlisted: (productId: string) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (product) =>
        set((state) => ({
          items: state.items.some((i) => i.id === product.id)
            ? state.items.filter((i) => i.id !== product.id)
            : [...state.items, product],
        })),
      isWishlisted: (productId) => get().items.some((i) => i.id === productId),
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'aura-wishlist',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
