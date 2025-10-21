import axios from 'axios'
import { useAuthStore } from '@/store/auth'

const baseURL = import.meta.env.VITE_API_BASE
if (!baseURL) {
  // 强约束：未设置则立即报错，确保只从 .env 提供
  throw new Error('VITE_API_BASE is not defined. Please set it in your .env files.')
}

const instance = axios.create({
  baseURL,
  timeout: 15000
})

instance.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      const auth = useAuthStore()
      auth.logout(false)
    }
    return Promise.reject(err)
  }
)

export default instance
