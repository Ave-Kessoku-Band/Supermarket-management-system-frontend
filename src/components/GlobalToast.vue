<template>
  <div class="toast-container" :style="{ '--toast-offset': toastOffset }">
    <!-- Success Toast -->
    <v-snackbar
      v-model="ui.showToastState"
      :color="ui.toastType === 'success' ? 'success' : ui.toastType === 'error' ? 'error' : 'info'"
      :timeout="ui.toastDuration || 4000"
      location="top"
      :elevation="8"
      class="material-toast"
    >
      <template v-slot:activator="{ props }">
        <div v-bind="props"></div>
      </template>

      <div class="toast-content">
        <!-- Icon based on toast type -->
        <v-icon
          :icon="getToastIcon(ui.toastType)"
          :color="ui.toastType === 'success' ? 'white' : ui.toastType === 'error' ? 'white' : 'white'"
          class="toast-icon"
          size="20"
        ></v-icon>

        <!-- Toast message -->
        <span class="toast-message">{{ ui.toastMessage }}</span>

        <v-spacer></v-spacer>

        <!-- Close button -->
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          color="white"
          @click="hideToast"
          class="toast-close"
        ></v-btn>
      </div>
    </v-snackbar>

    <!-- Login Tip Toast (Legacy Support) -->
    <transition name="toast-slide">
      <div v-if="ui.loginTipVisible" class="login-tip-toast">
        <v-card class="toast-card" :elevation="6">
          <v-card-text class="pa-4">
            <div class="toast-content">
              <v-icon color="primary" class="toast-icon" size="20">
                mdi-information-outline
              </v-icon>
              <span class="toast-message">{{ ui.tipMessage }}</span>
              <v-spacer></v-spacer>
              <v-btn
                icon="mdi-close"
                variant="text"
                size="small"
                @click="ui.hideLoginTip()"
                color="medium-emphasis"
              ></v-btn>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '@/store/ui'

const ui = useUiStore()
const route = useRoute()

// Position offset based on navigation visibility
const toastOffset = computed(() => (route.meta.hideNav ? '20px' : '80px'))

const getToastIcon = (type: string) => {
  switch (type) {
    case 'success':
      return 'mdi-check-circle-outline'
    case 'error':
      return 'mdi-alert-circle-outline'
    case 'warning':
      return 'mdi-alert-outline'
    default:
      return 'mdi-information-outline'
  }
}

const hideToast = () => {
  ui.hideToast()
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  pointer-events: none;
  display: flex;
  justify-content: center;
}

/* Material Design 3 Toast Styling */
:deep(.material-toast .v-snackbar__wrapper) {
  border-radius: 12px !important;
  backdrop-filter: blur(8px) saturate(180%);
  -webkit-backdrop-filter: blur(8px) saturate(180%);
  min-width: min(300px, 90vw);
  max-width: 560px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2) !important;
}

/* Success toast styling */
:deep(.material-toast.v-snackbar--color-success .v-snackbar__wrapper) {
  background: linear-gradient(135deg, #1976d2, #1565c0) !important;
}

/* Error toast styling */
:deep(.material-toast.v-snackbar--color-error .v-snackbar__wrapper) {
  background: linear-gradient(135deg, #d32f2f, #c62828) !important;
}

/* Info toast styling */
:deep(.material-toast.v-snackbar--color-info .v-snackbar__wrapper) {
  background: linear-gradient(135deg, #0288d1, #0277bd) !important;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.toast-icon {
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}

.toast-close {
  flex-shrink: 0;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.toast-close:hover {
  opacity: 1;
}

/* Login Tip Toast Styling (Legacy) */
.login-tip-toast {
  margin-top: var(--toast-offset);
  pointer-events: auto;
}

.toast-card {
  border-radius: 12px;
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  min-width: min(280px, 85vw);
  max-width: 560px;
}

/* Slide animations */
.toast-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.toast-slide-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.toast-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  :deep(.material-toast .v-snackbar__wrapper) {
    margin: 0 16px;
    border-radius: 8px !important;
  }

  .toast-card {
    margin: 0 8px;
  }

  .toast-message {
    font-size: 13px;
  }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .toast-slide-enter-active,
  .toast-slide-leave-active {
    transition: opacity 0.2s ease;
  }

  .toast-slide-enter-from,
  .toast-slide-leave-to {
    transform: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :deep(.material-toast .v-snackbar__wrapper) {
    border: 2px solid currentColor;
  }

  .toast-card {
    border: 2px solid var(--v-theme-outline);
  }
}
</style>