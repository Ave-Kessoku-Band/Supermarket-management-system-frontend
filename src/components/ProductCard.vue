<template>
  <v-card
    class="product-card"
    elevation="3"
    hover
    :class="{ 'product-card--disabled': disabled }"
  >
    <!-- Product Image -->
    <v-img
      :src="image || defaultImage"
      :alt="name"
      aspect-ratio="1"
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
    <v-card-text class="pa-4">
      <div class="product-info">
        <!-- Category -->
        <div class="body-small text-medium-emphasis mb-1">
          {{ category }}
        </div>

        <!-- Name -->
        <h3 class="title-medium mb-2 text-truncate">
          {{ name }}
        </h3>

        <!-- Stock Info -->
        <div v-if="stock !== undefined" class="body-small text-medium-emphasis mb-3">
          <v-icon size="14" class="mr-1">
            mdi-package-variant-closed
          </v-icon>
          库存: {{ stock }} {{ unit }}
        </div>

        <!-- Price and Action -->
        <div class="d-flex align-center justify-space-between">
          <div class="text-h6 text-primary font-weight-bold">
            ¥{{ price?.toFixed(2) }}
            <span v-if="unit" class="body-small text-medium-emphasis ml-1">
              / {{ unit }}
            </span>
          </div>

          <v-btn
            :disabled="disabled"
            :loading="loading"
            color="primary"
            variant="elevated"
            size="small"
            prepend-icon="mdi-cart-plus"
            @click="onAddToCart"
            class="add-to-cart-btn"
          >
            {{ disabled ? '暂时缺货' : '加入' }}
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

const props = defineProps<{
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
const onAddToCart = async () => {
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
</script>

<style scoped>
.product-card {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
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
  transform: translateY(-12px) scale(1.03);
  box-shadow: 
    0 24px 48px rgba(102, 126, 234, 0.2),
    0 8px 16px rgba(102, 126, 234, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border-color: rgba(102, 126, 234, 0.3);
  background: rgba(255, 255, 255, 0.85) !important;
}

.product-card:hover::before {
  opacity: 0.8;
}

.product-card--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: saturate(0.7);
}

.product-card--disabled:hover {
  transform: none;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.03);
}

.product-image {
  position: relative;
  overflow: hidden;
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
  top: 12px;
  right: 12px;
  font-weight: 500;
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

.product-info {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  z-index: 2;
}

.add-to-cart-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.add-to-cart-btn:hover {
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.product-ripple {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

/* Material Design 3 Elevation Transitions */
.product-card:hover :deep(.v-card__overlay) {
  opacity: 1;
}

/* Ensuring proper truncation for long names */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
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
    border-radius: 20px;
  }
  
  .add-to-cart-btn {
    font-size: 12px !important;
    padding: 0 12px !important;
  }
  
  .product-stock-badge {
    top: 8px;
    right: 8px;
  }
}
</style>