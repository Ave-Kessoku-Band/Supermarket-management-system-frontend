<template>
  <div class="app-bg">
    <div class="container">
      <NavBar v-if="showNav" />
      <main class="app-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'

const route = useRoute()
// 路由 meta.hideNav 为 true 时隐藏导航栏（用于 /login 与 /register）
const showNav = computed(() => !route.meta.hideNav)
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 16px 32px;
}
.app-main {
  margin-top: 16px;
}
</style>
