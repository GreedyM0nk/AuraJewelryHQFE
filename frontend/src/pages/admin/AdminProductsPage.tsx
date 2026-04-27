import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/api/products'
import { getCategories } from '@/api/categories'
import type { AdminOutletContext } from './AdminLayout'
import type { Category, Product, ProductCreate, ProductUpdate } from '@/types'

type ProductFormState = {
  name: string
  sku: string
  price: string
  stock_quantity: string
  category_id: string
  description: string
  image_url: string
}

const emptyForm: ProductFormState = {
  name: '',
  sku: '',
  price: '',
  stock_quantity: '0',
  category_id: '',
  description: '',
  image_url: '',
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

const AdminProductsPage: React.FC = () => {
  const { apiKey, handleUnauthorized } = useOutletContext<AdminOutletContext>()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductFormState>(emptyForm)

  const categoryMap = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name]))
  }, [categories])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [productsData, categoriesData] = await Promise.all([getProducts(), getCategories()])
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (unknownError) {
      const err = unknownError as { status?: number; message?: string }
      setError(err.message ?? 'Could not load products')
      if (err.status === 401) {
        handleUnauthorized()
      }
    } finally {
      setLoading(false)
    }
  }, [handleUnauthorized])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      stock_quantity: String(product.stock_quantity),
      category_id: product.category_id ?? '',
      description: product.description ?? '',
      image_url: product.image_url ?? '',
    })
    setModalOpen(true)
  }

  const saveProduct = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.name.trim() || !form.sku.trim() || !form.price.trim() || !form.stock_quantity.trim()) {
      setError('Name, SKU, price and stock are required.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const payload: ProductCreate | ProductUpdate = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity),
        category_id: form.category_id || null,
        description: form.description || null,
        image_url: form.image_url || null,
      }

      if (editing) {
        await updateProduct(editing.id, payload, apiKey)
      } else {
        await createProduct(payload as ProductCreate, apiKey)
      }

      setModalOpen(false)
      await loadData()
    } catch (unknownError) {
      const err = unknownError as { status?: number; message?: string }
      setError(err.message ?? 'Failed to save product')
      if (err.status === 401) {
        handleUnauthorized()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(`Delete ${product.name}?`)
    if (!confirmed) {
      return
    }

    setError('')
    try {
      await deleteProduct(product.id, apiKey)
      await loadData()
    } catch (unknownError) {
      const err = unknownError as { status?: number; message?: string }
      setError(err.message ?? 'Failed to delete product')
      if (err.status === 401) {
        handleUnauthorized()
      }
    }
  }

  const criticalStock = products.filter((p) => p.stock_quantity <= 3)
  const lowStock = products.filter((p) => p.stock_quantity > 3 && p.stock_quantity <= 7)

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="font-accent text-brand-gold tracking-widest uppercase text-base">Products</h1>
        <Button onClick={openAdd}>Add Product</Button>
      </div>

      {!loading && criticalStock.length > 0 && (
        <div className="flex items-start gap-3 border border-red-500/30 bg-red-500/10 px-4 py-3 mb-4 rounded-sm">
          <span className="text-red-400 text-xs font-accent tracking-widest uppercase shrink-0">⚠ Critical Stock</span>
          <p className="font-body text-red-300/80 text-xs">
            {criticalStock.map((p) => `${p.name} (${p.stock_quantity} left)`).join(' · ')}
          </p>
        </div>
      )}
      {!loading && lowStock.length > 0 && (
        <div className="flex items-start gap-3 border border-amber-500/30 bg-amber-500/10 px-4 py-3 mb-4 rounded-sm">
          <span className="text-amber-400 text-xs font-accent tracking-widest uppercase shrink-0">Low Stock</span>
          <p className="font-body text-amber-300/80 text-xs">
            {lowStock.map((p) => `${p.name} (${p.stock_quantity} left)`).join(' · ')}
          </p>
        </div>
      )}

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
                <th className="py-2 pr-3">SKU</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3">Price</th>
                <th className="py-2 pr-3">Stock</th>
                <th className="py-2 pr-3">Created</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-brand-gold/10">
                  <td className="py-2 pr-3">{product.name}</td>
                  <td className="py-2 pr-3">{product.sku}</td>
                  <td className="py-2 pr-3">
                    {product.category_id ? (categoryMap.get(product.category_id) ?? '-') : '-'}
                  </td>
                  <td className="py-2 pr-3">{formatCurrency(product.price)}</td>
                  <td className="py-2 pr-3">{product.stock_quantity}</td>
                  <td className="py-2 pr-3">{new Date(product.created_at).toLocaleDateString()}</td>
                  <td className="py-2 pr-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(product)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(product)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-brand-charcoal border border-brand-gold/30 p-5">
            <h2 className="font-accent text-brand-gold tracking-widest uppercase mb-4">
              {editing ? 'Edit Product' : 'Add Product'}
            </h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={saveProduct}>
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Name*"
                className="bg-brand-black border border-brand-gold/30 p-2"
              />
              <input
                value={form.sku}
                onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
                placeholder="SKU*"
                className="bg-brand-black border border-brand-gold/30 p-2"
              />
              <input
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                placeholder="Price*"
                type="number"
                min="0"
                step="0.01"
                className="bg-brand-black border border-brand-gold/30 p-2"
              />
              <input
                value={form.stock_quantity}
                onChange={(event) => setForm((prev) => ({ ...prev, stock_quantity: event.target.value }))}
                placeholder="Stock*"
                type="number"
                min="0"
                className="bg-brand-black border border-brand-gold/30 p-2"
              />
              <select
                value={form.category_id}
                onChange={(event) => setForm((prev) => ({ ...prev, category_id: event.target.value }))}
                aria-label="Category"
                className="bg-brand-black border border-brand-gold/30 p-2"
              >
                <option value="">No Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                value={form.image_url}
                onChange={(event) => setForm((prev) => ({ ...prev, image_url: event.target.value }))}
                placeholder="Image URL"
                className="bg-brand-black border border-brand-gold/30 p-2"
              />
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Description"
                rows={3}
                className="bg-brand-black border border-brand-gold/30 p-2 md:col-span-2"
              />
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProductsPage
