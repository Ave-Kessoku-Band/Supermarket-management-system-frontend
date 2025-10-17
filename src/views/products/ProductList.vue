<template>
  <div class="card">
    <h3>商品管理</h3>
    <div class="form-inline">
      <input v-model="keyword" placeholder="搜索名称/条码/SKU" @keydown.enter="load" />
      <select v-model="status">
        <option value="">全部状态</option>
        <option value="active">上架</option>
        <option value="inactive">下架</option>
      </select>
      <button class="btn" @click="load">查询</button>
    </div>

    <details class="card" open>
      <summary><b>{{ editing ? '编辑商品' : '新建商品' }}</b></summary>
      <div class="form-grid">
        <label>SKU</label><input v-model="form.sku" />
        <label>名称</label><input v-model="form.name" />
        <label>条码(逗号分隔)</label><input v-model="barcodesStr" />
        <label>单位</label><input v-model="form.unit" placeholder="个/斤/包" />
        <label>售价（元，含/未税与后端一致）</label><input type="number" step="0.01" v-model.number="priceYuan" />
        <label>税率(0-1)</label><input type="number" step="0.01" v-model.number="form.tax_rate" />
        <label>称重</label>
        <select v-model="form.is_weighed"><option :value="false">否</option><option :value="true">是</option></select>
        <label>状态</label>
        <select v-model="form.status"><option value="active">active</option><option value="inactive">inactive</option></select>
      </div>
      <div class="form-inline">
        <button class="btn primary" @click="onSave">{{ editing ? '保存' : '创建' }}</button>
        <button class="btn" v-if="editing" @click="onCancel">取消</button>
      </div>
      <div class="error" v-if="error">{{ error }}</div>
    </details>

    <table class="table" style="margin-top:10px">
      <thead>
        <tr><th>SKU</th><th>名称</th><th>条码</th><th>单位</th><th>价格</th><th>税率</th><th>称重</th><th>状态</th><th>操作</th></tr>
      </thead>
      <tbody>
        <tr v-for="p in items" :key="p.id">
          <td>{{ p.sku }}</td>
          <td>{{ p.name }}</td>
          <td>{{ p.barcodes.join(',') }}</td>
          <td>{{ p.unit }}</td>
          <td>{{ cents(p.price) }}</td>
          <td>{{ p.tax_rate }}</td>
          <td>{{ p.is_weighed ? '是' : '否' }}</td>
          <td>{{ p.status }}</td>
          <td>
            <button class="btn" @click="startEdit(p)">编辑</button>
            <button class="btn danger" @click="onDelete(p)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { listProducts, createProduct, updateProduct, deleteProduct } from '../../api/products'
import type { Product } from '../../api/types'

const keyword = ref('')
const status = ref('')
const items = ref<Product[]>([])

const emptyForm = (): Partial<Product> => ({
  sku: '', name: '', barcodes: [], unit: '个', price: 0, tax_rate: 0, is_weighed: false, status: 'active'
})
const form = reactive<Partial<Product>>(emptyForm())
const editing = ref(false)
const editingId = ref<string | null>(null)
const barcodesStr = ref('')
const priceYuan = ref<number>(0)
const error = ref('')

function cents(v?: number) { if (v == null) return '-'; return (v/100).toFixed(2) }

async function load() {
  try {
    const res = await listProducts({ keyword: keyword.value, status: status.value })
    items.value = res.items
  } catch (e: any) { alert(e.message) }
}

function startEdit(p: Product) {
  Object.assign(form, p)
  editing.value = true
  editingId.value = p.id
  barcodesStr.value = p.barcodes.join(',')
  priceYuan.value = p.price / 100
}

function onCancel() {
  Object.assign(form, emptyForm())
  editing.value = false
  editingId.value = null
  barcodesStr.value = ''
  priceYuan.value = 0
  error.value = ''
}

async function onSave() {
  try {
    error.value = ''
    form.barcodes = barcodesStr.value.split(',').map(s => s.trim()).filter(Boolean)
    form.price = Math.round((priceYuan.value || 0) * 100)
    if (editing.value && editingId.value) {
      await updateProduct(editingId.value, form)
    } else {
      await createProduct(form)
    }
    await load()
    onCancel()
  } catch (e: any) {
    error.value = e.message || '保存失败'
  }
}

async function onDelete(p: Product) {
  if (!confirm(`确认删除 ${p.name}?`)) return
  try { await deleteProduct(p.id); await load() } catch (e: any) { alert(e.message) }
}

onMounted(load)
</script>

<style scoped>
.card { background:#fff; border:1px solid #eee; border-radius:10px; padding:12px; }
.form-inline { display:flex; gap:8px; align-items:center; margin:8px 0; }
.form-grid {
  display:grid; grid-template-columns: 120px 1fr; gap:8px; align-items:center; margin:8px 0;
}
.table { width:100%; border-collapse: collapse; }
.table th, .table td { border:1px solid #eee; padding:6px; }
.btn { padding:6px 10px; border:1px solid #ccc; background:#fff; border-radius:6px; cursor:pointer; }
.btn.primary { background:#409eff; border-color:#409eff; color:#fff; }
.btn.danger { border-color:#e74c3c; color:#e74c3c; }
.error { color:#d33; margin-top:6px; }
</style>
