import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProductsPage from '@/pages/ProductsPage'

let categoriesMock: Array<{ id: string; name: string }> = []
let productsState: {
  data: Array<{ id: string; name: string }>
  isLoading: boolean
  isError: boolean
} = {
  data: [],
  isLoading: false,
  isError: false,
}
const refetchMock = vi.fn()

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    data: categoriesMock,
  }),
}))

vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => ({
    data: productsState.data,
    isLoading: productsState.isLoading,
    isError: productsState.isError,
    refetch: refetchMock,
  }),
}))

vi.mock('@/components/layout/PageWrapper', () => ({
  PageWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/SEO', () => ({ SEO: () => null }))
vi.mock('@/components/ui/GoldDivider', () => ({ GoldDivider: () => <div /> }))
vi.mock('@/components/ui/ProductCardSkeleton', () => ({
  ProductCardSkeleton: () => <div data-testid="product-skeleton" />,
}))
vi.mock('@/components/home/ProductCard', () => ({
  ProductCard: ({ product }: { product: { name: string } }) => <div>{product.name}</div>,
}))

beforeEach(() => {
  categoriesMock = [
    { id: 'cat-1', name: 'Rings' },
    { id: 'cat-2', name: 'Necklaces' },
  ]
  productsState = { data: [], isLoading: false, isError: false }
  refetchMock.mockReset()
})

describe('ProductsPage mobile tabs', () => {
  it('uses horizontal-scroll tabs wrapper and non-shrinking tab buttons', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    )

    const tablist = screen.getByRole('tablist')
    expect(tablist.className).toContain('overflow-x-auto')
    expect(tablist.className).toContain('scrollbar-hide')

    const allPiecesTab = screen.getByRole('tab', { name: 'All Pieces' })
    expect(allPiecesTab.className).toContain('flex-shrink-0')

    const ringsTab = screen.getByRole('tab', { name: 'Rings' })
    await user.click(ringsTab)
    expect(ringsTab).toHaveAttribute('aria-selected', 'true')
  })

  it('renders loading skeletons when isLoading is true', () => {
    productsState = { data: [], isLoading: true, isError: false }

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    )

    expect(screen.getAllByTestId('product-skeleton')).toHaveLength(8)
  })

  it('renders error state and retries fetch', async () => {
    const user = userEvent.setup()
    productsState = { data: [], isLoading: false, isError: true }

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Could not load products. Please try again.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /retry/i }))
    expect(refetchMock).toHaveBeenCalledTimes(1)
  })

  it('renders product grid when items are available', () => {
    productsState = {
      data: [
        { id: 'prod-1', name: 'Moonlight Ring' },
        { id: 'prod-2', name: 'Golden Necklace' },
      ],
      isLoading: false,
      isError: false,
    }

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Moonlight Ring')).toBeInTheDocument()
    expect(screen.getByText('Golden Necklace')).toBeInTheDocument()
  })

  it('shows active filter chips and reset control from URL params', () => {
    productsState = {
      data: [{ id: 'prod-1', name: 'Moonlight Ring' }],
      isLoading: false,
      isError: false,
    }

    render(
      <MemoryRouter initialEntries={['/shop?category=cat-1&search=moon&sort=price_asc']}>
        <ProductsPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Rings', { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByText('Search: moon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset filters/i })).toBeInTheDocument()
  })

  it('resets filters and hides chips when reset is clicked', async () => {
    const user = userEvent.setup()
    productsState = {
      data: [{ id: 'prod-1', name: 'Moonlight Ring' }],
      isLoading: false,
      isError: false,
    }

    render(
      <MemoryRouter initialEntries={['/shop?category=cat-1&search=moon&sort=price_asc']}>
        <ProductsPage />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /reset filters/i }))

    expect(screen.queryByText('Search: moon')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /reset filters/i })).not.toBeInTheDocument()
  })
})
