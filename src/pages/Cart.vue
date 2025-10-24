<template>
  <div class="cart-page">
    <v-container>
      <!-- Header -->
      <div class="page-header mb-6">
        <h1 class="headline-large">购物车</h1>
        <p class="body-medium text-medium-emphasis">管理您的商品并完成结算</p>
      </div>

      <!-- Loading State -->
      <v-card v-if="loading" class="elevation-1 pa-8 text-center">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <p class="body-medium text-medium-emphasis mt-4">加载中...</p>
      </v-card>

      <!-- Empty State -->
      <v-card v-else-if="!cart || cart.items.length === 0" class="elevation-1 pa-8 text-center">
        <v-icon size="64" color="medium-emphasis" class="mb-4">mdi-cart-outline</v-icon>
        <h3 class="title-large mb-2">购物车是空的</h3>
        <p class="body-medium text-medium-emphasis mb-4">快去添加一些商品吧</p>
        <v-btn color="primary" variant="elevated" to="/">
          <v-icon start>mdi-store</v-icon>
          去购物
        </v-btn>
      </v-card>

      <!-- Cart Content -->
      <v-row v-else>
        <!-- Cart Items -->
        <v-col cols="12" lg="8">
          <v-card class="elevation-1 mb-4">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2">mdi-cart</v-icon>
              商品列表
              <v-chip class="ml-2" size="small" color="primary">{{ cart.items.length }}</v-chip>
              <v-spacer></v-spacer>
              <v-btn variant="text" color="error" @click="clear" size="small">
                <v-icon start>mdi-delete-outline</v-icon>
                清空购物车
              </v-btn>
            </v-card-title>
            <v-divider></v-divider>
            
            <v-list lines="two">
              <template v-for="(item, index) in cart.items" :key="item.itemId">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-avatar color="primary-container" rounded="lg" size="64">
                      <v-icon size="32">mdi-package-variant</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="title-medium mb-1">
                    {{ item.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="body-small">
                    ¥{{ item.price.toFixed(2) }} / {{ item.unit }}
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <div class="d-flex flex-column align-end">
                      <div class="d-flex align-center mb-2">
                        <v-btn
                          icon
                          variant="text"
                          size="small"
                          @click="update(item, Math.max(0, item.quantity - 1))"
                        >
                          <v-icon>mdi-minus</v-icon>
                        </v-btn>
                        <span class="mx-3 title-medium">{{ item.quantity }}</span>
                        <v-btn
                          icon
                          variant="text"
                          size="small"
                          @click="update(item, item.quantity + 1)"
                        >
                          <v-icon>mdi-plus</v-icon>
                        </v-btn>
                      </div>
                      <div class="title-medium">¥{{ item.subtotal.toFixed(2) }}</div>
                      <v-btn
                        variant="text"
                        color="error"
                        size="x-small"
                        @click="remove(item)"
                        class="mt-1"
                      >
                        移除
                      </v-btn>
                    </div>
                  </template>
                </v-list-item>
                <v-divider v-if="index < cart.items.length - 1"></v-divider>
              </template>
            </v-list>
          </v-card>
        </v-col>

        <!-- Order Summary -->
        <v-col cols="12" lg="4">
          <v-card class="elevation-2" style="position: sticky; top: 80px;">
            <v-card-title>
              <v-icon class="mr-2">mdi-receipt-text</v-icon>
              订单摘要
            </v-card-title>
            <v-divider></v-divider>
            
            <v-card-text>
              <div class="d-flex justify-space-between mb-3">
                <span class="body-medium text-medium-emphasis">商品数量</span>
                <span class="body-medium">{{ cart.items.length }} 件</span>
              </div>
              
              <div class="d-flex justify-space-between mb-3">
                <span class="body-medium text-medium-emphasis">折扣系数</span>
                <span class="body-medium">{{ cart.discount ?? 1.0 }}</span>
              </div>

              <v-divider class="my-4"></v-divider>

              <div class="d-flex justify-space-between mb-4">
                <span class="title-large">总计</span>
                <span class="title-large text-primary">¥{{ cart.total.toFixed(2) }}</span>
              </div>

              <v-select
                v-model="payment"
                label="支付方式"
                :items="paymentMethods"
                variant="outlined"
                prepend-inner-icon="mdi-credit-card-outline"
                class="mb-4"
              ></v-select>

              <v-btn
                block
                color="primary"
                variant="elevated"
                size="large"
                @click="checkout"
              >
                <v-icon start>mdi-check</v-icon>
                立即结算
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useCartStore } from '@/store/cart'
import { apiCreateOrder, apiPaymentMethods } from '@/api/endpoints'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/store/ui'

const cartStore = useCartStore()
const ui = useUiStore()
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
  ui.showToast('已移除商品', 'success')
}

const clear = async () => {
  if (!confirm('确定要清空购物车吗？')) return
  await cartStore.clear()
  cart.value = cartStore.cart
  ui.showToast('购物车已清空', 'success')
}

const checkout = async () => {
  if (!cart.value || cart.value.items.length === 0) return
  try {
    const items = cart.value.items.map((i: any) => ({ productId: i.productId, quantity: i.quantity }))
    const res = await apiCreateOrder({ items, paymentMethod: payment.value as any })
    ui.showToast('下单成功：' + res.orderNo, 'success')
    await load()
    router.push({ name: 'orders' })
  } catch (e: any) {
    ui.showToast(e?.response?.data?.message || '下单失败', 'error')
  }
}
</script>

<style scoped>
.cart-page {
  padding: 24px 0;
}

.page-header {
  text-align: center;
}

.v-card {
  border-radius: 16px;
}

.v-avatar {
  border-radius: 12px !important;
}
</style>
