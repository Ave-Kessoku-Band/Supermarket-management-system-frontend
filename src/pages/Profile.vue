<template>
  <GlassCard>
    <h2 class="section-title">个人信息</h2>
    <div v-if="loading" class="small">加载中...</div>
    <div v-else>
      <div class="glass card" style="padding:16px;">
        <div class="small text-medium-emphasis">用户名</div>
        <div style="font-weight:600;margin-bottom:12px;">{{ me?.username }}</div>
        <div class="small text-medium-emphasis">角色</div>
        <div style="font-weight:600;margin-bottom:12px;">{{ me?.role }}</div>

        <!-- 根据后端API完善编辑表单，这里先保留展示与跳转逻辑 -->
        <div class="small text-medium-emphasis" style="margin-top:16px;">
          可在此页面实现头像/昵称/密码等信息修改（请对照后端 API 文档补充保存逻辑）。
        </div>
      </div>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import GlassCard from '@/components/GlassCard.vue'
import { onMounted, ref } from 'vue'
import { apiMe } from '@/api/endpoints'

const loading = ref(true)
const me = ref<any | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    me.value = await apiMe()
  } finally {
    loading.value = false
  }
})
</script>
