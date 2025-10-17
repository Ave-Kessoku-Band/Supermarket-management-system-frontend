import http from './http'

export function paymentMethods(): Promise<string[]> {
  return http.get('/v1/config/payment-methods')
}
