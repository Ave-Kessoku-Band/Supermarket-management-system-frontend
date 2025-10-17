import http from './http'
import type { Cart } from './types'

export function createCart(): Promise<Cart> {
  return http.post('/v1/carts', {})
}
export function addItem(cartId: string, body: { barcode?: string; sku_id?: string; qty: number }): Promise<Cart> {
  return http.post(`/v1/carts/${cartId}/items`, body)
}
export function updateItem(cartId: string, lineId: string, body: { qty?: number; unit_price?: number; line_discount?: number }): Promise<Cart> {
  return http.patch(`/v1/carts/${cartId}/items/${lineId}`, body)
}
export function addDiscount(cartId: string, body: { scope: 'line' | 'order'; line_id?: string; type: 'rate' | 'amount'; value: number }): Promise<Cart> {
  return http.post(`/v1/carts/${cartId}/discounts`, body)
}
export function applyCoupon(cartId: string, code: string): Promise<Cart> {
  return http.post(`/v1/carts/${cartId}/apply-coupon`, { code })
}
export function addPayment(cartId: string, body: { method: string; amount: number; external_ref?: string }): Promise<Cart> {
  return http.post(`/v1/carts/${cartId}/payments`, body)
}
export function checkout(cartId: string): Promise<{ receipt_no: string }> {
  return http.post(`/v1/carts/${cartId}/checkout`, {})
}
