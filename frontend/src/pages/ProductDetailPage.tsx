import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { getProduct } from '@/api/products'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/types'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setError('Product not found.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')
      try {
        const data = await getProduct(productId)
        setProduct(data)
      } catch (unknownError) {
        const err = unknownError as { message?: string }
        setError(err.message ?? 'Could not load product')
      } finally {
        setLoading(false)
      }
    }

    void loadProduct()
  }, [productId])

  return (
    <PageWrapper>
      <main className="pt-28 pb-16 min-h-screen px-4">
        <section className="max-w-6xl mx-auto">
          <nav className="text-sm text-brand-cream/60 mb-5">
            <Link to="/" className="hover:text-brand-gold">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/shop" className="hover:text-brand-gold">Shop</Link>
            {product && (
              <>
                <span className="mx-2">/</span>
                <span className="text-brand-gold">{product.name}</span>
              </>
            )}
          </nav>

          {loading ? (
            <div className="py-20 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400">{error}</p>
            </div>
          ) : product ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="border border-brand-gold/20 bg-brand-black/40 aspect-square overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-gold/30 font-accent text-4xl">
                    AJ
                  </div>
                )}
              </div>

              <div>
                <p className="font-accent text-brand-gold/70 text-xs tracking-[0.35em] uppercase mb-2">Product</p>
                <h1 className="font-display text-5xl gold-gradient-text mb-3">{product.name}</h1>
                <GoldDivider className="max-w-xs" />

                <div className="mt-5 space-y-2 text-sm text-brand-cream/80">
                  <p>SKU: <span className="text-brand-gold">{product.sku}</span></p>
                  <p>Category: {product.category?.name ?? '-'}</p>
                  <p>Stock: {product.stock_quantity}</p>
                </div>

                <p className="font-accent text-brand-gold text-2xl mt-5">{formatPrice(product.price)}</p>

                {product.description && (
                  <p className="mt-5 text-brand-cream/80 leading-relaxed">{product.description}</p>
                )}

                <div className="mt-6">
                  <Button
                    onClick={() => addItem(product)}
                    disabled={product.stock_quantity === 0}
                  >
                    {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </PageWrapper>
  )
}

export default ProductDetailPage
