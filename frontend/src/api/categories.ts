import axiosClient from './axiosClient'
import type { Category, CategoryCreate } from '@/types'

export const getCategories = () => axiosClient.get<Category[]>('/categories').then((res) => res.data)

export const createCategory = (payload: CategoryCreate, apiKey: string) =>
	axiosClient.post<Category>('/categories', payload, { headers: { 'X-Api-Key': apiKey } }).then((res) => res.data)

export const deleteCategory = (id: string, apiKey: string) =>
	axiosClient.delete(`/categories/${id}`, { headers: { 'X-Api-Key': apiKey } })
