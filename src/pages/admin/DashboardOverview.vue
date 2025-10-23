<template>
  <div class="dashboard-overview">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="headline-large text-primary mb-2">仪表板</h1>
      <p class="title-medium text-medium-emphasis">超市运营数据概览</p>
    </div>

    <!-- KPI Overview -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="kpi-card" elevation="3">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="label-medium text-medium-emphasis mb-2">总销售额</div>
                <div class="headline-medium text-primary font-weight-bold">
                  ¥ {{ ov?.totalSales?.toFixed(2) ?? '-' }}
                </div>
              </div>
              <v-icon size="40" color="primary" class="opacity-70">
                mdi-currency-cny
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="kpi-card" elevation="3">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="label-medium text-medium-emphasis mb-2">订单数</div>
                <div class="headline-medium text-secondary font-weight-bold">
                  {{ ov?.orderCount ?? '-' }}
                </div>
              </div>
              <v-icon size="40" color="secondary" class="opacity-70">
                mdi-receipt-text-outline
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="kpi-card" elevation="3">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="label-medium text-medium-emphasis mb-2">会员数</div>
                <div class="headline-medium text-tertiary font-weight-bold">
                  {{ ov?.memberCount ?? '-' }}
                </div>
              </div>
              <v-icon size="40" color="tertiary" class="opacity-70">
                mdi-account-group-outline
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="kpi-card" elevation="3">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="label-medium text-medium-emphasis mb-2">商品数</div>
                <div class="headline-medium text-success font-weight-bold">
                  {{ ov?.productCount ?? '-' }}
                </div>
              </div>
              <v-icon size="40" color="success" class="opacity-70">
                mdi-package-variant-closed
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Sales Trend -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="pa-6">
        <div class="d-flex align-center justify-center">
          <span class="title-large">销售额趋势</span>
          <v-spacer></v-spacer>
          <div class="d-flex align-center ga-2">
            <v-label>时间范围</v-label>
            <v-select
              v-model="range"
              :items="tRangeOptions"
              variant="outlined"
              density="compact"
              style="width: 120px"
            ></v-select>
          </div>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-6">
        <div v-if="loadingTrend" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
          <div class="body-medium text-medium-emphasis mt-2">加载趋势数据...</div>
        </div>

        <div v-else-if="!trend || trend.points.length === 0" class="text-center py-8">
          <v-icon size="48" color="medium-emphasis">mdi-chart-line</v-icon>
          <div class="title-medium text-medium-emphasis mt-2">暂无趋势数据</div>
        </div>

        <div v-else class="trend-chart">
          <v-timeline density="compact">
            <v-timeline-item
              v-for="(point, index) in trend.points"
              :key="point.ts"
              :dot-color="getTrendDotColor(point.amount, index)"
              size="small"
            >
              <template v-slot:opposite>
                <div class="text-caption">{{ formatDate(point.ts) }}</div>
              </template>
              <div class="d-flex align-center">
                <div class="trend-bar-container">
                  <div
                    class="trend-bar"
                    :style="{ width: barWidth(point.amount), backgroundColor: getTrendBarColor(point.amount) }"
                  ></div>
                </div>
                <span class="ml-4 font-weight-bold">¥ {{ point.amount.toFixed(2) }}</span>
              </div>
            </v-timeline-item>
          </v-timeline>
        </div>
      </v-card-text>
    </v-card>

    <!-- Top Products -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="pa-6">
        <span class="title-large">
          热销商品（{{ range === '7d' ? '7天' : '30天' }}）
        </span>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-6">
        <div v-if="loadingTop" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
          <div class="body-medium text-medium-emphasis mt-2">加载中...</div>
        </div>

        <div v-else-if="top.length === 0" class="text-center py-8">
          <v-icon size="48" color="medium-emphasis">mdi-trophy-outline</v-icon>
          <div class="title-medium text-medium-emphasis mt-2">暂无数据</div>
        </div>

        <v-list v-else>
          <v-list-item
            v-for="(product, index) in top"
            :key="product.product.id"
            class="top-product-item"
          >
            <template v-slot:prepend>
              <div class="rank-badge" :class="getRankBadgeClass(index)">
                #{{ index + 1 }}
              </div>
            </template>

            <v-list-item-title class="title-medium">
              {{ product.product.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ product.product.category }} · ¥{{ Number(product.product.price).toFixed(2) }}
            </v-list-item-subtitle>

            <template v-slot:append>
              <div class="text-right">
                <div class="body-medium font-weight-bold">
                  销量: {{ product.quantity }}
                </div>
                <div class="body-small text-medium-emphasis">
                  销售额: ¥ {{ Number(product.sales).toFixed(2) }}
                </div>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
      text
    >
      {{ error }}
    </v-alert>
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

// Time range options for select
const tRangeOptions = [
  { title: '近 7 天', value: '7d' },
  { title: '近 30 天', value: '30d' }
]

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

// Material Design 3 color helpers
const getTrendDotColor = (amount: number, index: number) => {
  if (index === trend.value.points.length - 1) return 'primary'
  if (amount > maxAmount.value * 0.7) return 'success'
  if (amount > maxAmount.value * 0.3) return 'warning'
  return 'grey'
}

const getTrendBarColor = (amount: number) => {
  if (amount > maxAmount.value * 0.7) return '#4ade80'
  if (amount > maxAmount.value * 0.3) return '#facc15'
  return '#94a3b8'
}

const getRankBadgeClass = (index: number) => {
  if (index === 0) return 'rank-badge--gold'
  if (index === 1) return 'rank-badge--silver'
  if (index === 2) return 'rank-badge--bronze'
  return 'rank-badge--default'
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
.dashboard-overview {
  max-width: 1400px;
  margin: 0 auto;
}

/* KPI Cards Styling */
.kpi-card {
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  overflow: hidden;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* Trend Chart Styling */
.trend-chart {
  max-height: 400px;
  overflow-y: auto;
}

.trend-bar-container {
  width: 200px;
  height: 8px;
  background: rgba(var(--v-theme-surface-variant), 0.2);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.trend-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease-in-out;
  background: linear-gradient(90deg, var(--v-theme-primary), var(--v-theme-secondary));
}

/* Top Products Ranking */
.rank-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.3s ease;
}

.rank-badge--gold {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #854d0e;
  border: 2px solid #fbbf24;
}

.rank-badge--silver {
  background: linear-gradient(135deg, #c0c0c0, #e5e5e5);
  color: #374151;
  border: 2px solid #d1d5db;
}

.rank-badge--bronze {
  background: linear-gradient(135deg, #cd7f32, #d97706);
  color: white;
  border: 2px solid #f59e0b;
}

.rank-badge--default {
  background: var(--v-theme-surface-variant);
  color: var(--v-theme-on-surface-variant);
  border: 2px solid var(--v-theme-outline);
}

.top-product-item {
  transition: all 0.2s ease;
}

.top-product-item:hover {
  background: rgba(var(--v-theme-primary), 0.04);
}

/* Loading and empty states */
.text-center {
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .trend-bar-container {
    width: 150px;
  }
}

@media (max-width: 600px) {
  .dashboard-overview {
    padding: 16px;
  }

  .headline-large {
    font-size: 28px;
  }

  .title-large {
    font-size: 20px;
  }

  .rank-badge {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
}

/* Material Design 3 elevation animations */
.v-card {
  transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
}

/* Custom scrollbar for trend chart */
.trend-chart::-webkit-scrollbar {
  width: 6px;
}

.trend-chart::-webkit-scrollbar-track {
  background: var(--v-theme-surface-variant);
  border-radius: 3px;
}

.trend-chart::-webkit-scrollbar-thumb {
  background: var(--v-theme-outline);
  border-radius: 3px;
}

.trend-chart::-webkit-scrollbar-thumb:hover {
  background: var(--v-theme-on-surface-variant);
}
</style>
