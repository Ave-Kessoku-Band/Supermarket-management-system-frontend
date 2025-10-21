<template>
  <div class="glass card">
    <div class="section-title">订单管理</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
      <input class="input" placeholder="订单号" v-model="orderNo" @keyup.enter="load" style="max-width:220px;" />
      <select class="input" v-model="status" style="max-width:160px;">
        <option value="">全部状态</option>
        <option>PENDING</option>
        <option>PROCESSING</option>
        <option>COMPLETED</option>
        <option>CANCELED</option>
      </select>
      <button class="btn" @click="load">查询</button>
    </div>

    <div v-for="o in orders" :key="o.id" class="glass card" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
      <div>
        <div style="font-weight:600;">{{ o.orderNo }}</div>
        <div class="small">{{ o.createdAt }} · {{ o.memberName || o.memberId || '' }} · 状态：{{ o.status }}</div>
      </div>
      <div style="display:flex;gap:8px;">
        <select class="input" v-model="o.__status" style="max-width:180px;">
          <option>PENDING</option>
          <option>PROCESSING</option>
          <option>COMPLETED</option>
          <option>CANCELED</option>
        </select>
        <button class="btn" @click="save(o)">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiListOrders, apiGetOrder } from '@/api/endpoints'
import http from '@/api/http'

const orderNo = ref('')
const status = ref('')
const orders = ref<any[]>([])

const load = async () => {
  const res = await apiListOrders({ orderNo: orderNo.value || undefined, status: status.value || undefined, per_page: 50, sort: '-createdAt' })
  orders.value = (res.data || []).map((x: any) => ({ ...x, __status: x.status }))
}
onMounted(load)

const save = async (o: any) => {
  await http.patch(`/orders/${o.id}`, { status: o.__status })
  // 重新获取以同步其他字段
  const fresh = await apiGetOrder(o.id)
  Object.assign(o, fresh, { __status: fresh.status })
}
</script>
