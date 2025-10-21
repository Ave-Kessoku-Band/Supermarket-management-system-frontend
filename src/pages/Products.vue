<template>
  <div style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;">
    <div style="flex:1;min-width:220px;">
      <label class="small">搜索</label>
      <input class="input" v-model="search" placeholder="输入商品名" @keyup.enter="fetch" />
    </div>
    <div style="width:220px;">
      <label class="small">库存状态</label>
      <select class="input" v-model="stockStatus">
        <option value="">全部</option>
        <option value="OK">有货</option>
        <option value="LOW">库存紧张</option>
        <option value="OUT">无库存</option>
      </select>
    </div>
    <button class="btn" @click="fetch">查询</button>
  </div>

  <div class="grid" :class="gridCls" style="margin-top:16px;">
    <ProductCard
      v-for="p in products"
      :key="p.id"
      :name="p.name"
      :category="p.category"
      :unit="p.unit"
      :price="p.price"
      :image="p.imageUrl"
      :stock="p.stock"
      :stock-status="p.stockStatus"
      :disabled="p.stockStatus === 'OUT'"
      @add="onAddToCart(p)"
    />
  </div>

  <Pagination v-if="meta" v-model:page="page" :total-pages="meta.total_pages || 1" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { apiListProducts } from '@/api/endpoints'
import ProductCard from '@/components/ProductCard.vue'
import Pagination from '@/components/Pagination.vue'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import { useUiStore } from '@/store/ui'

const auth = useAuthStore()
const cart = useCartStore()
const ui = useUiStore()

const search = ref('')
const stockStatus = ref<string>('')
const page = ref(1)
const per_page = ref(12)

const products = ref<any[]>([])
const meta = ref<any | null>(null)

const gridCls = computed(() => {
  if (window.innerWidth >= 1100) return 'grid-cols-4'
  if (window.innerWidth >= 800) return 'grid-cols-3'
  return 'grid-cols-2'
})

const fetch = async () => {
  const data = await apiListProducts({
    search: search.value || undefined,
    stock_status: stockStatus.value || undefined,
    page: page.value,
    per_page: per_page.value
  })
  products.value = data.data || []
  meta.value = data.meta || null
}

watch(page, fetch)
onMounted(fetch)

const onAddToCart = async (p: any) => {
  if (!auth.isAuthenticated) {
    // 停留在首页，提示后跳登录（回跳到首页）
    ui.promptLoginAndRedirect('/')
    return
  }
  try {
    await cart.add(p.id, 1)
  } catch (e: any) {
    alert(e?.response?.data?.message || '添加失败')
  }
}
</script>
