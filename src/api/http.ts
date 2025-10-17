import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    idempotency?: boolean
    _retry?: boolean
  }
}

const baseURL = (import.meta as any).env?.VITE_API_BASE_URL || '/'

const instance: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
})

// 生成随机 UUID（优先使用原生 crypto.randomUUID，带多重降级）
function rid(): string {
  // 1) 现代浏览器
  if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
    return (crypto as any).randomUUID()
  }
  // 2) 使用 WebCrypto 生成字节并组装为 v4 UUID
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const buf = new Uint8Array(16)
    crypto.getRandomValues(buf)
    // 设置版本与变体位
    buf[6] = (buf[6] & 0x0f) | 0x40
    buf[8] = (buf[8] & 0x3f) | 0x80
    const toHex = (n: number) => n.toString(16).padStart(2, '0')
    const hex = Array.from(buf, toHex).join('')
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`
  }
  // 3) 最后兜底（非加密随机）
  let s = ''
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) s += '-'
    else if (i === 14) s += '4'
    else {
      const r = (Math.random() * 16) | 0
      s += (i === 19 ? ((r & 0x3) | 0x8) : r).toString(16)
    }
  }
  return s
}

function getAccessToken() {
  return localStorage.getItem('token:access') || ''
}
function getRefreshToken() {
  return localStorage.getItem('token:refresh') || ''
}
function setTokens(access: string, refresh?: string) {
  localStorage.setItem('token:access', access)
  if (refresh) localStorage.setItem('token:refresh', refresh)
}

instance.interceptors.request.use((config) => {
  config.headers = config.headers || {}
  const token = getAccessToken()
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  // 审计 ID
  config.headers['X-Request-Id'] = rid()
  // 幂等键（对变更型请求默认开启，可通过 config.idempotency=false 关闭）
  const method = (config.method || 'get').toLowerCase()
  const isMutating = ['post','put','patch','delete'].includes(method)
  if (isMutating && config.idempotency !== false) {
    config.headers['Idempotency-Key'] = rid()
  }
  return config
})

let refreshing = false
let queue: Array<() => void> = []

async function doRefresh(): Promise<{ access_token: string; refresh_token?: string }> {
  const rt = getRefreshToken()
  if (!rt) throw new Error('No refresh token')
  // 使用裸 axios 避免拦截器递归
  const res = await axios.post(`${baseURL.replace(/\/$/, '')}/v1/auth/refresh`, { refresh_token: rt }, { timeout: 10000 })
  return res.data
}

instance.interceptors.response.use(
  (res) => res.data,
  async (error: AxiosError<any>) => {
    const original = (error.config || {}) as AxiosRequestConfig
    const status = error.response?.status
    if (status === 401 && !original._retry && getRefreshToken()) {
      original._retry = true
      if (!refreshing) {
        refreshing = true
        try {
          const tokens = await doRefresh()
          setTokens(tokens.access_token, tokens.refresh_token)
          queue.forEach(fn => fn())
          queue = []
        } catch (e) {
          localStorage.removeItem('token:access')
          localStorage.removeItem('token:refresh')
          refreshing = false
          return Promise.reject(error)
        } finally {
          refreshing = false
        }
      }
      return new Promise((resolve) => {
        queue.push(async () => {
          resolve(instance(original))
        })
      })
    }
    const message = (error.response?.data?.message) || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

export default instance
