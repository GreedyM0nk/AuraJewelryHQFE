import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/api/categories'
import { MOCK_CATEGORIES } from '@/data/mockCategories'

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        return await getCategories()
      } catch {
        return MOCK_CATEGORIES
      }
    },
    staleTime: 10 * 60 * 1000,
    placeholderData: MOCK_CATEGORIES,
    retry: 1,
  })
}
