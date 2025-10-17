import http from './http'
import type { Receipt } from './types'

export function getReceipt(receiptNo: string): Promise<Receipt> {
  return http.get(`/v1/receipts/${receiptNo}`)
}
