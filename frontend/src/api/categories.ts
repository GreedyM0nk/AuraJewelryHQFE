import axiosClient from './axiosClient'
import type { Category } from '@/types'

export const getCategories = () => axiosClient.get<Category[]>('/categories').then((res) => res.data)
