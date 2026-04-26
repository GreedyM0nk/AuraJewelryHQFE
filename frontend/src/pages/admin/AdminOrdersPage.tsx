import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { deleteOrder, listOrders, updateOrderStatus } from '@/api/orders'
import type { AdminOutletContext } from './AdminLayout'
import type { Order } from '@/types'

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

const AdminOrdersPage: React.FC = () => {
  const { apiKey, handleUnauthorized } = useOutletContext<AdminOutletContext>()
  const [orders, setOrders] = useState<Order[]>([])
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOrders = async (status?: string) => {
    setLoading(true)
    setError('')
    try {
      const data = await listOrders(apiKey, status ? { status } : undefined)
      setOrders(data)
    } catch (unknownError) {
      const err = unknownError as { status?: number; message?: string }
      setError(err.message ?? 'Could not load orders')
      if (err.status === 401) {
        handleUnauthorized()
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchOrders(statusFilter || undefined)
  }, [statusFilter, apiKey])

  const onUpdateStatus = async (orderId: string, nextStatus: string) => {
    setError('')
    try {
      await updateOrderStatus(orderId, nextStatus, apiKey)
      await fetchOrders(statusFilter || undefined)
    } catch (unknownError) {
      const err = unknownError as { status?: number; message?: string }
      setError(err.message ?? 'Failed to update order status')
      if (err.status === 401) {
        handleUnauthorized()
      }
    }
  }

  const onDelete = async (order: Order) => {
    const confirmed = window.confirm(`Delete order ${order.id.slice(0, 8)}?`)
    if (!confirmed) {
      return
    }

    setError('')
    try {
      await deleteOrder(order.id, apiKey)
      await fetchOrders(statusFilter || undefined)
    } catch (unknownError) {
      const err = unknownError as { status?: number; message?: string }
      setError(err.message ?? 'Failed to delete order')
      if (err.status === 401) {
        handleUnauthorized()
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="font-accent text-brand-gold tracking-widest uppercase text-base">Orders</h1>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter orders by status"
          className="bg-brand-black border border-brand-gold/30 p-2 text-sm"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      {loading ? (
        <div className="py-10 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-brand-gold/20 text-brand-gold/80">
                <th className="py-2 pr-3">Order ID</th>
                <th className="py-2 pr-3">Customer ID</th>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Total</th>
                <th className="py-2 pr-3">Channel</th>
                <th className="py-2 pr-3">Items</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id
                return (
                  <React.Fragment key={order.id}>
                    <tr
                      className="border-b border-brand-gold/10 cursor-pointer"
                      onClick={() =>
                        setExpandedOrderId((current) => (current === order.id ? null : order.id))
                      }
                    >
                      <td className="py-2 pr-3">{order.id.slice(0, 8)}</td>
                      <td className="py-2 pr-3">{order.customer_id.slice(0, 8)}</td>
                      <td className="py-2 pr-3">{new Date(order.order_date).toLocaleString()}</td>
                      <td className="py-2 pr-3">
                        <span className="inline-block px-2 py-1 border border-brand-gold/30 text-xs uppercase tracking-widest">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2 pr-3">{formatCurrency(order.total_amount)}</td>
                      <td className="py-2 pr-3">{order.sales_channel ?? '-'}</td>
                      <td className="py-2 pr-3">{order.items.length}</td>
                      <td className="py-2 pr-3" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            aria-label={`Update status for order ${order.id.slice(0, 8)}`}
                            className="bg-brand-black border border-brand-gold/30 p-1 text-xs"
                            onChange={(event) => void onUpdateStatus(order.id, event.target.value)}
                          >
                            {ORDER_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <Button size="sm" variant="ghost" onClick={() => void onDelete(order)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-b border-brand-gold/10 bg-brand-black/50">
                        <td colSpan={8} className="py-3 px-2">
                          <p className="text-brand-gold/80 text-xs uppercase tracking-widest mb-2">
                            Order Items
                          </p>
                          <div className="space-y-1 text-xs">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="grid grid-cols-1 md:grid-cols-3 gap-2 text-brand-cream/80"
                              >
                                <span>Product: {item.product_id}</span>
                                <span>Quantity: {item.quantity}</span>
                                <span>Unit Price: {formatCurrency(item.unit_price)}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminOrdersPage
