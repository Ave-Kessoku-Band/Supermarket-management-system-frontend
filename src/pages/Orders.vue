<template>
  <GlassCard>
    <h2 class="section-title">历史订单</h2>
    <div v-if="loading" class="small">加载中...</div>
    <div v-else-if="orders.length === 0" class="small">暂无订单</div>
    <div v-else class="grid" style="grid-template-columns: repeat(1, minmax(0, 1fr));">
      <div v-for="o in orders" :key="o.id" class="glass card" style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-weight:600;">订单号：{{ o.orderNo }}</div>
          <div class="small">{{ o.createdAt }} · 状态：{{ o.status }} · 合计 ¥ {{ o.total.toFixed(2) }}</div>
        </div>
        <router-link class="btn" :to="{ name: 'order-detail', params: { id: o.id } }">查看</router-link>
      </div>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import GlassCard from '@/components/GlassCard.vue'
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

onMounted(load)
</script>
