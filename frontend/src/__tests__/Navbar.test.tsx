import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { Navbar } from '@/components/layout/Navbar'

const toggleCartMock = vi.fn()

vi.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    totalItems: 2,
    toggleCart: toggleCartMock,
  }),
}))

vi.mock('@/components/search/SearchModal', () => ({
  SearchModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <button onClick={onClose}>Close Search</button> : null,
}))

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    header: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => <header {...props}>{children}</header>,
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
}))

describe('Navbar mobile behavior', () => {
  beforeEach(() => {
    toggleCartMock.mockReset()
    document.body.style.overflow = ''
    document.body.style.height = ''
  })

  it('uses solid mobile menu background with z-50', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<Navbar />} />
        </Routes>
      </MemoryRouter>
    )

    const openButtons = screen.getAllByRole('button', { name: /open menu/i })
    await user.click(openButtons[0])

    const menu = document.querySelector('.fixed.inset-0.z-50.bg-brand-black')
    expect(menu).toBeInTheDocument()
    expect(menu?.className).not.toContain('bg-brand-black/98')
  })

  it('locks body scroll while mobile menu is open', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<Navbar />} />
        </Routes>
      </MemoryRouter>
    )

    const openButtons = screen.getAllByRole('button', { name: /open menu/i })
    await user.click(openButtons[0])
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.body.style.height).toBe('100vh')

    const closeButtons = screen.getAllByRole('button', { name: /close menu/i })
    await user.click(closeButtons[0])

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('')
      expect(document.body.style.height).toBe('')
    })
  })

  it('closes menu when tapping a mobile nav link', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<Navbar />} />
        </Routes>
      </MemoryRouter>
    )

    const openButtons = screen.getAllByRole('button', { name: /open menu/i })
    await user.click(openButtons[0])

    const menu = document.querySelector('.fixed.inset-0.z-50.bg-brand-black')
    expect(menu).toBeInTheDocument()

    const shopLink = within(menu as HTMLElement).getByRole('link', { name: 'Shop' })
    await user.click(shopLink)

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('')
      expect(document.body.style.height).toBe('')
    })
  })

  it('renders solid navbar background on non-home routes', () => {
    render(
      <MemoryRouter initialEntries={['/shop']}>
        <Routes>
          <Route path="*" element={<Navbar />} />
        </Routes>
      </MemoryRouter>
    )

    const header = document.querySelector('header')
    expect(header?.className).toContain('bg-brand-black/95')
    expect(header?.className).toContain('border-brand-gold/20')
  })

  it('triggers cart toggle when cart button is tapped', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<Navbar />} />
        </Routes>
      </MemoryRouter>
    )

    const cartButtons = screen.getAllByRole('button', { name: /cart, 2 items/i })
    await user.click(cartButtons[0])
    expect(toggleCartMock).toHaveBeenCalledTimes(1)
  })

  it('closes menu when mobile consultation link is clicked', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<Navbar />} />
        </Routes>
      </MemoryRouter>
    )

    const openButtons = screen.getAllByRole('button', { name: /open menu/i })
    await user.click(openButtons[0])
    expect(document.body.style.overflow).toBe('hidden')

    const menu = document.querySelector('.fixed.inset-0.z-50.bg-brand-black')
    const consultationLink = within(menu as HTMLElement).getByRole('link', { name: /book consultation/i })
    await user.click(consultationLink)

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('')
      expect(document.body.style.height).toBe('')
    })
  })

  it('opens and closes the search modal via handlers', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<Navbar />} />
        </Routes>
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: 'Search' }))
    await user.click(screen.getByRole('button', { name: 'Close Search' }))
    expect(screen.queryByRole('button', { name: 'Close Search' })).not.toBeInTheDocument()
  })
})
