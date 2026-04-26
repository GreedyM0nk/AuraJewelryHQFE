import React, { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { createCategory, deleteCategory, getCategories } from '@/api/categories'
import type { AdminOutletContext } from './AdminLayout'
import type { Category } from '@/types'

const AdminCategoriesPage: React.FC = () => {
  const { apiKey, handleUnauthorized } = useOutletContext<AdminOutletContext>()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const loadCategories = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (unknownError) {
      const err = unknownError as { status?: number; message?: string }
      setError(err.message ?? 'Could not load categories')
      if (err.status === 401) {
        handleUnauthorized()
      }
    } finally {
      setLoading(false)
    }
  }, [handleUnauthorized])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  const onCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Category name is required')
      return
    }

    setError('')
    try {
      await createCategory(
        {
          name: name.trim(),
          description: description.trim() || null,
          image_url: imageUrl.trim() || null,
        },
        apiKey
      )
      setName('')
      setDescription('')
      setImageUrl('')
      await loadCategories()
    } catch (unknownError) {
      const err = unknownError as { status?: number; message?: string }
      setError(err.message ?? 'Failed to create category')
      if (err.status === 401) {
        handleUnauthorized()
      }
    }
  }

  const onDelete = async (category: Category) => {
    const confirmed = window.confirm(`Delete ${category.name}?`)
    if (!confirmed) {
      return
    }

    setError('')
    try {
      await deleteCategory(category.id, apiKey)
      await loadCategories()
    } catch (unknownError) {
      const err = unknownError as { status?: number; message?: string }
      setError(err.message ?? 'Failed to delete category')
      if (err.status === 401) {
        handleUnauthorized()
      }
    }
  }

  return (
    <div>
      <h1 className="font-accent text-brand-gold tracking-widest uppercase text-base mb-4">Categories</h1>

      <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="bg-brand-black border border-brand-gold/30 p-2"
          placeholder="Name*"
        />
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="bg-brand-black border border-brand-gold/30 p-2"
          placeholder="Description"
        />
        <input
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          className="bg-brand-black border border-brand-gold/30 p-2"
          placeholder="Image URL"
        />
        <Button type="submit" className="w-full">
          Add Category
        </Button>
      </form>

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
                <th className="py-2 pr-3">Description</th>
                <th className="py-2 pr-3">Image URL</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-brand-gold/10">
                  <td className="py-2 pr-3">{category.name}</td>
                  <td className="py-2 pr-3">{category.description ?? '-'}</td>
                  <td className="py-2 pr-3 break-all">{category.image_url ?? '-'}</td>
                  <td className="py-2 pr-3">
                    <Button size="sm" variant="ghost" onClick={() => onDelete(category)}>
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

export default AdminCategoriesPage
