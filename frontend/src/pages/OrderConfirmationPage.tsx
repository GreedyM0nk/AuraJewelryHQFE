import React from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { GoldDivider } from '@/components/ui/GoldDivider'
import type { Order } from '@/types'

type OrderConfirmationState = {
  order?: Order
  cartSummary?: Array<{
    product_id: string
    name: string
    quantity: number
    unit_price: number
    subtotal: number
  }>
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const location = useLocation()
  const state = (location.state as OrderConfirmationState | null) ?? null
  const order = state?.order
  const summary = state?.cartSummary ?? []

  return (
    <PageWrapper>
      <main className="pt-28 pb-16 min-h-screen px-4">
        <section className="max-w-3xl mx-auto border border-brand-gold/20 bg-brand-black/50 p-6">
          <p className="font-accent text-brand-gold/70 text-xs tracking-[0.35em] uppercase text-center mb-2">
            Order Confirmed
          </p>
          <h1 className="font-display text-4xl text-center gold-gradient-text mb-3">Thank You</h1>
          <GoldDivider className="max-w-xs mx-auto" />

          <div className="mt-6 text-sm">
            <p className="text-brand-cream/80">
              Order ID: <span className="text-brand-gold">{order?.id ?? orderId ?? '-'}</span>
            </p>

            {summary.length > 0 && (
              <div className="mt-4 space-y-2">
                {summary.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-center justify-between border border-brand-gold/15 px-3 py-2"
                  >
                    <span>{item.name} x {item.quantity}</span>
                    <span>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 border-t border-brand-gold/20 pt-3 flex items-center justify-between">
              <span className="text-brand-cream/70">Total Amount</span>
              <span className="font-accent text-brand-gold">
                {typeof order?.total_amount === 'number' ? formatPrice(order.total_amount) : '-'}
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button as={Link} to="/shop">
              Continue Shopping
            </Button>
          </div>
        </section>
      </main>
    </PageWrapper>
  )
}

export default OrderConfirmationPage
