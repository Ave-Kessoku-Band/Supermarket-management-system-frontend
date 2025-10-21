<template>
  <header class="glass navbar">
    <router-link to="/" class="brand" style="font-weight:700;letter-spacing:.2px;">NEW 超市</router-link>

    <nav style="display:flex;gap:10px;">
      <router-link to="/" class="btn" :class="{ active: isActive('/') }">商品</router-link>
      <!-- 受保护导航：未登录先提示，1s 后跳登录 -->
      <button class="btn" @click="goCart">
        购物车<span v-if="cartCount > 0">（{{ cartCount }}）</span>
      </button>
      <button class="btn" @click="goOrders">订单</button>

      <div v-if="isStaffOrAdmin" style="display:flex;gap:10px;">
        <router-link to="/admin" class="btn">仪表盘</router-link>
      </div>
    </nav>

    <div class="nav-spacer"></div>

    <div v-if="auth.isAuthenticated" style="display:flex;align-items:center;gap:10px;">
      <span class="small">你好，{{ auth.user?.username }}</span>
      <button class="avatar" @click="menuOpen = !menuOpen" :title="auth.user?.username">
        <img v-if="avatarUrl" :src="avatarUrl" alt="avatar" />
        <div v-else class="avatar-fallback">{{ initials }}</div>
      </button>
      <div v-if="menuOpen" class="menu glass card" style="position:absolute;right:16px;top:60px;min-width:180px;">
        <div class="small" style="padding:6px 8px;">角色：{{ auth.user?.role }}</div>
        <hr class="hr" />
        <button class="btn" style="width:100%;" @click="logout">退出登录</button>
      </div>
    </div>
    <div v-else>
      <router-link :to="{ name: 'login' }" class="btn">登录</router-link>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import { useUiStore } from '@/store/ui'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const cart = useCartStore()

const isActive = (path: string) => route.path === path
const cartCount = computed(() => cart.badgeCount)
const isStaffOrAdmin = computed(() => auth.user?.role === 'staff' || auth.user?.role === 'admin')

const avatarUrl = '' // 可接入上传头像地址
const initials = computed(() => (auth.user?.username?.[0] || 'U').toUpperCase())
const menuOpen = ref(false)

const goCart = () => {
  if (!auth.isAuthenticated) {
    ui.promptLoginAndRedirect('/cart')
  } else {
    router.push({ name: 'cart' })
  }
}

const goOrders = () => {
  if (!auth.isAuthenticated) {
    ui.promptLoginAndRedirect('/orders')
  } else {
    router.push({ name: 'orders' })
  }
}

const logout = async () => {
  await auth.logout()
  router.push({ name: 'products' })
}
</script>

<style scoped>
.brand { color: var(--fg); }
.avatar {
  width: 36px; height: 36px; border-radius: 50%; overflow: hidden;
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.9); border: 1px solid rgba(16,24,40,0.12);
}
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar-fallback { color: var(--fg); font-weight: 700; }
.menu { z-index: 60; }
.btn.active { outline: 2px solid rgba(59,130,246,0.25); }
</style>
