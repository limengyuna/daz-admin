<template>
  <div class="dashboard">
    <!-- ========== 欢迎横幅 ========== -->
    <div class="hero-banner">
      <!-- 装饰性光斑 -->
      <div class="hero-orb hero-orb--blue"></div>
      <div class="hero-orb hero-orb--purple"></div>
      <div class="hero-content">
        <p class="hero-greeting">仪表盘概览</p>
        <h1 class="hero-title">找搭子 · 数据中心</h1>
        <p class="hero-desc">实时掌握平台运营核心指标</p>
      </div>
      <!-- 横幅右侧：今日摘要 -->
      <div class="hero-summary">
        <div class="hero-summary-item">
          <span class="hero-summary-num">{{ dashboardData.todayNewUsers || 0 }}</span>
          <span class="hero-summary-label">今日新增用户</span>
        </div>
        <div class="hero-summary-divider"></div>
        <div class="hero-summary-item">
          <span class="hero-summary-num">{{ dashboardData.todayNewActivities || 0 }}</span>
          <span class="hero-summary-label">今日新增活动</span>
        </div>
        <div class="hero-summary-divider"></div>
        <div class="hero-summary-item">
          <span class="hero-summary-num">{{ dashboardData.todayNewMoments || 0 }}</span>
          <span class="hero-summary-label">今日新增动态</span>
        </div>
      </div>
    </div>

    <!-- ========== 统计数据卡片 ========== -->
    <div class="stat-grid">
      <!-- 前三个：纵向大卡片，数字突出 -->
      <div class="stat-card stat-card--featured stat-card--blue" style="--delay: 0">
        <div class="stat-top">
          <span class="stat-label">用户总数</span>
          <svg class="stat-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h2 class="stat-value stat-value--lg">{{ animatedUsers }}</h2>
        <span class="stat-badge" v-if="dashboardData.todayNewUsers">+{{ dashboardData.todayNewUsers }} 今日</span>
      </div>

      <div class="stat-card stat-card--featured stat-card--green" style="--delay: 1">
        <div class="stat-top">
          <span class="stat-label">活动总数</span>
          <svg class="stat-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>
          </svg>
        </div>
        <h2 class="stat-value stat-value--lg">{{ animatedActivities }}</h2>
        <span class="stat-badge" v-if="dashboardData.todayNewActivities">+{{ dashboardData.todayNewActivities }} 今日</span>
      </div>

      <div class="stat-card stat-card--featured stat-card--amber" style="--delay: 2">
        <div class="stat-top">
          <span class="stat-label">动态总数</span>
          <svg class="stat-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>
          </svg>
        </div>
        <h2 class="stat-value stat-value--lg">{{ animatedMoments }}</h2>
        <span class="stat-badge" v-if="dashboardData.todayNewMoments">+{{ dashboardData.todayNewMoments }} 今日</span>
      </div>

      <!-- 后两个：横向紧凑小卡片，打破对称 -->
      <div class="stat-card stat-card--compact stat-card--cyan" style="--delay: 3">
        <svg class="stat-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <div class="stat-compact-body">
          <span class="stat-label">招募中</span>
          <h2 class="stat-value">{{ dashboardData.recruitingActivities || 0 }}</h2>
        </div>
      </div>

      <div class="stat-card stat-card--compact stat-card--rose" style="--delay: 4">
        <svg class="stat-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <div class="stat-compact-body">
          <span class="stat-label">封禁用户</span>
          <h2 class="stat-value">{{ dashboardData.bannedUsers || 0 }}</h2>
        </div>
      </div>
    </div>

    <!-- ========== 图表 + 快捷操作 ========== -->
    <div class="charts-row">
      <div class="chart-card chart-card--main">
        <div class="chart-header">
          <h3 class="chart-title">数据概览</h3>
          <span class="chart-subtitle">总数 vs 今日新增</span>
        </div>
        <div ref="overviewChartRef" class="chart-container"></div>
      </div>

      <div class="chart-card chart-card--pie">
        <div class="chart-header">
          <h3 class="chart-title">活动状态</h3>
          <span class="chart-subtitle">招募中 / 其他</span>
        </div>
        <div ref="pieChartRef" class="chart-container"></div>
      </div>

      <div class="chart-card chart-card--quick">
        <div class="chart-header">
          <h3 class="chart-title">快捷入口</h3>
        </div>
        <div class="quick-list">
          <div class="quick-item" @click="$router.push('/users')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
            <span>用户管理</span>
            <svg class="quick-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>
          <div class="quick-item" @click="$router.push('/activities')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>
            </svg>
            <span>活动管理</span>
            <svg class="quick-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>
          <div class="quick-item" @click="$router.push('/moments')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>
            </svg>
            <span>动态管理</span>
            <svg class="quick-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getDashboard } from '@/api/dashboard'
