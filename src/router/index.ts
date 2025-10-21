import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useUiStore } from '@/store/ui'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'products', component: () => import('@/pages/Products.vue') },

  // 登录 / 注册为独立页面，隐藏导航栏
  { path: '/login', name: 'login', component: () => import('@/pages/Login.vue'), meta: { public: true, hideNav: true } },
  { path: '/register', name: 'register', component: () => import('@/pages/Register.vue'), meta: { public: true, hideNav: true } },

  { path: '/cart', name: 'cart', component: () => import('@/pages/Cart.vue'), meta: { requiresAuth: true, roles: ['member'] } },
  { path: '/orders', name: 'orders', component: () => import('@/pages/Orders.vue'), meta: { requiresAuth: true } },
  { path: '/orders/:id', name: 'order-detail', component: () => import('@/pages/OrderDetail.vue'), meta: { requiresAuth: true } },

  {
    path: '/admin',
    component: { render: () => null },
    meta: { requiresAuth: true, roles: ['staff', 'admin'] },
    children: [
      { path: '', name: 'admin-home', component: () => import('@/pages/admin/DashboardOverview.vue') },
      { path: 'members', name: 'admin-members', component: () => import('@/pages/admin/Members.vue') },
      { path: 'staff', name: 'admin-staff', component: () => import('@/pages/admin/Staff.vue') },
      { path: 'inventory', name: 'admin-inventory', component: () => import('@/pages/admin/Inventory.vue') },
      { path: 'orders', name: 'admin-orders', component: () => import('@/pages/admin/Orders.vue') }
    ]
  },

  { path: '/403', name: 'forbidden', component: () => import('@/pages/Forbidden.vue'), meta: { public: true } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/pages/NotFound.vue'), meta: { public: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from) => {
  const auth = useAuthStore()

  if (!auth.initialized) {
    await auth.bootstrap()
  }

  if (to.meta.public) return true

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    // 初次直接打开受保护路由：正常重定向（避免初始导航空白）
    if (!from.name) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
    // 应用内点击：先提示，再延迟跳转
    const ui = useUiStore()
    ui.promptLoginAndRedirect(to.fullPath)
    return false
  }

  const roles = (to.meta.roles as string[] | undefined) ?? []
  if (roles.length && auth.user && !roles.includes(auth.user.role)) {
    return { name: 'forbidden' }
  }

  return true
})

export default router
