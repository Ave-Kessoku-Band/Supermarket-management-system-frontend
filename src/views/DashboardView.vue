<template>
  <div class="grid">
    <div class="tile">
      <div class="label">今日交易笔数</div>
      <div class="value">{{ data?.transactions ?? '-' }}</div>
    </div>
    <div class="tile">
      <div class="label">今日营业额</div>
      <div class="value">{{ cents(data?.turnover) }}</div>
    </div>
    <div class="tile">
      <div class="label">折扣</div>
      <div class="value">{{ cents(data?.discount) }}</div>
    </div>
    <div class="tile">
      <div class="label">税额</div>
      <div class="value">{{ cents(data?.tax) }}</div>
    </div>
  </div>
  <div class="card" v-if="data">
    <h3>支付方式分布</h3>
    <ul>
      <li v-for="(v,k) in data.by_methods" :key="k">{{ k }}：{{ cents(v) }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { ref, onMounted } from 'vue'
import { salesSummary } from '../api/reports'

const data = ref<any>(null)
const today = dayjs().format('YYYY-MM-DD')
function cents(v?: number) {
  if (v == null) return '-'
  return (v / 100).toFixed(2)
}
async function load() {
  try { data.value = await salesSummary(today) } catch (e) { console.error(e) }
}
onMounted(load)
</script>

<style scoped>
.grid { display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; }
.tile { background:#fff; border:1px solid #eee; border-radius:10px; padding:12px; }
.label { color:#666; }
.value { font-size:24px; font-weight:bold; margin-top:6px; }
.card { background:#fff; border:1px solid #eee; border-radius:10px; padding:12px; margin-top:12px; }
</style>
