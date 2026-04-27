import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/api/products'

export const useProducts = (categoryId?: string, search?: string, sort?: string) => {
  const normalizedSearch = search?.trim() || undefined

  return useQuery({
    queryKey: ['products', categoryId, normalizedSearch, sort],
    queryFn: () =>
      getProducts({
        ...(categoryId ? { category_id: categoryId } : {}),
        ...(normalizedSearch ? { search: normalizedSearch } : {}),
        ...(sort ? { sort } : {}),
      }),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  })
}
