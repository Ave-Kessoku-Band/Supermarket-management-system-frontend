<template>
  <div class="card">
    <h3>库存调整</h3>
    <div class="form-grid">
      <label>SKU</label><input v-model="sku_id" />
      <label>变动数量</label><input type="number" v-model.number="delta" />
      <label>原因</label>
      <select v-model="reason">
        <option value="manual">manual</option>
        <option value="stocktake">stocktake</option>
        <option value="damage">damage</option>
      </select>
      <label>备注</label><input v-model="note" />
    </div>
    <button class="btn primary" @click="onSubmit">提交调整</button>
    <div class="hint">注意：销售结账也会自动扣减库存</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { postAdjustment } from '../../api/inventory'

const sku_id = ref('')
const delta = ref<number>(0)
const reason = ref<'manual'|'stocktake'|'damage'>('manual')
const note = ref('')

async function onSubmit() {
  if (!sku_id.value) { alert('请输入 SKU'); return }
  try {
    await postAdjustment({ sku_id: sku_id.value, delta: delta.value, reason: reason.value, note: note.value || undefined })
    alert('调整成功')
    sku_id.value = ''
    delta.value = 0
    note.value = ''
  } catch (e: any) {
    alert(e.message || '调整失败')
  }
}
</script>

<style scoped>
.card { background:#fff; border:1px solid #eee; border-radius:10px; padding:12px; }
.form-grid { display:grid; grid-template-columns: 120px 1fr; gap:8px; align-items:center; margin:8px 0; }
.btn { padding:6px 10px; border:1px solid #ccc; background:#409eff; border-color:#409eff; color:#fff; border-radius:6px; cursor:pointer; }
.hint { color:#777; margin-top:8px; }
</style>
