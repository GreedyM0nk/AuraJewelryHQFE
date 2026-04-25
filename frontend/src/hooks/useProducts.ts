import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/api/products'
import { MOCK_PRODUCTS } from '@/data/mockProducts'

export const useProducts = (categoryId?: string) => {
  return useQuery({
    queryKey: ['products', categoryId],
    queryFn: async () => {
      try {
        return await getProducts(categoryId ? { category_id: categoryId } : undefined)
      } catch {
        return categoryId
          ? MOCK_PRODUCTS.filter((product) => product.category_id === categoryId)
          : MOCK_PRODUCTS
      }
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: MOCK_PRODUCTS,
    retry: 1,
  })
}
