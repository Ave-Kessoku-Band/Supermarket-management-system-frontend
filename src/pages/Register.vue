<template>
  <v-container fluid class="auth-container">
    <!-- Background Pattern -->
    <div class="auth-bg"></div>

    <v-row justify="center" align="center" class="auth-row">
      <v-col cols="12" sm="8" md="6" lg="5" xl="4">
        <!-- Register Card -->
        <v-card class="auth-card" elevation="8">
          <v-card-text class="pa-10">
            <!-- Logo and Title -->
            <div class="text-center mb-8">
              <v-icon size="72" color="primary" class="mb-4">
                mdi-account-plus-outline
              </v-icon>
              <h1 class="headline-large text-primary mb-2">爪哇超市</h1>
            </div>

            <!-- Register Form -->
            <v-form @submit.prevent="onSubmit" class="auth-form" ref="registerForm">
              <v-text-field
                v-model="form.username"
                label="用户名"
                variant="outlined"
                prepend-inner-icon="mdi-account-outline"
                :error-messages="errors.username"
                :rules="[usernameRules.required, usernameRules.length]"
                class="mb-3"
                validate-on="blur"
                counter
                maxlength="20"
                density="comfortable"
              ></v-text-field>

              <v-text-field
                v-model="form.email"
                label="邮箱地址"
                type="email"
                variant="outlined"
                prepend-inner-icon="mdi-email-outline"
                :error-messages="errors.email"
                :rules="[emailRules.required, emailRules.valid]"
                class="mb-3"
                validate-on="blur"
                density="comfortable"
              ></v-text-field>

              <v-text-field
                v-model="form.phone"
                label="手机号码"
                variant="outlined"
                prepend-inner-icon="mdi-phone-outline"
                :error-messages="errors.phone"
                :rules="[phoneRules.required, phoneRules.valid]"
                class="mb-3"
                validate-on="blur"
                counter
                maxlength="11"
                density="comfortable"
              ></v-text-field>

              <v-text-field
                v-model="form.password"
                label="密码"
                type="password"
                variant="outlined"
                prepend-inner-icon="mdi-lock-outline"
                :error-messages="errors.password"
                :rules="[passwordRules.required, passwordRules.length, passwordRules.strength]"
                class="mb-4"
                validate-on="blur"
                density="comfortable"
              >
                <template v-slot:append-inner>
                  <v-btn
                    icon="mdi-eye-outline"
                    size="small"
                    variant="text"
                    @click="showPassword = !showPassword"
                    :color="showPassword ? 'primary' : 'medium-emphasis'"
                  ></v-btn>
                </template>
              </v-text-field>

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
                :disabled="!isFormValid || !turnstileToken || loading"
                color="primary"
                variant="elevated"
                size="large"
                block
                class="mb-4"
                prepend-icon="mdi-account-plus"
              >
                注册账号
              </v-btn>
            </v-form>

            <!-- Login Link -->
            <div class="text-center">
              <span class="body-medium text-medium-emphasis">已有账号？</span>
              <router-link
                to="/login"
                class="text-primary text-decoration-none ml-1"
              >
                去登录
              </router-link>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'
import VueTurnstile from 'vue-turnstile'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({ username: '', email: '', phone: '', password: '' })
const loading = ref(false)
const errors = reactive({
  username: '',
  email: '',
  phone: '',
  password: ''
})

const registerForm = ref()
const showPassword = ref(false)
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
  errors.username = 'Turnstile验证失败，请刷新页面重试'
}

const onTurnstileExpired = () => {
  turnstileToken.value = ''
}

// Form validation rules
const usernameRules = {
  required: (v: string) => !!v || '请输入用户名',
  length: (v: string) => (v && v.length >= 2 && v.length <= 20) || '用户名长度为2-20个字符'
}

const emailRules = {
  required: (v: string) => !!v || '请输入邮箱地址',
  valid: (v: string) => /.+@.+\..+/.test(v) || '请输入有效的邮箱地址'
}

const phoneRules = {
  required: (v: string) => !!v || '请输入手机号码',
  valid: (v: string) => /^1[3-9]\d{9}$/.test(v) || '请输入有效的手机号码'
}

const passwordRules = {
  required: (v: string) => !!v || '请输入密码',
  length: (v: string) => (v && v.length >= 8) || '密码至少8位',
  strength: (v: string) => /(?=.*[a-zA-Z])(?=.*\d)/.test(v) || '密码需包含字母和数字'
}

// Form validity
const isFormValid = computed(() => {
  return form.username.length >= 2 &&
         form.email.includes('@') &&
         /^1[3-9]\d{9}$/.test(form.phone) &&
         form.password.length >= 8
})

const clearErrors = () => {
  errors.username = ''
  errors.email = ''
  errors.phone = ''
  errors.password = ''
}

const validateForm = () => {
  clearErrors()

  if (form.username.length < 2 || form.username.length > 20) {
    errors.username = '用户名长度为2-20个字符'
    return false
  }

  if (!/.+@.+\..+/.test(form.email)) {
    errors.email = '请输入有效的邮箱地址'
    return false
  }

  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    errors.phone = '请输入有效的手机号码'
    return false
  }

  if (form.password.length < 8) {
    errors.password = '密码至少8位'
    return false
  }

  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(form.password)) {
    errors.password = '密码需包含字母和数字'
    return false
  }

  return true
}

const onSubmit = async () => {
  if (!validateForm()) return

  if (!turnstileToken.value) {
    errors.username = '请完成人机验证'
    return
  }

  loading.value = true
  try {
    await auth.register(form)
    router.replace('/')
    // Show success message through the global toast system
    if (auth.ui?.showToast) {
      auth.ui.showToast('注册成功！欢迎加入NEW超市 🎉', 'success')
    }
  } catch (e: any) {
    const errorMsg = e?.response?.data?.message || '注册失败，请检查信息'

    // Handle specific validation errors
    if (errorMsg.includes('用户名')) {
      errors.username = errorMsg
    } else if (errorMsg.includes('邮箱')) {
      errors.email = errorMsg
    } else if (errorMsg.includes('手机')) {
      errors.phone = errorMsg
    } else if (errorMsg.includes('密码')) {
      errors.password = errorMsg
    } else {
      // Generic error for the first field
      errors.username = errorMsg
    }
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

/* Modern gradient background similar to login */
.auth-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(600px 400px at 80% 20%, rgba(98, 91, 113, 0.15), transparent 60%),
    radial-gradient(800px 600px at 20% 80%, rgba(103, 80, 164, 0.1), transparent 60%),
    radial-gradient(400px 300px at 60% 60%, rgba(125, 82, 96, 0.08), transparent 60%),
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
  border-radius: 16px;
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
  margin-top: 16px;
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
    border-radius: 16px;
    min-height: auto;
  }

  .auth-card .pa-10 {
    padding: 32px 24px !important;
  }
}

/* Error message styling */
:deep(.v-messages.error) {
  color: var(--v-theme-error);
}

/* Dark mode support */
.v-theme--dark {
  .auth-bg {
    background:
      radial-gradient(600px 400px at 80% 20%, rgba(98, 91, 113, 0.25), transparent 60%),
      radial-gradient(800px 600px at 20% 80%, rgba(103, 80, 164, 0.2), transparent 60%),
      radial-gradient(400px 300px at 60% 60%, rgba(125, 82, 96, 0.15), transparent 60%),
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
  border-radius: 16px;
}
</style>