import type { DashboardData } from '@/types/api'
import * as echarts from 'echarts'

// 仪表盘原始数据
const dashboardData = ref<DashboardData>({} as DashboardData)

// 数字滚动动画值
const animatedUsers = ref(0)
const animatedActivities = ref(0)
const animatedMoments = ref(0)

// 图表 DOM 引用
const overviewChartRef = ref<HTMLDivElement | null>(null)
const pieChartRef = ref<HTMLDivElement | null>(null)
let overviewChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

/** 数字滚动动画工具函数 */
function animateCounter(target: { value: number }, endVal: number, duration = 1200): void {
  const startTime = performance.now()
  const step = (now: number) => {
    const progress = Math.min((now - startTime) / duration, 1)
    // 缓出效果
    const eased = 1 - Math.pow(1 - progress, 3)
    target.value = Math.round(eased * endVal)
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

// 获取仪表盘数据
async function fetchDashboard(): Promise<void> {
  try {
    const res = await getDashboard()
    dashboardData.value = res.data
    // 触发数字滚动动画
    animateCounter(animatedUsers, res.data.totalUsers || 0)
    animateCounter(animatedActivities, res.data.totalActivities || 0, 1400)
    animateCounter(animatedMoments, res.data.totalMoments || 0, 1600)
    initCharts()
  } catch (err) { /* 错误已在拦截器中处理 */ }
}

// 初始化图表（深色主题）
function initCharts(): void {
  if (overviewChartRef.value) {
    overviewChart = echarts.init(overviewChartRef.value)
    const d = dashboardData.value
    overviewChart.setOption({
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(255,255,255,0.08)',
        textStyle: { color: '#e2e8f0', fontSize: 12 }
      },
      legend: {
        data: ['总数', '今日新增'], bottom: 0,
        textStyle: { color: '#94a3b8', fontSize: 11 }
      },
      grid: { left: '3%', right: '4%', bottom: '14%', top: '8%', containLabel: true },
      xAxis: {
        type: 'category', data: ['用户', '活动', '动态'],
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
        axisLabel: { color: '#94a3b8', fontSize: 11 }
      },
      yAxis: {
        type: 'value', axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
        axisLabel: { color: '#64748b', fontSize: 11 }
      },
      animationEasing: 'cubicOut',
      series: [
        {
          name: '总数', type: 'bar', barWidth: '28%',
          data: [
            { value: d.totalUsers || 0, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#60a5fa' }, { offset: 1, color: '#3b82f6' }]), borderRadius: [6, 6, 0, 0] } },
            { value: d.totalActivities || 0, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#34d399' }, { offset: 1, color: '#10b981' }]), borderRadius: [6, 6, 0, 0] } },
            { value: d.totalMoments || 0, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#fbbf24' }, { offset: 1, color: '#f59e0b' }]), borderRadius: [6, 6, 0, 0] } }
          ]
        },
        {
          name: '今日新增', type: 'bar', barWidth: '28%',
          data: [
            { value: d.todayNewUsers || 0, itemStyle: { color: 'rgba(96, 165, 250, 0.35)', borderRadius: [6, 6, 0, 0] } },
            { value: d.todayNewActivities || 0, itemStyle: { color: 'rgba(52, 211, 153, 0.35)', borderRadius: [6, 6, 0, 0] } },
            { value: d.todayNewMoments || 0, itemStyle: { color: 'rgba(251, 191, 36, 0.35)', borderRadius: [6, 6, 0, 0] } }
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
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(255,255,255,0.08)',
        textStyle: { color: '#e2e8f0', fontSize: 12 }
      },
      legend: { bottom: '2%', textStyle: { color: '#94a3b8', fontSize: 11 } },
      animationEasing: 'cubicOut',
      series: [{
        type: 'pie', radius: ['44%', '70%'], avoidLabelOverlap: false,
        center: ['50%', '44%'],
        itemStyle: { borderRadius: 8, borderColor: 'rgba(15, 23, 41, 0.8)', borderWidth: 3 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 16, fontWeight: '600', color: '#e2e8f0' } },
        data: [
          { value: recruiting, name: '招募中', itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [{ offset: 0, color: '#34d399' }, { offset: 1, color: '#10b981' }]) } },
          { value: other, name: '其他状态', itemStyle: { color: 'rgba(100, 116, 139, 0.4)' } }
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
/* ========== 仪表盘 - 深色科技风 ========== */
.dashboard {
  margin: -18px -20px;
  padding: 24px;
  min-height: calc(100vh - 60px);
  background: var(--dash-bg);
  /* 微妙的网格纹理 */
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 48px 48px;
}

/* ===== Hero Banner ===== */
.hero-banner {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-xl);
  padding: 36px 40px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #1a2744 0%, #1e3a5f 40%, #2a4480 100%);
  border: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 装饰光斑 */
.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  animation: orbFloat 8s ease-in-out infinite alternate;

  &--blue {
    width: 260px; height: 260px;
    background: rgba(59, 130, 246, 0.2);
    top: -80px; left: -40px;
  }
  &--purple {
    width: 200px; height: 200px;
    background: rgba(139, 92, 246, 0.15);
    bottom: -60px; right: 10%;
    animation-delay: -4s;
  }
}

@keyframes orbFloat {
  0%   { transform: translate(0, 0) scale(1); }
  100% { transform: translate(20px, -15px) scale(1.1); }
}

.hero-content { position: relative; z-index: 1; }

.hero-greeting {
  font-family: var(--font-display-num);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #60a5fa;
  margin-bottom: 6px;
}
.hero-title {
  font-family: var(--font-display-num);
  font-size: 28px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.5px;
  line-height: 1.2;
}
.hero-desc {
  font-size: 13px;
  color: #64748b;
  margin-top: 6px;
}

/* Hero 右侧今日摘要 */
.hero-summary {
  position: relative; z-index: 1;
  display: flex;
  align-items: center;
  gap: 24px;
}
.hero-summary-item { text-align: center; }
.hero-summary-num {
  display: block;
  font-family: var(--font-display-num);
  font-size: 32px;
  font-weight: 700;
  color: #f1f5f9;
  text-shadow: 0 0 20px rgba(96, 165, 250, 0.4);
  line-height: 1.1;
}
.hero-summary-label {
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
  display: block;
}
.hero-summary-divider {
  width: 1px;
  height: 40px;
  background: rgba(255,255,255,0.08);
}

/* ===== 统计卡片 ===== */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr) repeat(2, 0.8fr);
  gap: 14px;
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  background: var(--dash-surface);
  backdrop-filter: blur(12px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--dash-border);
  transition: transform 0.25s, border-color 0.3s, box-shadow 0.3s;
  /* 交错入场 */
  animation: cardSlideUp 0.5s ease both;
  animation-delay: calc(var(--delay, 0) * 0.08s);

  &:hover {
    transform: translateY(-3px);
    border-color: rgba(255,255,255,0.12);
  }

  /* 每种卡片的发光色 */
  &--blue:hover  { box-shadow: 0 8px 30px rgba(59, 130, 246, 0.15); }
  &--green:hover { box-shadow: 0 8px 30px rgba(52, 211, 153, 0.15); }
  &--amber:hover { box-shadow: 0 8px 30px rgba(251, 191, 36, 0.15); }
  &--cyan:hover  { box-shadow: 0 8px 30px rgba(34, 211, 238, 0.15); }
  &--rose:hover  { box-shadow: 0 8px 30px rgba(251, 113, 133, 0.15); }
}

/* 前三个卡片 - 纵向布局，数字突出 */
.stat-card--featured {
  padding: 20px 22px 18px;
}

/* 后两个卡片 - 横向紧凑 */
.stat-card--compact {
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-compact-body { flex: 1; min-width: 0; }

@keyframes cardSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* SVG 图标 - 直接着色，无背景容器 */
.stat-svg {
  flex-shrink: 0;
  opacity: 0.7;
  .stat-card--blue &  { color: #60a5fa; }
  .stat-card--green & { color: #34d399; }
  .stat-card--amber & { color: #fbbf24; }
  .stat-card--cyan &  { color: #22d3ee; }
  .stat-card--rose &  { color: #fb7185; }
}

/* 标签与图标同行 */
.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--dash-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.stat-value {
  font-family: var(--font-display-num);
  font-size: 22px;
  font-weight: 700;
  color: var(--dash-text);
  margin: 0;
  line-height: 1.2;
}
.stat-value--lg {
  font-size: 32px;
  letter-spacing: -1px;
}
.stat-badge {
  font-size: 11px;
  font-weight: 600;
  color: #34d399;
  margin-top: 8px;
  display: inline-block;
}

/* ===== 图表 + 快捷操作行 ===== */
.charts-row {
  display: grid;
  grid-template-columns: 5fr 3.5fr 3fr;
  gap: 14px;
}

.chart-card {
  background: var(--dash-surface);
  backdrop-filter: blur(12px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--dash-border);
  padding: 22px 24px;
  animation: cardSlideUp 0.5s ease both;
  animation-delay: 0.35s;
}

.chart-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 14px;
}

.chart-title {
  font-family: var(--font-display-num);
  font-size: 14px;
  font-weight: 600;
  color: var(--dash-text);
}
.chart-subtitle {
  font-size: 11px;
  color: var(--dash-text-muted);
}

.chart-container { height: 250px; }

/* ===== 快捷入口 ===== */
.quick-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.quick-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-radius: var(--radius-md);
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.04);
  cursor: pointer;
  transition: all 0.25s;
  color: var(--dash-text-muted);

  span {
    flex: 1;
    font-size: 13px;
    font-weight: 500;
    color: var(--dash-text);
    transition: color 0.25s;
  }

  .quick-arrow {
    opacity: 0;
    transform: translateX(-4px);
    transition: all 0.25s;
  }

  &:hover {
    background: rgba(59, 130, 246, 0.08);
    border-color: rgba(59, 130, 246, 0.15);
    color: #60a5fa;

    span { color: #93bbfd; }
    .quick-arrow {
      opacity: 1;
      transform: translateX(0);
      color: #60a5fa;
    }
  }
}

/* ===== 响应式 ===== */
@media (max-width: 1200px) {
  .stat-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .stat-card--compact {
    grid-column: auto;
  }
  .charts-row {
    grid-template-columns: 1fr 1fr;
  }
  .chart-card--quick {
    grid-column: 1 / -1;
  }
  .quick-list {
    flex-direction: row;
  }
  .quick-item { flex: 1; }
}

@media (max-width: 768px) {
  .dashboard { padding: 16px; }
  .hero-banner {
    flex-direction: column;
    gap: 24px;
    padding: 28px 24px;
  }
  .hero-summary { width: 100%; justify-content: space-around; }
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-row {
    grid-template-columns: 1fr;
  }
  .quick-list { flex-direction: column; }
}
</style>
