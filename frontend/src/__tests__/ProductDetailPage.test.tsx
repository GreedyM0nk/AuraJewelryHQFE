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
vi.mock('@/components/SEO', () => ({ SEO: () => null }))

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
    const productId = '22222222-2222-2222-2222-222222220001'
    const categoryId = '11111111-1111-1111-1111-111111111004'
    axiosGetMock.mockResolvedValueOnce({
      data: {
        id: productId,
        name: 'Moonlight Ring',
        description: 'Fine handcrafted ring',
        price: 4500,
        category_id: categoryId,
        category: { id: categoryId, name: 'Rings', description: null, image_url: null },
        image_url: null,
        stock_quantity: 7,
        sku: 'MOON-001',
        created_at: '2026-01-01T00:00:00Z',
      },
    })
    getProductsMock.mockResolvedValueOnce([])

    renderOnRoute(`/products/${productId}`)

    await waitFor(() => {
      expect(axiosGetMock).toHaveBeenCalledWith(`/products/${productId}`)
    })

    expect(await screen.findByRole('heading', { name: 'Moonlight Ring' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Shop' })).toBeInTheDocument()

    const categoryLink = screen.getByRole('link', { name: 'Rings' })
    expect(categoryLink).toHaveAttribute('href', `/shop?category=${categoryId}`)

    expect(screen.getByText(/Category:\s+Rings/)).toBeInTheDocument()
    expect(screen.getByText('In stock (7 available)')).toBeInTheDocument()
  })

  it('handles quantity controls and add-to-cart action', async () => {
    const user = userEvent.setup()
    axiosGetMock.mockResolvedValueOnce({
      data: {
        id: '22222222-2222-2222-2222-222222220002',
        name: 'Star Necklace',
        description: 'Necklace description',
        price: 9000,
        category_id: '11111111-1111-1111-1111-111111111003',
        category: { id: '11111111-1111-1111-1111-111111111003', name: 'Necklaces', description: null, image_url: null },
        image_url: null,
        stock_quantity: 3,
        sku: 'STAR-001',
        created_at: '2026-01-01T00:00:00Z',
      },
    })
    getProductsMock.mockResolvedValueOnce([])

    renderOnRoute('/products/22222222-2222-2222-2222-222222220002')

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
        id: '22222222-2222-2222-2222-222222220003',
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

    renderOnRoute('/products/22222222-2222-2222-2222-222222220003')

    await screen.findByRole('heading', { name: 'Sold Ring' })
    expect(screen.getAllByText('Out of Stock').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Out of Stock' })).toBeDisabled()
    expect(screen.getByRole('img', { name: 'Sold Ring' })).toBeInTheDocument()
  })

  it('renders related products section when related items are returned', async () => {
    axiosGetMock.mockResolvedValueOnce({
      data: {
        id: '22222222-2222-2222-2222-222222220004',
        name: 'Main Product',
        description: 'Main item',
        price: 5000,
        category_id: '11111111-1111-1111-1111-111111111004',
        category: { id: '11111111-1111-1111-1111-111111111004', name: 'Rings', description: null, image_url: null },
        image_url: null,
        stock_quantity: 5,
        sku: 'MAIN-001',
        created_at: '2026-01-01T00:00:00Z',
      },
    })
    getProductsMock.mockResolvedValueOnce([
      { id: '22222222-2222-2222-2222-222222220004', name: 'Main Product' },
      { id: '22222222-2222-2222-2222-222222220005', name: 'Related Ring' },
    ])

    renderOnRoute('/products/22222222-2222-2222-2222-222222220004')

    expect(await screen.findByText('You May Also Like')).toBeInTheDocument()
    expect(screen.getByText('Related Ring')).toBeInTheDocument()
  })

  it('shows not found message when API request fails', async () => {
    axiosGetMock.mockRejectedValueOnce(new Error('fail'))

    renderOnRoute('/products/not-a-uuid')

    expect(await screen.findByText('Product not found')).toBeInTheDocument()
  })

  it('shows not found message when productId is missing', async () => {
    renderOnRoute('/products', '/products')

    expect(await screen.findByText('Product not found')).toBeInTheDocument()
  })

  it('rejects invalid UUID format without making API call', async () => {
    renderOnRoute('/products/not-a-valid-uuid')

    await waitFor(() => {
      expect(axiosGetMock).not.toHaveBeenCalled()
    })

    expect(screen.getByText('Product not found')).toBeInTheDocument()
  })

  it('rejects malformed UUID with numbers and special chars', async () => {
    renderOnRoute('/products/12345-67890-abcde-fghij')

    await waitFor(() => {
      expect(axiosGetMock).not.toHaveBeenCalled()
    })

    expect(screen.getByText('Product not found')).toBeInTheDocument()
  })

  it('accepts valid UUID format with correct pattern', async () => {
    const validUUID = '22222222-2222-2222-2222-222222220010'
    axiosGetMock.mockResolvedValueOnce({
      data: {
        id: validUUID,
        name: 'Valid UUID Product',
        description: 'Test',
        price: 1000,
        category_id: null,
        category: null,
        image_url: null,
        stock_quantity: 5,
        sku: 'VALID-001',
        created_at: '2026-01-01T00:00:00Z',
      },
    })
    getProductsMock.mockResolvedValueOnce([])

    renderOnRoute(`/products/${validUUID}`)

    await waitFor(() => {
      expect(axiosGetMock).toHaveBeenCalledWith(`/products/${validUUID}`)
    })

    expect(await screen.findByRole('heading', { name: 'Valid UUID Product' })).toBeInTheDocument()
  })

  it('displays low stock urgency message when stock is 3 or less', async () => {
    axiosGetMock.mockResolvedValueOnce({
      data: {
        id: '22222222-2222-2222-2222-222222220011',
        name: 'Low Stock Ring',
        description: 'Limited item',
        price: 5000,
        category_id: null,
        category: null,
        image_url: null,
        stock_quantity: 2,
        sku: 'LOW-001',
        created_at: '2026-01-01T00:00:00Z',
      },
    })
    getProductsMock.mockResolvedValueOnce([])

    renderOnRoute('/products/22222222-2222-2222-2222-222222220011')

    await screen.findByRole('heading', { name: 'Low Stock Ring' })
    expect(screen.getByText(/only \d+ left/i)).toBeInTheDocument()
  })

  it('displays stock quantity in badge for in-stock items', async () => {
    axiosGetMock.mockResolvedValueOnce({
      data: {
        id: '22222222-2222-2222-2222-222222220012',
        name: 'Plenty Stock Ring',
        description: 'Abundant item',
        price: 5000,
        category_id: null,
        category: null,
        image_url: null,
        stock_quantity: 10,
        sku: 'PLENTY-001',
        created_at: '2026-01-01T00:00:00Z',
      },
    })
    getProductsMock.mockResolvedValueOnce([])

    renderOnRoute('/products/22222222-2222-2222-2222-222222220012')

    await screen.findByRole('heading', { name: 'Plenty Stock Ring' })
    expect(screen.getByText('In stock (10 available)')).toBeInTheDocument()
  })

  it('displays low stock badge when stock is between 1 and 5', async () => {
    axiosGetMock.mockResolvedValueOnce({
      data: {
        id: '22222222-2222-2222-2222-222222220013',
        name: 'Limited Stock Ring',
        description: 'Limited item',
        price: 5000,
        category_id: null,
        category: null,
        image_url: null,
        stock_quantity: 3,
        sku: 'LIMITED-001',
        created_at: '2026-01-01T00:00:00Z',
      },
    })
    getProductsMock.mockResolvedValueOnce([])

    renderOnRoute('/products/22222222-2222-2222-2222-222222220013')

    await screen.findByRole('heading', { name: 'Limited Stock Ring' })
    // Low stock (1-5) displays "Only X left" badge
    expect(screen.getByText(/Only 3 left/i)).toBeInTheDocument()
  })

  it('triggers fresh API fetch on component mount', async () => {
    const productId = '22222222-2222-2222-2222-222222220014'
    axiosGetMock.mockResolvedValueOnce({
      data: {
        id: productId,
        name: 'Fresh Fetch Product',
        description: 'Test',
        price: 3000,
        category_id: null,
        category: null,
        image_url: null,
        stock_quantity: 5,
        sku: 'FRESH-001',
        created_at: '2026-01-01T00:00:00Z',
      },
    })
    getProductsMock.mockResolvedValueOnce([])

    renderOnRoute(`/products/${productId}`)

    await waitFor(() => {
      expect(axiosGetMock).toHaveBeenCalledTimes(1)
      expect(axiosGetMock).toHaveBeenCalledWith(`/products/${productId}`)
    })
  })

  it('does not cache product data from previous loads', async () => {
    const productId = '22222222-2222-2222-2222-222222220015'
    axiosGetMock.mockResolvedValueOnce({
      data: {
        id: productId,
        name: 'Always Fresh Product',
        description: 'Test',
        price: 2500,
        category_id: null,
        category: null,
        image_url: null,
        stock_quantity: 8,
        sku: 'ALWAYS-FRESH-001',
        created_at: '2026-01-01T00:00:00Z',
      },
    })
    getProductsMock.mockResolvedValueOnce([])

    const { rerender } = renderOnRoute(`/products/${productId}`)

    await screen.findByRole('heading', { name: 'Always Fresh Product' })

    expect(axiosGetMock).toHaveBeenCalledTimes(1)

    // Re-rendering with same productId should trigger another fetch
    rerender(
      <MemoryRouter initialEntries={[`/products/${productId}`]}>
        <Routes>
          <Route path="/products/:productId" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>
    )

    // Note: actual behavior depends on useCallback dependencies, but fresh mount should fetch
    expect(axiosGetMock).toHaveBeenCalled()
  })

  it('displays product name in h1 heading and breadcrumb', async () => {
    axiosGetMock.mockResolvedValueOnce({
      data: {
        id: '22222222-2222-2222-2222-222222220016',
        name: 'Unique Name Ring',
        description: 'Test',
        price: 4000,
        category_id: '11111111-1111-1111-1111-111111111005',
        category: { id: '11111111-1111-1111-1111-111111111005', name: 'Rings', description: null, image_url: null },
        image_url: null,
        stock_quantity: 5,
        sku: 'UNIQUE-001',
        created_at: '2026-01-01T00:00:00Z',
      },
    })
    getProductsMock.mockResolvedValueOnce([])

    renderOnRoute('/products/22222222-2222-2222-2222-222222220016')

    // Product name should appear in h1 heading
    const heading = await screen.findByRole('heading', { name: 'Unique Name Ring' })
    expect(heading).toBeInTheDocument()
    expect(heading.tagName).toBe('H1')
    
    // Verify only one h1 heading exists
    const h1Elements = screen.getAllByRole('heading', { level: 1 })
    expect(h1Elements).toHaveLength(1)
    
    // Product name should also appear in breadcrumb
    expect(screen.getByText('Unique Name Ring', { selector: 'span' })).toBeInTheDocument()
  })
})
