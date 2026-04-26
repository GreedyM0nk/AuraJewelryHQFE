import React, { useMemo, useState } from 'react'
import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

type AdminNavItem = {
  label: string
  to: string
}

const NAV_ITEMS: AdminNavItem[] = [
  { label: 'Products', to: '/admin/products' },
  { label: 'Categories', to: '/admin/categories' },
  { label: 'Customers', to: '/admin/customers' },
  { label: 'Orders', to: '/admin/orders' },
]

export type AdminOutletContext = {
  apiKey: string
  handleUnauthorized: () => void
}

const AdminLayout: React.FC = () => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('adminApiKey')?.trim() ?? '')
  const [inputKey, setInputKey] = useState('')

  const hasApiKey = apiKey.length > 0

  const outletContext = useMemo<AdminOutletContext>(
    () => ({
      apiKey,
      handleUnauthorized: () => {
        localStorage.removeItem('adminApiKey')
        setApiKey('')
      },
    }),
    [apiKey]
  )

  if (!hasApiKey) {
    return (
      <main className="min-h-screen bg-brand-charcoal text-brand-cream pt-28 px-4">
        <section className="max-w-md mx-auto border border-brand-gold/30 p-6 bg-brand-black/60">
          <h1 className="font-accent text-brand-gold text-lg tracking-widest uppercase mb-2">
            Admin Access
          </h1>
          <p className="font-body text-sm text-brand-cream/70 mb-5">
            Enter your admin API key to unlock dashboard access.
          </p>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              const value = inputKey.trim()
              if (!value) {
                return
              }
              localStorage.setItem('adminApiKey', value)
              setApiKey(value)
            }}
          >
            <input
              value={inputKey}
              onChange={(event) => setInputKey(event.target.value)}
              type="password"
              className="w-full bg-brand-black border border-brand-gold/40 px-3 py-2 text-brand-cream outline-none focus:border-brand-gold"
              placeholder="Enter X-Api-Key"
            />
            <Button type="submit" className="w-full">
              Unlock
            </Button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brand-charcoal text-brand-cream pt-24">
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          <aside className="border border-brand-gold/20 bg-brand-black/60 p-4 h-fit">
            <h2 className="font-accent text-brand-gold tracking-widest uppercase mb-4">Admin</h2>
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-body transition-colors ${
                      isActive
                        ? 'text-brand-gold bg-brand-gold/10'
                        : 'text-brand-cream/70 hover:text-brand-gold hover:bg-brand-gold/5'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <Button
              variant="ghost"
              className="w-full mt-5"
              onClick={() => {
                localStorage.removeItem('adminApiKey')
                setApiKey('')
              }}
            >
              Lock Dashboard
            </Button>
          </aside>

          <section className="border border-brand-gold/20 bg-brand-black/60 p-4 md:p-6">
            <Outlet context={outletContext} />
          </section>
        </div>
      </div>
    </main>
  )
}

export const RequireAdminIndex: React.FC = () => <Navigate to="/admin/products" replace />

export default AdminLayout
