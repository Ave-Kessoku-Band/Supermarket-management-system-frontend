<template>
  <div class="products-page">
    <!-- Search and Filter Section -->
    <v-card class="mb-6" elevation="2">
      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              label="搜索商品"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              clearable
              @keyup.enter="fetch"
              @click:clear="search = ''; fetch()"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="stockStatus"
              label="库存状态"
              :items="stockStatusOptions"
              variant="outlined"
              clearable
              prepend-inner-icon="mdi-package-variant-closed"
            ></v-select>
          </v-col>

          <v-col cols="12" md="2" class="d-flex align-end">
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
