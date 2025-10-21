<template>
  <div class="glass card">
    <div class="section-title">库存管理</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
      <input class="input" placeholder="商品名" v-model="search" @keyup.enter="load" style="max-width:240px;" />
      <select class="input" v-model="stockStatus" style="max-width:180px;">
        <option value="">全部库存状态</option>
        <option value="OK">OK</option>
        <option value="LOW">LOW</option>
        <option value="OUT">OUT</option>
      </select>
      <button class="btn" @click="load">查询</button>
    </div>

    <div v-for="p in products" :key="p.id" class="glass card" style="margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-weight:600;">{{ p.name }}</div>
          <div class="small">库存：{{ p.stock }}（{{ p.stockStatus }}） · 单价 ¥ {{ p.price }}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <input class="input" type="number" v-model.number="p.__delta" placeholder="数量（可负数）" style="width:160px;" />
          <button class="btn" @click="applyIncrement(p)">增量调整</button>
          <button class="btn" @click="applySet(p)">设置为该值</button>
        </div>
      </div>
    </div>

    <Pagination v-if="meta" v-model:page="page" :total-pages="meta.total_pages || 1" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { apiAdjustStock, apiListProducts } from '@/api/endpoints'
import Pagination from '@/components/Pagination.vue'

const search = ref('')
const stockStatus = ref('')
const products = ref<any[]>([])
const meta = ref<any | null>(null)
const page = ref(1)
const per_page = ref(12)

const load = async () => {
  const data = await apiListProducts({ search: search.value || undefined, stock_status: stockStatus.value || undefined, page: page.value, per_page: per_page.value })
  products.value = (data.data || []).map((x: any) => ({ ...x, __delta: 0 }))
  meta.value = data.meta || null
}
watch(page, load)
onMounted(load)

const applyIncrement = async (p: any) => {
  await apiAdjustStock(p.id, { op: 'increment', value: Number(p.__delta || 0) })
  await load()
}

const applySet = async (p: any) => {
  await apiAdjustStock(p.id, { op: 'set', value: Number(p.__delta || 0) })
  await load()
}
</script>
