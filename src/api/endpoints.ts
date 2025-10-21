import http from './http'

// Auth
export const apiRegister = (body: { username: string; email: string; password: string; phone: string }) =>
  http.post('/auth/register', body).then(r => r.data)

export const apiLogin = (body: { username: string; password: string }) =>
  http.post('/auth/login', body).then(r => r.data as { user: any; token: string; refreshToken: string })

export const apiMe = () => http.get('/auth/me').then(r => r.data)

export const apiLogout = () => http.post('/auth/logout').then(r => r.data)

// Meta
export const apiMeta = () => http.get('/meta').then(r => r.data)

// Products
export type ProductsQuery = {
  category?: string
  search?: string
  stock_status?: 'OK' | 'LOW' | 'OUT'
  page?: number
  per_page?: number
  sort?: string
}
export const apiListProducts = (q: ProductsQuery = {}) => http.get('/products', { params: q }).then(r => r.data)

export const apiGetProduct = (id: string) => http.get(`/products/${id}`).then(r => r.data)

// Cart
export const apiGetCart = () => http.get('/cart').then(r => r.data)
export const apiAddCartItem = (body: { productId: string; quantity: number }) =>
  http.post('/cart/items', body).then(r => r.data)
export const apiUpdateCartItem = (itemId: string, quantity: number) =>
  http.patch(`/cart/items/${itemId}`, { quantity }).then(r => r.data)
export const apiDeleteCartItem = (itemId: string) => http.delete(`/cart/items/${itemId}`).then(r => r.data)
export const apiClearCart = () => http.delete('/cart').then(r => r.data)
export const apiCartCount = () => http.get('/cart/count').then(r => r.data)

// Orders
export const apiCreateOrder = (body: { items: { productId: string; quantity: number }[]; paymentMethod: 'CASH' | 'ALIPAY' | 'WECHAT' | 'BANK_CARD' }) =>
  http.post('/orders', body).then(r => r.data)
export const apiListOrders = (params: any = {}) => http.get('/orders', { params }).then(r => r.data)
export const apiGetOrder = (id: string) => http.get(`/orders/${id}`).then(r => r.data)
export const apiPaymentMethods = () => http.get('/payment-methods').then(r => r.data)

// Admin - Members
export const apiListMembers = (params: any = {}) => http.get('/members', { params }).then(r => r.data)
export const apiGetMember = (id: string) => http.get(`/members/${id}`).then(r => r.data)
export const apiUpdateMember = (id: string, body: any) => http.patch(`/members/${id}`, body).then(r => r.data)
export const apiAdjustMemberPoints = (id: string, body: { delta: number; reason: string }) =>
  http.post(`/members/${id}/points/adjust`, body).then(r => r.data)

// Admin - Staff
export const apiListStaff = (params: any = {}) => http.get('/staff', { params }).then(r => r.data)
export const apiCreateStaff = (body: any) => http.post('/staff', body).then(r => r.data)
export const apiUpdateStaff = (id: string, body: any) => http.patch(`/staff/${id}`, body).then(r => r.data)
export const apiSetStaffStatus = (id: string, status: 'ACTIVE' | 'DISABLED') =>
  http.post(`/staff/${id}/status`, { status }).then(r => r.data)

// Admin - Inventory / Products
export const apiCreateProduct = (body: any) => http.post('/products', body).then(r => r.data)
export const apiUpdateProduct = (id: string, body: any) => http.patch(`/products/${id}`, body).then(r => r.data)
export const apiDeleteProduct = (id: string) => http.delete(`/products/${id}`).then(r => r.data)
export const apiAdjustStock = (id: string, body: { op: 'increment' | 'set'; value: number }) =>
  http.patch(`/products/${id}/stock`, body).then(r => r.data)

// Admin - Dashboard
export const apiDashboardOverview = () => http.get('/dashboard/overview').then(r => r.data)
export const apiSalesTrend = (params: { range?: '7d' | '30d' | 'custom'; from?: string; to?: string } = {}) =>
  http.get('/dashboard/sales', { params }).then(r => r.data)
export const apiTopProducts = (params: { range?: string; limit?: number } = {}) =>
  http.get('/dashboard/top-products', { params }).then(r => r.data)
