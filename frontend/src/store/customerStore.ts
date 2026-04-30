import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CustomerSession {
  id: string
  name: string
  email: string
  phone: string | null
  country: string
  signup_date: string | null
  created_at: string
}

interface CustomerState {
  customer: CustomerSession | null
  setCustomer: (customer: CustomerSession) => void
  clearCustomer: () => void
  isLoggedIn: () => boolean
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customer: null,
      setCustomer: (customer) => set({ customer }),
      clearCustomer: () => set({ customer: null }),
      isLoggedIn: () => get().customer !== null,
    }),
    {
      name: 'aura-customer',
      partialize: (state) => ({ customer: state.customer }),
    }
  )
)
