<template>
  <v-app-bar color="surface" elevation="2" class="navbar" app fixed @click="handleNavbarClick">
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
      <!-- Search Bar (Material Design 3) -->
      <div class="search-bar-container mr-4" @click.stop="handleSearchClick">
        <v-text-field
          v-model="searchQuery"
          placeholder="搜索商品"
          prepend-inner-icon="mdi-magnify"
          variant="filled"
          density="compact"
          single-line
          hide-details
          clearable
          rounded
          class="search-bar"
          @keyup.enter="handleSearch"
        >
          <template v-slot:append-inner>
            <v-fade-transition>
              <v-icon 
                v-if="searchQuery"
                @click="handleSearch"
                class="search-submit-icon"
              >
                mdi-arrow-right
              </v-icon>
            </v-fade-transition>
          </template>
        </v-text-field>
      </div>

      <v-btn
        variant="text"
        color="on-surface-variant"
        @click="openFilterMenu"
        class="text-none"
        ref="filterButton"
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
        @click="mobileSearchOpen = true"
      >
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </template>
  </v-app-bar>

  <!-- Overlay for search/filter focus (below navbar) -->
  <transition name="overlay-fade">
    <div 
      v-if="searchFocused || filterMenuOpen || drawerOpen"
      class="focus-overlay"
      @click="closeFocusElements"
    ></div>
  </transition>

  <!-- Mobile Search Drawer -->
  <v-navigation-drawer
    v-model="mobileSearchOpen"
    location="left"
    temporary
    class="search-drawer"
  >
    <v-toolbar color="transparent" elevation="0">
      <v-toolbar-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-magnify</v-icon>
        搜索商品
      </v-toolbar-title>
      <v-btn icon variant="text" @click="mobileSearchOpen = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>

    <v-divider></v-divider>

    <v-container class="pa-4">
      <v-text-field
        v-model="searchQuery"
        placeholder="输入商品名称"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        clearable
        autofocus
        @keyup.enter="handleSearchMobile"
        @click:clear="searchQuery = ''"
      ></v-text-field>

      <div class="d-flex justify-end mt-4">
        <v-btn variant="text" @click="mobileSearchOpen = false" class="mr-2">取消</v-btn>
        <v-btn color="primary" variant="elevated" @click="handleSearchMobile">搜索</v-btn>
      </div>
    </v-container>
  </v-navigation-drawer>

<!-- Left Navigation Drawer -->
  <v-navigation-drawer
    v-model="drawerOpen"
    location="left"
    temporary
    class="left-drawer"
  >
    <v-list nav class="flex-grow-1">
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
    
    <!-- 底部主题切换按钮 -->
    <template v-slot:append>
      <v-list nav>
        <v-divider></v-divider>
        <v-list-item
          @click="toggleTheme"
          :prepend-icon="isDark ? 'mdi-white-balance-sunny' : 'mdi-weather-night'"
          :title="isDark ? '切换到亮色' : '切换到暗色'"
        ></v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
 </template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import { useUiStore } from '@/store/ui'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const cart = useCartStore()
const theme = useTheme()

const isActive = (path: string) => route.path === path
const cartCount = computed(() => cart.badgeCount)
const isStaffOrAdmin = computed(() => auth.user?.role === 'staff' || auth.user?.role === 'admin')

const avatarUrl = '' // 可接入上传头像地址
const initials = computed(() => (auth.user?.username?.[0] || 'U').toUpperCase())
const drawerOpen = ref(false)
const mobileSearchOpen = ref(false)
const searchQuery = ref('')
const searchFocused = ref(false)
const filterMenuOpen = ref(false)
const isDark = computed(() => theme.global.name.value === 'dark')

const emit = defineEmits(['openFilter', 'filterMenuChange'])

// 监听筛选菜单状态
watch(filterMenuOpen, (newVal) => {
  emit('filterMenuChange', newVal)
})

const closeFocusElements = () => {
  searchFocused.value = false
  drawerOpen.value = false
  if (filterMenuOpen.value) {
    // 触发事件通知 Products 关闭筛选菜单
    window.dispatchEvent(new CustomEvent('close-filter-menu'))
  }
  filterMenuOpen.value = false
}

