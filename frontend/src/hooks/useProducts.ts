import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/api/products'
import { MOCK_PRODUCTS } from '@/data/mockProducts'

export const useProducts = (categoryId?: string, search?: string) => {
  const normalizedSearch = search?.trim() || undefined

  return useQuery({
    queryKey: ['products', categoryId, normalizedSearch],
    queryFn: async () => {
      try {
        return await getProducts({
          ...(categoryId ? { category_id: categoryId } : {}),
          ...(normalizedSearch ? { search: normalizedSearch } : {}),
        })
      } catch {
        return MOCK_PRODUCTS.filter((product) => {
          const matchesCategory = !categoryId || product.category_id === categoryId
          const haystack = `${product.name} ${product.description ?? ''}`.toLowerCase()
          const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch.toLowerCase())
          return matchesCategory && matchesSearch
        })
      }
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: MOCK_PRODUCTS,
    retry: 1,
  })
}
