<template>
  <div class="profile-page">
    <v-container>
      <!-- Header -->
      <div class="page-header mb-6">
        <h1 class="headline-large">个人信息</h1>
        <p class="body-medium text-medium-emphasis">查看和管理您的个人资料</p>
      </div>

      <!-- Loading State -->
      <v-card v-if="loading" class="elevation-1 pa-8 text-center">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <p class="body-medium text-medium-emphasis mt-4">加载中...</p>
      </v-card>

      <!-- Profile Content -->
      <div v-else>
        <v-row>
          <!-- User Avatar Card -->
          <v-col cols="12" md="4">
            <v-card class="elevation-2 text-center pa-6">
              <v-avatar size="120" color="primary" class="mb-4">
                <v-icon size="64">mdi-account</v-icon>
              </v-avatar>
              
              <h3 class="title-large mb-2">{{ me?.username }}</h3>
              
              <v-chip :color="getRoleColor(me?.role)" class="mb-4">
                {{ getRoleText(me?.role) }}
              </v-chip>
              
              <v-divider class="my-4"></v-divider>
              
              <v-btn block variant="outlined" color="primary" class="mb-2">
                <v-icon start>mdi-camera</v-icon>
                更换头像
              </v-btn>
              
              <v-btn block variant="outlined" color="primary">
                <v-icon start>mdi-lock-outline</v-icon>
                修改密码
              </v-btn>
            </v-card>
          </v-col>

          <!-- User Info Card -->
          <v-col cols="12" md="8">
            <v-card class="elevation-1">
              <v-card-title>
                <v-icon class="mr-2">mdi-account-details</v-icon>
                基本信息
              </v-card-title>
              
              <v-divider></v-divider>
              
              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="6">
                    <div class="info-field">
                      <div class="label-small text-medium-emphasis mb-1">用户名</div>
                      <div class="title-medium">{{ me?.username || '-' }}</div>
                    </div>
                  </v-col>
                  
                  <v-col cols="12" sm="6">
                    <div class="info-field">
                      <div class="label-small text-medium-emphasis mb-1">角色</div>
                      <div class="title-medium">{{ getRoleText(me?.role) }}</div>
                    </div>
                  </v-col>
                  
                  <v-col cols="12" sm="6">
                    <div class="info-field">
                      <div class="label-small text-medium-emphasis mb-1">用户ID</div>
                      <div class="body-medium">{{ me?.id || '-' }}</div>
                    </div>
                  </v-col>
                  
                  <v-col cols="12" sm="6">
                    <div class="info-field">
                      <div class="label-small text-medium-emphasis mb-1">注册时间</div>
                      <div class="body-medium">{{ me?.createdAt ? formatDate(me.createdAt) : '-' }}</div>
                    </div>
                  </v-col>
                </v-row>
                
                <v-divider class="my-6"></v-divider>
                
                <v-alert
                  type="info"
                  variant="tonal"
                  class="mb-4"
                >
                  <template v-slot:prepend>
                    <v-icon>mdi-information</v-icon>
                  </template>
                  <div class="body-small">
                    您可以在此页面查看个人信息。如需修改头像、昵称或密码等，请联系管理员或使用对应的修改功能。
                  </div>
                </v-alert>
                
                <v-btn color="primary" variant="elevated" size="large">
                  <v-icon start>mdi-pencil</v-icon>
                  编辑资料
                </v-btn>
              </v-card-text>
            </v-card>
            
            <!-- Additional Info Card -->
            <v-card class="elevation-1 mt-4">
              <v-card-title>
                <v-icon class="mr-2">mdi-chart-box</v-icon>
                账户统计
              </v-card-title>
              
              <v-divider></v-divider>
              
              <v-card-text>
                <v-row>
                  <v-col cols="6" md="3">
                    <div class="stat-item text-center pa-4">
                      <v-icon size="32" color="primary" class="mb-2">mdi-cart</v-icon>
                      <div class="title-large">0</div>
                      <div class="body-small text-medium-emphasis">订单数</div>
                    </div>
                  </v-col>
                  
                  <v-col cols="6" md="3">
                    <div class="stat-item text-center pa-4">
                      <v-icon size="32" color="success" class="mb-2">mdi-currency-cny</v-icon>
                      <div class="title-large">¥0.00</div>
                      <div class="body-small text-medium-emphasis">总消费</div>
                    </div>
                  </v-col>
                  
                  <v-col cols="6" md="3">
                    <div class="stat-item text-center pa-4">
                      <v-icon size="32" color="warning" class="mb-2">mdi-star</v-icon>
                      <div class="title-large">0</div>
                      <div class="body-small text-medium-emphasis">积分</div>
                    </div>
                  </v-col>
                  
                  <v-col cols="6" md="3">
                    <div class="stat-item text-center pa-4">
                      <v-icon size="32" color="info" class="mb-2">mdi-heart</v-icon>
                      <div class="title-large">0</div>
                      <div class="body-small text-medium-emphasis">收藏</div>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { apiMe } from '@/api/endpoints'

const loading = ref(true)
const me = ref<any | null>(null)

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    'admin': 'error',
    'staff': 'warning',
    'member': 'primary'
  }
  return colors[role] || 'grey'
}

const getRoleText = (role: string) => {
  const texts: Record<string, string> = {
    'admin': '管理员',
    'staff': '员工',
    'member': '会员'
  }
  return texts[role] || role
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

onMounted(async () => {
  loading.value = true
  try {
    me.value = await apiMe()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.profile-page {
  padding: 24px 0;
}

.page-header {
  text-align: center;
}

.v-card {
  border-radius: 16px;
}

.info-field {
  padding: 12px 0;
}

.stat-item {
  border-radius: 12px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-item:hover {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  transform: translateY(-2px);
}
</style>
