import axiosClient from './axiosClient'
import type { Order, OrderCreate } from '@/types'

export const createOrder = (payload: OrderCreate) =>
  axiosClient.post<Order>('/orders', payload).then((res) => res.data)

export const getOrder = (id: string, apiKey: string) =>
  axiosClient.get<Order>(`/orders/${id}`, { headers: { 'X-Api-Key': apiKey } }).then((res) => res.data)

export const listOrders = (
  apiKey: string,
  filters?: { status?: string; customer_id?: string }
) =>
  axiosClient
    .get<Order[]>('/orders', { params: filters, headers: { 'X-Api-Key': apiKey } })
    .then((res) => res.data)

export const updateOrderStatus = (id: string, status: string, apiKey: string) =>
  axiosClient
    .patch<Order>(`/orders/${id}/status`, { status }, { headers: { 'X-Api-Key': apiKey } })
    .then((res) => res.data)

export const deleteOrder = (id: string, apiKey: string) =>
  axiosClient.delete(`/orders/${id}`, { headers: { 'X-Api-Key': apiKey } })
