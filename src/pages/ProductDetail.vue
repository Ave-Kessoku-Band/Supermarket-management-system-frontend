<template>
  <div class="product-detail-page">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-16">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
        class="mb-4"
      ></v-progress-circular>
      <div class="body-large text-medium-emphasis">加载商品详情中...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-16">
      <v-icon size="80" color="error" class="mb-4">
        mdi-alert-circle-outline
      </v-icon>
      <div class="title-large text-high-emphasis mb-2">加载失败</div>
      <div class="body-medium text-medium-emphasis mb-6">{{ error }}</div>
      <v-btn color="primary" variant="elevated" @click="$router.back()">
        返回
      </v-btn>
    </div>

    <!-- Product Detail Content -->
    <v-container v-else-if="product" class="product-detail-container py-8">
      <v-row>
        <!-- Product Image -->
        <v-col cols="12" md="6">
          <v-card class="image-card" elevation="0">
            <v-img
              :src="product.imageUrl || defaultImage"
              :alt="product.name"
              aspect-ratio="1"
              cover
              class="product-main-image"
            >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center h-100 bg-grey-lighten-2">
                  <v-icon size="120" color="grey-lighten-1">
                    mdi-image-outline
                  </v-icon>
                </div>
              </template>

              <!-- Stock Status Badge -->
              <v-chip
                :color="stockStatusColor"
                variant="elevated"
                size="large"
                class="stock-badge"
              >
                <v-icon start>{{ stockStatusIcon }}</v-icon>
                {{ stockStatusLabel }}
              </v-chip>
            </v-img>
          </v-card>
        </v-col>

        <!-- Product Info -->
        <v-col cols="12" md="6">
          <div class="product-info-section">
            <!-- Category -->
            <v-chip
              color="primary"
              variant="tonal"
              size="small"
              class="mb-4"
              prepend-icon="mdi-tag"
            >
              {{ product.category }}
            </v-chip>

            <!-- Product Name -->
            <h1 class="text-h3 font-weight-bold text-high-emphasis mb-4">
              {{ product.name }}
            </h1>

            <!-- Price -->
            <div class="price-section mb-6">
              <div class="d-flex align-center">
                <span class="text-h4 text-primary font-weight-bold">
                  ¥{{ product.price?.toFixed(2) }}
                </span>
                <span class="text-body-1 text-medium-emphasis ml-2">
                  / {{ product.unit }}
                </span>
              </div>
            </div>

            <!-- Stock Info -->
            <v-card class="stock-info-card mb-6" variant="tonal">
              <v-card-text class="pa-4">
                <div class="d-flex align-center">
                  <v-icon size="24" class="mr-3">
                    mdi-package-variant-closed
                  </v-icon>
                  <div>
                    <div class="text-body-2 text-medium-emphasis">库存数量</div>
                    <div class="text-h6 font-weight-medium">
                      {{ product.stock }} {{ product.unit }}
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Quantity Selector -->
            <div class="quantity-section mb-6">
              <div class="text-body-1 font-weight-medium mb-3">购买数量</div>
              <div class="d-flex align-center">
                <v-btn
                  icon
                  variant="outlined"
                  size="large"
                  :disabled="quantity <= 1"
                  @click="quantity--"
                  class="quantity-btn"
                >
                  <v-icon>mdi-minus</v-icon>
                </v-btn>
                <v-text-field
                  v-model.number="quantity"
                  type="number"
                  min="1"
                  :max="product.stock"
                  variant="outlined"
                  hide-details
                  class="quantity-input mx-4"
                  density="comfortable"
                ></v-text-field>
                <v-btn
                  icon
                  variant="outlined"
                  size="large"
                  :disabled="quantity >= product.stock"
                  @click="quantity++"
                  class="quantity-btn"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <v-btn
                color="primary"
                variant="elevated"
                size="x-large"
                block
                :disabled="product.stockStatus === 'OUT'"
                :loading="addingToCart"
                @click="onAddToCart"
                class="mb-3"
                prepend-icon="mdi-cart-plus"
              >
                {{ product.stockStatus === 'OUT' ? '暂时缺货' : '加入购物车' }}
              </v-btn>
              <v-btn
                variant="outlined"
                size="large"
                block
                @click="$router.back()"
                prepend-icon="mdi-arrow-left"
              >
                返回商品列表
              </v-btn>
            </div>

            <!-- Product Meta -->
            <v-divider class="my-6"></v-divider>
            <div class="product-meta">
              <div class="meta-item mb-3">
                <v-icon size="20" class="mr-2">mdi-clock-outline</v-icon>
                <span class="text-body-2 text-medium-emphasis">
                  上架时间: {{ formatDate(product.createdAt) }}
                </span>
              </div>
              <div class="meta-item">
                <v-icon size="20" class="mr-2">mdi-update</v-icon>
                <span class="text-body-2 text-medium-emphasis">
                  更新时间: {{ formatDate(product.updatedAt) }}
                </span>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiGetProduct } from '@/api/endpoints'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import { useUiStore } from '@/store/ui'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const ui = useUiStore()

const product = ref<any>(null)
const loading = ref(false)
const error = ref('')
const quantity = ref(1)
const addingToCart = ref(false)

const defaultImage = 'https://picsum.photos/seed/product/800/800.jpg'

const stockStatusLabel = computed(() => {
  if (!product.value) return ''
  if (product.value.stockStatus === 'OUT') return '无库存'
  if (product.value.stockStatus === 'LOW') return '库存紧张'
  return '有货'
})

const stockStatusColor = computed(() => {
  if (!product.value) return 'success'
  if (product.value.stockStatus === 'OUT') return 'error'
  if (product.value.stockStatus === 'LOW') return 'warning'
  return 'success'
})

const stockStatusIcon = computed(() => {
  if (!product.value) return 'mdi-check-circle'
  if (product.value.stockStatus === 'OUT') return 'mdi-close-circle'
  if (product.value.stockStatus === 'LOW') return 'mdi-alert-circle'
  return 'mdi-check-circle'
})

const fetchProduct = async () => {
  const id = route.params.id as string
  if (!id) {
    error.value = '商品ID无效'
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    product.value = await apiGetProduct(id)
  } catch (e: any) {
    console.error('Failed to fetch product:', e)
    error.value = e?.response?.data?.message || '商品不存在或已下架'
  } finally {
    loading.value = false
  }
}

const onAddToCart = async () => {
  if (!auth.isAuthenticated) {
    ui.promptLoginAndRedirect(route.fullPath)
    return
  }

  if (!product.value || quantity.value < 1) return

  addingToCart.value = true
  try {
    await cart.add(product.value.id, quantity.value)
    ui.showToast(`已添加 ${quantity.value} ${product.value.unit} 到购物车`, 'success')
    quantity.value = 1
  } catch (e: any) {
    ui.showToast(e?.response?.data?.message || '添加失败', 'error')
  } finally {
    addingToCart.value = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

onMounted(() => {
  fetchProduct()
})
</script>

<style scoped>
.product-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, 
    rgba(102, 126, 234, 0.03) 0%, 
    rgba(118, 75, 162, 0.02) 50%,
    transparent 100%);
}

.product-detail-container {
  max-width: 1200px;
}

.image-card {
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.product-main-image {
  position: relative;
  border-radius: 16px;
}

.product-main-image :deep(.v-img__img) {
  border-radius: 16px;
}

.stock-badge {
  position: absolute;
  top: 24px;
  right: 24px;
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

.product-info-section {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 16px;
  padding: 32px;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.price-section {
  padding: 16px 0;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.stock-info-card {
  border-radius: 16px;
}

.quantity-section {
  padding: 20px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 16px;
}

.quantity-input {
  max-width: 120px;
}

.quantity-input :deep(.v-field__input) {
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
}

.quantity-btn {
  border-width: 2px;
}

.action-buttons {
  margin-top: 24px;
}

.product-meta .meta-item {
  display: flex;
  align-items: center;
}

/* Animation */
.product-detail-container {
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark mode */
.v-theme--dark {
  .product-detail-page {
    background: linear-gradient(180deg, 
      rgba(102, 126, 234, 0.08) 0%, 
      rgba(118, 75, 162, 0.05) 50%,
      transparent 100%);
  }
  
  .image-card,
  .product-info-section {
    background: rgba(30, 30, 30, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .quantity-section {
    background: rgba(102, 126, 234, 0.1);
  }
}

/* Mobile responsiveness */
@media (max-width: 960px) {
  .product-info-section {
    margin-top: 24px;
    padding: 24px;
  }

  .stock-badge {
    top: 16px;
    right: 16px;
  }

  .text-h3 {
    font-size: 2rem !important;
  }

  .text-h4 {
    font-size: 1.75rem !important;
  }
}
</style>
