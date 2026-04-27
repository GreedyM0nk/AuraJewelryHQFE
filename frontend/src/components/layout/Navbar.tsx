import React, { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Search, Menu, X, Heart } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useWishlistStore } from '@/store/wishlistStore'
import { SearchModal } from '@/components/search/SearchModal'
import logo from '@/assets/logo.png'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/collections', label: 'Collections' },
  { to: '/about', label: 'About' },
]

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { totalItems, toggleCart } = useCart()
  const wishlistCount = useWishlistStore((s) => s.items.length)
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.height = '100vh'
    } else {
      document.body.style.overflow = ''
      document.body.style.height = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.height = ''
    }
  }, [mobileOpen])

  const handleNavClick = () => {
    setMobileOpen(false)
  }

  const navBase =
    'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b'
  const navBg = (scrolled || !isHomePage)
    ? 'bg-brand-black/95 backdrop-blur-md border-brand-gold/20 shadow-[0_4px_30px_rgba(201,168,76,0.08)]'
    : 'bg-transparent border-transparent'

  return (
    <>
      <motion.header
        className={`${navBase} ${navBg}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0" aria-label="Aura Jewellery HQ Home">
              <img src={logo} alt="Aura Jewellery HQ" className="h-14 w-14 object-contain" width={56} height={56} />
            </Link>

            {/* Centre nav */}
            <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `font-accent text-xs tracking-widest uppercase transition-colors duration-200 ${
                      isActive ? 'text-brand-gold' : 'text-brand-cream/70 hover:text-brand-gold'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-3 lg:gap-4 overflow-hidden">
              <button
                aria-label="Search"
                className="text-brand-cream/70 hover:text-brand-gold transition-colors duration-200 flex min-h-[48px] min-w-[48px] items-center justify-center"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search size={20} />
              </button>

              <Link
                to="/wishlist"
                aria-label={`Wishlist, ${wishlistCount} items`}
                className="relative text-brand-cream/70 hover:text-brand-gold transition-colors duration-200 min-h-[48px] min-w-[48px] flex items-center justify-center"
              >
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-brand-gold text-brand-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              <button
                aria-label={`Cart, ${totalItems} items`}
                className="relative text-brand-cream/70 hover:text-brand-gold transition-colors duration-200 min-h-[48px] min-w-[48px] flex items-center justify-center flex-shrink-0"
                onClick={toggleCart}
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-brand-gold text-brand-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>

              <a
                href="https://wa.me/919000000000?text=Hi!%20I%27d%20like%20to%20book%20a%20jewellery%20consultation."
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:inline-flex items-center justify-center gap-2 font-accent tracking-widest uppercase transition-all duration-300 bg-transparent text-brand-gold border border-brand-gold hover:bg-brand-gold hover:text-brand-black px-4 py-1.5 text-xs"
              >
                Book Consultation
              </a>

              <button
                className="lg:hidden text-brand-cream/70 hover:text-brand-gold transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            className="fixed inset-0 z-50 bg-brand-black flex flex-col items-center justify-center gap-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col items-center gap-6" aria-label="Mobile navigation">
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `font-accent text-xl tracking-widest uppercase transition-colors duration-200 min-h-[48px] px-3 flex items-center ${
                      isActive ? 'text-brand-gold' : 'text-brand-cream/70 hover:text-brand-gold'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
            <a
              href="https://wa.me/919000000000?text=Hi!%20I%27d%20like%20to%20book%20a%20jewellery%20consultation."
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleNavClick}
              className="inline-flex items-center justify-center gap-2 font-accent tracking-widest uppercase transition-all duration-300 bg-transparent text-brand-gold border border-brand-gold hover:bg-brand-gold hover:text-brand-black px-6 py-2 text-sm"
            >
              Book Consultation
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
