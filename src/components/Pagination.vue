<template>
  <div style="display:flex;gap:8px;align-items:center;justify-content:center;margin-top:12px;">
    <button class="btn" :disabled="page <= 1" @click="$emit('update:page', page - 1)">上一页</button>
    <span class="small">第 {{ page }} / {{ totalPages }} 页</span>
    <button class="btn" :disabled="page >= totalPages" @click="$emit('update:page', page + 1)">下一页</button>
  </div>
</template>
<script setup lang="ts">
defineProps<{ page: number; totalPages: number }>()
defineEmits<{ (e: 'update:page', val: number): void }>()
</script>
