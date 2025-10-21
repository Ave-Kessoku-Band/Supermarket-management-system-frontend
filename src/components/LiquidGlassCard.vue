<template>
  <div class="liquid-wrap" :style="{ maxWidth }">
    <div
      ref="cardRef"
      class="liquid-glass"
      @mousemove="onMove"
      @mouseleave="onLeave"
      :style="styleVars"
    >
      <!-- 动态高光层（跟随鼠标） -->
      <div class="lg-highlight" aria-hidden="true"></div>
      <!-- 斜向扫光 -->
      <div class="lg-gloss" aria-hidden="true"></div>
      <!-- 内容 -->
      <div class="lg-content">
        <slot />
      </div>
    </div>

    <!-- 定义可选的 SVG 滤镜（流动/轻微形变） -->
    <svg class="lg-filters" width="0" height="0" aria-hidden="true">
      <filter id="lg-waves">
        <feTurbulence type="fractalNoise" baseFrequency="0.005 0.01" numOctaves="2" seed="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    maxWidth?: string
  }>(),
  { maxWidth: '480px' }
)

const cardRef = ref<HTMLElement | null>(null)
const state = reactive({
  mx: 50, // mouse x %
  my: 50, // mouse y %
  tiltX: 0, // -6 ~ 6
  tiltY: 0
})

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const onMove = (e: MouseEvent) => {
  const el = cardRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  state.mx = clamp(x, 0, 100)
  state.my = clamp(y, 0, 100)
  // 轻微 3D 倾斜
  state.tiltY = clamp((state.mx - 50) / 50, -1, 1) * 6
  state.tiltX = clamp((50 - state.my) / 50, -1, 1) * 6
}

const onLeave = () => {
  state.mx = 50
  state.my = 50
  state.tiltX = 0
  state.tiltY = 0
}

const styleVars = computed(() => ({
  '--mx': `${state.mx}%`,
  '--my': `${state.my}%`,
  '--tiltX': `${state.tiltX}deg`,
  '--tiltY': `${state.tiltY}deg`
}) as Record<string, string>)

const maxWidth = computed(() => props.maxWidth)
</script>

<style scoped>
.liquid-wrap {
  width: 100%;
}

/* 核心：白色液态玻璃 + 半透明 + 背景模糊 + 轻微形变 */
.liquid-glass {
  position: relative;
  border-radius: 20px;
  padding: 16px;
  border: 1px solid rgba(16, 24, 40, 0.14);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.68), rgba(255,255,255,0.48));
  backdrop-filter: blur(16px) saturate(180%) contrast(105%);
  -webkit-backdrop-filter: blur(16px) saturate(180%) contrast(105%);
  box-shadow:
    0 10px 30px rgba(15, 23, 42, 0.12),
    inset 0 1px 0 rgba(255,255,255,0.55);
  overflow: hidden;
  transform: perspective(800px) rotateX(var(--tiltX, 0deg)) rotateY(var(--tiltY, 0deg));
  transition: transform 80ms linear;
  filter: url(#lg-waves); /* 细微流动 */
}

/* 彩色流动层（极浅，营造折射/流动感） */
.liquid-glass::before {
  content: "";
  position: absolute;
  inset: -40%;
  background: conic-gradient(
    from 0deg,
    rgba(59,130,246,0.12),
    rgba(16,185,129,0.10),
    rgba(244,114,182,0.10),
    rgba(234,179,8,0.10),
    rgba(59,130,246,0.12)
  );
  filter: blur(30px) saturate(120%);
  animation: lg-spin 18s linear infinite;
  pointer-events: none;
}

/* 高光层：基于鼠标位置的柔和圆形高光 */
.lg-highlight {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(
      300px 300px at var(--mx, 50%) var(--my, 50%),
      rgba(255,255,255,0.55),
      rgba(255,255,255,0.18) 35%,
      rgba(255,255,255,0.0) 60%
    );
  mix-blend-mode: screen;
  transition: background-position 60ms linear;
}

/* 斜向扫光动画（微弱） */
.lg-gloss {
  position: absolute;
  inset: -60% -20%;
  pointer-events: none;
  background:
    linear-gradient(115deg,
      rgba(255,255,255,0.00) 35%,
      rgba(255,255,255,0.18) 50%,
      rgba(255,255,255,0.00) 65%
    );
  animation: lg-gloss-move 6s ease-in-out infinite;
  opacity: .7;
}

/* 内容层 */
.lg-content {
  position: relative;
  z-index: 1;
}

/* 动画 */
@keyframes lg-spin {
  to { transform: rotate(360deg); }
}
@keyframes lg-gloss-move {
  0%, 100% { transform: translate3d(-10%, -10%, 0) rotate(0.001deg); }
  50%      { transform: translate3d(10%, 10%, 0)  rotate(0.001deg); }
}
</style>
