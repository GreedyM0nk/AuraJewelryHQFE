import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { useCart } from '@/hooks/useCart'
import { registerCustomer } from '@/api/customers'
import { createOrder } from '@/api/orders'
import type { CustomerCreate } from '@/types'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const [step, setStep] = useState<1 | 2>(1)
  const [customerId, setCustomerId] = useState('')
  const [inlineError, setInlineError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [customerForm, setCustomerForm] = useState<CustomerCreate>({
    name: '',
    email: '',
    phone: '',
    country: 'India',
  })

  const cartSummary = useMemo(
    () =>
      items.map((item) => ({
        product_id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        subtotal: item.quantity * item.product.price,
      })),
    [items]
  )

  const submitCustomer = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!customerForm.name.trim() || !customerForm.email.trim() || !customerForm.country.trim()) {
      setInlineError('Name, email and country are required.')
      return
    }

    setSubmitting(true)
    setInlineError('')
    setEmailError('')

    try {
      const created = await registerCustomer({
        ...customerForm,
        name: customerForm.name.trim(),
        email: customerForm.email.trim(),
        phone: customerForm.phone?.trim() || null,
        country: customerForm.country.trim(),
      })
      setCustomerId(created.id)
      setStep(2)
    } catch (unknownError) {
      const err = unknownError as {
        status?: number
        message?: string
        data?: { detail?: { message?: string; customer_id?: string } | Array<{ msg?: string }> }
      }
      const detail = err.data?.detail

      if (err.status === 409) {
        const existingId = !Array.isArray(detail) ? detail?.customer_id : undefined
        if (existingId) {
          setCustomerId(existingId)
          setStep(2)
          return
        }
        setInlineError('This email is already registered. Please use a different email.')
        return
      }

      if (Array.isArray(detail)) {
        const validationMessage = detail[0]?.msg ?? 'Validation error'
        setEmailError(validationMessage.replace('value is not a valid email address: ', ''))
        return
      }

      if (typeof detail === 'string') {
        setInlineError(detail)
        return
      }

      setInlineError(err.message ?? 'Failed to register customer.')
    } finally {
      setSubmitting(false)
    }
  }

  const placeOrder = async () => {
    if (!customerId || items.length === 0) {
      return
    }

    setSubmitting(true)
    setInlineError('')

    try {
      const order = await createOrder({
        customer_id: customerId,
        total_amount: subtotal,
        sales_channel: 'online',
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.price,
        })),
      })

      clearCart()
      navigate(`/order-confirmation/${order.id}`, {
        state: {
          orderId: order.id,
          totalAmount: order.total_amount,
          items: order.items,
          customerName: customerForm.name,
          order,
          cartSummary,
        },
      })
    } catch (unknownError) {
      const err = unknownError as { status?: number; message?: string }
      if (err.status === 422) {
        setInlineError('Insufficient stock for one or more items.')
      } else {
        setInlineError(err.message ?? 'Failed to place order.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <PageWrapper>
        <div className="text-center py-24">
          <p className="font-body text-brand-cream/60 mb-6">Your cart is empty.</p>
          <Link to="/shop" className="font-accent text-brand-gold tracking-widest text-sm hover:underline">
            BROWSE COLLECTION
          </Link>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <main className="pt-28 pb-16 min-h-screen px-4">
        <section className="max-w-4xl mx-auto">
          <p className="font-accent text-brand-gold/70 text-xs tracking-[0.35em] uppercase text-center mb-3">
            Checkout
          </p>
          <h1 className="font-display text-5xl text-center gold-gradient-text mb-4">Complete Your Order</h1>
          <GoldDivider className="max-w-xs mx-auto" />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 mt-8">
            <section className="border border-brand-gold/20 bg-brand-black/50 p-5">
              {step === 1 ? (
                <form className="space-y-3" onSubmit={submitCustomer}>
                  <h2 className="font-accent text-brand-gold tracking-widest uppercase text-sm mb-2">
                    Step 1: Customer Details
                  </h2>
                  <input
                    value={customerForm.name}
                    onChange={(event) =>
                      setCustomerForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className="w-full bg-brand-black border border-brand-gold/30 p-2"
                    placeholder="Name*"
                  />
                  <input
                    value={customerForm.email}
                    onChange={(event) =>
                      setCustomerForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                    className="w-full bg-brand-black border border-brand-gold/30 p-2"
                    placeholder="Email*"
                    type="email"
                  />
                  {emailError && <p className="text-red-400 text-sm font-body mt-1">{emailError}</p>}
                  <input
                    value={customerForm.phone ?? ''}
                    onChange={(event) =>
                      setCustomerForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    className="w-full bg-brand-black border border-brand-gold/30 p-2"
                    placeholder="Phone"
                  />
                  <input
                    value={customerForm.country}
                    onChange={(event) =>
                      setCustomerForm((prev) => ({ ...prev, country: event.target.value }))
                    }
                    className="w-full bg-brand-black border border-brand-gold/30 p-2"
                    placeholder="Country*"
                  />
                  {inlineError && <p className="text-sm text-red-400">{inlineError}</p>}
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? 'Saving...' : 'Continue to Review'}
                  </Button>
                </form>
              ) : (
                <div>
                  <h2 className="font-accent text-brand-gold tracking-widest uppercase text-sm mb-3">
                    Step 2: Review & Place Order
                  </h2>
                  <div className="space-y-2">
                    {cartSummary.map((item) => (
                      <div
                        key={item.product_id}
                        className="border border-brand-gold/15 bg-brand-black/40 px-3 py-2 text-sm"
                      >
                        <div className="flex justify-between gap-2">
                          <span>{item.name}</span>
                          <span>{formatPrice(item.subtotal)}</span>
                        </div>
                        <p className="text-brand-cream/70 text-xs mt-1">
                          Qty {item.quantity} x {formatPrice(item.unit_price)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-between items-center border-t border-brand-gold/20 pt-3">
                    <span className="text-brand-cream/70">Total</span>
                    <span className="font-accent text-brand-gold">{formatPrice(subtotal)}</span>
                  </div>

                  {inlineError && <p className="text-sm text-red-400 mt-3">{inlineError}</p>}

                  <div className="mt-4 flex gap-2">
                    <Button variant="ghost" onClick={() => setStep(1)} disabled={submitting}>
                      Back
                    </Button>
                    <Button onClick={placeOrder} disabled={submitting}>
                      {submitting ? 'Placing Order...' : 'Place Order'}
                    </Button>
                  </div>
                </div>
              )}
            </section>

            <aside className="border border-brand-gold/20 bg-brand-black/50 p-5 h-fit">
              <h3 className="font-accent text-brand-gold tracking-widest uppercase text-sm mb-3">
                Order Summary
              </h3>
              <div className="space-y-2 text-sm">
                {cartSummary.map((item) => (
                  <div key={`summary-${item.product_id}`} className="flex justify-between">
                    <span className="text-brand-cream/80">{item.name}</span>
                    <span className="text-brand-cream">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-brand-gold/20 mt-4 pt-3 flex justify-between font-accent text-brand-gold">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </PageWrapper>
  )
}

export default CheckoutPage
