<template>
  <div class="activity-management">
    <!-- 页面标题区域 -->
    <div class="flex items-start justify-between mb-5 animate-fade-in-up">
      <div class="flex flex-col gap-1">
        <h1 class="font-display text-22px font-700 text-t-main tracking-tight">活动管理</h1>
        <div class="flex items-center gap-2">
          <span class="text-13px text-t-muted">管理平台上的所有搭子活动，查看活动状态与进度</span>
          <el-tag v-if="filterUserId" type="warning" closable @close="clearUserFilter" size="small">
            筛选用户 #{{ filterUserId }}
          </el-tag>
        </div>
      </div>
      <div class="flex-shrink-0">
        <el-button :icon="PhArrowClockwise" @click="handleRefresh" :loading="loading" round>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="grid grid-cols-4 gap-3.5 mb-5">
      <div
        v-for="(stat, index) in statCards"
        :key="stat.key"
        class="stat-card bg-surface border border-border rounded-md px-5 py-4.5 flex items-center gap-3.5 shadow-sm transition-all duration-250 hover:shadow-md hover:-translate-y-0.5"
        :style="{ animationDelay: `${index * 0.06}s` }"
      >
        <div class="opacity-75 flex-shrink-0 flex items-center justify-center" :style="{ color: stat.color }">
          <component :is="stat.icon" :size="22" weight="duotone" />
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="font-display-num text-22px font-700 text-t-main leading-none">{{ stat.value }}</span>
          <span class="text-12px text-t-muted tracking-wide">{{ stat.label }}</span>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="page-card">
      <!-- 工具栏区域 -->
      <div class="flex items-center justify-between mb-4.5 flex-wrap gap-3">
        <span class="toolbar-label">ACTIVITY LIST</span>
        <div class="flex items-center gap-2.5">
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索活动标题..."
            clearable
            :prefix-icon="PhMagnifyingGlass"
            class="w-60"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
          <el-select
            v-model="queryParams.status"
            placeholder="全部状态"
            clearable
            class="w-33"
            @change="handleSearch"
          >
            <el-option label="招募中" :value="0" />
            <el-option label="已满员" :value="1" />
            <el-option label="已结束" :value="2" />
            <el-option label="已取消" :value="3" />
          </el-select>
          <el-button @click="handleReset">重置筛选</el-button>
        </div>
      </div>

      <!-- 活动表格 -->
      <el-table :data="activityList" v-loading="loading">
        <el-table-column prop="activityId" label="ID" width="70" align="center">
          <template #default="{ row }">
            <span class="font-display-num text-13px text-t-muted font-500">#{{ row.activityId }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="活动标题" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="flex flex-col gap-0.75">
              <span class="font-500 text-t-main text-13.5px">{{ row.title }}</span>
              <span class="text-12px text-t-muted">{{ formatTime(row.startTime) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="发起人" width="160">
          <template #default="{ row }">
            <div class="cell-flex">
              <el-avatar :size="30" :src="row.initiatorAvatar" class="flex-shrink-0">
                {{ row.initiatorNickname?.charAt(0) }}
              </el-avatar>
              <span class="text-13px font-500 text-t-main">{{ row.initiatorNickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="参与进度" width="160">
          <template #default="{ row }">
            <div class="flex items-center gap-2.5">
              <div class="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  class="progress-fill h-full rounded-full"
                  :style="{
                    width: `${(row.currentParticipants / row.maxParticipants) * 100}%`,
                    background: getProgressColor(row.currentParticipants, row.maxParticipants)
                  }"
                />
              </div>
              <span class="font-display-num text-12px text-t-muted font-500 whitespace-nowrap min-w-9 text-right">
                {{ row.currentParticipants }}/{{ row.maxParticipants }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="locationName" label="地点" width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="inline-flex items-center gap-1 text-t-muted text-13px">
              <PhMapPin :size="14" weight="bold" />
              <span class="text-t-main">{{ row.locationName || '未指定' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <span
              class="inline-flex items-center gap-1.5 text-12.5px font-500 status-dot"
              :class="`status-dot--${statusMap[row.status]?.key}`"
            >
              {{ statusMap[row.status]?.label }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleDetail(row)">
              <PhCalendarCheck :size="14" weight="bold" class="mr-0.5" />详情
            </el-button>
            <el-button
              v-if="row.status !== 3"
              size="small"
              type="danger"
              link
              @click="handleCancel(row)"
            >
              <PhProhibit :size="14" weight="bold" class="mr-0.5" />下架
            </el-button>
            <el-button
              v-else
              size="small"
              type="success"
              link
              @click="handleRestore(row)"
            >
              <PhArrowCounterClockwise :size="14" weight="bold" class="mr-0.5" />恢复
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </div>

    <!-- 活动详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      width="600px"
      destroy-on-close
      :show-header="false"
      class="detail-dialog"
    >
      <template v-if="currentActivity">
        <!-- Hero 头部 -->
        <div class="detail-hero">
          <div class="detail-hero__bg" />
          <div class="relative z-1 px-6 pt-6 pb-5">
            <div class="flex items-center gap-3">
              <el-avatar :size="44" :src="currentActivity.initiatorAvatar" class="detail-hero__avatar flex-shrink-0">
                {{ currentActivity.initiatorNickname?.charAt(0) }}
              </el-avatar>
              <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                <h2 class="font-display text-18px font-700 text-white truncate">{{ currentActivity.title }}</h2>
                <span class="text-12px text-white/50">发起人：{{ currentActivity.initiatorNickname }}</span>
              </div>
              <span
                class="inline-flex items-center gap-1.5 text-12px font-500 px-3 py-1 rounded-full flex-shrink-0"
                :class="{
                  'bg-emerald-500/20 text-emerald-300': statusMap[currentActivity.status]?.key === 'recruiting',
                  'bg-amber-500/20 text-amber-300': statusMap[currentActivity.status]?.key === 'full',
                  'bg-gray-500/20 text-gray-300': statusMap[currentActivity.status]?.key === 'ended',
                  'bg-red-500/20 text-red-300': statusMap[currentActivity.status]?.key === 'cancelled'
                }"
              >
                {{ statusMap[currentActivity.status]?.label }}
              </span>
            </div>
          </div>
        </div>

        <!-- 核心指标 -->
        <div class="grid grid-cols-3 gap-2.5 px-6 -mt-4 relative z-2">
          <div class="detail-metric-card">
            <PhUsers :size="18" class="text-primary opacity-70" />
            <span class="font-display-num text-20px font-700 text-t-main leading-none">
              {{ currentActivity.currentParticipants }}<span class="text-13px text-t-muted font-400">/{{ currentActivity.maxParticipants }}</span>
            </span>
            <span class="text-11px text-t-muted uppercase tracking-widest">参与人数</span>
          </div>
          <div class="detail-metric-card">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" class="text-warning opacity-70">
              <path fill="currentColor" stroke="currentColor" stroke-width="1.5" d="M128 24a104 104 0 1 0 104 104A104 104 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88 88 88 0 0 1-88 88Zm40-88a8 8 0 0 1-8 8h-32a8 8 0 0 1-8-8V80a8 8 0 0 1 16 0v40h24a8 8 0 0 1 8 8Z"/>
            </svg>
            <span class="text-14px font-600 text-t-main leading-none">{{ paymentTypeMap[currentActivity.paymentType] || '未知' }}</span>
            <span class="text-11px text-t-muted uppercase tracking-widest">费用方式</span>
          </div>
          <div class="detail-metric-card">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" class="text-success opacity-70">
              <path fill="currentColor" stroke="currentColor" stroke-width="1.5" d="M128 24a104 104 0 1 0 104 104A104 104 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88 88 88 0 0 1-88 88Zm-40-88a12 12 0 1 1 12 12 12 12 0 0 1-12-12Zm72 0a12 12 0 1 1 12 12 12 12 0 0 1-12-12Z"/>
            </svg>
            <span class="font-display-num text-18px font-700 text-t-main leading-none">{{ currentActivity.initiatorCreditScore ?? '—' }}</span>
            <span class="text-11px text-t-muted uppercase tracking-widest">信用分</span>
          </div>
        </div>

        <!-- 活动描述 -->
        <div class="px-6 pt-5">
          <div class="text-11px text-t-muted uppercase tracking-widest mb-1.5">活动描述</div>
          <div class="text-14px text-t-main leading-7 bg-bg rounded-md px-3.5 py-2.5 mb-4">
            {{ currentActivity.description }}
          </div>
        </div>

        <!-- 图片 -->
        <div v-if="parseImages(currentActivity.images).length" class="px-6 mb-4">
          <div class="grid grid-cols-3 gap-2">
            <el-image
              v-for="(img, i) in parseImages(currentActivity.images)"
              :key="i"
              :src="img"
              :preview-src-list="parseImages(currentActivity.images)"
              :initial-index="i"
              fit="cover"
              class="w-full aspect-square rounded-lg overflow-hidden"
              loading="lazy"
            />
          </div>
        </div>

        <!-- 时间与地点 -->
        <div class="px-6 pb-2">
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="flex flex-col gap-0.5">
              <span class="text-11px text-t-muted uppercase tracking-widest">开始时间</span>
              <span class="text-13px text-t-main font-500">{{ currentActivity.startTime }}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-11px text-t-muted uppercase tracking-widest">结束时间</span>
              <span class="text-13px text-t-main font-500">{{ currentActivity.endTime }}</span>
            </div>
          </div>
        </div>

        <!-- 底部元数据 -->
        <div class="flex flex-wrap gap-x-5 gap-y-2 px-6 pb-6 text-13px text-t-muted border-t border-border pt-4">
          <span class="inline-flex items-center gap-1">
            <PhMapPin :size="14" weight="bold" />
            {{ currentActivity.locationName || '未指定' }}
            <template v-if="currentActivity.locationAddress"> · {{ currentActivity.locationAddress }}</template>
          </span>
          <span>创建时间：{{ currentActivity.createdAt }}</span>
          <span>ID：<b class="font-display-num text-t-main">#{{ currentActivity.activityId }}</b></span>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getActivityList, getActivityDetail, cancelActivity, restoreActivity } from '@/api/activity'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ActivityItem, ActivityQueryParams } from '@/types/api'
import {
  PhMagnifyingGlass,
  PhArrowClockwise,
  PhMapPin,
  PhProhibit,
  PhArrowCounterClockwise,
  PhCalendarCheck,
  PhUsers,
  PhCheckCircle,
  PhXCircle
} from '@phosphor-icons/vue'

const loading = ref<boolean>(false)
const activityList = ref<ActivityItem[]>([])
const total = ref<number>(0)
const currentPage = ref<number>(1)
const detailVisible = ref<boolean>(false)
const currentActivity = ref<ActivityItem | null>(null)

const route = useRoute()
const router = useRouter()

// 从路由参数读取 userId 筛选
const filterUserId = ref<number | undefined>(
  route.query.userId ? Number(route.query.userId) : undefined
)

const queryParams = reactive<ActivityQueryParams>({ keyword: '', status: undefined, size: 10 })

// 活动状态映射
const statusMap: Record<number, { label: string; type: string; key: string }> = {
  0: { label: '招募中', type: 'success', key: 'recruiting' },
  1: { label: '已满员', type: 'warning', key: 'full' },
  2: { label: '已结束', type: 'info', key: 'ended' },
  3: { label: '已取消', type: 'danger', key: 'cancelled' }
}

// 费用方式映射
const paymentTypeMap: Record<number, string> = {
  1: 'AA制',
  2: '发起人请客',
  3: '免费',
  4: '各付各的'
}

// 统计卡片数据 - 基于当前列表数据计算
const statCards = computed(() => [
  {
    key: 'total',
    label: '活动总数',
    value: total.value,
    color: 'var(--color-primary)',
    icon: PhCalendarCheck
  },
  {
    key: 'recruiting',
    label: '招募中',
    value: activityList.value.filter(a => a.status === 0).length,
    color: 'var(--color-success)',
    icon: PhUsers
  },
  {
    key: 'full',
    label: '已满员',
    value: activityList.value.filter(a => a.status === 1).length,
    color: 'var(--color-warning)',
    icon: PhCheckCircle
  },
  {
    key: 'cancelled',
    label: '已取消',
    value: activityList.value.filter(a => a.status === 3).length,
    color: 'var(--color-danger)',
    icon: PhXCircle
  }
])

// 获取参与进度的颜色
function getProgressColor(current: number, max: number): string {
  const ratio = current / max
  if (ratio >= 1) return 'var(--color-warning)'
  if (ratio >= 0.7) return 'var(--color-success)'
  return 'var(--color-primary)'
}

// 格式化时间为更友好的形式
function formatTime(time: string): string {
  if (!time) return ''
  const date = new Date(time)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 ${hours}:${minutes}`
}

// 获取活动列表
async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const params: ActivityQueryParams = {
      page: currentPage.value - 1,
      size: queryParams.size,
      keyword: queryParams.keyword
    }
    if (queryParams.status !== undefined) params.status = queryParams.status
    if (filterUserId.value) params.userId = filterUserId.value
    const res = await getActivityList(params)
    activityList.value = res.data.list
    total.value = res.data.total
  } catch (err) { /* 错误已在拦截器中处理 */ }
  finally { loading.value = false }
}

function handleSearch(): void { currentPage.value = 1; fetchList() }
function handleReset(): void { queryParams.keyword = ''; queryParams.status = undefined; handleSearch() }
function handleRefresh(): void { fetchList() }

// 清除用户ID筛选
function clearUserFilter(): void {
  filterUserId.value = undefined
  router.replace({ query: {} })
  handleSearch()
}

// 查看活动详情
async function handleDetail(row: ActivityItem): Promise<void> {
  try {
    const res = await getActivityDetail(row.activityId)
    currentActivity.value = res.data
    detailVisible.value = true
  } catch (err) { /* 错误已在拦截器中处理 */ }
}

// 解析图片 JSON 字符串
function parseImages(imagesStr: string): string[] {
  try { return JSON.parse(imagesStr || '[]') }
  catch { return [] }
}

// 下架活动
function handleCancel(row: ActivityItem): void {
  ElMessageBox.confirm(`确定要下架活动「${row.title}」吗？`, '警告', {
    type: 'warning', confirmButtonText: '确定下架', cancelButtonText: '取消'
  }).then(async () => {
    await cancelActivity(row.activityId)
    ElMessage.success('已下架该活动')
    fetchList()
  }).catch(() => {})
}

// 恢复活动
function handleRestore(row: ActivityItem): void {
  ElMessageBox.confirm(`确定要恢复活动「${row.title}」吗？`, '提示', {
    type: 'info', confirmButtonText: '确定恢复', cancelButtonText: '取消'
  }).then(async () => {
    await restoreActivity(row.activityId)
    ElMessage.success('已恢复该活动')
    fetchList()
  }).catch(() => {})
}

onMounted(() => fetchList())
</script>

<style scoped lang="scss">
/* 统计卡片入场动画 */
.stat-card {
  animation: fadeInUp 0.4s ease both;
}

/* 主内容卡片动画 */
.page-card {
  animation: fadeInUp 0.45s ease both;
  animation-delay: 0.15s;
}

/* 进度条填充动画 */
.progress-fill {
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 状态小圆点伪元素（仅保留原子类无法覆盖的部分） */
.status-dot::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.status-dot--recruiting::before { background: var(--color-success); box-shadow: 0 0 6px var(--color-success); }
.status-dot--recruiting { color: var(--color-success); }
.status-dot--full::before { background: var(--color-warning); box-shadow: 0 0 6px var(--color-warning); }
.status-dot--full { color: var(--color-warning); }
.status-dot--ended::before { background: var(--color-info, #8d99ae); }
.status-dot--ended { color: var(--color-text-muted); }
.status-dot--cancelled::before { background: var(--color-danger); }
.status-dot--cancelled { color: var(--color-danger); }

/* ========== 详情对话框样式 ========== */
.detail-dialog :deep(.el-dialog__body) { padding: 0; }

.detail-hero {
  position: relative;
  overflow: hidden;
}
.detail-hero__bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #1a2744 0%, #1e3a5f 40%, #2a4480 100%);
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 70% 20%, rgba(67, 97, 238, 0.3) 0%, transparent 50%);
  }
}
.detail-hero__avatar {
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 16px rgba(67, 97, 238, 0.3);
}

.detail-metric-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

/* 动画关键帧 */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
