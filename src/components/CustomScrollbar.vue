<template>
  <div class="custom-scrollbar-container" ref="containerRef">
    <div
      class="custom-scrollbar-content"
      ref="contentRef"
      @scroll="handleScroll"
      :style="{ height: height }"
    >
      <slot></slot>
    </div>
    
    <!-- Vertical Scrollbar -->
    <transition name="fade">
      <div
        v-if="showVerticalBar && needsVerticalScroll"
        class="custom-scrollbar-track vertical"
        @mousedown.prevent="handleTrackClick"
      >
        <div
          class="custom-scrollbar-thumb"
          :style="verticalThumbStyle"
          @mousedown.prevent="startDrag"
        ></div>
      </div>
    </transition>
    
    <!-- Horizontal Scrollbar -->
    <transition name="fade">
      <div
        v-if="showHorizontalBar && needsHorizontalScroll"
        class="custom-scrollbar-track horizontal"
        @mousedown.prevent="handleTrackClick"
      >
        <div
          class="custom-scrollbar-thumb"
          :style="horizontalThumbStyle"
          @mousedown.prevent="startDrag"
        ></div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  height?: string
  thumbColor?: string
  thumbHoverColor?: string
  autoHide?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: '100%',
  thumbColor: 'rgba(103, 80, 164, 0.5)',
  thumbHoverColor: 'rgba(103, 80, 164, 0.8)',
  autoHide: true
})

const containerRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()
const scrollTop = ref(0)
const scrollLeft = ref(0)
const scrollHeight = ref(0)
const scrollWidth = ref(0)
const clientHeight = ref(0)
const clientWidth = ref(0)
const isDragging = ref(false)
const dragStartY = ref(0)
const dragStartX = ref(0)
const dragStartScrollTop = ref(0)
const dragStartScrollLeft = ref(0)
const showVerticalBar = ref(false)
const showHorizontalBar = ref(false)
const hideTimeout = ref<number>()

const needsVerticalScroll = computed(() => scrollHeight.value > clientHeight.value)
const needsHorizontalScroll = computed(() => scrollWidth.value > clientWidth.value)

const verticalThumbHeight = computed(() => {
  if (!needsVerticalScroll.value) return 0
  const ratio = clientHeight.value / scrollHeight.value
  return Math.max(ratio * clientHeight.value, 40)
})

const verticalThumbTop = computed(() => {
  if (!needsVerticalScroll.value) return 0
  const maxScroll = scrollHeight.value - clientHeight.value
  const maxThumbTop = clientHeight.value - verticalThumbHeight.value
  return (scrollTop.value / maxScroll) * maxThumbTop
})

const horizontalThumbWidth = computed(() => {
  if (!needsHorizontalScroll.value) return 0
  const ratio = clientWidth.value / scrollWidth.value
  return Math.max(ratio * clientWidth.value, 40)
})

const horizontalThumbLeft = computed(() => {
  if (!needsHorizontalScroll.value) return 0
  const maxScroll = scrollWidth.value - clientWidth.value
  const maxThumbLeft = clientWidth.value - horizontalThumbWidth.value
  return (scrollLeft.value / maxScroll) * maxThumbLeft
})

const verticalThumbStyle = computed(() => ({
  height: `${verticalThumbHeight.value}px`,
  transform: `translateY(${verticalThumbTop.value}px)`,
  background: isDragging.value ? props.thumbHoverColor : props.thumbColor,
}))

const horizontalThumbStyle = computed(() => ({
  width: `${horizontalThumbWidth.value}px`,
  transform: `translateX(${horizontalThumbLeft.value}px)`,
  background: isDragging.value ? props.thumbHoverColor : props.thumbColor,
}))

const updateScrollInfo = () => {
  if (!contentRef.value) return
  scrollTop.value = contentRef.value.scrollTop
  scrollLeft.value = contentRef.value.scrollLeft
  scrollHeight.value = contentRef.value.scrollHeight
  scrollWidth.value = contentRef.value.scrollWidth
  clientHeight.value = contentRef.value.clientHeight
  clientWidth.value = contentRef.value.clientWidth
}

const handleScroll = () => {
  updateScrollInfo()
  showScrollbars()
}

const showScrollbars = () => {
  showVerticalBar.value = true
  showHorizontalBar.value = true
  
  if (props.autoHide) {
    clearTimeout(hideTimeout.value)
    hideTimeout.value = window.setTimeout(() => {
      if (!isDragging.value) {
        showVerticalBar.value = false
        showHorizontalBar.value = false
      }
    }, 2000)
  }
}

const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  const target = e.target as HTMLElement
  const isVertical = target.parentElement?.classList.contains('vertical')
  
  if (isVertical) {
    dragStartY.value = e.clientY
    dragStartScrollTop.value = scrollTop.value
  } else {
    dragStartX.value = e.clientX
    dragStartScrollLeft.value = scrollLeft.value
  }
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'grabbing'
}

const handleDrag = (e: MouseEvent) => {
  if (!isDragging.value || !contentRef.value) return
  
  const deltaY = e.clientY - dragStartY.value
  const deltaX = e.clientX - dragStartX.value
  
  if (Math.abs(deltaY) > 0) {
    const maxScroll = scrollHeight.value - clientHeight.value
    const maxThumbTop = clientHeight.value - verticalThumbHeight.value
    const scrollRatio = maxScroll / maxThumbTop
    contentRef.value.scrollTop = dragStartScrollTop.value + deltaY * scrollRatio
  }
  
  if (Math.abs(deltaX) > 0) {
    const maxScroll = scrollWidth.value - clientWidth.value
    const maxThumbLeft = clientWidth.value - horizontalThumbWidth.value
    const scrollRatio = maxScroll / maxThumbLeft
    contentRef.value.scrollLeft = dragStartScrollLeft.value + deltaX * scrollRatio
  }
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
  
  if (props.autoHide) {
    showScrollbars()
  }
}

