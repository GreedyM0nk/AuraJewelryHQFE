import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ProductCard } from '@/components/home/ProductCard'
import type { Product } from '@/types'

const addItemMock = vi.fn()

vi.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    addItem: addItemMock,
  }),
}))

const product: Product = {
  id: 'prod-1',
  name: 'Test Ring',
  description: 'A handcrafted ring',
  price: 2500,
  category_id: 'cat-1',
  category: { id: 'cat-1', name: 'Rings', description: null, image_url: null },
  image_url: null,
  stock_quantity: 10,
  sku: 'RING-001',
  created_at: '2026-01-01T00:00:00Z',
}

describe('ProductCard wishlist target size', () => {
  beforeEach(() => {
    addItemMock.mockReset()
  })

  it('applies minimum 44x44 touch target classes to wishlist button', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>
    )

    const wishlist = screen.getByRole('button', { name: /wishlist test ring/i })
    expect(wishlist.className).toContain('min-w-[44px]')
    expect(wishlist.className).toContain('min-h-[44px]')

    await user.click(wishlist)
  })

  it('renders low-stock and new badges and triggers addItem from buttons', () => {
    const lowStockProduct: Product = {
      ...product,
      isNew: true,
      stock_quantity: 2,
      image_url: 'https://example.com/ring.jpg',
    }

    render(
      <MemoryRouter>
        <ProductCard product={lowStockProduct} />
      </MemoryRouter>
    )

    expect(screen.getByText('New')).toBeInTheDocument()
    expect(screen.getByText('Only 2 left')).toBeInTheDocument()

    const addButtons = screen.getAllByRole('button', { name: /add test ring to cart/i })
    expect(addButtons.length).toBeGreaterThan(0)
    addButtons.forEach((button) => {
      expect(button).not.toBeDisabled()
      button.click()
    })

    expect(addItemMock).toHaveBeenCalled()
  })

  it('shows sold-out state and disables add-to-cart buttons when stock is zero', () => {
    const soldOutProduct: Product = {
      ...product,
      stock_quantity: 0,
    }

    render(
      <MemoryRouter>
        <ProductCard product={soldOutProduct} />
      </MemoryRouter>
    )

    expect(screen.getAllByText('Sold Out').length).toBeGreaterThan(0)
    const addButtons = screen.getAllByRole('button', { name: /add test ring to cart/i })
    addButtons.forEach((button) => {
      expect(button).toBeDisabled()
    })
  })
})
