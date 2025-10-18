import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { public: true } },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { roles: ['admin','cashier'] } },
      { path: 'pos', name: 'pos', component: () => import('../views/pos/PosView.vue'), meta: { roles: ['admin','cashier'] } },
      { path: 'products', name: 'products', component: () => import('../views/products/ProductList.vue'), meta: { roles: ['admin'] } },
      { path: 'inventory/levels', name: 'inventory-levels', component: () => import('../views/inventory/InventoryLevels.vue'), meta: { roles: ['admin'] } },
      { path: 'inventory/adjust', name: 'inventory-adjust', component: () => import('../views/inventory/InventoryAdjust.vue'), meta: { roles: ['admin'] } },
      { path: 'reports/sales-summary', name: 'report-sales', component: () => import('../views/reports/SalesSummary.vue'), meta: { roles: ['admin'] } },
      { path: 'registers', name: 'registers', component: () => import('../views/registers/RegistersAndShifts.vue'), meta: { roles: ['admin','cashier'] } },
      { path: 'receipts/:receiptNo', name: 'receipt-detail', component: () => import('../views/receipts/ReceiptDetail.vue'), meta: { roles: ['admin','cashier'] } },
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.public) return true
  if (!auth.isAuthenticated) {
    // 用 sessionStorage 暂存目标路径，避免 URL 出现 ?redirect=
    sessionStorage.setItem('redirect:path', to.fullPath)
    return { name: 'login' }
  }
  const roles = (to.meta.roles as string[] | undefined) ?? []
  if (roles.length && !roles.includes(auth.user?.role ?? '')) {
    return { name: 'dashboard' }
  }
  return true
})

export default router
