<template>
  <div class="card" v-if="receipt">
    <h3>小票详情</h3>
    <ul>
      <li>小票号：{{ receipt.receipt_no }}</li>
      <li>订单总额：{{ cents(receipt.grand_total) }}</li>
      <li>折扣：{{ cents(receipt.discount_total) }}</li>
      <li>税额：{{ cents(receipt.tax_total) }}</li>
      <li>收银员：{{ receipt.cashier }}</li>
      <li>支付时间：{{ receipt.paid_at }}</li>
    </ul>
  </div>
  <div v-else class="card">加载中...</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getReceipt } from '../../api/receipts'
import type { Receipt } from '../../api/types'

const route = useRoute()
const receipt = ref<Receipt | null>(null)
function cents(v?: number) { if (v == null) return '-'; return (v/100).toFixed(2) }

onMounted(async () => {
  const no = route.params.receiptNo as string
  try { receipt.value = await getReceipt(no) } catch (e: any) { alert(e.message) }
})
</script>

<style scoped>
.card { background:#fff; border:1px solid #eee; border-radius:10px; padding:12px; }
</style>
