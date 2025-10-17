<template>
  <div class="row">
    <div class="col">
      <div class="card">
        <h3>输入/加购</h3>

        <!-- 方式一：直接输入 SKU -->
        <div class="form-inline">
          <input v-model="skuInput" placeholder="输入 SKU 代码" @keydown.enter.prevent="onAddBySku" />
          <input type="number" v-model.number="qty" min="1" step="1" style="width:100px" />
          <button class="btn primary" @click="onAddBySku">加入 SKU</button>
          <button class="btn" @click="onNewCart" :disabled="cart && cart.status==='open'">新建购物车</button>
        </div>

        <!-- 方式二：搜索商品后加入 -->
        <div class="form-inline">
          <input v-model="keyword" placeholder="搜索商品名称/条码/SKU" @keydown.enter.prevent="onSearch" />
          <button class="btn" @click="onSearch">搜索</button>
        </div>

        <table class="table" v-if="searchResults.length">
          <thead>
            <tr>
              <th>SKU</th>
              <th>名称</th>
              <th>价格</th>
              <th style="width:120px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in searchResults" :key="p.id">
              <td>{{ p.sku }}</td>
              <td>{{ p.name }}</td>
              <td>{{ cents(p.price) }}</td>
              <td>
                <button class="btn" @click="onAddProduct(p)">加入</button>
              </td>
            </tr>
          </tbody>
        </table>

        <table class="table" v-if="cart">
          <thead>
            <tr>
              <th>SKU</th><th>名称</th><th>数量</th><th>单价</th><th>优惠</th><th>小计</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="line in cart.items" :key="line.line_id">
              <td>{{ line.sku_id }}</td>
              <td>{{ line.name }}</td>
              <td>
                <input type="number" step="1" min="0" v-model.number="line.qty" @change="updateQty(line)" style="width:80px" />
              </td>
              <td>{{ cents(line.unit_price) }}</td>
              <td>{{ cents(line.line_discount) }}</td>
              <td>{{ cents(line.line_total) }}</td>
              <td>
                <button class="btn" @click="onLineDiscount(line)">折扣</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="totals" v-if="cart">
          <div>商品数：{{ cart.items.length }}</div>
          <div>小计：{{ cents(cart.subtotal) }}</div>
          <div>折扣：{{ cents(cart.discount_total) }}</div>
          <div>税额：{{ cents(cart.tax_total) }}</div>
          <div><b>应付：{{ cents(cart.grand_total) }}</b></div>
        </div>

        <div class="form-inline" v-if="cart">
          <button class="btn" @click="onOrderDiscount">整单折扣</button>
          <button class="btn" @click="onApplyCoupon">优惠券</button>
        </div>
      </div>
    </div>

    <div class="col">
      <div class="card">
        <h3>支付</h3>
        <div v-if="!cart" class="hint">请先新建购物车并加购</div>
        <div v-else>
          <div class="form-inline">
            <input v-model="payAmountYuan" type="number" step="0.01" min="0" placeholder="金额（元）" style="width:140px" />
            <select v-model="payMethod" style="width:140px">
              <option v-for="m in payMethods" :key="m" :value="m">{{ m }}</option>
            </select>
            <button class="btn primary" @click="onAddPayment" :disabled="!canAddPayment">添加支付行</button>
            <button class="btn success" @click="onCheckout" :disabled="!canCheckout">结账</button>
          </div>

          <table class="table" v-if="payments.length">
            <thead><tr><th>方式</th><th>金额</th></tr></thead>
            <tbody>
              <tr v-for="(p,idx) in payments" :key="idx">
                <td>{{ p.method }}</td>
                <td>{{ cents(p.amount) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <div>应付：{{ cents(cart.grand_total) }}</div>
            <div>已付：{{ cents(paidTotal) }}</div>
            <div>未付：{{ cents(Math.max(cart.grand_total - paidTotal, 0)) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createCart, addItem, updateItem, addDiscount, applyCoupon, addPayment, checkout } from '../../api/carts'
import { paymentMethods } from '../../api/config'
import { listProducts } from '../../api/products'
import type { Cart, CartItem, Product } from '../../api/types'

const router = useRouter()

const cart = ref<Cart | null>(null)
const skuInput = ref('')
const keyword = ref('')
const searchResults = ref<Product[]>([])
const qty = ref(1)

const payMethods = ref<string[]>([])
const payMethod = ref<string>('')
const payAmountYuan = ref<string>('') // 输入元
const payments = ref<{ method: string; amount: number }[]>([]) // 金额分

const paidTotal = computed(() => payments.value.reduce((sum, p) => sum + p.amount, 0))
const canCheckout = computed(() => !!cart.value && paidTotal.value >= (cart.value?.grand_total || 0))
const canAddPayment = computed(() => {
  const v = parseFloat(payAmountYuan.value || '0')
  return !!cart.value && !!payMethod.value && v > 0
})

function cents(v?: number) {
  if (v == null) return '-'
  return (v / 100).toFixed(2)
}

async function ensureCart() {
  if (!cart.value) {
    cart.value = await createCart()
    payments.value = []
  }
}

async function onNewCart() {
  try {
    cart.value = await createCart()
    payments.value = []
  } catch (e: any) {
    alert(e.message || '新建失败')
  }
}

async function onSearch() {
  try {
    const res = await listProducts({ keyword: keyword.value })
    searchResults.value = res.items || []
  } catch (e: any) {
    alert(e.message || '搜索失败')
  }
}

async function onAddBySku() {
  const sku = skuInput.value.trim()
  if (!sku) return
  if (qty.value <= 0) { alert('数量需大于0'); return }
  try {
    await ensureCart()
    cart.value = await addItem(cart.value!.id, { sku_id: sku, qty: qty.value })
    skuInput.value = ''
    qty.value = 1
  } catch (e: any) {
    alert(e.message || '加购失败')
  }
}

async function onAddProduct(p: Product) {
  try {
    await ensureCart()
    cart.value = await addItem(cart.value!.id, { sku_id: p.sku, qty: qty.value })
  } catch (e: any) {
    alert(e.message || '加购失败')
  }
}

async function updateQty(line: CartItem) {
  if (!cart.value) return
  try {
    cart.value = await updateItem(cart.value.id, line.line_id, { qty: line.qty })
  } catch (e: any) {
    alert(e.message || '修改数量失败')
  }
}

async function onLineDiscount(line: CartItem) {
  if (!cart.value) return
  const mode = prompt('折扣类型：rate(折扣率0-1) / amount(金额分)。输入 "rate" 或 "amount"', 'rate')
  if (!mode) return
  if (mode === 'rate') {
    const r = parseFloat(prompt('输入折扣率(0-1)', '0.1') || '0')
    if (isNaN(r)) return
    try { cart.value = await addDiscount(cart.value.id, { scope: 'line', line_id: line.line_id, type: 'rate', value: r }) } catch (e: any) { alert(e.message) }
  } else {
    const a = parseInt(prompt('输入折扣金额（分）', '100') || '0', 10)
    if (isNaN(a)) return
    try { cart.value = await addDiscount(cart.value.id, { scope: 'line', line_id: line.line_id, type: 'amount', value: a }) } catch (e: any) { alert(e.message) }
  }
}

async function onOrderDiscount() {
  if (!cart.value) return
  const mode = prompt('整单折扣：rate 或 amount', 'rate')
  if (!mode) return
  if (mode === 'rate') {
    const r = parseFloat(prompt('输入折扣率(0-1)', '0.05') || '0')
    if (isNaN(r)) return
    try { cart.value = await addDiscount(cart.value.id, { scope: 'order', type: 'rate', value: r }) } catch (e: any) { alert(e.message) }
  } else {
    const a = parseInt(prompt('输入折扣金额（分）', '200') || '0', 10)
    if (isNaN(a)) return
    try { cart.value = await addDiscount(cart.value.id, { scope: 'order', type: 'amount', value: a }) } catch (e: any) { alert(e.message) }
  }
}

async function onApplyCoupon() {
  if (!cart.value) return
  const code = prompt('输入优惠券码')
  if (!code) return
  try { cart.value = await applyCoupon(cart.value.id, code) } catch (e: any) { alert(e.message) }
}

async function onAddPayment() {
  if (!cart.value) return
  const yuan = parseFloat(payAmountYuan.value || '0')
  if (!payMethod.value || !(yuan > 0)) return
  const amount = Math.round(yuan * 100)
  try {
    const updated = await addPayment(cart.value.id, { method: payMethod.value, amount })
    cart.value = updated
    payments.value.push({ method: payMethod.value, amount })
    payAmountYuan.value = ''
  } catch (e: any) {
    alert(e.message || '添加支付失败')
  }
}

async function onCheckout() {
  if (!cart.value) return
  if (!canCheckout.value) { alert('已付金额不足'); return }
  try {
    const res = await checkout(cart.value.id)
    alert(`结账成功，小票号：${res.receipt_no}`)
    router.push({ name: 'receipt-detail', params: { receiptNo: res.receipt_no } })
    cart.value = null
    payments.value = []
    searchResults.value = []
  } catch (e: any) {
    alert(e.message || '结账失败')
  }
}

onMounted(async () => {
  try {
    payMethods.value = await paymentMethods()
    payMethod.value = payMethods.value[0] || ''
  } catch {}
})
</script>

<style scoped>
.row { display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
.card { background:#fff; border:1px solid #eee; border-radius:10px; padding:12px; }
.form-inline { display:flex; gap:8px; align-items:center; margin-bottom:8px; }
.table { width:100%; border-collapse: collapse; background:#fff; }
.table th, .table td { border:1px solid #eee; padding:6px; text-align:left; }
.totals { display:flex; gap:16px; margin-top:8px; }
.btn { padding:6px 10px; border:1px solid #ccc; background:#fff; border-radius:6px; cursor:pointer; }
.btn.primary { background:#409eff; border-color:#409eff; color:#fff; }
.btn.success { background:#67C23A; border-color:#67C23A; color:#fff; }
.hint { color:#777; }
</style>
