import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '@/api/products'
import type { Product } from '@/types'

type SearchModalProps = {
  isOpen: boolean
  onClose: () => void
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setLoading(false)
      return
    }

    const timeout = window.setTimeout(async () => {
      setLoading(true)
      try {
        const data = await getProducts({ search: trimmed, limit: 6 })
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [isOpen, query])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" onClick={onClose} role="presentation">
      <div
        className="max-w-2xl mx-auto mt-24 border border-brand-gold/20 bg-brand-black p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products..."
          className="w-full bg-brand-charcoal border border-brand-gold/30 px-3 py-2"
          autoFocus
        />

        {loading && <p className="text-brand-cream/60 text-sm mt-3">Searching...</p>}

        {!loading && query.trim() && (
          <div className="mt-3 border border-brand-gold/15 divide-y divide-brand-gold/10">
            {results.length === 0 ? (
              <p className="px-3 py-3 text-brand-cream/60 text-sm">No products found.</p>
            ) : (
              results.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-brand-gold/10 transition-colors"
                >
                  <div className="w-10 h-10 bg-brand-charcoal overflow-hidden shrink-0">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm truncate">{product.name}</p>
                    <p className="text-xs text-brand-gold">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {!!query.trim() && (
          <div className="mt-3">
            <Link
              to={`/shop?search=${encodeURIComponent(query.trim())}`}
              onClick={onClose}
              className="font-accent text-brand-gold text-xs tracking-widest uppercase hover:underline mt-4 block text-center"
            >
              View all results ({results.length}+) {'->'}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
