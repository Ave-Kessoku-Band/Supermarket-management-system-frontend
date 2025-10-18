<template>
  <div class="min-h-screen flex items-center justify-center px-3">
    <div class="glass-ios w-full max-w-sm p-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-900">登录</h2>

      <div class="space-y-3">
        <div>
          <label class="block text-sm text-gray-700 mb-1">用户名</label>
          <input
            v-model="username"
            autocomplete="username"
            class="w-full rounded-md border border-white/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
            placeholder="admin 或 cashier"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-700 mb-1">密码</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="w-full rounded-md border border-white/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
            placeholder="请输入密码"
            @keydown.enter="onSubmit"
          />
        </div>
        <button
          class="w-full inline-flex items-center justify-center btn-primary px-4 py-2 rounded-md disabled:opacity-60"
          :disabled="loading"
          @click="onSubmit"
        >
          {{ loading ? '登录中…' : '登录' }}
        </button>
      </div>

      <p class="text-xs text-gray-700 mt-3">支持角色：admin / cashier</p>
      <p v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    const redirect = sessionStorage.getItem('redirect:path') || '/'
    sessionStorage.removeItem('redirect:path')
    router.replace(redirect)
  } catch (e: any) {
    error.value = e.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>
