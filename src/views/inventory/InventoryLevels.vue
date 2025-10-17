<template>
  <div class="card">
    <h3>库存水平</h3>
    <div class="form-inline">
      <input v-model="sku" placeholder="按 SKU 过滤" @keydown.enter="load" />
      <button class="btn" @click="load">查询</button>
    </div>
    <table class="table">
      <thead><tr><th>SKU</th><th>在手数量</th><th>更新时间</th></tr></thead>
      <tbody>
        <tr v-for="l in list" :key="l.sku_id">
          <td>{{ l.sku_id }}</td>
          <td>{{ l.qty_on_hand }}</td>
          <td>{{ l.updated_at || '-' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getLevels } from '../../api/inventory'
import type { InventoryLevel } from '../../api/types'

const sku = ref('')
const list = ref<InventoryLevel[]>([])

async function load() {
  try { list.value = await getLevels({ sku: sku.value || undefined }) } catch (e: any) { alert(e.message) }
}
onMounted(load)
</script>

<style scoped>
.card { background:#fff; border:1px solid #eee; border-radius:10px; padding:12px; }
.form-inline { display:flex; gap:8px; align-items:center; margin:8px 0; }
.table { width:100%; border-collapse: collapse; }
.table th, .table td { border:1px solid #eee; padding:6px; }
.btn { padding:6px 10px; border:1px solid #ccc; background:#fff; border-radius:6px; cursor:pointer; }
</style>
