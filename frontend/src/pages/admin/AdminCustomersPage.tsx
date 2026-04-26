import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { deleteCustomer, listCustomers } from '@/api/customers'
import type { AdminOutletContext } from './AdminLayout'
import type { Customer } from '@/types'

const AdminCustomersPage: React.FC = () => {
  const { apiKey, handleUnauthorized } = useOutletContext<AdminOutletContext>()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchCustomers = async (searchTerm?: string) => {
    setLoading(true)
    setError('')
    try {
      const data = await listCustomers(apiKey, searchTerm)
      setCustomers(data)
    } catch (unknownError) {
      const err = unknownError as { status?: number; message?: string }
      setError(err.message ?? 'Could not load customers')
      if (err.status === 401) {
        handleUnauthorized()
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchCustomers(search.trim() || undefined)
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [search, apiKey])

  const onDelete = async (customer: Customer) => {
    const confirmed = window.confirm(`Delete ${customer.name}?`)
    if (!confirmed) {
      return
    }

    setError('')
    try {
      await deleteCustomer(customer.id, apiKey)
      await fetchCustomers(search.trim() || undefined)
    } catch (unknownError) {
      const err = unknownError as { status?: number; message?: string }
      setError(err.message ?? 'Failed to delete customer')
      if (err.status === 401) {
        handleUnauthorized()
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="font-accent text-brand-gold tracking-widest uppercase text-base">Customers</h1>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name or email"
          className="w-full max-w-xs bg-brand-black border border-brand-gold/30 p-2 text-sm"
        />
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
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Phone</th>
                <th className="py-2 pr-3">Country</th>
                <th className="py-2 pr-3">Signup Date</th>
                <th className="py-2 pr-3">Created</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-brand-gold/10">
                  <td className="py-2 pr-3">{customer.name}</td>
                  <td className="py-2 pr-3">{customer.email}</td>
                  <td className="py-2 pr-3">{customer.phone ?? '-'}</td>
                  <td className="py-2 pr-3">{customer.country}</td>
                  <td className="py-2 pr-3">{customer.signup_date ?? '-'}</td>
                  <td className="py-2 pr-3">{new Date(customer.created_at).toLocaleDateString()}</td>
                  <td className="py-2 pr-3">
                    <Button size="sm" variant="ghost" onClick={() => onDelete(customer)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminCustomersPage
