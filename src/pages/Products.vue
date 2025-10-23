<template>
  <div class="products-page">
    <!-- Search and Filter Section with Glass Effect -->
    <v-card class="glass-card mb-8" elevation="0">
      <v-card-text class="pa-4">
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              placeholder="搜索商品"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              clearable
              density="comfortable"
              hide-details
              @keyup.enter="fetch"
              @click:clear="search = ''; fetch()"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="stockStatus"
              placeholder="库存状态"
              :items="stockStatusOptions"
              variant="outlined"
              clearable
              density="comfortable"
              prepend-inner-icon="mdi-package-variant-closed"
              hide-details
            ></v-select>
          </v-col>

          <v-col cols="12" md="2">
            <v-btn
              color="primary"
              variant="elevated"
              size="large"
              block
              @click="fetch"
              prepend-icon="mdi-magnify"
            >
              查询
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <div v-if="products.length === 0 && loading" class="text-center py-8">
      <v-progress-circular
        indeterminate
        color="primary"
        size="48"
        class="mb-4"
      ></v-progress-circular>
      <div class="body-medium text-medium-emphasis">加载商品中...</div>
    </div>

    <!-- Empty State -->
    <div v-else-if="products.length === 0 && !loading" class="text-center py-8">
      <v-icon size="64" color="medium-emphasis" class="mb-4">
        mdi-package-variant
      </v-icon>
      <div class="title-medium text-medium-emphasis mb-2">暂无商品</div>
      <div class="body-medium text-medium-emphasis">
        尝试调整搜索条件或筛选器
      </div>
    </div>

    <!-- Products Grid -->
    <v-row v-else>
      <v-col
        v-for="product in products"
        :key="product.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="product-col"
      >
        <ProductCard
          :name="product.name"
          :category="product.category"
          :unit="product.unit"
          :price="product.price"
          :image="product.imageUrl"
          :stock="product.stock"
          :stock-status="product.stockStatus"
          :disabled="product.stockStatus === 'OUT'"
          @add="onAddToCart(product)"
        />
      </v-col>
    </v-row>

    <!-- Pagination -->
    <div v-if="meta && meta.total_pages > 1" class="d-flex justify-center mt-8">
      <Pagination
        v-model:page="page"
        :total-pages="meta.total_pages || 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
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
const loading = ref(false)

const products = ref<any[]>([])
const meta = ref<any | null>(null)

const stockStatusOptions = [
  { title: '全部', value: '' },
  { title: '有货', value: 'OK' },
  { title: '库存紧张', value: 'LOW' },
  { title: '无库存', value: 'OUT' }
]

const fetch = async () => {
  loading.value = true
  try {
    const data = await apiListProducts({
      search: search.value || undefined,
      stock_status: stockStatus.value || undefined,
      page: page.value,
      per_page: per_page.value
    })
    products.value = data.data || []
    meta.value = data.meta || null
  } catch (error) {
    console.error('Failed to fetch products:', error)
    products.value = []
  } finally {
    loading.value = false
  }
}

const onAddToCart = async (p: any) => {
  if (!auth.isAuthenticated) {
    ui.promptLoginAndRedirect('/')
    return
  }
  try {
    await cart.add(p.id, 1)
    // Show success message
    ui.showToast('已添加到购物车', 'success')
  } catch (e: any) {
    ui.showToast(e?.response?.data?.message || '添加失败', 'error')
  }
}

watch(() => [search.value, stockStatus.value], () => {
  page.value = 1
  fetch()
})

watch(page, fetch)
onMounted(fetch)
</script>

<style scoped>
.products-page {
  position: relative;
  background: linear-gradient(180deg, 
    rgba(102, 126, 234, 0.03) 0%, 
    rgba(118, 75, 162, 0.02) 50%,
    transparent 100%);
  min-height: 100vh;
  padding-top: 24px;
}

/* Enhanced Glass Morphism Card with Multi-layer Blur */
.glass-card {
  position: relative;
  background: rgba(255, 255, 255, 0.65) !important;
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  border-radius: 24px !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 24px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.3) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  pointer-events: none;
  opacity: 0.5;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 48px rgba(0, 0, 0, 0.12),
    0 2px 4px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.7) !important;
  border-color: rgba(102, 126, 234, 0.3);
}

/* Product Grid Animation with Stagger */
.product-col {
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

.product-col:nth-child(1) { animation-delay: 0.05s; }
.product-col:nth-child(2) { animation-delay: 0.1s; }
.product-col:nth-child(3) { animation-delay: 0.15s; }
.product-col:nth-child(4) { animation-delay: 0.2s; }
.product-col:nth-child(5) { animation-delay: 0.25s; }
.product-col:nth-child(6) { animation-delay: 0.3s; }
.product-col:nth-child(7) { animation-delay: 0.35s; }
.product-col:nth-child(8) { animation-delay: 0.4s; }
.product-col:nth-child(9) { animation-delay: 0.45s; }
.product-col:nth-child(10) { animation-delay: 0.5s; }
.product-col:nth-child(11) { animation-delay: 0.55s; }
.product-col:nth-child(12) { animation-delay: 0.6s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

/* Enhanced Input Fields with Blur */
.glass-card :deep(.v-field) {
  background: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px !important;
}

.glass-card :deep(.v-field:hover) {
  background: rgba(255, 255, 255, 0.75) !important;
}

.glass-card :deep(.v-field--focused) {
  background: rgba(255, 255, 255, 0.85) !important;
  box-shadow: 
    0 4px 16px rgba(102, 126, 234, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

/* Dark mode support with enhanced blur */
@media (prefers-color-scheme: dark) {
  .products-page {
    background: linear-gradient(180deg, 
      rgba(102, 126, 234, 0.08) 0%, 
      rgba(118, 75, 162, 0.05) 50%,
      transparent 100%);
  }
  
  .glass-card {
    background: rgba(30, 30, 30, 0.6) !important;
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(40px) saturate(150%);
    -webkit-backdrop-filter: blur(40px) saturate(150%);
  }
  
  .glass-card::before {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      rgba(255, 255, 255, 0.02) 100%);
  }
  
  .glass-card :deep(.v-field) {
    background: rgba(45, 45, 45, 0.6) !important;
  }
  
  .glass-card :deep(.v-field:hover) {
    background: rgba(55, 55, 55, 0.7) !important;
  }
  
  .glass-card :deep(.v-field--focused) {
    background: rgba(60, 60, 60, 0.8) !important;
  }
}
</style>
