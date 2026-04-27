import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/api/categories'

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  })
}
