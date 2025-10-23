<template>
  <v-app-bar color="surface" elevation="2" class="navbar">
    <!-- Brand Logo -->
    <v-app-bar-title>
      <router-link to="/" class="text-decoration-none text-primary">
        <span class="title-large">NEW 超市</span>
      </router-link>
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <!-- Navigation Items -->
    <template v-if="$vuetify.display.mdAndUp">
      <v-btn
        variant="text"
        :color="isActive('/') ? 'primary' : 'on-surface-variant'"
        @click="$router.push('/')"
        class="text-none"
      >
        商品
      </v-btn>

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

    <!-- User Section -->
    <div v-if="auth.isAuthenticated">
      <!-- Welcome message (desktop only) -->
      <span v-if="$vuetify.display.mdAndUp" class="body-medium mr-4">
        你好，{{ auth.user?.username }}
      </span>

      <!-- User Avatar Menu -->
      <v-menu v-model="menuOpen" :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            variant="outlined"
            v-bind="props"
            :color="'primary'"
          >
            <v-avatar size="32">
              <v-img v-if="avatarUrl" :src="avatarUrl" alt="avatar" />
              <span v-else class="text-primary">{{ initials }}</span>
            </v-avatar>
          </v-btn>
        </template>

        <v-card min-width="200">
          <v-card-text>
            <div class="body-medium mb-2">{{ auth.user?.username }}</div>
            <div class="label-medium text-medium-emphasis">角色：{{ auth.user?.role }}</div>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn
              variant="text"
              block
              color="error"
              @click="logout"
              prepend-icon="mdi-logout"
            >
              退出登录
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
    </div>

    <v-btn
      v-else
      color="primary"
      variant="elevated"
      :to="{ name: 'login' }"
      prepend-icon="mdi-login"
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
      <v-list-item
        to="/"
        prepend-icon="mdi-shopping-outline"
        title="商品"
        :active="isActive('/')"
      ></v-list-item>

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
const menuOpen = ref(false)
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

const logout = async () => {
  await auth.logout()
  router.push({ name: 'products' })
  menuOpen.value = false
}
</script>

<style scoped>
.navbar {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
</style>
