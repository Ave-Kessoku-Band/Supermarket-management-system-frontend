<template>
  <div>
    <!-- KPI 概览 -->
    <div class="grid grid-cols-4">
      <div class="glass card kpi">
        <div class="small">总销售额</div>
        <div class="kpi-num">¥ {{ ov?.totalSales?.toFixed(2) ?? '-' }}</div>
      </div>
      <div class="glass card kpi">
        <div class="small">订单数</div>
        <div class="kpi-num">{{ ov?.orderCount ?? '-' }}</div>
      </div>
      <div class="glass card kpi">
        <div class="small">会员数</div>
        <div class="kpi-num">{{ ov?.memberCount ?? '-' }}</div>
      </div>
      <div class="glass card kpi">
        <div class="small">商品数</div>
        <div class="kpi-num">{{ ov?.productCount ?? '-' }}</div>
      </div>
    </div>

    <!-- 销售趋势 -->
    <div class="glass card" style="margin-top:16px;">
      <div class="section-title" style="display:flex;align-items:center;justify-content:space-between;">
        <span>销售额趋势</span>
        <div style="display:flex;gap:8px;align-items:center;">
          <label class="small">范围</label>
          <select class="input" v-model="range" style="width:120px;">
            <option value="7d">近 7 天</option>
            <option value="30d">近 30 天</option>
          </select>
        </div>
      </div>

      <div v-if="loadingTrend" class="small">加载趋势数据...</div>
      <div v-else-if="!trend || trend.points.length === 0" class="small">暂无趋势数据</div>
      <div v-else class="trend-wrap">
        <div v-for="p in trend.points" :key="p.ts" class="trend-row">
          <div class="trend-label small">{{ formatDate(p.ts) }}</div>
          <div class="trend-bar-outer">
            <div class="trend-bar-inner" :style="{ width: barWidth(p.amount), }"></div>
          </div>
          <div class="trend-amount small">¥ {{ p.amount.toFixed(2) }}</div>
        </div>
      </div>
    </div>

    <!-- 热销商品 -->
    <div class="glass card" style="margin-top:16px;">
      <div class="section-title">热销商品（{{ range === '7d' ? '7天' : '30天' }}）</div>
      <div v-if="loadingTop" class="small">加载中...</div>
      <div v-else-if="top.length === 0" class="small">暂无数据</div>
      <div v-else class="top-list">
        <div v-for="(t,idx) in top" :key="t.product.id" class="top-item">
          <div class="top-left">
            <div class="rank">#{{ idx + 1 }}</div>
            <div class="name">{{ t.product.name }}</div>
            <div class="muted small">{{ t.product.category }} · ¥{{ Number(t.product.price).toFixed(2) }}</div>
          </div>
          <div class="top-right small">
            <div>销量：<b>{{ t.quantity }}</b></div>
            <div>销售额：<b>¥ {{ Number(t.sales).toFixed(2) }}</b></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="glass card" style="margin-top:16px;color:#ff9b9b;">
      <div class="small">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { apiDashboardOverview, apiSalesTrend, apiTopProducts } from '@/api/endpoints'

type TrendPoint = { ts: string; amount: number }
type Trend = { points: TrendPoint[] }

const ov = ref<any>({})
const trend = ref<Trend | null>(null)
const top = ref<any[]>([])

const range = ref<'7d' | '30d'>('7d')

const loadingTrend = ref(false)
const loadingTop = ref(false)
const error = ref<string>('')

const maxAmount = computed(() => {
  if (!trend.value) return 0
  return Math.max(0, ...trend.value.points.map(p => p.amount))
})

const barWidth = (val: number) => {
  const max = maxAmount.value || 1
  const pct = Math.min(100, Math.max(0, (val / max) * 100))
  return `${pct}%`
}

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso)
    return `${d.getMonth() + 1}-${d.getDate()}`
  } catch {
    return iso
  }
}

const loadOverview = async () => {
  try {
    ov.value = await apiDashboardOverview()
  } catch (e: any) {
    error.value = e?.response?.data?.message || '加载总览失败'
  }
}

const loadTrend = async () => {
  loadingTrend.value = true
  try {
    const data = await apiSalesTrend({ range: range.value })
    // 保障数据有序显示
    const points = (data?.points ?? []).slice().sort((a: TrendPoint, b: TrendPoint) => +new Date(a.ts) - +new Date(b.ts))
    trend.value = { points }
  } catch (e: any) {
    error.value = e?.response?.data?.message || '加载趋势失败'
  } finally {
    loadingTrend.value = false
  }
}

const loadTop = async () => {
  loadingTop.value = true
  try {
    top.value = await apiTopProducts({ range: range.value, limit: 10 })
  } catch (e: any) {
    error.value = e?.response?.data?.message || '加载热销榜失败'
  } finally {
    loadingTop.value = false
  }
}

watch(range, () => {
  loadTrend()
  loadTop()
})

onMounted(async () => {
  await Promise.all([loadOverview(), loadTrend(), loadTop()])
})
</script>

<style scoped>
.kpi {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 92px;
  justify-content: center;
}
.kpi-num {
  font-size: 22px;
  font-weight: 700;
}

.trend-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.trend-row {
  display: grid;
  grid-template-columns: 64px 1fr 96px;
  gap: 8px;
  align-items: center;
}
.trend-label { text-align: right; color: var(--muted); }
.trend-bar-outer {
  height: 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18);
  overflow: hidden;
}
.trend-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, rgba(122,162,255,0.9), rgba(122,255,220,0.9));
}
.trend-amount { text-align: left; }

.top-list { display: flex; flex-direction: column; gap: 8px; }
.top-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
}
.top-left { display: grid; grid-template-columns: 48px auto; gap: 6px; align-items: center; }
.rank {
  width: 36px; height: 36px;
  display:flex; align-items:center; justify-content:center;
  border-radius: 50%;
  background: rgba(122,162,255,0.15);
  border: 1px solid rgba(255,255,255,0.2);
  font-weight: 700;
}
.name { font-weight: 600; }
.muted { color: var(--muted); }
.top-right { text-align: right; display:flex; flex-direction:column; gap:2px; }
</style>
