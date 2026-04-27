import React, { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { getOrder } from '@/api/orders'
import type { Order } from '@/types'

type OrderLineItem = {
  name: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

type OrderConfirmationState = {
  orderId?: string
  totalAmount?: number
  items?: OrderLineItem[]
  customerName?: string
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
  const [fetchedOrder, setFetchedOrder] = useState<Order | null>(null)
  const [fetchAttempted, setFetchAttempted] = useState(false)

  useEffect(() => {
    const hasStateData = Boolean(state?.order || state?.items || typeof state?.totalAmount === 'number')
    if (hasStateData || !orderId) {
      setFetchAttempted(true)
      return
    }

    const adminApiKey = localStorage.getItem('adminApiKey')?.trim()
    if (!adminApiKey) {
      setFetchAttempted(true)
      return
    }

    const loadOrder = async () => {
      try {
        const data = await getOrder(orderId, adminApiKey)
        setFetchedOrder(data)
      } finally {
        setFetchAttempted(true)
      }
    }

    void loadOrder()
  }, [orderId, state])

  const resolvedOrder = state?.order ?? fetchedOrder
  const resolvedItems: OrderLineItem[] =
    state?.items ??
    (resolvedOrder?.items ?? []).map((item) => ({
      name: `Product ${item.product_id.slice(0, 8)}`,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      lineTotal: displayLineTotal(item.quantity, item.unit_price),
    }))
  const resolvedOrderId = state?.orderId ?? resolvedOrder?.id ?? orderId ?? ''
  const resolvedTotal =
    typeof state?.totalAmount === 'number' ? state.totalAmount : resolvedOrder?.total_amount
  const displayName = state?.customerName?.trim() || null

  const displayLineTotal = (quantity: number, unitPrice: number) => quantity * unitPrice

  return (
    <PageWrapper>
      <main className="pt-28 pb-16 min-h-screen px-4">
        <section className="max-w-3xl mx-auto border border-brand-gold/20 bg-brand-black/50 p-6">
          <div className="flex justify-center mb-3">
            <CheckCircle2 className="text-brand-gold" size={52} aria-hidden="true" />
          </div>
          <p className="font-accent text-brand-gold/70 text-xs tracking-[0.35em] uppercase text-center mb-2">
            Order Confirmed
          </p>
          <h1 className="font-display text-4xl text-center gold-gradient-text mb-3">Thank You</h1>
          {displayName && (
            <p className="text-center text-brand-cream/80 mb-3">Thank you, {displayName}!</p>
          )}
          <GoldDivider className="max-w-xs mx-auto" />

          <div className="mt-6 text-sm">
            <p className="text-brand-cream/80">
              Order ID:{' '}
              <span className="text-brand-gold" title={resolvedOrderId}>
                {resolvedOrderId ? resolvedOrderId.slice(0, 8) : 'Unavailable'}
              </span>
            </p>

            {resolvedItems.length > 0 && (
              <div className="mt-4 border border-brand-gold/15 overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-2 bg-brand-black/60 text-brand-gold text-xs uppercase tracking-widest">
                  <span>Item</span>
                  <span>Qty</span>
                  <span>Unit</span>
                  <span>Line Total</span>
                </div>
                {resolvedItems.map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-2 border-t border-brand-gold/10"
                  >
                    <span>{item.name}</span>
                    <span>{item.quantity}</span>
                    <span>{formatPrice(item.unitPrice)}</span>
                    <span>{formatPrice(item.lineTotal)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 border-t border-brand-gold/20 pt-3 flex items-center justify-between">
              <span className="text-brand-cream/70">Total Amount</span>
              <span className="font-accent text-brand-gold">
                {typeof resolvedTotal === 'number' ? formatPrice(resolvedTotal) : 'Will be confirmed soon'}
              </span>
            </div>

            <p className="mt-3 text-brand-cream/70">Estimated delivery: 5-7 business days</p>

            {!fetchAttempted && !state?.order && (
              <p className="text-brand-cream/60 mt-3">Loading order details...</p>
            )}

            {fetchAttempted && !resolvedOrder && !state?.order && (
              <p className="text-brand-cream/70 mt-3">Your order has been placed.</p>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <Button as={Link} to="/shop">
              CONTINUE SHOPPING
            </Button>
          </div>
        </section>
      </main>
    </PageWrapper>
  )
}

export default OrderConfirmationPage