const handleNavbarClick = (event: MouseEvent) => {
  // 检查点击是否在搜索框容器内
  const searchContainer = document.querySelector('.search-bar-container')
  if (searchContainer && !searchContainer.contains(event.target as Node)) {
    // 点击在搜索框外部，关闭搜索
    if (searchFocused.value) {
      searchFocused.value = false
    }
  }
}

const handleSearchClick = () => {
  // 点击搜索框时才显示遮罩，延迟一点确保 transition 动画能正确触发
  if (!searchFocused.value) {
    // 使用 nextTick 确保 DOM 更新后再触发动画
    requestAnimationFrame(() => {
      searchFocused.value = true
    })
  }
}

const handleSearch = () => {
  if (searchQuery.value?.trim()) {
    if (route.path !== '/') {
      router.push({ name: 'products', query: { search: searchQuery.value } })
    } else {
      // 触发产品页面搜索
      window.dispatchEvent(new CustomEvent('navbar-search', { detail: searchQuery.value }))
    }
    searchFocused.value = false
  }
}

const openFilterMenu = () => {
  filterMenuOpen.value = true
  emit('openFilter')
}

const handleSearchMobile = () => {
  if (searchQuery.value?.trim()) {
    if (route.path !== '/') {
      router.push({ name: 'products', query: { search: searchQuery.value } })
    } else {
      // 触发产品页面搜索
      window.dispatchEvent(new CustomEvent('navbar-search', { detail: searchQuery.value }))
    }
    mobileSearchOpen.value = false
  }
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

const toggleTheme = () => {
  const currentTheme = theme.global.name.value
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  theme.global.name.value = newTheme
  // 保存到 localStorage
  localStorage.setItem('theme', newTheme)
  console.log('Theme switched to:', newTheme)
}

// 监听来自页面的筛选菜单事件
onMounted(() => {
  // 读取保存的主题
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark' || savedTheme === 'light') {
    theme.global.name.value = savedTheme
    console.log('Loaded theme from localStorage:', savedTheme)
  } else {
    console.log('Using default theme:', theme.global.name.value)
  }
  
  window.addEventListener('filter-menu-open', () => {
    filterMenuOpen.value = true
  })
  window.addEventListener('filter-menu-close', () => {
    filterMenuOpen.value = false
  })
  window.addEventListener('close-filter-menu', () => {
    // 从遮罩点击触发，需要通知页面关闭
  })
})
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
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1100 !important;
}

.v-theme--dark .navbar {
  background: rgba(30, 30, 30, 0.7) !important;
  border-bottom-color: rgba(255, 255, 255, 0.1);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.2),
    0 1px 2px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.left-drawer {
  z-index: 1200 !important;
}

.left-drawer :deep(.v-list-item-title) {
  font-size: 1rem;
  font-weight: 400;
}

.left-drawer :deep(.v-icon) {
  font-size: 20px;
}

.left-drawer :deep(.v-list-item) {
  min-height: 48px;
}

.search-drawer {
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
}

/* Material Design 3 Search Bar */
.search-bar-container {
  min-width: 280px;
  max-width: 400px;
  width: 100%;
  position: relative;
  z-index: 1101;
}

.search-bar {
  transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.search-bar :deep(.v-field) {
  border-radius: 28px;
  background: rgba(var(--v-theme-surface-variant), 0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.search-bar :deep(.v-field__outline) {
  display: none;
}

.search-bar :deep(.v-field__underlay) {
  display: none;
}

.search-bar :deep(.v-field--variant-filled .v-field__overlay) {
  display: none;
}

.search-bar :deep(.v-field--focused) {
  background: rgba(var(--v-theme-surface-variant), 0.8);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.search-bar :deep(.v-field__input) {
  padding-top: 8px;
  padding-bottom: 8px;
  min-height: 40px;
}

.search-bar :deep(.v-field__prepend-inner) {
  padding-left: 12px;
}

.search-bar :deep(.v-field__append-inner) {
  padding-right: 8px;
}

.search-submit-icon {
  cursor: pointer;
  color: rgb(var(--v-theme-primary));
  transition: transform 0.2s ease;
}

.search-submit-icon:hover {
  transform: translateX(2px);
}

/* Focus Overlay */
.focus-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 1000;
  pointer-events: auto;
  /* 不覆盖导航栏区域 */
  clip-path: inset(64px 0 0 0);
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
</style>
