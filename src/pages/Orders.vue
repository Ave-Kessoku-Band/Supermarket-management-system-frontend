<template>
  <div class="orders-page">
    <v-container>
      <!-- Header -->
      <div class="page-header mb-6">
        <h1 class="headline-large">我的订单</h1>
        <p class="body-medium text-medium-emphasis">查看您的历史订单</p>
      </div>

      <!-- Loading State -->
      <v-card v-if="loading" class="elevation-1 pa-8 text-center">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <p class="body-medium text-medium-emphasis mt-4">加载中...</p>
      </v-card>

      <!-- Empty State -->
      <v-card v-else-if="orders.length === 0" class="elevation-1 pa-8 text-center">
        <v-icon size="64" color="medium-emphasis" class="mb-4">mdi-receipt-text-outline</v-icon>
        <h3 class="title-large mb-2">暂无订单</h3>
        <p class="body-medium text-medium-emphasis mb-4">您还没有创建任何订单</p>
        <v-btn color="primary" variant="elevated" to="/">
          <v-icon start>mdi-store</v-icon>
          去购物
        </v-btn>
      </v-card>

      <!-- Orders List -->
      <div v-else>
        <v-card
          v-for="order in orders"
          :key="order.id"
          class="elevation-1 mb-4 order-card"
        >
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-receipt-text</v-icon>
            <span class="title-medium">订单号：{{ order.orderNo }}</span>
            <v-spacer></v-spacer>
            <v-chip :color="getStatusColor(order.status)" size="small">
              {{ getStatusText(order.status) }}
            </v-chip>
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="body-medium mb-1">
                  <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                  {{ formatDate(order.createdAt) }}
                </div>
                <div class="title-large text-primary">
                  ¥{{ order.total.toFixed(2) }}
                </div>
              </div>
              
              <v-btn
                color="primary"
                variant="elevated"
                :to="{ name: 'order-detail', params: { id: order.id } }"
              >
                <v-icon start>mdi-eye</v-icon>
                查看详情
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { apiListOrders } from '@/api/endpoints'

const loading = ref(true)
const orders = ref<any[]>([])

const load = async () => {
  loading.value = true
  try {
    const res = await apiListOrders({ page: 1, per_page: 50, sort: '-createdAt' })
    orders.value = res.data || []
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'PENDING': 'warning',
    'PAID': 'success',
    'CANCELLED': 'error',
    'COMPLETED': 'primary'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    'PENDING': '待支付',
    'PAID': '已支付',
    'CANCELLED': '已取消',
    'COMPLETED': '已完成'
  }
  return texts[status] || status
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(load)
</script>

<style scoped>
.orders-page {
  padding: 24px 0;
}

.page-header {
  text-align: center;
}

.order-card {
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}
</style>
