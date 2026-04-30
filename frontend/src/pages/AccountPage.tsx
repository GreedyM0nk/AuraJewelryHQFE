import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Heart, LogOut, Mail, MapPin, Phone, ShoppingBag, User } from 'lucide-react'
import { SEO } from '@/components/SEO'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { Spinner } from '@/components/ui/Spinner'
import { useCustomerStore } from '@/store/customerStore'
import axiosClient from '@/api/axiosClient'

type AccountOrder = {
  id: string
  order_date: string
  total_amount: number | string
  status: string
  items?: Array<{
    product_id?: string
    quantity: number
    unit_price: number | string
  }>
}

const AccountPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const customer = useCustomerStore((state) => state.customer)
  const clearCustomer = useCustomerStore((state) => state.clearCustomer)
  const isLoggedIn = useCustomerStore((state) => state.isLoggedIn)
  const justRegistered = (location.state as { justRegistered?: boolean } | null)?.justRegistered === true

  const [orders, setOrders] = useState<AccountOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login', { state: { from: '/account' }, replace: true })
    }
  }, [isLoggedIn, navigate])

  useEffect(() => {
    if (!customer?.id) {
      return
    }

    const adminKey = localStorage.getItem('adminApiKey')
    if (!adminKey) {
      setOrdersLoading(false)
      return
    }

    axiosClient
      .get<AccountOrder[]>(`/orders/customer/${customer.id}`, { headers: { 'X-Api-Key': adminKey } })
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false))
  }, [customer?.id])

  if (!customer) {
    return null
  }

  const handleSignOut = () => {
    clearCustomer()
    navigate('/')
  }

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const formatINR = (value: number | string) => `₹${Number(value).toLocaleString('en-IN')}`

  const statusColour: Record<string, string> = {
    pending: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    confirmed: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    shipped: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    delivered: 'text-green-400 border-green-400/30 bg-green-400/10',
    cancelled: 'text-red-400 border-red-400/30 bg-red-400/10',
  }

  return (
    <PageWrapper>
      <SEO title="My Account" description="Manage your Aura Jewellery account and order history." noIndex />

      <main className="min-h-screen pt-28 pb-16 px-4 max-w-4xl mx-auto">
        {justRegistered && (
          <div className="border border-brand-gold/30 bg-brand-gold/10 px-6 py-4 mb-8 flex items-center gap-3">
            <span className="text-brand-gold text-lg">✦</span>
            <div>
              <p className="font-accent text-brand-gold text-xs tracking-widest uppercase">Welcome to Aura</p>
              <p className="font-body text-brand-cream/70 text-sm mt-0.5">
                Your account has been created. Welcome, {customer.name.split(' ')[0]}!
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="font-accent text-brand-gold/60 text-xs tracking-[0.4em] uppercase mb-2">My Account</p>
            <h1 className="font-display text-5xl text-brand-cream italic">{customer.name}</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 font-body text-brand-cream/40 text-xs hover:text-red-400 transition-colors mt-2"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>

        <GoldDivider className="mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h2 className="font-accent text-brand-gold text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
              <User size={12} /> Profile
            </h2>
            <div className="border border-brand-gold/15 p-5 space-y-3">
              <div className="flex items-start gap-3">
                <Mail size={13} className="text-brand-gold/50 mt-0.5 shrink-0" />
                <div>
                  <p className="font-body text-brand-cream/40 text-xs">Email</p>
                  <p className="font-body text-brand-cream text-sm">{customer.email}</p>
                </div>
              </div>
              {customer.phone && (
                <div className="flex items-start gap-3">
                  <Phone size={13} className="text-brand-gold/50 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-body text-brand-cream/40 text-xs">Phone</p>
                    <p className="font-body text-brand-cream text-sm">{customer.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <MapPin size={13} className="text-brand-gold/50 mt-0.5 shrink-0" />
                <div>
                  <p className="font-body text-brand-cream/40 text-xs">Country</p>
                  <p className="font-body text-brand-cream text-sm">{customer.country}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-brand-gold/10">
                <p className="font-body text-brand-cream/30 text-xs">Member since {formatDate(customer.created_at)}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Link to="/shop" className="flex items-center gap-2 font-body text-brand-cream/50 text-xs hover:text-brand-gold transition-colors">
                <ShoppingBag size={12} /> Continue Shopping
              </Link>
              <Link to="/wishlist" className="flex items-center gap-2 font-body text-brand-cream/50 text-xs hover:text-brand-gold transition-colors">
                <Heart size={12} /> View Wishlist
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="font-accent text-brand-gold text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
              <ShoppingBag size={12} /> Order History
            </h2>

            {ordersLoading ? (
              <div className="flex justify-center py-12"><Spinner size="md" /></div>
            ) : orders.length === 0 ? (
              <div className="border border-brand-gold/15 p-8 text-center">
                <ShoppingBag size={32} className="text-brand-gold/20 mx-auto mb-3" />
                <p className="font-body text-brand-cream/40 text-sm">No orders yet</p>
                <Link to="/shop" className="font-accent text-brand-gold text-xs tracking-widest hover:underline mt-3 inline-block uppercase">
                  Browse Collection {'->'}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="border border-brand-gold/15 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-accent text-brand-cream/70 text-xs tracking-wider">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="font-body text-brand-cream/40 text-xs mt-0.5">{formatDate(order.order_date)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`font-accent text-xs px-2 py-0.5 border uppercase tracking-wider ${statusColour[order.status] ?? 'text-brand-cream/40'}`}>
                          {order.status}
                        </span>
                        <p className="font-body text-brand-gold text-sm mt-1">{formatINR(order.total_amount)}</p>
                      </div>
                    </div>
                    {order.items?.length ? (
                      <ul className="space-y-1 pt-2 border-t border-brand-gold/10">
                        {order.items.map((item, index) => (
                          <li key={`${order.id}-${index}`} className="font-body text-brand-cream/50 text-xs flex justify-between">
                            <span>{item.product_id?.slice(-8)}</span>
                            <span>x{item.quantity} · {formatINR(item.unit_price)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </PageWrapper>
  )
}

export default AccountPage
