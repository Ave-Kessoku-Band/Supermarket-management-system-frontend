import http from './http'
import type { Product } from './types'

export function listProducts(params?: { keyword?: string; status?: string; page?: number; page_size?: number }): Promise<{ items: Product[]; total: number }> {
  return http.get('/v1/products', { params })
}
export function createProduct(p: Partial<Product>): Promise<Product> {
  return http.post('/v1/products', p)
}
export function updateProduct(id: string, p: Partial<Product>): Promise<Product> {
  return http.patch(`/v1/products/${id}`, p)
}
export function deleteProduct(id: string): Promise<void> {
  return http.delete(`/v1/products/${id}`)
}
export function getByBarcode(barcode: string): Promise<Product> {
  return http.get('/v1/products:by-barcode', { params: { barcode } })
}
export function bulkUpsertPrices(items: { sku: string; price: number }[]): Promise<void> {
  return http.post('/v1/prices:bulk-upsert', items)
}
