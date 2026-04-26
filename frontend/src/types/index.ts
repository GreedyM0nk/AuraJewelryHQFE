export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category_id: string | null
  category?: Category | null
  image_url: string | null
  stock_quantity: number
  sku: string
  created_at: string
  isNew?: boolean
}

export interface Category {
  id: string
  name: string
  description: string | null
  image_url: string | null
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface ProductCreate {
  name: string
  description?: string | null
  price: number
  category_id?: string | null
  image_url?: string | null
  stock_quantity: number
  sku: string
}

export interface ProductUpdate {
  name?: string
  description?: string | null
  price?: number
  category_id?: string | null
  image_url?: string | null
  stock_quantity?: number
  sku?: string
}

export interface CategoryCreate {
  name: string
  description?: string | null
  image_url?: string | null
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  country: string
  signup_date: string | null
  created_at: string
}

export interface CustomerCreate {
  name: string
  email: string
  phone?: string | null
  country: string
  signup_date?: string | null
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
}

export interface Order {
  id: string
  customer_id: string
  order_date: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  sales_channel: string | null
  items: OrderItem[]
}

export interface OrderCreate {
  customer_id: string
  total_amount: number
  sales_channel: string
  items: Array<{
    product_id: string
    quantity: number
    unit_price: number
  }>
}
