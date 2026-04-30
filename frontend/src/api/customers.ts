import axiosClient from './axiosClient'
import type { Customer, CustomerCreate } from '@/types'

export const registerCustomer = (payload: CustomerCreate) =>
  axiosClient.post<Customer>('/customers', payload).then((res) => res.data)

export const lookupCustomerByEmail = (email: string) =>
  axiosClient.post<Customer>('/customers/lookup', { email }).then((res) => res.data)

export const listCustomers = (apiKey: string, search?: string) =>
  axiosClient
    .get<Customer[]>('/customers', { params: { search }, headers: { 'X-Api-Key': apiKey } })
    .then((res) => res.data)

export const deleteCustomer = (id: string, apiKey: string) =>
  axiosClient.delete(`/customers/${id}`, { headers: { 'X-Api-Key': apiKey } })
