<template>
  <div class="min-h-screen flex">
    <!-- 侧栏：Apple 风格液态玻璃 -->
    <aside class="glass-ios-strong w-[220px] p-3 m-3">
      <div class="font-semibold mb-3 text-gray-900">超市管理（极简）</div>
      <nav class="space-y-1">
        <router-link class="block px-3 py-2 rounded-md text-gray-800 hover:bg-white/60"
                     :class="{ 'bg-white/70': $route.name==='dashboard' }"
                     to="/">总览</router-link>
        <router-link class="block px-3 py-2 rounded-md text-gray-800 hover:bg-white/60"
                     :class="{ 'bg-white/70': $route.name==='pos' }"
                     to="/pos">POS 收银</router-link>
        <router-link class="block px-3 py-2 rounded-md text-gray-800 hover:bg-white/60"
                     :class="{ 'bg-white/70': $route.name==='products' }"
                     to="/products">商品管理</router-link>
        <router-link class="block px-3 py-2 rounded-md text-gray-800 hover:bg-white/60"
                     :class="{ 'bg-white/70': $route.name==='inventory-levels' }"
                     to="/inventory/levels">库存水平</router-link>
        <router-link class="block px-3 py-2 rounded-md text-gray-800 hover:bg-white/60"
                     :class="{ 'bg-white/70': $route.name==='inventory-adjust' }"
                     to="/inventory/adjust">库存调整</router-link>
        <router-link class="block px-3 py-2 rounded-md text-gray-800 hover:bg-white/60"
                     :class="{ 'bg-white/70': $route.name==='report-sales' }"
                     to="/reports/sales-summary">销售汇总</router-link>
        <router-link class="block px-3 py-2 rounded-md text-gray-800 hover:bg-white/60"
                     :class="{ 'bg-white/70': $route.name==='registers' }"
                     to="/registers">收银机/班次</router-link>
      </nav>
    </aside>

    <!-- 内容区 -->
    <section class="flex-1 flex flex-col p-3">
      <!-- 顶栏：Apple 风格液态玻璃 -->
      <header class="glass-ios-strong flex items-center px-3 py-2 mb-3">
        <div class="flex-1"></div>
        <div class="flex items-center gap-2">
          <span>{{ user?.username }} ({{ user?.role }})</span>
          <button class="btn" @click="onLogout">退出</button>
        </div>
      </header>

      <!-- 主内容 -->
      <main class="grid gap-3">
        <router-view />
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
const auth = useAuthStore()
const user = auth.user
const router = useRouter()
async function onLogout() {
  await auth.logout()
  router.replace({ name: 'login' })
}
</script>
