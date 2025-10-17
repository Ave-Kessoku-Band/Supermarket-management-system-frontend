import http from './http'
import type { User } from './types'

export function loginApi(body: { username: string; password: string }): Promise<{ access_token: string; refresh_token: string }> {
  return http.post('/v1/auth/login', body, { idempotency: false })
}
export function refreshApi(refreshToken: string): Promise<{ access_token: string; refresh_token?: string }> {
  return http.post('/v1/auth/refresh', { refresh_token: refreshToken }, { idempotency: false })
}
export function logoutApi(): Promise<void> {
  return http.post('/v1/auth/logout', {}, { idempotency: false })
}
export function meApi(): Promise<User> {
  return http.get('/v1/auth/me')
}
