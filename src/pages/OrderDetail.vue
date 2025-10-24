<template>
  <div class="order-detail-page">
    <v-container>
      <!-- Back Button -->
      <v-btn
        variant="text"
        class="mb-4"
        @click="$router.back()"
      >
        <v-icon start>mdi-arrow-left</v-icon>
        返回订单列表
      </v-btn>

      <!-- Loading State -->
      <v-card v-if="loading" class="elevation-1 pa-8 text-center">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <p class="body-medium text-medium-emphasis mt-4">加载中...</p>
      </v-card>

      <!-- Not Found -->
      <v-card v-else-if="!order" class="elevation-1 pa-8 text-center">
        <v-icon size="64" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
        <h3 class="title-large mb-2">未找到订单</h3>
        <p class="body-medium text-medium-emphasis">该订单可能已被删除或不存在</p>
      </v-card>

      <!-- Order Details -->
      <div v-else>
        <!-- Order Header -->
        <v-card class="elevation-2 mb-4">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-receipt-text</v-icon>
            订单详情
            <v-spacer></v-spacer>
            <v-chip :color="getStatusColor(order.status)">
              {{ getStatusText(order.status) }}
            </v-chip>
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <div class="info-item">
                  <div class="body-small text-medium-emphasis mb-1">订单号</div>
                  <div class="title-medium">{{ order.orderNo }}</div>
                </div>
              </v-col>
              
              <v-col cols="12" md="6">
                <div class="info-item">
                  <div class="body-small text-medium-emphasis mb-1">下单时间</div>
                  <div class="body-medium">{{ formatDate(order.createdAt) }}</div>
                </div>
              </v-col>
              
              <v-col cols="12" md="6">
                <div class="info-item">
                  <div class="body-small text-medium-emphasis mb-1">支付方式</div>
                  <div class="body-medium">{{ order.paymentMethod || '未指定' }}</div>
                </div>
              </v-col>
              
              <v-col cols="12" md="6">
                <div class="info-item">
                  <div class="body-small text-medium-emphasis mb-1">订单状态</div>
                  <div class="body-medium">{{ getStatusText(order.status) }}</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Order Items -->
        <v-card class="elevation-1">
          <v-card-title>
            <v-icon class="mr-2">mdi-package-variant</v-icon>
            商品清单
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-list lines="two">
            <template v-for="(item, index) in order.items" :key="item.productId">
              <v-list-item>
                <template v-slot:prepend>
                  <v-avatar color="primary-container" rounded="lg" size="56">
                    <v-icon size="28">mdi-package-variant</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="title-medium">
                  {{ item.name }}
                </v-list-item-title>
                <v-list-item-subtitle class="body-small">
                  数量：{{ item.quantity }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <div class="text-right">
                    <div class="title-medium">¥{{ item.subtotal.toFixed(2) }}</div>
                    <div class="body-small text-medium-emphasis">
                      单价：¥{{ (item.subtotal / item.quantity).toFixed(2) }}
                    </div>
                  </div>
                </template>
              </v-list-item>
              <v-divider v-if="index < order.items.length - 1"></v-divider>
            </template>
          </v-list>
          
          <v-divider></v-divider>
          
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <span class="title-large">订单总计</span>
              <span class="headline-small text-primary">¥{{ order.total.toFixed(2) }}</span>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { apiGetOrder } from '@/api/endpoints'

const route = useRoute()
const loading = ref(true)
const order = ref<any | null>(null)

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
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(async () => {
  loading.value = true
  try {
    order.value = await apiGetOrder(route.params.id as string)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.order-detail-page {
  padding: 24px 0;
}

.v-card {
  border-radius: 16px;
}

.info-item {
  padding: 8px 0;
}

.v-avatar {
  border-radius: 12px !important;
}
</style>
