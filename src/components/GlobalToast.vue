<template>
  <!-- 顶部居中；停靠位置由 --toast-offset 控制 -->
  <div class="toast-host" :style="{ '--toast-offset': toastOffset }" aria-live="polite">
    <transition name="toast-slide">
      <div v-if="ui.loginTipVisible" class="toast-card">
        <!-- 液态玻璃外观 -->
        <LiquidGlassCard maxWidth="560px">
          <div class="toast-content">
            <span class="toast-dot" aria-hidden="true"></span>
            <span>{{ ui.tipMessage }}</span>
          </div>
        </LiquidGlassCard>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '@/store/ui'
import LiquidGlassCard from '@/components/LiquidGlassCard.vue'

const ui = useUiStore()
const route = useRoute()

// 更短的停靠距离：有导航 56px；无导航（登录/注册）20px
const toastOffset = computed(() => (route.meta.hideNav ? '20px' : '56px'))
</script>

<style scoped>
/* 宿主容器：顶部水平居中，动画终点由 --toast-offset & --toast-drop 决定 */
.toast-host {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 2000;
  display: flex;
  justify-content: center;
  pointer-events: none;

  /* 默认变量：到位偏移与下落距离 */
  --toast-offset: 56px;  /* JS 覆盖 */
  --toast-drop: 28px;    /* 稍短的下落距离 */
}

/* 关键修复：基础状态就保持在目标位置，防止动画类移除后回到顶部 */
.toast-card {
  pointer-events: auto;
  width: min(92vw, 560px);
  margin: 0 12px;
  transform: translateY(var(--toast-offset));
}

/* 内容：液态玻璃卡里的提示行 */
.toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 4px;
  font-size: 14px;
}
.toast-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: radial-gradient(closest-side, rgba(59,130,246,0.9), rgba(59,130,246,0.2));
  box-shadow: 0 0 10px rgba(59,130,246,0.35), 0 0 20px rgba(59,130,246,0.2);
}

/* 动画：无回弹的下滑到位 + 轻微上收隐藏 */
.toast-slide-enter-active {
  transition:
    transform .20s cubic-bezier(.4,0,.2,1),
    opacity .16s ease;
  will-change: transform, opacity;
  transform: translateZ(0);
}
.toast-slide-leave-active {
  transition:
    transform .16s cubic-bezier(.4,0,.2,1),
    opacity .14s ease;
  will-change: transform, opacity;
  transform: translateZ(0);
}

/* 进入：从“终点上方 var(--toast-drop)”到达终点（基础 transform 保持终点） */
.toast-slide-enter-from {
  transform: translateY(calc(var(--toast-offset) - var(--toast-drop)));
  opacity: 0;
}
.toast-slide-enter-to {
  transform: translateY(var(--toast-offset));
  opacity: 1;
}

/* 离开：轻微上收 12px 同时淡出 */
.toast-slide-leave-from {
  transform: translateY(var(--toast-offset));
  opacity: 1;
}
.toast-slide-leave-to {
  transform: translateY(calc(var(--toast-offset) - 12px));
  opacity: 0;
}

/* 动画减弱支持 */
@media (prefers-reduced-motion: reduce) {
  .toast-slide-enter-active,
  .toast-slide-leave-active {
    transition: opacity .12s ease;
  }
  .toast-slide-enter-from,
  .toast-slide-leave-to,
  .toast-slide-enter-to,
  .toast-slide-leave-from {
    transform: none !important;
  }
}
</style>