const handleTrackClick = (e: MouseEvent) => {
  if (!contentRef.value) return
  const target = e.currentTarget as HTMLElement
  const isVertical = target.classList.contains('vertical')
  
  if (isVertical) {
    const rect = target.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    const thumbCenter = verticalThumbTop.value + verticalThumbHeight.value / 2
    const delta = clickY - thumbCenter
    const maxScroll = scrollHeight.value - clientHeight.value
    const maxThumbTop = clientHeight.value - verticalThumbHeight.value
    const scrollRatio = maxScroll / maxThumbTop
    contentRef.value.scrollTop += delta * scrollRatio
  } else {
    const rect = target.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const thumbCenter = horizontalThumbLeft.value + horizontalThumbWidth.value / 2
    const delta = clickX - thumbCenter
    const maxScroll = scrollWidth.value - clientWidth.value
    const maxThumbLeft = clientWidth.value - horizontalThumbWidth.value
    const scrollRatio = maxScroll / maxThumbLeft
    contentRef.value.scrollLeft += delta * scrollRatio
  }
}

const handleMouseEnter = () => {
  if (!props.autoHide) return
  showScrollbars()
}

onMounted(() => {
  // 延迟更新以确保内容已渲染
  setTimeout(() => {
    updateScrollInfo()
  }, 100)
  
  if (containerRef.value) {
    containerRef.value.addEventListener('mouseenter', handleMouseEnter)
  }
  window.addEventListener('resize', updateScrollInfo)
  
  const resizeObserver = new ResizeObserver(() => {
    // 使用 requestAnimationFrame 确保 DOM 更新完成
    requestAnimationFrame(updateScrollInfo)
  })
  if (contentRef.value) {
    resizeObserver.observe(contentRef.value)
    // 也观察内容的子元素
    const children = contentRef.value.children
    for (let i = 0; i < children.length; i++) {
      resizeObserver.observe(children[i])
    }
  }
  
  onUnmounted(() => {
    resizeObserver.disconnect()
    window.removeEventListener('resize', updateScrollInfo)
    clearTimeout(hideTimeout.value)
    if (containerRef.value) {
      containerRef.value.removeEventListener('mouseenter', handleMouseEnter)
    }
  })
})
</script>

<style scoped>
.custom-scrollbar-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.custom-scrollbar-content {
  width: 100%;
  height: 100%;
  overflow: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-right: 0;
  margin-right: 0;
  box-sizing: border-box;
}

.custom-scrollbar-content::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.custom-scrollbar-content::-webkit-scrollbar-track {
  display: none;
}

.custom-scrollbar-content::-webkit-scrollbar-thumb {
  display: none;
}

.custom-scrollbar-track {
  position: absolute;
  background: transparent;
  z-index: 1000;
  border-radius: 12px;
  transition: background 0.2s ease;
  pointer-events: auto;
}

.custom-scrollbar-track:hover {
  background: rgba(0, 0, 0, 0.03);
}

.v-theme--dark .custom-scrollbar-track:hover {
  background: rgba(255, 255, 255, 0.05);
}

.custom-scrollbar-track.vertical {
  top: 0;
  right: 2px;
  width: 8px;
  height: 100%;
}

.custom-scrollbar-track.horizontal {
  left: 0;
  bottom: 2px;
  width: 100%;
  height: 8px;
}

.custom-scrollbar-thumb {
  position: absolute;
  border-radius: 10px;
  cursor: grab;
  transition: background 0.2s ease, box-shadow 0.2s ease;
  background: linear-gradient(135deg, 
    rgba(103, 80, 164, 0.2) 0%, 
    rgba(103, 80, 164, 0.3) 100%);
}

.custom-scrollbar-thumb:hover {
  background: linear-gradient(135deg, 
    rgba(103, 80, 164, 0.35) 0%, 
    rgba(103, 80, 164, 0.5) 100%);
  box-shadow: 0 2px 6px rgba(103, 80, 164, 0.2);
}

.custom-scrollbar-thumb:active {
  cursor: grabbing;
  background: linear-gradient(135deg, 
    rgba(103, 80, 164, 0.5) 0%, 
    rgba(103, 80, 164, 0.65) 100%);
}

.v-theme--dark .custom-scrollbar-thumb {
  background: linear-gradient(135deg, 
    rgba(208, 188, 255, 0.2) 0%, 
    rgba(208, 188, 255, 0.3) 100%);
}

.v-theme--dark .custom-scrollbar-thumb:hover {
  background: linear-gradient(135deg, 
    rgba(208, 188, 255, 0.35) 0%, 
    rgba(208, 188, 255, 0.5) 100%);
  box-shadow: 0 2px 6px rgba(208, 188, 255, 0.2);
}

.v-theme--dark .custom-scrollbar-thumb:active {
  background: linear-gradient(135deg, 
    rgba(208, 188, 255, 0.5) 0%, 
    rgba(208, 188, 255, 0.65) 100%);
}

.custom-scrollbar-track.vertical .custom-scrollbar-thumb {
  width: 8px;
  left: 0;
}

.custom-scrollbar-track.horizontal .custom-scrollbar-thumb {
  height: 8px;
  top: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
