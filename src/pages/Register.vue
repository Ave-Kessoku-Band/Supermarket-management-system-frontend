<template>
  <div class="auth-root">
    <!-- 全屏背景（Bing 每日壁纸） -->
    <div class="auth-bg"></div>

    <!-- 居中的表单卡片（液态玻璃） -->
    <div class="auth-page">
      <LiquidGlassCard class="auth-card">
        <h2 style="margin:0 0 8px 0;">注册</h2>
        <div class="small" style="margin-bottom:12px;">
          已有账号？<router-link to="/login">去登录</router-link>
        </div>

        <form @submit.prevent="onSubmit" style="display:flex;flex-direction:column;gap:10px;">
          <input class="input" placeholder="用户名" v-model="form.username" required />
          <input class="input" placeholder="邮箱" v-model="form.email" type="email" required />
          <input class="input" placeholder="手机号" v-model="form.phone" required />
          <input class="input" placeholder="密码（至少8位）" v-model="form.password" type="password" required />
          <button class="btn" :disabled="loading" type="submit">{{ loading ? '注册中...' : '注册' }}</button>
        </form>

        <div v-if="error" class="small" style="color:#d92d20;margin-top:8px;">{{ error }}</div>
      </LiquidGlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'
import LiquidGlassCard from '@/components/LiquidGlassCard.vue'

const router = useRouter()
const auth = useAuthStore()
const form = reactive({ username: '', email: '', phone: '', password: '' })
const loading = ref(false)
const error = ref('')

const onSubmit = async () => {
  loading.value = true
  error.value = ''
  try {
    await auth.register(form)
    router.replace('/')
  } catch (e: any) {
    error.value = e?.response?.data?.message || '注册失败，请检查信息'
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

/* 统一模块宽度（与登录页保持一致） */
.auth-card {
  width: 100%;
  max-width: 480px;
}
</style>
