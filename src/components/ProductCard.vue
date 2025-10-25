<template>
  <v-card
    class="product-card"
    elevation="3"
    :class="{ 'product-card--disabled': disabled }"
    @click="onCardClick"
  >
    <!-- Product Image -->
    <v-img
      :src="image || defaultImage"
      :alt="name"
      aspect-ratio="1.2"
      cover
      class="product-image"
    >
      <template v-slot:placeholder>
        <div class="d-flex align-center justify-center h-100 bg-grey-lighten-2">
          <v-icon size="48" color="grey-lighten-1">
            mdi-image-outline
          </v-icon>
        </div>
      </template>

      <!-- Stock Status Badge -->
      <v-chip
        v-if="stockStatus"
        :color="statusColor"
        variant="elevated"
        size="small"
        class="product-stock-badge"
      >
        {{ stockStatusLabel }}
      </v-chip>
    </v-img>

    <!-- Product Info -->
    <v-card-text class="pa-3">
      <div class="product-info">
        <!-- Category -->
        <div class="category-tag mb-2">
          {{ category }}
        </div>

        <!-- Name -->
        <h3 class="product-title mb-2">
          {{ name }}
        </h3>

        <!-- Stock Info -->
        <div v-if="stock !== undefined" class="stock-info mb-3">
          <v-icon size="14" class="mr-1">
            mdi-package-variant-closed
          </v-icon>
          <span>库存: {{ stock }} {{ unit }}</span>
        </div>

        <!-- Price and Action -->
        <div class="d-flex align-center justify-space-between mt-auto">
          <div class="price-wrapper">
            <div class="price-main">¥{{ price?.toFixed(2) }}</div>
            <div class="price-unit">/ {{ unit }}</div>
          </div>

          <v-btn
            :disabled="disabled"
            :loading="loading"
            color="primary"
            variant="elevated"
            size="small"
            icon="mdi-cart-plus"
            @click="onAddToCart"
            class="add-to-cart-btn"
          >
          </v-btn>
        </div>
      </div>
    </v-card-text>

    <!-- Ripple Effect -->
    <v-ripple class="product-ripple"></v-ripple>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  id?: string
  name: string
  category: string
  unit: string
  price: number
  image?: string
  stock?: number
  stockStatus?: 'OK' | 'LOW' | 'OUT'
  disabled?: boolean
}>()

const emit = defineEmits<{
  add: []
}>()

const router = useRouter()
const loading = ref(false)

// Default image placeholder
const defaultImage = 'https://picsum.photos/seed/product/300/300.jpg'

// Stock status helpers
const stockStatusLabel = computed(() => {
  if (props.stockStatus === 'OUT') return '无库存'
  if (props.stockStatus === 'LOW') return '库存紧张'
  return '有货'
})

const statusColor = computed(() => {
  if (props.stockStatus === 'OUT') return 'error'
  if (props.stockStatus === 'LOW') return 'warning'
  return 'success'
})

// Add to cart handler
const onAddToCart = async (event: Event) => {
  event.stopPropagation() // 阻止事件冒泡，避免触发卡片点击
  
  if (props.disabled || loading.value) return

  loading.value = true
  try {
    emit('add')
    // Add a small delay for loading state visibility
    await new Promise(resolve => setTimeout(resolve, 500))
  } finally {
    loading.value = false
  }
}

// Card click handler
const onCardClick = () => {
  if (props.id) {
    router.push({ name: 'product-detail', params: { id: props.id } })
  }
}
</script>

<style scoped>
.product-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.3) 0%, 
    transparent 100%);
  pointer-events: none;
  opacity: 0.6;
  z-index: 1;
  transition: opacity 0.3s ease;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 16px rgba(102, 126, 234, 0.12),
    0 2px 6px rgba(102, 126, 234, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border-color: rgba(102, 126, 234, 0.3);
  background: rgba(255, 255, 255, 0.8) !important;
}

.product-card:hover::before {
  opacity: 0.8;
}

.product-card--disabled {
  opacity: 0.5;
  cursor: default;
  filter: saturate(0.7);
}

.product-card--disabled:hover {
  transform: none;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.03);
}

.product-image {
  position: relative;
  overflow: hidden;
}

.product-image :deep(.v-img__img) {
  display: block;
}

.product-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, 
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.02) 100%);
  pointer-events: none;
}

.product-stock-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-weight: 500;
  font-size: 0.7rem;
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  z-index: 2;
}

.product-card :deep(.v-card-text) {
  border-radius: 0 !important;
}

.product-info {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  z-index: 2;
}

.category-tag {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-primary));
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-title {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
  color: rgb(var(--v-theme-on-surface));
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.6em;
}

.stock-info {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
  display: flex;
  align-items: center;
}

.price-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.price-main {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  line-height: 1;
}

.price-unit {
  font-size: 0.7rem;
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1;
}

.product-info > div:last-child {
  margin-top: auto;
}

.add-to-cart-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.2);
}

.add-to-cart-btn:hover {
  box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
}

.product-ripple {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

/* 移除 hover 时的遮罩效果 */
.product-card :deep(.v-card__overlay) {
  display: none;
}

/* Ensuring proper truncation for long names */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Dark mode support */
.v-theme--dark {
  .product-card {
    background: rgba(30, 30, 30, 0.7) !important;
    border-color: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(40px) saturate(150%);
    -webkit-backdrop-filter: blur(40px) saturate(150%);
  }
  
  .product-card:hover {
    background: rgba(40, 40, 40, 0.85) !important;
    border-color: rgba(102, 126, 234, 0.4);
  }
  
  .product-card::before {
    background: linear-gradient(180deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      transparent 100%);
  }
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  .product-card {
    border-radius: 16px;
  }
  
  .product-title {
    font-size: 0.9rem;
    min-height: 2.4em;
  }

  .price-main {
    font-size: 1.1rem;
  }
  
  .add-to-cart-btn {
    transform: scale(0.9);
  }
  
  .product-stock-badge {
    top: 6px;
    right: 6px;
    font-size: 0.65rem;
  }
}
</style>