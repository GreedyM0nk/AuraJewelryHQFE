import axiosClient from './axiosClient'
import type { Product, ProductCreate, ProductUpdate } from '@/types'

export const getProducts = (params?: {
  category_id?: string
  search?: string
  limit?: number
  offset?: number
  sort?: string
}) =>
  axiosClient.get<Product[]>('/products', { params }).then((res) => res.data)

export const getProductById = (id: string) =>
  axiosClient.get<Product>(`/products/${id}`).then((res) => res.data)

export const getProduct = (id: string) =>
  axiosClient.get<Product>(`/products/${id}`).then((res) => res.data)

export const createProduct = (payload: ProductCreate, apiKey: string) =>
  axiosClient.post<Product>('/products', payload, { headers: { 'X-Api-Key': apiKey } }).then((res) => res.data)

export const updateProduct = (id: string, payload: ProductUpdate, apiKey: string) =>
  axiosClient
    .patch<Product>(`/products/${id}`, payload, { headers: { 'X-Api-Key': apiKey } })
    .then((res) => res.data)

export const deleteProduct = (id: string, apiKey: string) =>
  axiosClient.delete(`/products/${id}`, { headers: { 'X-Api-Key': apiKey } })
