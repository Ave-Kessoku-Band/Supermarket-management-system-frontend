<template>
  <GlassCard>
    <h2 class="section-title">订单详情</h2>
    <div v-if="loading" class="small">加载中...</div>
    <div v-else-if="!order" class="small">未找到订单</div>
    <div v-else>
      <div style="margin-bottom:10px;">订单号：{{ order.orderNo }}</div>
      <div class="small">下单时间：{{ order.createdAt }} · 状态：{{ order.status }}</div>
      <hr class="hr" />
      <div v-for="it in order.items" :key="it.productId" class="glass card" style="margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;">
          <div>{{ it.name }} × {{ it.quantity }}</div>
          <div>¥ {{ it.subtotal.toFixed(2) }}</div>
        </div>
      </div>
      <div style="text-align:right;font-weight:700;">合计 ¥ {{ order.total.toFixed(2) }}</div>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import GlassCard from '@/components/GlassCard.vue'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { apiGetOrder } from '@/api/endpoints'

const route = useRoute()
const loading = ref(true)
const order = ref<any | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    order.value = await apiGetOrder(route.params.id as string)
  } finally {
    loading.value = false
  }
})
</script>
