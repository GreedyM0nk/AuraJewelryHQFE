import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCartStore } from '@/store/cartStore'
import type { Product } from '@/types'

const mockProduct: Product = {
  id: '22222222-2222-2222-2222-222222220001',
  name: 'Test Ring',
  description: 'A beautiful test ring',
  price: 29999,
  image_url: 'https://example.com/ring.jpg',
  category_id: '11111111-1111-1111-1111-111111111001',
  stock_quantity: 5,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  sku: 'TEST-RING-001',
}

const mockProductLowStock: Product = {
  ...mockProduct,
  id: '33333333-3333-3333-3333-333333330001',
  name: 'Low Stock Ring',
  stock_quantity: 2,
}

describe('useCartStore - Cart Atomicity', () => {
  beforeEach(() => {
    // Clear localStorage to reset persisted state before each test
    localStorage.clear()
    // Reset the store state
    const { result } = renderHook(() => useCartStore())
    act(() => {
      result.current.clearCart()
    })
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should add an item to empty cart', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(mockProduct, 1)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].product.id).toBe(mockProduct.id)
    expect(result.current.items[0].quantity).toBe(1)
  })

  it('should increment quantity when adding same product twice', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(mockProduct, 1)
      result.current.addItem(mockProduct, 1)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(2)
  })

  it('should cap quantity at stock_quantity when adding', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(mockProduct, 3) // stock is 5
      result.current.addItem(mockProduct, 3) // trying to add 3 more = 6 total, but max is 5
    })

    expect(result.current.items[0].quantity).toBe(5)
  })

  it('should not exceed stock_quantity with rapid sequential adds', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      // Simulate 5 rapid clicks to add 1 each (5 total)
      result.current.addItem(mockProduct, 1)
      result.current.addItem(mockProduct, 1)
      result.current.addItem(mockProduct, 1)
      result.current.addItem(mockProduct, 1)
      result.current.addItem(mockProduct, 1)
    })

    expect(result.current.items[0].quantity).toBe(5)

    // Try to add one more - should stay at 5
    act(() => {
      result.current.addItem(mockProduct, 1)
    })

    expect(result.current.items[0].quantity).toBe(5)
  })

  it('should respect Infinity when stock_quantity is not provided', () => {
    const productWithoutStock = { ...mockProduct, stock_quantity: undefined }

    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(productWithoutStock, 10)
      result.current.addItem(productWithoutStock, 10)
    })

    expect(result.current.items[0].quantity).toBe(20)
  })

  it('should handle fractional quantities by flooring them', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(mockProduct, 1.7)
    })

    expect(result.current.items[0].quantity).toBe(1)

    act(() => {
      result.current.addItem(mockProduct, 2.3)
    })

    expect(result.current.items[0].quantity).toBe(3) // 1 + 2
  })

  it('should handle zero quantity as 1', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(mockProduct, 0)
    })

    expect(result.current.items[0].quantity).toBe(1)
  })

  it('should handle negative quantity as 1', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(mockProduct, -5)
    })

    expect(result.current.items[0].quantity).toBe(1)
  })

  it('should open cart when adding item', () => {
    const { result } = renderHook(() => useCartStore())

    const initialState = result.current.isOpen

    act(() => {
      result.current.addItem(mockProduct, 1)
    })

    // Cart should be open after adding item
    expect(result.current.isOpen).toBe(true)
  })

  it('should update lastAddedAt timestamp when adding item', () => {
    const { result } = renderHook(() => useCartStore())

    const beforeTimestamp = Date.now()

    act(() => {
      result.current.addItem(mockProduct, 1)
    })

    const afterTimestamp = Date.now()

    expect(result.current.lastAddedAt).toBeGreaterThanOrEqual(beforeTimestamp)
    expect(result.current.lastAddedAt).toBeLessThanOrEqual(afterTimestamp)
  })

  it('should track lastAddedProductName when adding item', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(mockProduct, 1)
    })

    expect(result.current.lastAddedProductName).toBe('Test Ring')
  })

  it('should handle low stock items correctly', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(mockProductLowStock, 1)
      result.current.addItem(mockProductLowStock, 1)
      result.current.addItem(mockProductLowStock, 1)
    })

    // Can only hold 2 (stock_quantity), not 3
    expect(result.current.items[0].quantity).toBe(2)
  })

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(mockProduct, 1)
    })

    expect(result.current.items).toHaveLength(1)

    act(() => {
      result.current.removeItem(mockProduct.id)
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(mockProduct, 2)
    })

    act(() => {
      result.current.updateQuantity(mockProduct.id, 4)
    })

    expect(result.current.items[0].quantity).toBe(4)
  })

  it('should clear entire cart', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(mockProduct, 2)
      result.current.addItem(mockProductLowStock, 1)
    })

    expect(result.current.items).toHaveLength(2)

    act(() => {
      result.current.clearCart()
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('should toggle cart visibility', () => {
    const { result } = renderHook(() => useCartStore())

    const initialState = result.current.isOpen

    act(() => {
      result.current.toggleCart()
    })

    expect(result.current.isOpen).toBe(!initialState)

    act(() => {
      result.current.toggleCart()
    })

    expect(result.current.isOpen).toBe(initialState)
  })

  it('should handle multiple different products', () => {
    const { result } = renderHook(() => useCartStore())
    const secondProduct = { ...mockProduct, id: '44444444-4444-4444-4444-444444440001', name: 'Test Necklace' }

    act(() => {
      result.current.addItem(mockProduct, 2)
      result.current.addItem(secondProduct, 1)
    })

    expect(result.current.items).toHaveLength(2)
    expect(result.current.items[0].quantity).toBe(2)
    expect(result.current.items[1].quantity).toBe(1)
  })

  it('should maintain atomicity with mixed add and remove operations', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(mockProduct, 1)
      result.current.addItem(mockProduct, 1)
    })

    expect(result.current.items[0].quantity).toBe(2)

    act(() => {
      result.current.removeItem(mockProduct.id)
    })

    expect(result.current.items).toHaveLength(0)

    act(() => {
      result.current.addItem(mockProduct, 3)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(3)
  })
})
