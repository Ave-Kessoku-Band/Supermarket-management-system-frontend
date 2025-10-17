import { defineStore } from 'pinia'
import { loginApi, meApi, logoutApi } from '../api/auth'
import type { User } from '../api/types'

const ACCESS_KEY = 'token:access'
const REFRESH_KEY = 'token:refresh'
const USER_KEY = 'user:self'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: (JSON.parse(localStorage.getItem(USER_KEY) || 'null')) as User | null,
    accessToken: localStorage.getItem(ACCESS_KEY) || '',
    refreshToken: localStorage.getItem(REFRESH_KEY) || '',
    loading: false,
  }),
  getters: {
    isAuthenticated: (s) => !!s.accessToken,
    role: (s) => s.user?.role,
  },
  actions: {
    async login(username: string, password: string) {
      this.loading = true
      try {
        const res = await loginApi({ username, password })
        this.accessToken = res.access_token
        this.refreshToken = res.refresh_token
        localStorage.setItem(ACCESS_KEY, this.accessToken)
        localStorage.setItem(REFRESH_KEY, this.refreshToken)
        const me = await meApi()
        this.user = me
        localStorage.setItem(USER_KEY, JSON.stringify(me))
      } finally {
        this.loading = false
      }
    },
    setTokens(access: string, refresh?: string) {
      this.accessToken = access
      localStorage.setItem(ACCESS_KEY, access)
      if (refresh) {
        this.refreshToken = refresh
        localStorage.setItem(REFRESH_KEY, refresh)
      }
    },
    async logout() {
      try { await logoutApi() } catch {}
      this.accessToken = ''
      this.refreshToken = ''
      this.user = null
      localStorage.removeItem(ACCESS_KEY)
      localStorage.removeItem(REFRESH_KEY)
      localStorage.removeItem(USER_KEY)
    }
  },
})
