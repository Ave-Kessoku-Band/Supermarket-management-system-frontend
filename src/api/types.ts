export type Role = 'admin' | 'cashier'

export interface User {
  id: string
  username: string
  role: Role
  status?: string
  created_at?: string
}

export interface Product {
  id: string
  sku: string
  name: string
  barcodes: string[]
  unit: string
  price: number
  tax_rate: number
  is_weighed: boolean
  status: 'active' | 'inactive'
}

export interface InventoryLevel {
  sku_id: string
  qty_on_hand: number
  safety_stock?: number
  updated_at?: string
}

export interface CartItem {
  line_id: string
  sku_id: string
  name: string
  qty: number
  unit_price: number
  line_discount: number
  line_total: number
}

export interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  discount_total: number
  tax_total: number
  grand_total: number
  status: 'open' | 'checked_out'
  created_by: string
}

export interface Receipt {
  receipt_no: string
  cart_id: string
  subtotal: number
  discount_total: number
  tax_total: number
  grand_total: number
  paid_at: string
  cashier: string
}
