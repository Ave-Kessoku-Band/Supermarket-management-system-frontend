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
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.product-card--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.product-card--disabled:hover {
  transform: none;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.product-image {
  position: relative;
}

.product-stock-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-weight: 500;
}

.product-info {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.add-to-cart-btn {
  transition: all 0.2s ease;
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

/* Mobile responsiveness */
@media (max-width: 600px) {
  .add-to-cart-btn {
    font-size: 12px !important;
    padding: 0 12px !important;
  }
}
</style>