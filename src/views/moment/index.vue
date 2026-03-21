<template>
  <div class="moment-management">
    <!-- 页面标题区域 -->
    <div class="flex items-start justify-between mb-5 animate-fade-in-up">
      <div class="flex flex-col gap-1">
        <h1 class="font-display text-22px font-700 text-t-main tracking-tight">动态管理</h1>
        <div class="flex items-center gap-2">
          <span class="text-13px text-t-muted">查看与管理用户发布的动态内容，维护社区环境</span>
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
      <!-- 工具栏 -->
      <div class="flex items-center justify-between mb-4.5 flex-wrap gap-3">
        <span class="toolbar-label">MOMENT LIST</span>
        <div class="flex items-center gap-2.5">
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索动态内容..."
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
            <el-option label="正常" :value="1" />
            <el-option label="已删除" :value="0" />
            <el-option label="审核屏蔽" :value="2" />
          </el-select>
          <el-button @click="handleReset">重置筛选</el-button>
        </div>
      </div>

      <!-- 动态表格 -->
      <el-table :data="momentList" v-loading="loading">
        <el-table-column prop="momentId" label="ID" width="70" align="center">
          <template #default="{ row }">
            <span class="font-display-num text-13px text-t-muted font-500">#{{ row.momentId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="发布者" width="150">
          <template #default="{ row }">
            <div class="cell-flex">
              <el-avatar :size="30" :src="row.userAvatar" class="flex-shrink-0">
                {{ row.userNickname?.charAt(0) }}
              </el-avatar>
              <span class="text-13px font-500 text-t-main">{{ row.userNickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" min-width="250" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="text-13px text-t-main leading-relaxed">{{ row.content }}</span>
          </template>
        </el-table-column>
        <el-table-column label="位置" width="130" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="inline-flex items-center gap-1 text-t-muted text-13px">
              <PhMapPin :size="14" weight="bold" />
              <span class="text-t-main">{{ row.locationName || '未标记' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="互动数据" width="180">
          <template #default="{ row }">
            <div class="flex items-center gap-4 text-13px text-t-muted">
              <span class="inline-flex items-center gap-1" :class="{ 'text-danger': row.likeCount > 50 }">
                <PhHeart :size="14" weight="fill" /> {{ row.likeCount }}
              </span>
              <span class="inline-flex items-center gap-1">
                <PhChatDots :size="14" /> {{ row.commentCount }}
              </span>
              <span class="inline-flex items-center gap-1">
                <PhEye :size="14" /> {{ row.viewCount }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <span
              class="inline-flex items-center gap-1.5 text-12.5px font-500 status-dot"
              :class="`status-dot--${statusMap[row.status]?.key}`"
            >
              {{ statusMap[row.status]?.label }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="发布时间" width="170">
          <template #default="{ row }">
            <span class="text-13px text-t-muted">{{ row.createdAt }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleDetail(row)">
              <PhArticle :size="14" weight="bold" class="mr-0.5" />详情
            </el-button>
            <el-button
              v-if="row.status === 1"
              size="small"
              type="danger"
              link
              @click="handleBlock(row)"
            >
              <PhProhibit :size="14" weight="bold" class="mr-0.5" />屏蔽
            </el-button>
            <el-button
              v-else-if="row.status === 2"
              size="small"
              type="success"
              link
              @click="handleRestore(row)"
            >
              <PhArrowCounterClockwise :size="14" weight="bold" class="mr-0.5" />恢复
            </el-button>
            <span v-else class="text-12px text-t-muted">已删除</span>
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

    <!-- 动态详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      width="580px"
      destroy-on-close
      :show-header="false"
      class="detail-dialog"
    >
      <template v-if="currentMoment">
        <!-- Hero 头部 -->
        <div class="detail-hero">
          <div class="detail-hero__bg" />
          <div class="relative z-1 flex items-center gap-3 px-6 pt-6 pb-5">
            <el-avatar :size="48" :src="currentMoment.userAvatar" class="detail-hero__avatar flex-shrink-0">
              {{ currentMoment.userNickname?.charAt(0) }}
            </el-avatar>
            <div class="flex flex-col gap-0.5">
              <span class="font-display text-17px font-700 text-white">{{ currentMoment.userNickname }}</span>
              <span class="text-12px text-white/50">{{ currentMoment.createdAt }}</span>
            </div>
            <span
              class="inline-flex items-center gap-1.5 text-12px font-500 ml-auto px-3 py-1 rounded-full"
              :class="{
                'bg-emerald-500/20 text-emerald-300': statusMap[currentMoment.status]?.key === 'normal',
                'bg-red-500/20 text-red-300': statusMap[currentMoment.status]?.key === 'blocked',
                'bg-gray-500/20 text-gray-300': statusMap[currentMoment.status]?.key === 'deleted'
              }"
            >
              {{ statusMap[currentMoment.status]?.label }}
            </span>
          </div>
        </div>

        <!-- 动态内容区 -->
        <div class="px-6 pt-5">
          <div class="text-15px text-t-main leading-7 mb-4">{{ currentMoment.content }}</div>

          <!-- 图片九宫格 -->
          <div v-if="parseImages(currentMoment.images).length" class="grid grid-cols-3 gap-2 mb-5">
            <el-image
              v-for="(img, i) in parseImages(currentMoment.images)"
              :key="i"
              :src="img"
              :preview-src-list="parseImages(currentMoment.images)"
              :initial-index="i"
              fit="cover"
              class="w-full aspect-square rounded-lg overflow-hidden"
              loading="lazy"
            />
          </div>
        </div>

        <!-- 互动指标 -->
        <div class="grid grid-cols-3 gap-2.5 px-6 mb-5">
          <div class="detail-metric-card">
            <PhHeart :size="18" weight="fill" class="text-danger opacity-70" />
            <span class="font-display-num text-20px font-700 text-t-main leading-none">{{ currentMoment.likeCount }}</span>
            <span class="text-11px text-t-muted uppercase tracking-widest">点赞</span>
          </div>
          <div class="detail-metric-card">
            <PhChatDots :size="18" class="text-primary opacity-70" />
            <span class="font-display-num text-20px font-700 text-t-main leading-none">{{ currentMoment.commentCount }}</span>
            <span class="text-11px text-t-muted uppercase tracking-widest">评论</span>
          </div>
          <div class="detail-metric-card">
            <PhEye :size="18" class="text-t-muted opacity-70" />
            <span class="font-display-num text-20px font-700 text-t-main leading-none">{{ currentMoment.viewCount }}</span>
            <span class="text-11px text-t-muted uppercase tracking-widest">浏览</span>
          </div>
        </div>

        <!-- 元数据标签 -->
        <div class="flex flex-wrap gap-x-5 gap-y-2 px-6 pb-6 text-13px text-t-muted">
          <span class="inline-flex items-center gap-1">
            <PhMapPin :size="14" weight="bold" />
            {{ currentMoment.locationName || '未标记位置' }}
          </span>
          <span>可见范围：{{ visibilityMap[currentMoment.visibility] || '公开' }}</span>
          <span>信用分：<b class="font-display-num text-t-main">{{ currentMoment.userCreditScore }}</b></span>
          <span>ID：<b class="font-display-num text-t-main">#{{ currentMoment.momentId }}</b></span>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMomentList, getMomentDetail, blockMoment, restoreMoment } from '@/api/moment'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { MomentItem, MomentQueryParams } from '@/types/api'
import {
  PhMagnifyingGlass,
  PhArrowClockwise,
  PhHeart,
  PhChatDots,
  PhEye,
  PhMapPin,
  PhProhibit,
  PhArrowCounterClockwise,
  PhArticle,
  PhCheckCircle,
  PhTrash,
  PhShieldWarning
} from '@phosphor-icons/vue'

const loading = ref<boolean>(false)
const momentList = ref<MomentItem[]>([])
const total = ref<number>(0)
const currentPage = ref<number>(1)
const detailVisible = ref<boolean>(false)
const currentMoment = ref<MomentItem | null>(null)

const route = useRoute()
const router = useRouter()

// 从路由参数读取 userId 筛选
const filterUserId = ref<number | undefined>(
  route.query.userId ? Number(route.query.userId) : undefined
)

const queryParams = reactive<MomentQueryParams>({ keyword: '', status: undefined, size: 10 })

// 动态状态映射
const statusMap: Record<number, { label: string; type: string; key: string }> = {
  0: { label: '已删除', type: 'info', key: 'deleted' },
  1: { label: '正常', type: 'success', key: 'normal' },
  2: { label: '审核屏蔽', type: 'danger', key: 'blocked' }
}

// 动态可见范围映射
const visibilityMap: Record<number, string> = {
  0: '公开',
  1: '仅关注者',
  2: '仅自己'
}

// 统计卡片数据 - 基于当前列表数据计算
const statCards = computed(() => [
  {
    key: 'total',
    label: '动态总数',
    value: total.value,
    color: 'var(--color-primary)',
    icon: PhArticle
  },
  {
    key: 'normal',
    label: '正常',
    value: momentList.value.filter(m => m.status === 1).length,
    color: 'var(--color-success)',
    icon: PhCheckCircle
  },
  {
    key: 'deleted',
    label: '已删除',
    value: momentList.value.filter(m => m.status === 0).length,
    color: 'var(--color-text-muted)',
    icon: PhTrash
  },
  {
    key: 'blocked',
    label: '审核屏蔽',
    value: momentList.value.filter(m => m.status === 2).length,
    color: 'var(--color-danger)',
    icon: PhShieldWarning
  }
])

// 获取动态列表
async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const params: MomentQueryParams = {
      page: currentPage.value - 1,
      size: queryParams.size,
      keyword: queryParams.keyword
    }
    if (queryParams.status !== undefined) params.status = queryParams.status
    if (filterUserId.value) params.userId = filterUserId.value
    const res = await getMomentList(params)
    momentList.value = res.data.list
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

// 查看动态详情
async function handleDetail(row: MomentItem): Promise<void> {
  try {
    const res = await getMomentDetail(row.momentId)
    currentMoment.value = res.data
    detailVisible.value = true
  } catch (err) { /* 错误已在拦截器中处理 */ }
}

// 解析图片 JSON 字符串
function parseImages(imagesStr: string): string[] {
  try { return JSON.parse(imagesStr || '[]') }
  catch { return [] }
}

// 屏蔽动态
function handleBlock(row: MomentItem): void {
  ElMessageBox.confirm('确定要屏蔽这条动态吗？', '警告', {
    type: 'warning', confirmButtonText: '确定屏蔽', cancelButtonText: '取消'
  }).then(async () => {
    await blockMoment(row.momentId)
    ElMessage.success('已屏蔽该动态')
    fetchList()
  }).catch(() => {})
}

// 恢复动态
function handleRestore(row: MomentItem): void {
  ElMessageBox.confirm('确定要恢复这条动态吗？', '提示', {
    type: 'info', confirmButtonText: '确定恢复', cancelButtonText: '取消'
  }).then(async () => {
    await restoreMoment(row.momentId)
    ElMessage.success('已恢复该动态')
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

/* 状态小圆点伪元素（仅保留原子类无法覆盖的部分） */
.status-dot::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.status-dot--normal::before { background: var(--color-success); box-shadow: 0 0 6px var(--color-success); }
.status-dot--normal { color: var(--color-success); }
.status-dot--deleted::before { background: var(--color-info, #8d99ae); }
.status-dot--deleted { color: var(--color-text-muted); }
.status-dot--blocked::before { background: var(--color-danger); box-shadow: 0 0 6px var(--color-danger); }
.status-dot--blocked { color: var(--color-danger); }

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

