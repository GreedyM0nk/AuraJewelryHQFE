import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProductDetailPage from '@/pages/ProductDetailPage'

const axiosGetMock = vi.fn()
const getProductsMock = vi.fn()
const addItemMock = vi.fn()

vi.mock('@/api/axiosClient', () => ({
  default: {
    get: (...args: unknown[]) => axiosGetMock(...args),
  },
}))

vi.mock('@/api/products', () => ({
  getProducts: (...args: unknown[]) => getProductsMock(...args),
}))

vi.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    addItem: addItemMock,
  }),
}))

vi.mock('@/components/layout/PageWrapper', () => ({
  PageWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/GoldDivider', () => ({ GoldDivider: () => <div /> }))
vi.mock('@/components/ui/Spinner', () => ({ Spinner: () => <div>Loading...</div> }))
vi.mock('@/components/home/ProductCard', () => ({
  ProductCard: ({ product }: { product: { name: string } }) => <div>{product.name}</div>,
}))

const renderOnRoute = (path: string, routePath = '/products/:productId') => {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={routePath} element={<ProductDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProductDetailPage API and breadcrumb behavior', () => {
  beforeEach(() => {
    axiosGetMock.mockReset()
    getProductsMock.mockReset()
    addItemMock.mockReset()
  })

  it('fetches fresh product data from API and renders breadcrumb/category link', async () => {
    axiosGetMock.mockResolvedValueOnce({
      data: {
        id: 'prod-1',
        name: 'Moonlight Ring',
        description: 'Fine handcrafted ring',
        price: 4500,
        category_id: 'cat-1',
        category: { id: 'cat-1', name: 'Rings', description: null, image_url: null },
        image_url: null,
        stock_quantity: 7,
        sku: 'MOON-001',
        created_at: '2026-01-01T00:00:00Z',
      },
    })
    getProductsMock.mockResolvedValueOnce([])

    renderOnRoute('/products/prod-1')

    await waitFor(() => {
      expect(axiosGetMock).toHaveBeenCalledWith('/products/prod-1')
    })

    expect(await screen.findByRole('heading', { name: 'Moonlight Ring' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Shop' })).toBeInTheDocument()

    const categoryLink = screen.getByRole('link', { name: 'Rings' })
    expect(categoryLink).toHaveAttribute('href', '/shop?category=rings')

    expect(screen.getByText(/Category:\s+Rings/)).toBeInTheDocument()
    expect(screen.getByText(/Stock:\s+7/)).toBeInTheDocument()
  })

  it('handles quantity controls and add-to-cart action', async () => {
    const user = userEvent.setup()
    axiosGetMock.mockResolvedValueOnce({
      data: {
        id: 'prod-2',
        name: 'Star Necklace',
        description: 'Necklace description',
        price: 9000,
        category_id: 'cat-2',
        category: { id: 'cat-2', name: 'Necklaces', description: null, image_url: null },
        image_url: null,
        stock_quantity: 3,
        sku: 'STAR-001',
        created_at: '2026-01-01T00:00:00Z',
      },
    })
    getProductsMock.mockResolvedValueOnce([])

    renderOnRoute('/products/prod-2')

    await screen.findByRole('heading', { name: 'Star Necklace' })

    const plusButtons = screen.getAllByRole('button', { name: '+' })
    await user.click(plusButtons[0])
    await user.click(plusButtons[0])
    await user.click(plusButtons[0])

    const quantityValue = screen.getByText('3')
    expect(quantityValue).toBeInTheDocument()

    const minusButton = screen.getByRole('button', { name: '-' })
    await user.click(minusButton)
    expect(screen.getByText('2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add to Cart' }))
    expect(addItemMock).toHaveBeenCalledTimes(1)
  })

  it('renders out-of-stock state and disabled add button', async () => {
    axiosGetMock.mockResolvedValueOnce({
      data: {
        id: 'prod-3',
        name: 'Sold Ring',
        description: null,
        price: 3200,
        category_id: null,
        category: null,
        image_url: 'https://example.com/sold.jpg',
        stock_quantity: 0,
        sku: 'SOLD-001',
        created_at: '2026-01-01T00:00:00Z',
      },
    })

    renderOnRoute('/products/prod-3')

    await screen.findByRole('heading', { name: 'Sold Ring' })
    expect(screen.getAllByText('Out of Stock').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Out of Stock' })).toBeDisabled()
    expect(screen.getByRole('img', { name: 'Sold Ring' })).toBeInTheDocument()
  })

  it('renders related products section when related items are returned', async () => {
    axiosGetMock.mockResolvedValueOnce({
      data: {
        id: 'prod-main',
        name: 'Main Product',
        description: 'Main item',
        price: 5000,
        category_id: 'cat-1',
        category: { id: 'cat-1', name: 'Rings', description: null, image_url: null },
        image_url: null,
        stock_quantity: 5,
        sku: 'MAIN-001',
        created_at: '2026-01-01T00:00:00Z',
      },
    })
    getProductsMock.mockResolvedValueOnce([
      { id: 'prod-main', name: 'Main Product' },
      { id: 'related-1', name: 'Related Ring' },
    ])

    renderOnRoute('/products/prod-main')

    expect(await screen.findByText('You May Also Like')).toBeInTheDocument()
    expect(screen.getByText('Related Ring')).toBeInTheDocument()
  })

  it('shows not found message when API request fails', async () => {
    axiosGetMock.mockRejectedValueOnce(new Error('fail'))

    renderOnRoute('/products/missing')

    expect(await screen.findByText('Product not found')).toBeInTheDocument()
  })

  it('shows not found message when productId is missing', async () => {
    renderOnRoute('/products', '/products')

    expect(await screen.findByText('Product not found')).toBeInTheDocument()
  })
})
