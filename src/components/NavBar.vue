<template>
  <v-app-bar color="surface" elevation="2" class="navbar">
    <!-- Brand Logo (点击标题返回主页) -->
    <v-app-bar-title>
      <router-link to="/" class="text-decoration-none text-primary">
        <span class="title-large">NEW 超市</span>
      </router-link>
    </v-app-bar-title>

    <!-- Left Navigation Items (仅保留员工/管理员的仪表盘) -->
    <template v-if="$vuetify.display.mdAndUp">
      <v-btn
        v-if="isStaffOrAdmin"
        variant="text"
        :color="isActive('/admin') ? 'primary' : 'on-surface-variant'"
        @click="$router.push('/admin')"
        class="text-none"
      >
        <v-icon>mdi-view-dashboard-outline</v-icon>
        <span class="ml-2">仪表盘</span>
      </v-btn>
    </template>

    <v-spacer></v-spacer>

    <!-- Right Actions: Cart & Orders -->
    <template v-if="$vuetify.display.mdAndUp">
      <v-btn
        variant="text"
        :color="isActive('/cart') ? 'primary' : 'on-surface-variant'"
        @click="goCart"
        class="text-none"
      >
        <v-badge
          :content="cartCount"
          :model-value="cartCount > 0"
          color="error"
        >
          <v-icon>mdi-cart-outline</v-icon>
        </v-badge>
        <span class="ml-2">购物车</span>
      </v-btn>

      <v-btn
        variant="text"
        :color="isActive('/orders') ? 'primary' : 'on-surface-variant'"
        @click="goOrders"
        class="text-none"
      >
        <v-icon>mdi-receipt-text-outline</v-icon>
        <span class="ml-2">订单</span>
      </v-btn>
    </template>

    <!-- User Section -->
    <div v-if="auth.isAuthenticated" class="ml-2">
      <span v-if="$vuetify.display.mdAndUp" class="body-medium mr-4">
        你好，{{ auth.user?.username }}
      </span>
      <v-btn
        icon
        variant="outlined"
        :color="'primary'"
        @click="goProfile"
      >
        <v-avatar size="32">
          <v-img v-if="avatarUrl" :src="avatarUrl" alt="avatar" />
          <span v-else class="text-primary">{{ initials }}</span>
        </v-avatar>
      </v-btn>
    </div>

    <v-btn
      v-else
      color="primary"
      variant="elevated"
      :to="{ name: 'login' }"
      prepend-icon="mdi-login"
      class="ml-2"
    >
      登录
    </v-btn>

    <!-- Mobile Navigation Menu -->
    <template v-if="$vuetify.display.smAndDown">
      <v-btn
        icon
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </template>
  </v-app-bar>

  <!-- Mobile Navigation Drawer -->
  <v-navigation-drawer
    v-model="mobileMenuOpen"
    location="bottom"
    temporary
    class="pa-4"
  >
    <v-list nav>
      <!-- 已移除“商品”项 -->

      <v-list-item
        @click="goCart"
        prepend-icon="mdi-cart-outline"
        title="购物车"
        :active="isActive('/cart')"
      >
        <template v-slot:append>
          <v-badge
            :content="cartCount"
            :model-value="cartCount > 0"
            color="error"
          ></v-badge>
        </template>
      </v-list-item>

      <v-list-item
        @click="goOrders"
        prepend-icon="mdi-receipt-text-outline"
        title="订单"
        :active="isActive('/orders')"
      ></v-list-item>

      <v-list-item
        v-if="isStaffOrAdmin"
        to="/admin"
        prepend-icon="mdi-view-dashboard-outline"
        title="仪表盘"
        :active="isActive('/admin')"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
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
const mobileMenuOpen = ref(false)

const goCart = () => {
  if (!auth.isAuthenticated) {
    ui.promptLoginAndRedirect('/cart')
  } else {
    router.push({ name: 'cart' })
    mobileMenuOpen.value = false
  }
}

const goOrders = () => {
  if (!auth.isAuthenticated) {
    ui.promptLoginAndRedirect('/orders')
  } else {
    router.push({ name: 'orders' })
    mobileMenuOpen.value = false
  }
}

const goProfile = () => {
  router.push({ name: 'profile' })
}
</script>

<style scoped>
.navbar {
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  background: rgba(255, 255, 255, 0.7) !important;
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

@media (prefers-color-scheme: dark) {
  .navbar {
    background: rgba(30, 30, 30, 0.7) !important;
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
