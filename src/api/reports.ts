import http from './http'

export function salesSummary(date: string): Promise<{ transactions: number; turnover: number; discount: number; tax: number; by_methods: Record<string, number>; gross_profit?: number }> {
  return http.get('/v1/reports/sales-summary', { params: { date } })
}
