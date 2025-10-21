<template>
  <div class="auth-root">
    <!-- 全屏背景（Bing 每日壁纸） -->
    <div class="auth-bg"></div>

    <!-- 居中的表单卡片（液态玻璃） -->
    <div class="auth-page">
      <LiquidGlassCard class="auth-card">
        <h2 style="margin:0 0 8px 0;">登录</h2>
        <div class="small" style="margin-bottom:12px;">
          没有账号？<router-link to="/register">去注册</router-link>
        </div>

        <form @submit.prevent="onSubmit" style="display:flex;flex-direction:column;gap:10px;">
          <input class="input" placeholder="用户名" v-model="username" required />
          <input class="input" placeholder="密码" v-model="password" type="password" required />
          <button class="btn" :disabled="loading" type="submit">{{ loading ? '登录中...' : '登录' }}</button>
        </form>

        <div v-if="error" class="small" style="color:#d92d20;margin-top:8px;">{{ error }}</div>
      </LiquidGlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useRoute, useRouter } from 'vue-router'
import LiquidGlassCard from '@/components/LiquidGlassCard.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const onSubmit = async () => {
  loading.value = true
  error.value = ''
  try {
    await auth.login(username.value, password.value)
    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } catch (e: any) {
    error.value = e?.response?.data?.message || '登录失败，请检查账号和密码'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 固定在视口内，禁止滚动 */
.auth-root {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh; /* 兼容移动端可视高度 */
  overflow: hidden; /* 彻底禁用滚动 */
  z-index: 0;
}

/* 全屏背景图：Bing 每日壁纸（不阻挡交互） */
.auth-bg {
  position: absolute;
  inset: 0;
  background-image: url('https://bing.img.run/uhd.php');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  pointer-events: none;
}

/* 居中容器 */
.auth-page {
  position: relative;
  z-index: 1; /* 置于背景之上 */
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 12px;
}

/* 统一模块宽度（与注册页保持一致） */
.auth-card {
  width: 100%;
  max-width: 480px;
}
</style>
