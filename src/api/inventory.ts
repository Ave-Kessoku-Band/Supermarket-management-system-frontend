import http from './http'
import type { InventoryLevel } from './types'

export function getLevels(params?: { sku?: string }): Promise<InventoryLevel[]> {
  return http.get('/v1/inventory/levels', { params })
}
export function postAdjustment(body: { sku_id: string; delta: number; reason: 'stocktake'|'damage'|'manual'; note?: string }): Promise<void> {
  return http.post('/v1/inventory/adjustments', body)
}
