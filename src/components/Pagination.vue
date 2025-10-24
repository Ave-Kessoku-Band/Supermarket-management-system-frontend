<template>
  <div class="pagination-container">
    <v-pagination
      v-model="currentPage"
      :length="totalPages"
      :total-visible="totalVisible"
      color="primary"
      variant="elevated"
      show-first-last-page
      @update:model-value="onPageChange"
    >
      <template v-slot:prev>
        <v-btn icon="mdi-chevron-left" variant="text" :disabled="currentPage <= 1"></v-btn>
      </template>
      <template v-slot:next>
        <v-btn icon="mdi-chevron-right" variant="text" :disabled="currentPage >= totalPages"></v-btn>
      </template>
      <template v-slot:first>
        <v-btn icon="mdi-page-first" variant="text" :disabled="currentPage <= 1"></v-btn>
      </template>
      <template v-slot:last>
        <v-btn icon="mdi-page-last" variant="text" :disabled="currentPage >= totalPages"></v-btn>
      </template>
    </v-pagination>

    <!-- Page info for better UX -->
    <div class="text-center mt-2">
      <span class="body-small text-medium-emphasis">
        第 {{ page }} 页，共 {{ totalPages }} 页
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  totalPages: number
}>()

const emit = defineEmits<{
  (e: 'update:page', val: number): void
}>()

// Responsive total visible pages
const totalVisible = computed(() => {
  if (typeof window !== 'undefined') {
    if (window.innerWidth < 600) return 3
    if (window.innerWidth < 960) return 5
    return 7
  }
  return 5
})

const currentPage = computed({
  get: () => props.page,
  set: (value: number) => emit('update:page', value)
})

const onPageChange = (newPage: number) => {
  emit('update:page', newPage)

  // Smooth scroll to top on page change
  if (typeof window !== 'undefined') {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 20px;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

/* Material Design 3 pagination styling */
:deep(.v-pagination__item) {
  border-radius: 12px;
  margin: 0 4px;
  transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

:deep(.v-pagination__item:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(var(--v-theme-primary), 0.2);
}

:deep(.v-pagination__item--is-active) {
  background: var(--v-theme-primary);
  color: var(--v-theme-on-primary);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
}

:deep(.v-pagination__item--is-active:hover) {
  box-shadow: 0 6px 16px rgba(var(--v-theme-primary), 0.4);
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  .pagination-container {
    padding: 16px 0;
  }

  :deep(.v-pagination) {
    gap: 4px;
  }
  
  :deep(.v-pagination__item) {
    margin: 0 2px;
  }
}

/* Dark mode support */
.v-theme--dark {
  .pagination-container {
    background: rgba(30, 30, 30, 0.7);
    border-color: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(40px) saturate(150%);
    -webkit-backdrop-filter: blur(40px) saturate(150%);
  }
}
</style>