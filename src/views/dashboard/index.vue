<template>
  <div class="dashboard">
    <!-- 统计数据卡片 - 紧凑一行 -->
    <div class="stat-grid">
      <div class="stat-card">
        <span class="stat-label">用户总数</span>
        <div class="stat-row">
          <h2 class="stat-value">{{ dashboardData.totalUsers || 0 }}</h2>
          <span class="stat-sub" v-if="dashboardData.todayNewUsers">+{{ dashboardData.todayNewUsers }}</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-label">活动总数</span>
        <div class="stat-row">
          <h2 class="stat-value accent-green">{{ dashboardData.totalActivities || 0 }}</h2>
          <span class="stat-sub" v-if="dashboardData.todayNewActivities">+{{ dashboardData.todayNewActivities }}</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-label">动态总数</span>
        <div class="stat-row">
          <h2 class="stat-value accent-amber">{{ dashboardData.totalMoments || 0 }}</h2>
          <span class="stat-sub" v-if="dashboardData.todayNewMoments">+{{ dashboardData.todayNewMoments }}</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-label">招募中</span>
        <h2 class="stat-value">{{ dashboardData.recruitingActivities || 0 }}</h2>
      </div>
      <div class="stat-card">
        <span class="stat-label">封禁用户</span>
        <h2 class="stat-value accent-red">{{ dashboardData.bannedUsers || 0 }}</h2>
      </div>
    </div>

    <!-- 图表 + 快捷操作 -->
    <el-row :gutter="16">
      <el-col :xs="24" :lg="10">
        <div class="page-card">
          <h3 class="card-title">数据概览</h3>
          <div ref="overviewChartRef" class="chart-container"></div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="8">
        <div class="page-card">
          <h3 class="card-title">活动状态分布</h3>
          <div ref="pieChartRef" class="chart-container"></div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="6">
        <div class="page-card quick-panel">
          <h3 class="card-title">快捷操作</h3>
          <div class="quick-list">
            <div class="quick-item" @click="$router.push('/users')">
              <PhUsers :size="18" weight="duotone" />
              <span>用户管理</span>
              <PhCaretRight :size="14" />
            </div>
            <div class="quick-item" @click="$router.push('/activities')">
              <PhFlag :size="18" weight="duotone" />
              <span>活动管理</span>
              <PhCaretRight :size="14" />
            </div>
            <div class="quick-item" @click="$router.push('/moments')">
              <PhChatDots :size="18" weight="duotone" />
              <span>动态管理</span>
              <PhCaretRight :size="14" />
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getDashboard } from '@/api/dashboard'
import type { DashboardData } from '@/types/api'
import * as echarts from 'echarts'
import { PhUsers, PhFlag, PhChatDots, PhCaretRight } from '@phosphor-icons/vue'

// 仪表盘原始数据
const dashboardData = ref<DashboardData>({} as DashboardData)

// 图表 DOM 引用
const overviewChartRef = ref<HTMLDivElement | null>(null)
const pieChartRef = ref<HTMLDivElement | null>(null)
let overviewChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

// 获取仪表盘数据
async function fetchDashboard(): Promise<void> {
  try {
    const res = await getDashboard()
    dashboardData.value = res.data
    initCharts()
  } catch (err) { /* 错误已在拦截器中处理 */ }
}

// 初始化图表
function initCharts(): void {
  if (overviewChartRef.value) {
    overviewChart = echarts.init(overviewChartRef.value)
    const d = dashboardData.value
    overviewChart.setOption({
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.75)', textStyle: { color: '#fff', fontSize: 12 } },
      legend: { data: ['总数', '今日新增'], bottom: 0, textStyle: { fontSize: 11 } },
      grid: { left: '3%', right: '4%', bottom: '14%', top: '6%', containLabel: true },
      xAxis: {
        type: 'category', data: ['用户', '活动', '动态'],
        axisLine: { lineStyle: { color: '#eaecf0' } }, axisLabel: { color: '#667085', fontSize: 11 }
      },
      yAxis: {
        type: 'value', axisLine: { show: false },
        splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }, axisLabel: { color: '#98a2b3', fontSize: 11 }
      },
      series: [
        {
          name: '总数', type: 'bar', barWidth: '28%',
          data: [
            { value: d.totalUsers || 0, itemStyle: { color: '#4361ee', borderRadius: [4, 4, 0, 0] } },
            { value: d.totalActivities || 0, itemStyle: { color: '#2ec4b6', borderRadius: [4, 4, 0, 0] } },
            { value: d.totalMoments || 0, itemStyle: { color: '#f4a261', borderRadius: [4, 4, 0, 0] } }
          ]
        },
        {
          name: '今日新增', type: 'bar', barWidth: '28%',
          data: [
            { value: d.todayNewUsers || 0, itemStyle: { color: '#a5b4fc', borderRadius: [4, 4, 0, 0] } },
            { value: d.todayNewActivities || 0, itemStyle: { color: '#99e2db', borderRadius: [4, 4, 0, 0] } },
            { value: d.todayNewMoments || 0, itemStyle: { color: '#fcd5b0', borderRadius: [4, 4, 0, 0] } }
          ]
        }
      ]
    })
  }

  if (pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value)
    const d = dashboardData.value
    const recruiting = d.recruitingActivities || 0
    const other = (d.totalActivities || 0) - recruiting
    pieChart.setOption({
      tooltip: { trigger: 'item', backgroundColor: 'rgba(0,0,0,0.75)', textStyle: { color: '#fff', fontSize: 12 } },
      legend: { bottom: '2%', textStyle: { color: '#667085', fontSize: 11 } },
      series: [{
        type: 'pie', radius: ['42%', '68%'], avoidLabelOverlap: false,
        center: ['50%', '45%'],
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 15, fontWeight: 'bold' } },
        data: [
          { value: recruiting, name: '招募中', itemStyle: { color: '#2ec4b6' } },
          { value: other, name: '其他状态', itemStyle: { color: '#d0d5dd' } }
        ]
      }]
    })
  }
}

function handleResize(): void {
  overviewChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  fetchDashboard()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  overviewChart?.dispose()
  pieChart?.dispose()
})
</script>

<style lang="scss" scoped>
/* 统计卡片 - 一行五个 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: 14px 16px;
  transition: box-shadow 0.2s, border-color 0.2s;

  &:hover {
    box-shadow: var(--shadow-md);
    border-color: transparent;
  }
}

.stat-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.stat-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 2px;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text);
  margin: 2px 0 0;
  line-height: 1.2;
}

.stat-sub {
  font-size: 11px;
  color: var(--color-success);
  font-weight: 600;
}

.accent-green { color: var(--color-success) !important; }
.accent-amber { color: var(--color-warning) !important; }
.accent-red { color: var(--color-danger) !important; }

/* 图表 + 快捷操作同一行 */
.chart-container { height: 240px; }

.card-title {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 12px;
}

/* 快捷操作面板 */
.quick-panel {
  height: 100%;
  display: flex;
  flex-direction: column;

  .card-title { margin-bottom: 16px; }
}

.quick-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.quick-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-text-secondary);

  span {
    flex: 1;
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text);
  }

  &:hover {
    background: var(--color-primary-pale);
    color: var(--color-primary);

    span { color: var(--color-primary); }
  }
}

@media (max-width: 768px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
