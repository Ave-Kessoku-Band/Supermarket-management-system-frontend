<template>
  <div class="center">
    <div class="card">
      <h2>登录</h2>
      <div class="form-row">
        <label>用户名</label>
        <input v-model="username" autocomplete="username" />
      </div>
      <div class="form-row">
        <label>密码</label>
        <input v-model="password" type="password" autocomplete="current-password" />
      </div>
      <div class="form-row">
        <button class="btn primary" :disabled="loading" @click="onSubmit">{{ loading ? '登录中...' : '登录' }}</button>
      </div>
      <div class="hint">支持角色：admin / cashier</div>
      <div class="error" v-if="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } catch (e: any) {
    error.value = e.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.center { height:100vh; display:flex; align-items:center; justify-content:center; }
.card { width: 340px; background:#fff; padding:16px; border:1px solid #eee; border-radius:10px; }
.form-row { display:flex; flex-direction:column; margin-bottom:10px; gap:4px; }
input, select { padding:8px; border:1px solid #ccc; border-radius:6px; }
.btn { padding:8px 12px; border:1px solid #ccc; background:#fff; border-radius:6px; cursor:pointer; }
.btn.primary { background:#409eff; border-color:#409eff; color:#fff; }
.btn:disabled { opacity:0.6; cursor:not-allowed; }
.hint { color:#888; font-size:12px; margin-top:6px; }
.error { color: #d33; margin-top: 6px; }
</style>
