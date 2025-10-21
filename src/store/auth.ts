import { defineStore } from 'pinia'
import { apiLogin, apiMe, apiLogout, apiRegister } from '@/api/endpoints'

type Role = 'member' | 'staff' | 'admin'
type AccountStatus = 'ACTIVE' | 'DISABLED'

export type User = {
  id: string
  username: string
  name?: string
  email?: string
  phone?: string
  role: Role
  level?: 'NORMAL' | 'SILVER' | 'GOLD'
  points?: number
  totalSpent?: number
  status?: AccountStatus
  createdAt?: string
}

type State = {
  user: User | null
  token: string | null
  refreshToken: string | null
  initialized: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): State => ({
    user: null,
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    initialized: false
  }),
  getters: {
    isAuthenticated: (s) => !!s.token && !!s.user
  },
  actions: {
    async bootstrap() {
      try {
        if (this.token) {
          const me = await apiMe()
          this.user = me
        }
      } catch {
        this.logout(false)
      } finally {
        this.initialized = true
      }
    },
    async login(username: string, password: string) {
      const res = await apiLogin({ username, password })
      this.token = res.token
      this.refreshToken = res.refreshToken
      localStorage.setItem('token', this.token!)
      localStorage.setItem('refreshToken', this.refreshToken!)
      const me = await apiMe()
      this.user = me
    },
    async register(payload: { username: string; email: string; password: string; phone: string }) {
      const res = await apiRegister(payload)
      this.token = res.token
      localStorage.setItem('token', this.token!)
      const me = await apiMe()
      this.user = me
    },
    async logout(callApi = true) {
      try {
        if (callApi) await apiLogout()
      } catch {}
      this.user = null
      this.token = null
      this.refreshToken = null
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    }
  }
})
