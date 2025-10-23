<template>
  <v-container fluid class="auth-container">
    <!-- Background Pattern -->
    <div class="auth-bg"></div>

    <v-row justify="center" align="center" class="auth-row">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <!-- Register Card -->
        <v-card class="auth-card" elevation="8">
          <v-card-text class="pa-8">
            <!-- Logo and Title -->
            <div class="text-center mb-6">
              <v-icon size="64" color="primary" class="mb-4">
                mdi-account-plus-outline
              </v-icon>
              <h1 class="headline-large text-primary mb-2">NEW 超市</h1>
              <p class="title-medium text-medium-emphasis">创建新账户</p>
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
                class="mb-4"
                validate-on="blur"
                counter
                maxlength="20"
              ></v-text-field>

              <v-text-field
                v-model="form.email"
                label="邮箱地址"
                type="email"
                variant="outlined"
                prepend-inner-icon="mdi-email-outline"
                :error-messages="errors.email"
                :rules="[emailRules.required, emailRules.valid]"
                class="mb-4"
                validate-on="blur"
              ></v-text-field>

              <v-text-field
                v-model="form.phone"
                label="手机号码"
                variant="outlined"
                prepend-inner-icon="mdi-phone-outline"
                :error-messages="errors.phone"
                :rules="[phoneRules.required, phoneRules.valid]"
                class="mb-4"
                validate-on="blur"
                counter
                maxlength="11"
              ></v-text-field>

              <v-text-field
                v-model="form.password"
                label="密码"
                type="password"
                variant="outlined"
                prepend-inner-icon="mdi-lock-outline"
                :error-messages="errors.password"
                :rules="[passwordRules.required, passwordRules.length, passwordRules.strength]"
                class="mb-6"
                validate-on="blur"
                hint="密码至少8位，包含字母和数字"
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

              <v-btn
                type="submit"
                :loading="loading"
                :disabled="!isFormValid || loading"
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

            <!-- Registration Benefits -->
            <v-card class="mt-6" variant="tonal" color="primary">
              <v-card-text class="pa-4">
                <div class="d-flex align-center mb-2">
                  <v-icon color="primary" class="mr-2">mdi-gift-outline</v-icon>
                  <span class="body-medium font-weight-medium">注册即享</span>
                </div>
                <ul class="body-small text-medium-emphasis ma-0 pl-6">
                  <li>初始积分 100 分</li>
                  <li>会员专属优惠</li>
                  <li>积分兑换礼品</li>
                </ul>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'

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
  padding: 0;
  position: relative;
}

/* Modern gradient background similar to login */
.auth-bg {
  position: absolute;
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
  margin-top: 16px;
}

/* Benefits card styling */
:deep(.v-card--variant-tonal) {
  border-radius: 12px;
}

/* Form field enhancements */
:deep(.v-field) {
  border-radius: 12px;
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
    border-radius: 20px;
  }

  .auth-form {
    margin-top: 12px;
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

/* Error message styling */
:deep(.v-messages.error) {
  color: var(--v-theme-error);
}

/* Password strength indicator */
.password-strength {
  margin-top: -12px;
  margin-bottom: 8px;
}
</style>