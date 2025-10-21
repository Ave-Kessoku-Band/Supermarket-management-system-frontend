<template>
  <div class="liquid-wrap" :style="{ maxWidth }">
    <div
      ref="cardRef"
      class="liquid-glass"
      @mouseenter="onEnter"
      @mousemove="onMove"
      @mouseleave="onLeave"
      :style="styleVars"
    >
      <!-- 跟随鼠标的柔和高光：默认隐藏，仅悬停时通过 --hl-o 显示 -->
      <div class="lg-highlight" aria-hidden="true"></div>
      <!-- 斜向扫光 -->
      <div class="lg-gloss" aria-hidden="true"></div>

      <!-- 内容 -->
      <div class="lg-content">
        <slot />
      </div>
    </div>

    <!-- SVG 滤镜：细微流动/形变 -->
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
const hovered = ref(false)
const state = reactive({
  mx: 50,
  my: 50,
  tiltX: 0,
  tiltY: 0
})

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const onEnter = () => {
  hovered.value = true
}

const onMove = (e: MouseEvent) => {
  const el = cardRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  state.mx = clamp(x, 0, 100)
  state.my = clamp(y, 0, 100)
  // 轻微 3D 倾斜仅跟随悬停时的坐标
  state.tiltY = clamp((state.mx - 50) / 50, -1, 1) * 6
  state.tiltX = clamp((50 - state.my) / 50, -1, 1) * 6
}

const onLeave = () => {
  hovered.value = false
  // 复位坐标与倾斜
  state.mx = 50
  state.my = 50
  state.tiltX = 0
  state.tiltY = 0
}

const styleVars = computed(() => ({
  '--mx': `${state.mx}%`,
  '--my': `${state.my}%`,
  '--tiltX': `${state.tiltX}deg`,
  '--tiltY': `${state.tiltY}deg`,
  // 悬停时显示高光（1），未悬停隐藏（0）
  '--hl-o': hovered.value ? '1' : '0'
}) as Record<string, string>)

const maxWidth = computed(() => props.maxWidth)
</script>

<style scoped>
.liquid-wrap {
  width: 100%;
}

/* 加重底色 + 连续描边 + 提升文字可读性 */
.liquid-glass {
  position: relative;
  border-radius: 20px;
  padding: 16px;

  /* 使用边框作为白色高光描边，避免描边与填充间隙 */
  border: 2px solid rgba(255, 255, 255, 0.75);
  background-clip: padding-box;

  /* 更重一些的半透明白底，提升可读性 */
  background:
    linear-gradient(180deg,
      rgba(255,255,255,0.28),
      rgba(255,255,255,0.18)
    );

  /* 外投影 + 顶部内高光 */
  box-shadow:
    0 10px 28px rgba(15, 23, 42, 0.18),
    inset 0 1px 0 rgba(255,255,255,0.65);

  /* 更强的毛玻璃与对比 */
  backdrop-filter: blur(20px) saturate(180%) contrast(112%);
  -webkit-backdrop-filter: blur(20px) saturate(180%) contrast(112%);

  overflow: hidden;
  transform: perspective(800px) rotateX(var(--tiltX, 0deg)) rotateY(var(--tiltY, 0deg));
  transition: transform 80ms linear;

  /* 细微流动形变 */
  filter: url(#lg-waves);
}

/* 彩色流动层（低强度） */
.liquid-glass::before {
  content: "";
  position: absolute;
  inset: -40%;
  background: conic-gradient(
    from 0deg,
    rgba(59,130,246,0.045),
    rgba(16,185,129,0.04),
    rgba(244,114,182,0.04),
    rgba(234,179,8,0.04),
    rgba(59,130,246,0.045)
  );
  filter: blur(30px) saturate(115%);
  animation: lg-spin 18s linear infinite;
  pointer-events: none;
}

/* 跟随鼠标的柔和高光：默认透明，悬停时通过 --hl-o 淡入 */
.lg-highlight {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: var(--hl-o, 0);
  transition: opacity 120ms ease, background-position 60ms linear;
  background:
    radial-gradient(
      300px 300px at var(--mx, 50%) var(--my, 50%),
      rgba(255,255,255,0.42),
      rgba(255,255,255,0.14) 35%,
      rgba(255,255,255,0.0) 60%
    );
  mix-blend-mode: screen;
}

/* 斜向扫光（轻微） */
.lg-gloss {
  position: absolute;
  inset: -60% -20%;
  pointer-events: none;
  background:
    linear-gradient(115deg,
      rgba(255,255,255,0.00) 35%,
      rgba(255,255,255,0.12) 50%,
      rgba(255,255,255,0.00) 65%
    );
  animation: lg-gloss-move 6s ease-in-out infinite;
  opacity: .66;
}

/* 内容层：文字可读性 */
.lg-content {
  position: relative;
  z-index: 1;
  color: var(--fg);
  text-shadow: 0 1px 1px rgba(0,0,0,0.12);
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
