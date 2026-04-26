import React from 'react'
import { Link } from 'react-router-dom'
import { Instagram, MessageCircle } from 'lucide-react'
import { GoldDivider } from '@/components/ui/GoldDivider'
import logo from '@/assets/logo.png'

const COMPANY_LINKS = [
  { label: 'Our Story', to: '/about' },
  { label: 'Craftsmanship', to: '/about#craftsmanship' },
  { label: 'Sustainability', to: '/about#sustainability' },
  { label: 'Careers', to: '/about#careers' },
  { label: 'Press', to: '/about#press' },
]

const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
)

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-charcoal border-t border-brand-gold/20" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex flex-col items-start gap-3 mb-4">
              <img src={logo} alt="Aura Jewellery HQ" className="h-20 w-20 object-contain mx-auto" width={80} height={80} />
              <p className="font-accent tracking-[0.4em] text-brand-gold text-sm mt-3 uppercase">
                Aura Jewellery
              </p>
            </div>
            <p className="font-body text-brand-cream/60 text-sm leading-relaxed mb-6">
              Handcrafted jewellery rooted in Kolkata's goldsmithing heritage. Every piece tells a story of
              artisanship, love, and legacy.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-brand-cream/50 hover:text-brand-gold transition-colors duration-200"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="text-brand-cream/50 hover:text-brand-gold transition-colors duration-200"
              >
                <PinterestIcon />
              </a>
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-brand-cream/50 hover:text-brand-gold transition-colors duration-200"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-accent text-brand-gold text-xs tracking-widest uppercase mb-5">Shop</h3>
            <ul className="space-y-3">
              {['Charms', 'Bracelets', 'Necklaces', 'Rings', 'New Arrivals'].map((item) => (
                <li key={item}>
                  <Link
                    to="/shop"
                    className="font-body text-brand-cream/60 text-sm hover:text-brand-gold transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-accent text-brand-gold text-xs tracking-widest uppercase mb-5">Company</h3>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="font-body text-brand-cream/60 text-sm hover:text-brand-gold transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-accent text-brand-gold text-xs tracking-widest uppercase mb-5">Contact</h3>
            <ul className="space-y-3 font-body text-brand-cream/60 text-sm">
              <li>Kolkata, West Bengal, India</li>
              <li>
                <a href="mailto:hello@aurajewellery.in" className="hover:text-brand-gold transition-colors">
                  hello@aurajewellery.in
                </a>
              </li>
              <li>
                <a href="tel:+919000000000" className="hover:text-brand-gold transition-colors">
                  +91 90000 00000
                </a>
              </li>
              <li className="pt-2">Mon – Sat, 10 AM – 7 PM IST</li>
            </ul>
          </div>
        </div>

        <GoldDivider className="my-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-brand-cream/40 text-xs font-body">
          <p>© {new Date().getFullYear()} Aura Jewellery HQ. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-brand-gold transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-brand-gold transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
