<template>
  <v-app>
    <v-main>
      <NavBar v-if="showNav" @open-filter="handleOpenFilter" />
      
      <!-- 使用自定义滚动条包装内容（登录注册页除外） -->
      <CustomScrollbar 
        v-if="useCustomScrollbar" 
        :height="showNav ? 'calc(100vh - 64px)' : '100vh'"
        :auto-hide="true"
      >
        <v-container fluid class="pa-4">
          <router-view />
        </v-container>
      </CustomScrollbar>
      
      <!-- 登录注册页使用原生滚动 -->
      <v-container v-else fluid class="pa-4">
        <router-view />
      </v-container>
    </v-main>
    <!-- 全局提示 -->
    <GlobalToast />
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import GlobalToast from './components/GlobalToast.vue'
import CustomScrollbar from './components/CustomScrollbar.vue'

const route = useRoute()
const showNav = computed(() => !route.meta.hideNav)
const useCustomScrollbar = computed(() => !route.meta.hideNav)

const handleOpenFilter = () => {
  window.dispatchEvent(new CustomEvent('navbar-filter'))
}
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

<style>
/* Global styles for full background coverage */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.v-application {
  min-height: 100vh;
}

.v-main {
  min-height: 100vh;
  overflow: hidden;
}

/* 登录注册页保留原生滚动 */
.v-main:has(.pa-4:not(:has(.custom-scrollbar-container))) {
  overflow: auto;
}
</style>
