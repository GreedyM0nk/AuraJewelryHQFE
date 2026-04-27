import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Heart } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { SEO } from '@/components/SEO'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { GoldDivider } from '@/components/ui/GoldDivider'
import axiosClient from '@/api/axiosClient'
import { getProducts } from '@/api/products'
import { useCart } from '@/hooks/useCart'
import { useWishlistStore } from '@/store/wishlistStore'
import { ProductCard } from '@/components/home/ProductCard'
import type { Product } from '@/types'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

const ProductDetailPage: React.FC = () => {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const { addItem, toggleCart } = useCart()
  const { toggleItem, isWishlisted } = useWishlistStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setError('Product not found')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const res = await axiosClient.get<Product>(`/products/${productId}`)
        const data = res.data
        setProduct(data)
        setQuantity(1)

        if (data.category_id) {
          const related = await getProducts({ category_id: data.category_id, limit: 4 })
          setRelatedProducts(related.filter((item) => item.id !== data.id).slice(0, 4))
        } else {
          setRelatedProducts([])
        }
      } catch {
        setError('Product not found')
        setProduct(null)
        setRelatedProducts([])
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
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-brand-cream/50 hover:text-brand-gold transition-colors font-body text-xs mb-4"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 font-body text-xs text-brand-cream/40">
              <li><Link to="/" className="hover:text-brand-gold transition-colors">Home</Link></li>
              <li className="text-brand-gold/30">/</li>
              <li><Link to="/shop" className="hover:text-brand-gold transition-colors">Shop</Link></li>
              {product?.category?.name && (
                <>
                  <li className="text-brand-gold/30">/</li>
                  <li>
                    <Link
                      to={product.category_id ? `/shop?category=${product.category_id}` : '/shop'}
                      className="hover:text-brand-gold transition-colors"
                    >
                      {product.category.name}
                    </Link>
                  </li>
                </>
              )}
              <li className="text-brand-gold/30">/</li>
              <li className="text-brand-cream/70 truncate max-w-[120px]">{product?.name}</li>
            </ol>
          </nav>

          {product && (
            <SEO
              title={`${product.name} — ${product.category?.name ?? 'Jewellery'}`}
              description={product.description ?? `Handcrafted ${product.name} — ${product.sku}. ₹${product.price.toLocaleString('en-IN')}. Limited stock available.`}
            />
          )}

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
                    loading="lazy"
                    decoding="async"
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
                  <div className="flex items-center gap-3 mt-2">
                    {product.stock_quantity === 0 ? (
                      <span className="bg-red-500/20 text-red-300 border border-red-400/40 px-3 py-1 text-xs tracking-widest uppercase">
                        Out of Stock
                      </span>
                    ) : product.stock_quantity <= 5 ? (
                      <span className="bg-brand-gold/10 text-brand-gold border border-brand-gold/30 px-3 py-1 text-xs tracking-widest uppercase">
                        Only {product.stock_quantity} left
                      </span>
                    ) : (
                      <span className="text-brand-cream/40 font-body text-xs">
                        In stock ({product.stock_quantity} available)
                      </span>
                    )}
                  </div>
                  {product.stock_quantity > 0 && product.stock_quantity <= 3 && (
                    <p className="font-body text-brand-cream/50 text-xs mt-2 italic">
                      Only {product.stock_quantity} piece{product.stock_quantity > 1 ? 's' : ''} remain in this batch.
                      Once sold, this design will be reworked for the next collection.
                    </p>
                  )}
                </div>

                <p className="font-accent text-brand-gold text-2xl mt-5">{formatPrice(product.price)}</p>

                {product.description && (
                  <p className="mt-5 text-brand-cream/80 leading-relaxed">{product.description}</p>
                )}

                <div className="mt-6">
                  <div className="inline-flex items-center border border-brand-gold/30 mb-4">
                    <button
                      type="button"
                      className="px-3 py-2 text-brand-gold disabled:text-brand-cream/40"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      disabled={quantity <= 1 || product.stock_quantity === 0}
                    >
                      -
                    </button>
                    <span className="px-4 py-2 min-w-12 text-center">{quantity}</span>
                    <button
                      type="button"
                      className="px-3 py-2 text-brand-gold disabled:text-brand-cream/40"
                      onClick={() => setQuantity((prev) => Math.min(prev + 1, product.stock_quantity))}
                      disabled={quantity >= product.stock_quantity || product.stock_quantity === 0}
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      aria-label={isWishlisted(product.id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                      onClick={() => toggleItem(product)}
                      className={`transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center border border-brand-gold/30 ${
                        isWishlisted(product.id) ? 'text-red-400' : 'text-brand-cream/40 hover:text-red-400'
                      }`}
                    >
                      <Heart size={16} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} />
                    </button>
                    <Button
                      onClick={() => {
                        addItem(product, quantity)
                        toggleCart?.()
                      }}
                      disabled={product.stock_quantity === 0}
                    >
                      {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {!loading && !error && relatedProducts.length > 0 && (
            <section className="mt-14">
              <h2 className="font-accent text-brand-gold tracking-widest uppercase text-sm mb-4">
                You May Also Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-brand-gold/10">
                {relatedProducts.map((related) => (
                  <div key={related.id} className="bg-brand-black">
                    <ProductCard product={related} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </section>
      </main>
    </PageWrapper>
  )
}

export default ProductDetailPage
