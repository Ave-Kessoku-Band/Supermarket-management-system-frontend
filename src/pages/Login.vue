<template>
  <v-container fluid class="auth-container">
    <!-- Background Pattern -->
    <div class="auth-bg"></div>

    <v-row justify="center" align="center" class="auth-row">
      <v-col cols="12" sm="8" md="6" lg="5" xl="4">
        <!-- Login Card -->
        <v-card class="auth-card" elevation="8">
          <v-card-text class="pa-10">
            <!-- Logo and Title -->
            <div class="text-center mb-8">
              <v-icon size="72" color="primary" class="mb-4">
                mdi-storefront-outline
              </v-icon>
              <h1 class="headline-large text-primary mb-2">爪哇超市</h1>
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

              <!-- Turnstile Captcha -->
              <div class="turnstile-wrapper mb-6">
                <VueTurnstile
                  v-model="turnstileToken"
                  :site-key="turnstileSiteKey"
                  theme="light"
                  @error="onTurnstileError"
                  @expired="onTurnstileExpired"
                />
              </div>

              <v-btn
                type="submit"
                :loading="loading"
                :disabled="!username || !password || !turnstileToken || loading"
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useRoute, useRouter } from 'vue-router'
import VueTurnstile from 'vue-turnstile'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const turnstileToken = ref('')
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''

// Disable body scroll on mount
onMounted(() => {
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
})

// Re-enable body scroll on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
  document.documentElement.style.overflow = ''
})

const onTurnstileError = () => {
  error.value = 'Turnstile验证失败，请刷新页面重试'
}

const onTurnstileExpired = () => {
  turnstileToken.value = ''
}

const onSubmit = async () => {
  if (!turnstileToken.value) {
    error.value = '请完成人机验证'
    return
  }

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
  max-height: 100vh;
  padding: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Modern gradient background */
.auth-bg {
  position: fixed;
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
  width: 100%;
}

.auth-card {
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 32px;
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  background: rgba(255, 255, 255, 0.8);
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  box-shadow:
    0 24px 48px rgba(102, 126, 234, 0.15),
    0 8px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.auth-form {
  margin-top: 24px;
}

/* Form field enhancements */
:deep(.v-field) {
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

:deep(.v-field:hover .v-field__outline) {
  border-color: var(--v-theme-primary);
}

:deep(.v-field--focused .v-field__outline) {
  border-width: 2px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .auth-card {
    margin: 16px;
    border-radius: 24px;
    min-height: auto;
  }

  .auth-card .pa-10 {
    padding: 32px 24px !important;
  }
}

/* Dark mode support */
.v-theme--dark {
  .auth-bg {
    background:
      radial-gradient(600px 400px at 20% 80%, rgba(103, 80, 164, 0.25), transparent 60%),
      radial-gradient(800px 600px at 80% 20%, rgba(98, 91, 113, 0.2), transparent 60%),
      radial-gradient(400px 300px at 40% 40%, rgba(125, 82, 96, 0.15), transparent 60%),
      linear-gradient(135deg, rgba(20, 20, 30, 0.95), rgba(30, 25, 40, 0.98));
  }

  .auth-card {
    background: rgba(40, 40, 45, 0.7);
    border-color: rgba(255, 255, 255, 0.15);
  }
}

/* Turnstile wrapper styling */
.turnstile-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.turnstile-wrapper :deep(iframe) {
  border-radius: 12px;
}
</style>
