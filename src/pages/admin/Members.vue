<template>
  <div class="members-page">
    <v-container fluid>
      <!-- Header -->
      <div class="page-header mb-6">
        <h1 class="headline-large">会员管理</h1>
        <p class="body-medium text-medium-emphasis">管理会员信息和积分</p>
      </div>

      <!-- Filters -->
      <v-card class="elevation-1 mb-4">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="search"
                label="搜索会员"
                placeholder="姓名/邮箱"
                variant="outlined"
                prepend-inner-icon="mdi-magnify"
                clearable
                @keyup.enter="reload"
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="4">
              <v-select
                v-model="level"
                label="会员等级"
                :items="levelOptions"
                variant="outlined"
                prepend-inner-icon="mdi-medal"
                clearable
              ></v-select>
            </v-col>
            
            <v-col cols="12" md="4" class="d-flex align-end">
              <v-btn
                color="primary"
                variant="elevated"
                @click="reload"
                :loading="loading"
                block
              >
                <v-icon start>mdi-magnify</v-icon>
                查询
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Error Alert -->
      <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
        {{ error }}
      </v-alert>

      <!-- Loading State -->
      <v-card v-if="loading" class="elevation-1 pa-8 text-center">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <p class="body-medium text-medium-emphasis mt-4">加载中...</p>
      </v-card>

      <!-- Empty State -->
      <v-card v-else-if="members.length === 0" class="elevation-1 pa-8 text-center">
        <v-icon size="64" color="medium-emphasis" class="mb-4">mdi-account-group-outline</v-icon>
        <h3 class="title-large mb-2">未找到会员</h3>
        <p class="body-medium text-medium-emphasis">尝试调整搜索条件</p>
      </v-card>

      <!-- Members List -->
      <div v-else>
        <v-card
          v-for="member in members"
          :key="member.id"
          class="elevation-1 mb-3 member-card"
        >
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" md="6">
                <div class="d-flex align-center">
                  <v-avatar color="primary" size="56" class="mr-4">
                    <v-icon size="32">mdi-account</v-icon>
                  </v-avatar>
                  <div>
                    <div class="title-medium mb-1">
                      {{ member.username }}
                      <v-chip :color="getLevelColor(member.level)" size="small" class="ml-2">
                        {{ getLevelText(member.level) }}
                      </v-chip>
                    </div>
                    <div class="body-small text-medium-emphasis">
                      <v-icon size="small" class="mr-1">mdi-star</v-icon>
                      积分：{{ member.points }}
                      <span class="mx-2">·</span>
                      <v-icon size="small" class="mr-1">mdi-currency-cny</v-icon>
                      累计消费：¥{{ Number(member.totalSpent ?? 0).toFixed(2) }}
                    </div>
                  </div>
                </div>
              </v-col>
              
              <v-col cols="12" md="6" class="text-md-right">
                <v-btn
                  color="primary"
                  variant="elevated"
                  @click="openAdjust(member)"
                >
                  <v-icon start>mdi-pencil</v-icon>
                  调整积分
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Pagination -->
        <div v-if="meta && meta.total_pages > 1" class="d-flex justify-center mt-6">
          <Pagination
            v-model:page="page"
            :total-pages="meta.total_pages || 1"
          />
        </div>
      </div>
    </v-container>

    <!-- Adjust Points Dialog -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-pencil</v-icon>
          调整积分 - {{ currentName }}
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-divider></v-divider>
        
        <v-card-text>
          <v-alert type="info" variant="tonal" class="mb-4">
            正数增加，负数减少；必须为整数且非 0
          </v-alert>
          
          <v-text-field
            v-model="deltaText"
            label="调整积分"
            placeholder="如 50 或 -20"
            variant="outlined"
            type="number"
            prepend-inner-icon="mdi-plus-minus"
            class="mb-4"
          ></v-text-field>
          
          <v-text-field
            v-model="reason"
            label="原因"
            placeholder="请填写调整原因（必填）"
            variant="outlined"
            prepend-inner-icon="mdi-text"
          ></v-text-field>
          
          <v-alert v-if="dialogError" type="error" variant="tonal" class="mt-4">
            {{ dialogError }}
          </v-alert>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeDialog">取消</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="adjust"
            :loading="adjusting"
          >
            确定
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import Pagination from '@/components/Pagination.vue'
import { ref, onMounted, watch, computed } from 'vue'
import { apiAdjustMemberPoints, apiListMembers } from '@/api/endpoints'
import { useUiStore } from '@/store/ui'

const ui = useUiStore()

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

const levelOptions = [
  { title: '全部等级', value: '' },
  { title: '普通会员', value: 'NORMAL' },
  { title: '银卡会员', value: 'SILVER' },
  { title: '金卡会员', value: 'GOLD' }
]

const getLevelColor = (level: string) => {
  const colors: Record<string, string> = {
    'NORMAL': 'grey',
    'SILVER': 'blue-grey',
    'GOLD': 'amber'
  }
  return colors[level] || 'grey'
}

const getLevelText = (level: string) => {
  const texts: Record<string, string> = {
    'NORMAL': '普通',
    'SILVER': '银卡',
    'GOLD': '金卡'
  }
  return texts[level] || level
}

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
const deltaText = ref('')
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
    ui.showToast('积分调整成功', 'success')
    await load()
  } catch (e: any) {
    dialogError.value = e?.response?.data?.message || '调整失败'
  } finally {
    adjusting.value = false
  }
}
</script>

<style scoped>
.members-page {
  padding: 24px 0;
}

.page-header {
  text-align: center;
}

.member-card {
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.member-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.v-card {
  border-radius: 16px;
}
</style>
