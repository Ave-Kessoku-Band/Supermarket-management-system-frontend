<template>
  <div class="card">
    <h3>销售汇总</h3>
    <div class="form-inline">
      <input v-model="date" type="date" />
      <button class="btn" @click="load">刷新</button>
    </div>
    <div v-if="data">
      <ul class="stats">
        <li>交易笔数：{{ data.transactions }}</li>
        <li>营业额：{{ cents(data.turnover) }}</li>
        <li>折扣：{{ cents(data.discount) }}</li>
        <li>税额：{{ cents(data.tax) }}</li>
      </ul>
      <h4>支付方式</h4>
      <ul>
        <li v-for="(v,k) in data.by_methods" :key="k">{{ k }}：{{ cents(v) }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import dayjs from 'dayjs'
import { salesSummary } from '../../api/reports'

const date = ref(dayjs().format('YYYY-MM-DD'))
const data = ref<any>(null)
function cents(v?: number) { if (v == null) return '-'; return (v/100).toFixed(2) }
async function load() {
  try { data.value = await salesSummary(date.value) } catch (e: any) { alert(e.message) }
}
load()
</script>

<style scoped>
.card { background:#fff; border:1px solid #eee; border-radius:10px; padding:12px; }
.form-inline { display:flex; gap:8px; align-items:center; margin:8px 0; }
.btn { padding:6px 10px; border:1px solid #ccc; background:#fff; border-radius:6px; cursor:pointer; }
.stats { display:flex; gap:16px; }
</style>
