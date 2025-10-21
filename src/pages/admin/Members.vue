<template>
  <GlassCard>
    <div class="section-title">会员管理</div>

    <!-- 筛选区 -->
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
      <input
        class="input"
        placeholder="姓名/邮箱"
        v-model="search"
        @keyup.enter="reload"
        style="max-width:240px;"
      />
      <select class="input" v-model="level" style="max-width:180px;">
        <option value="">全部等级</option>
        <option value="NORMAL">NORMAL</option>
        <option value="SILVER">SILVER</option>
        <option value="GOLD">GOLD</option>
      </select>
      <button class="btn" @click="reload" :disabled="loading">查询</button>
    </div>

    <!-- 状态区 -->
    <div v-if="error" class="small" style="color:#d92d20;margin-bottom:8px;">{{ error }}</div>
    <div v-if="loading" class="small" style="margin-bottom:8px;">加载中...</div>

    <!-- 列表 -->
    <div v-if="!loading && members.length === 0" class="small">未找到会员</div>
    <div v-else>
      <div
        v-for="m in members"
        :key="m.id"
        class="glass card"
        style="margin-bottom:8px;"
      >
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:600;">
              {{ m.username }}
              <span class="small" style="margin-left:6px;">（{{ m.level }}）</span>
            </div>
            <div class="small">
              积分 {{ m.points }} · 累计消费 ¥ {{ Number(m.totalSpent ?? 0).toFixed(2) }}
            </div>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn" @click="openAdjust(m)">调整积分</button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <Pagination
        v-if="meta && meta.total_pages > 1"
        v-model:page="page"
        :total-pages="meta.total_pages || 1"
      />
    </div>
  </GlassCard>

  <!-- 调整积分弹窗 -->
  <div
    v-if="dialog"
    class="overlay"
    @click="closeDialog"
    style="position:fixed;inset:0;background:rgba(0,0,0,0.25);z-index:90;"
  >
    <div
      class="glass card"
      style="position:fixed;left:50%;top:20%;transform:translateX(-50%);min-width:340px;z-index:100;"
      @click.stop
    >
      <div class="section-title">调整积分 - {{ currentName }}</div>
      <div class="small" style="margin-bottom:8px;">正数增加，负数减少；必须为整数且非 0</div>

      <input
        class="input"
        v-model="deltaText"
        inputmode="numeric"
        placeholder="调整积分（如 50 或 -20）"
      />
      <input
        class="input"
        v-model="reason"
        placeholder="原因（必填）"
        style="margin-top:8px;"
      />

      <div v-if="dialogError" class="small" style="color:#d92d20;margin-top:6px;">
        {{ dialogError }}
      </div>

      <div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end;">
        <button class="btn" @click="closeDialog">取消</button>
        <button class="btn" @click="adjust" :disabled="adjusting">
          {{ adjusting ? '提交中...' : '确定' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import GlassCard from '@/components/GlassCard.vue'
import Pagination from '@/components/Pagination.vue'
import { ref, onMounted, watch, computed } from 'vue'
import { apiAdjustMemberPoints, apiListMembers } from '@/api/endpoints'

type Member = {
  id: string
  username: string
  level: 'NORMAL' | 'SILVER' | 'GOLD'
  points: number
  totalSpent?: number
}

type PagedMeta = { page: number; per_page: number; total: number; total_pages: number }

const search = ref('')
const level = ref<'' | 'NORMAL' | 'SILVER' | 'GOLD'>('')
const members = ref<Member[]>([])
const meta = ref<PagedMeta | null>(null)
const page = ref(1)
const per_page = ref(20)

const loading = ref(false)
const error = ref('')

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await apiListMembers({
      search: search.value || undefined,
      level: level.value || undefined,
      page: page.value,
      per_page: per_page.value,
      sort: '-createdAt'
    })
    members.value = res.data || []
    meta.value = res.meta || null
  } catch (e: any) {
    error.value = e?.response?.data?.message || '加载会员失败'
  } finally {
    loading.value = false
  }
}

const reload = () => {
  page.value = 1
  load()
}

watch(page, load)
onMounted(load)

/* 调整积分弹窗逻辑 */
const dialog = ref(false)
const current = ref<Member | null>(null)
const currentName = computed(() => current.value?.username ?? '')
const deltaText = ref('')       // 用字符串接收，便于校验整数
const reason = ref('')
const dialogError = ref('')
const adjusting = ref(false)

const openAdjust = (m: Member) => {
  current.value = m
  deltaText.value = ''
  reason.value = ''
  dialogError.value = ''
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
}

const adjust = async () => {
  dialogError.value = ''

  // 校验 delta：必须是非 0 的整数
  if (!/^-?\d+$/.test(deltaText.value.trim())) {
    dialogError.value = '积分调整必须为整数'
    return
  }
  const delta = Number(deltaText.value)
  if (delta === 0) {
    dialogError.value = '积分调整不能为 0'
    return
  }
  if (!reason.value.trim()) {
    dialogError.value = '请填写原因'
    return
  }
  if (!current.value) return

  adjusting.value = true
  try {
    await apiAdjustMemberPoints(current.value.id, { delta, reason: reason.value.trim() })
    dialog.value = false
    await load()
  } catch (e: any) {
    dialogError.value = e?.response?.data?.message || '调整失败'
  } finally {
    adjusting.value = false
  }
}
</script>

<style scoped>
/* 弹窗视觉由全局 glass 提供，这里无需额外样式 */
</style>
