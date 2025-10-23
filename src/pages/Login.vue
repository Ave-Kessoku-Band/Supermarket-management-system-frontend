<template>
  <v-container fluid class="auth-container">
    <!-- Background Pattern -->
    <div class="auth-bg"></div>

    <v-row justify="center" align="center" class="auth-row">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <!-- Login Card -->
        <v-card class="auth-card" elevation="8">
          <v-card-text class="pa-8">
            <!-- Logo and Title -->
            <div class="text-center mb-8">
              <v-icon size="64" color="primary" class="mb-4">
                mdi-storefront-outline
              </v-icon>
              <h1 class="headline-large text-primary mb-2">NEW 超市</h1>
              <p class="title-medium text-medium-emphasis">欢迎回来</p>
            </div>

            <!-- Login Form -->
            <v-form @submit.prevent="onSubmit" class="auth-form">
              <v-text-field
                v-model="username"
                label="用户名"
                variant="outlined"
                prepend-inner-icon="mdi-account-outline"
                :error-messages="error ? '用户名或密码错误' : []"
                class="mb-4"
                autofocus
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="密码"
                type="password"
                variant="outlined"
                prepend-inner-icon="mdi-lock-outline"
                :error-messages="error ? '用户名或密码错误' : []"
                class="mb-6"
                @keyup.enter="onSubmit"
              ></v-text-field>

              <v-btn
                type="submit"
                :loading="loading"
                :disabled="!username || !password || loading"
                color="primary"
                variant="elevated"
                size="large"
                block
                class="mb-4"
              >
                登录
              </v-btn>
            </v-form>

            <!-- Register Link -->
            <div class="text-center">
              <span class="body-medium text-medium-emphasis">没有账号？</span>
              <router-link
                to="/register"
                class="text-primary text-decoration-none ml-1"
              >
                去注册
              </router-link>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useRoute, useRouter } from 'vue-router'

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
.auth-container {
  min-height: 100vh;
  padding: 0;
  position: relative;
}

/* Modern gradient background */
.auth-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(600px 400px at 20% 80%, rgba(103, 80, 164, 0.15), transparent 60%),
    radial-gradient(800px 600px at 80% 20%, rgba(98, 91, 113, 0.1), transparent 60%),
    radial-gradient(400px 300px at 40% 40%, rgba(125, 82, 96, 0.08), transparent 60%),
    linear-gradient(135deg, rgba(255, 251, 254, 0.9), rgba(231, 224, 236, 0.95));
  z-index: 0;
}

.auth-row {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

.auth-card {
  border-radius: 28px;
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

.auth-form {
  margin-top: 24px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .auth-card {
    margin: 16px;
    border-radius: 20px;
  }
}

/* Floating animation for the card */
.auth-card {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
</style>
