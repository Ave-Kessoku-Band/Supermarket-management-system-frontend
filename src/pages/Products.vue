<template>
  <div class="products-page">
    <!-- Floating Filter Button -->
    <v-btn
      class="filter-fab"
      color="primary"
      icon
      size="large"
      elevation="8"
      @click="filterDialog = true"
    >
      <v-icon>mdi-filter-variant</v-icon>
    </v-btn>

    <!-- Filter Dialog -->
    <v-dialog v-model="filterDialog" max-width="500">
      <v-card class="glass-dialog">
        <v-card-title class="d-flex align-center pa-4">
          <v-icon class="mr-2">mdi-filter-variant</v-icon>
          筛选商品
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="filterDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-select
            v-model="stockStatus"
            label="库存状态"
            :items="stockStatusOptions"
            variant="outlined"
            clearable
            prepend-inner-icon="mdi-package-variant-closed"
          ></v-select>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-btn variant="text" @click="clearFilters">清除筛选</v-btn>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="filterDialog = false">取消</v-btn>
          <v-btn color="primary" variant="elevated" @click="applyFilters">应用</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { useRoute } from 'vue-router'
import { apiListProducts } from '@/api/endpoints'
import ProductCard from '@/components/ProductCard.vue'
import Pagination from '@/components/Pagination.vue'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import { useUiStore } from '@/store/ui'

const auth = useAuthStore()
const cart = useCartStore()
const ui = useUiStore()
const route = useRoute()

const search = ref('')
const stockStatus = ref<string>('')
const page = ref(1)
const per_page = ref(12)
const loading = ref(false)
const filterDialog = ref(false)

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

const applyFilters = () => {
  page.value = 1
  fetch()
  filterDialog.value = false
}

const clearFilters = () => {
  stockStatus.value = ''
  page.value = 1
  fetch()
  filterDialog.value = false
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

// 监听导航栏搜索事件
const handleNavbarSearch = (e: CustomEvent) => {
  search.value = e.detail
  page.value = 1
  fetch()
}

// 监听URL查询参数
watch(() => route.query.search, (newSearch) => {
  if (newSearch && typeof newSearch === 'string') {
    search.value = newSearch
    page.value = 1
    fetch()
  }
}, { immediate: true })

watch(page, fetch)

onMounted(() => {
  // 如果URL没有搜索参数，正常加载
  if (!route.query.search) {
    fetch()
  }
  // 添加事件监听
  window.addEventListener('navbar-search', handleNavbarSearch as EventListener)
})
</script>

<style scoped>
.products-page {
  position: relative;
  min-height: calc(100vh - 64px);
  padding: 24px 0;
  margin: 0 -16px;
  padding-left: 16px;
  padding-right: 16px;
}

.products-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, 
    rgba(102, 126, 234, 0.03) 0%, 
    rgba(118, 75, 162, 0.02) 50%,
    transparent 100%);
  z-index: -1;
  pointer-events: none;
}

/* Floating Filter Button */
.filter-fab {
  position: fixed;
  top: 88px;
  right: 24px;
  z-index: 100;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4) !important;
}

/* Glass Dialog */
.glass-dialog {
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08) !important;
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
.glass-dialog :deep(.v-field) {
  background: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px !important;
}

.glass-dialog :deep(.v-field:hover) {
  background: rgba(255, 255, 255, 0.75) !important;
}

.glass-dialog :deep(.v-field--focused) {
  background: rgba(255, 255, 255, 0.85) !important;
  box-shadow: 
    0 4px 16px rgba(102, 126, 234, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

/* Dark mode support with enhanced blur */
@media (prefers-color-scheme: dark) {
  .products-page::before {
    background: linear-gradient(180deg, 
      rgba(102, 126, 234, 0.08) 0%, 
      rgba(118, 75, 162, 0.05) 50%,
      transparent 100%);
  }
  
  .glass-dialog {
    background: rgba(30, 30, 30, 0.95) !important;
    border: 1.5px solid rgba(255, 255, 255, 0.15);
  }
  
  .glass-dialog :deep(.v-field) {
    background: rgba(45, 45, 45, 0.6) !important;
  }
  
  .glass-dialog :deep(.v-field:hover) {
    background: rgba(55, 55, 55, 0.7) !important;
  }
  
  .glass-dialog :deep(.v-field--focused) {
    background: rgba(60, 60, 60, 0.8) !important;
  }
}
</style>
