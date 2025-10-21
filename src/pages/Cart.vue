<template>
  <GlassCard>
    <h2 class="section-title">购物车</h2>
    <div v-if="loading" class="small">加载中...</div>
    <div v-else-if="!cart || cart.items.length === 0" class="small">购物车为空</div>
    <div v-else style="display:flex;gap:16px;flex-wrap:wrap;">
      <div style="flex:2;min-width:320px;">
        <div v-for="item in cart.items" :key="item.itemId" class="glass card" style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
          <div style="flex:1;">
            <div style="font-weight:600;">{{ item.name }}</div>
            <div class="small">¥ {{ item.price.toFixed(2) }} · {{ item.unit }}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <button class="btn" @click="update(item, Math.max(0, item.quantity - 1))">-</button>
            <span>{{ item.quantity }}</span>
            <button class="btn" @click="update(item, item.quantity + 1)">+</button>
          </div>
          <div style="width:120px;text-align:right;">小计 ¥ {{ item.subtotal.toFixed(2) }}</div>
          <button class="btn" @click="remove(item)">移除</button>
        </div>
        <button class="btn" @click="clear">清空购物车</button>
      </div>
      <div style="flex:1;min-width:280px;">
        <div class="glass card">
          <div>折扣系数：{{ cart.discount ?? 1 }}</div>
          <div style="font-weight:700;margin-top:8px;">总计：¥ {{ cart.total.toFixed(2) }}</div>
          <hr class="hr" />
          <label class="small">支付方式</label>
          <select class="input" v-model="payment" style="margin-bottom:10px;">
            <option v-for="pm in paymentMethods" :key="pm" :value="pm">{{ pm }}</option>
          </select>
          <button class="btn" @click="checkout">下单</button>
        </div>
      </div>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import GlassCard from '@/components/GlassCard.vue'
import { onMounted, ref } from 'vue'
import { useCartStore } from '@/store/cart'
import { apiCreateOrder, apiPaymentMethods } from '@/api/endpoints'
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const loading = ref(true)
const cart = ref<any>(null)
const paymentMethods = ref<string[]>([])
const payment = ref<string>('CASH')
const router = useRouter()

const load = async () => {
  loading.value = true
  await cartStore.fetchCart()
  cart.value = cartStore.cart
  try {
    paymentMethods.value = await apiPaymentMethods()
    if (paymentMethods.value.length) payment.value = paymentMethods.value[0]
  } catch {}
  loading.value = false
}

onMounted(load)

const update = async (item: any, q: number) => {
  if (q <= 0) {
    await cartStore.remove(item.itemId)
  } else {
    await cartStore.update(item.itemId, q)
  }
  cart.value = cartStore.cart
}

const remove = async (item: any) => {
  await cartStore.remove(item.itemId)
  cart.value = cartStore.cart
}

const clear = async () => {
  await cartStore.clear()
  cart.value = cartStore.cart
}

const checkout = async () => {
  if (!cart.value || cart.value.items.length === 0) return
  try {
    // 服务器也支持直接从购物车创建订单，这里演示显式传 items
    const items = cart.value.items.map((i: any) => ({ productId: i.productId, quantity: i.quantity }))
    const res = await apiCreateOrder({ items, paymentMethod: payment.value as any })
    alert('下单成功：' + res.orderNo)
    await load()
    router.push({ name: 'orders' })
  } catch (e: any) {
    alert(e?.response?.data?.message || '下单失败')
  }
}
</script>
