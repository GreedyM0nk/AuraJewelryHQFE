export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category_id: string
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
