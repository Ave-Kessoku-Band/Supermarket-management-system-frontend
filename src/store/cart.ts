import { defineStore } from 'pinia'
import { apiAddCartItem, apiCartCount, apiClearCart, apiDeleteCartItem, apiGetCart, apiUpdateCartItem } from '@/api/endpoints'

export type CartItem = {
  itemId: string
  productId: string
  name: string
  imageUrl?: string
  price: number
  unit: string
  quantity: number
  subtotal: number
}

type Cart = {
  items: CartItem[]
  discount?: number
  total: number
  badgeCount?: number
}

type State = {
  cart: Cart | null
  badgeCount: number
  loading: boolean
}

export const useCartStore = defineStore('cart', {
  state: (): State => ({
    cart: null,
    badgeCount: 0,
    loading: false
  }),
  actions: {
    async fetchCart() {
      this.loading = true
      try {
        this.cart = await apiGetCart()
        this.badgeCount = this.cart?.badgeCount ?? (this.cart?.items?.length ?? 0)
      } finally {
        this.loading = false
      }
    },
    async fetchBadge() {
      try {
        const data = await apiCartCount()
        this.badgeCount = data.count ?? 0
      } catch {}
    },
    async add(productId: string, quantity = 1) {
      await apiAddCartItem({ productId, quantity })
      await this.fetchCart()
    },
    async update(itemId: string, quantity: number) {
      await apiUpdateCartItem(itemId, quantity)
      await this.fetchCart()
    },
    async remove(itemId: string) {
      await apiDeleteCartItem(itemId)
      await this.fetchCart()
    },
    async clear() {
      await apiClearCart()
      await this.fetchCart()
    }
  }
})
