<template>
  <v-app-bar color="surface" elevation="2" class="navbar">
    <!-- Menu Button -->
    <v-btn
      icon
      variant="text"
      @click="drawerOpen = !drawerOpen"
      class="mr-2"
    >
      <v-icon>mdi-menu</v-icon>
    </v-btn>

    <!-- Brand Logo (点击标题返回主页) -->
    <v-app-bar-title>
      <router-link to="/" class="text-decoration-none text-primary">
        <span class="title-large">爪哇超市</span>
      </router-link>
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <!-- Right Actions: Search, Filter, Login -->
    <template v-if="$vuetify.display.mdAndUp">
      <v-btn
        variant="text"
        color="on-surface-variant"
        @click="searchDialog = true"
        class="text-none"
      >
        <v-icon>mdi-magnify</v-icon>
        <span class="ml-2">搜索</span>
      </v-btn>

      <v-btn
        variant="text"
        color="on-surface-variant"
        @click="$emit('openFilter')"
        class="text-none"
      >
        <v-icon>mdi-filter-variant</v-icon>
        <span class="ml-2">筛选</span>
      </v-btn>

      <v-btn
        v-if="!auth.isAuthenticated"
        color="primary"
        variant="elevated"
        :to="{ name: 'login' }"
        prepend-icon="mdi-login"
        class="ml-2"
      >
        登录
      </v-btn>

      <v-btn
        v-else
        icon
        variant="outlined"
        :color="'primary'"
        @click="goProfile"
        class="ml-2"
      >
        <v-avatar size="32">
          <v-img v-if="avatarUrl" :src="avatarUrl" alt="avatar" />
          <span v-else class="text-primary">{{ initials }}</span>
        </v-avatar>
      </v-btn>
    </template>

    <!-- Mobile Actions -->
    <template v-if="$vuetify.display.smAndDown">
      <v-btn
        icon
        @click="searchDialog = true"
      >
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </template>
  </v-app-bar>

<!-- Left Navigation Drawer -->
  <v-navigation-drawer
    v-model="drawerOpen"
    location="left"
    temporary
    class="left-drawer"
  >
    <v-list nav>
      <v-list-item
        v-if="isStaffOrAdmin"
        to="/admin"
        prepend-icon="mdi-view-dashboard-outline"
        title="仪表盘"
        :active="isActive('/admin')"
        @click="drawerOpen = false"
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

      <v-divider class="my-2"></v-divider>

      <v-list-item
        v-if="auth.isAuthenticated"
        @click="goProfile"
        prepend-icon="mdi-account-circle-outline"
        title="个人中心"
        :active="isActive('/profile')"
      ></v-list-item>

      <v-list-item
        v-else
        :to="{ name: 'login' }"
        prepend-icon="mdi-login"
        title="登录"
        @click="drawerOpen = false"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>

  <!-- Search Dialog -->
  <v-dialog v-model="searchDialog" max-width="600">
    <v-card class="glass-dialog">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-2">mdi-magnify</v-icon>
        搜索商品
        <v-spacer></v-spacer>
        <v-btn icon variant="text" @click="searchDialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pa-4">
        <v-text-field
          v-model="searchQuery"
          placeholder="输入商品名称"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
          autofocus
          @keyup.enter="handleSearch"
          @click:clear="searchQuery = ''"
        ></v-text-field>
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="searchDialog = false">取消</v-btn>
        <v-btn color="primary" variant="elevated" @click="handleSearch">搜索</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
const drawerOpen = ref(false)
const searchDialog = ref(false)
const searchQuery = ref('')

defineEmits(['openFilter'])

const handleSearch = () => {
  if (route.path !== '/') {
    router.push({ name: 'products', query: { search: searchQuery.value } })
  } else {
    // 触发产品页面搜索
    window.dispatchEvent(new CustomEvent('navbar-search', { detail: searchQuery.value }))
  }
  searchDialog.value = false
}

const goCart = () => {
  if (!auth.isAuthenticated) {
    ui.promptLoginAndRedirect('/cart')
  } else {
    router.push({ name: 'cart' })
    drawerOpen.value = false
  }
}

const goOrders = () => {
  if (!auth.isAuthenticated) {
    ui.promptLoginAndRedirect('/orders')
  } else {
    router.push({ name: 'orders' })
    drawerOpen.value = false
  }
}

const goProfile = () => {
  router.push({ name: 'profile' })
  drawerOpen.value = false
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

.glass-dialog {
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08) !important;
}

@media (prefers-color-scheme: dark) {
  .glass-dialog {
    background: rgba(30, 30, 30, 0.95) !important;
    border-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
