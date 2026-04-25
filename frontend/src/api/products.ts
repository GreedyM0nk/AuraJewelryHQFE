import axiosClient from './axiosClient'
import type { Product } from '@/types'

export const getProducts = (params?: { category_id?: string }) =>
  axiosClient.get<Product[]>('/products', { params }).then((res) => res.data)

export const getProductById = (id: string) =>
  axiosClient.get<Product>(`/products/${id}`).then((res) => res.data)
