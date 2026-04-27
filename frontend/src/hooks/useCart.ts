import { useCartStore } from '@/store/cartStore'

export function useCart() {
  const items = useCartStore((s) => s.items)
  const isOpen = useCartStore((s) => s.isOpen)
  const addItem = useCartStore((s) => s.addItem)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const clearCart = useCartStore((s) => s.clearCart)
  const toggleCart = useCartStore((s) => s.toggleCart)
  const lastAddedAt = useCartStore((s) => s.lastAddedAt)
  const lastAddedProductName = useCartStore((s) => s.lastAddedProductName)

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  return {
    items,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    totalItems,
    subtotal,
    lastAddedAt,
    lastAddedProductName,
  }
}
