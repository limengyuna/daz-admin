<template>
  <div class="user-management">
    <!-- 页面标题区域 -->
    <div class="flex items-start justify-between mb-5 animate-fade-in-up">
      <div class="flex flex-col gap-1">
        <h1 class="font-display text-22px font-700 text-t-main tracking-tight">用户管理</h1>
        <span class="text-13px text-t-muted">查看平台注册用户，管理用户状态与信息</span>
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
        <span class="toolbar-label">USER LIST</span>
        <div class="flex items-center gap-2.5">
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索用户名/昵称..."
            clearable
            :prefix-icon="PhMagnifyingGlass"
            class="w-60"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
          <el-button @click="handleReset">重置筛选</el-button>
        </div>
      </div>

      <!-- 用户表格 -->
      <el-table :data="userList" v-loading="loading">
        <el-table-column prop="userId" label="ID" width="70" align="center">
          <template #default="{ row }">
            <span class="font-display-num text-13px text-t-muted font-500">#{{ row.userId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户信息" min-width="220">
          <template #default="{ row }">
            <div class="cell-flex">
              <el-avatar :size="36" :src="row.avatarUrl" class="flex-shrink-0">
                {{ row.nickname?.charAt(0) }}
              </el-avatar>
              <div class="flex flex-col gap-0.5">
                <span class="font-500 text-t-main text-13.5px">{{ row.nickname }}</span>
                <span class="text-12px text-t-muted">@{{ row.username }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="性别" width="80" align="center">
          <template #default="{ row }">
            <span class="text-13px text-t-main">
              {{ row.gender === 1 ? '男' : row.gender === 2 ? '女' : '未知' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="city" label="城市" width="100">
          <template #default="{ row }">
            <div class="inline-flex items-center gap-1 text-t-muted text-13px">
              <PhMapPin :size="14" weight="bold" />
              <span class="text-t-main">{{ row.city || '未填写' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="信用分" width="110">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <div class="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  class="credit-fill h-full rounded-full"
                  :style="{
                    width: `${row.creditScore}%`,
                    background: getCreditColor(row.creditScore)
                  }"
                />
              </div>
              <span class="font-display-num text-12px font-500 text-t-muted min-w-7 text-right">
                {{ row.creditScore }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <span
              class="inline-flex items-center gap-1.5 text-12.5px font-500 status-dot"
              :class="row.status === 1 ? 'status-dot--normal' : 'status-dot--banned'"
            >
              {{ row.status === 1 ? '正常' : '已封禁' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="170">
          <template #default="{ row }">
            <span class="text-13px text-t-muted">{{ row.createdAt }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleDetail(row)">
              <PhUserCircle :size="14" weight="bold" class="mr-0.5" />详情
            </el-button>
            <el-button v-if="row.status === 1" size="small" type="danger" link @click="handleBan(row)">
              <PhProhibit :size="14" weight="bold" class="mr-0.5" />封禁
            </el-button>
            <el-button v-else size="small" type="success" link @click="handleUnban(row)">
              <PhArrowCounterClockwise :size="14" weight="bold" class="mr-0.5" />解封
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

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      width="580px"
      destroy-on-close
      :show-header="false"
      class="detail-dialog"
    >
      <template v-if="currentUser">
        <!-- Hero 头部 - 深色渐变背景 -->
        <div class="detail-hero">
          <div class="detail-hero__bg" />
          <div class="relative z-1 flex flex-col items-center pt-8 pb-6">
            <el-avatar :size="72" :src="currentUser.avatarUrl" class="detail-hero__avatar">
              {{ currentUser.nickname?.charAt(0) }}
            </el-avatar>
            <h2 class="font-display text-20px font-700 text-white mt-3 tracking-tight">
              {{ currentUser.nickname }}
            </h2>
            <span class="text-13px text-white/60 mt-0.5">@{{ currentUser.username }}</span>
            <span
              class="inline-flex items-center gap-1.5 text-12px font-500 mt-2.5 px-3 py-1 rounded-full"
              :class="currentUser.status === 1
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-red-500/20 text-red-300'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="currentUser.status === 1 ? 'bg-emerald-400' : 'bg-red-400'" />
              {{ currentUser.status === 1 ? '正常' : '已封禁' }}
            </span>
          </div>
        </div>

        <!-- 核心指标卡片 -->
        <div class="grid grid-cols-4 gap-2.5 px-6 -mt-5 relative z-2">
          <div class="detail-metric-card">
            <span class="text-11px text-t-muted uppercase tracking-widest">信用分</span>
            <span
              class="font-display-num text-22px font-700 leading-none"
              :style="{ color: getCreditColor(currentUser.creditScore) }"
            >{{ currentUser.creditScore }}</span>
          </div>
          <div class="detail-metric-card">
            <span class="text-11px text-t-muted uppercase tracking-widest">性别</span>
            <span class="text-15px font-600 text-t-main">
              {{ currentUser.gender === 1 ? '男' : currentUser.gender === 2 ? '女' : '—' }}
            </span>
          </div>
          <div class="detail-metric-card">
            <span class="text-11px text-t-muted uppercase tracking-widest">城市</span>
            <span class="text-13px font-600 text-t-main truncate">{{ currentUser.city || '—' }}</span>
          </div>
          <div class="detail-metric-card">
            <span class="text-11px text-t-muted uppercase tracking-widest">ID</span>
            <span class="font-display-num text-15px font-600 text-t-muted">#{{ currentUser.userId }}</span>
          </div>
        </div>

        <!-- 详细信息区 -->
        <div class="px-6 pt-5 pb-2">
          <!-- 个人简介 -->
          <div class="mb-4">
            <div class="text-11px text-t-muted uppercase tracking-widest mb-1.5">个人简介</div>
            <div class="text-14px text-t-main leading-relaxed bg-bg rounded-md px-3.5 py-2.5">
              {{ currentUser.bio || '这个人很懒，什么都没写~' }}
            </div>
          </div>

          <!-- 标签 -->
          <div class="mb-4">
            <div class="text-11px text-t-muted uppercase tracking-widest mb-1.5">标签</div>
            <div class="flex flex-wrap gap-1.5">
              <template v-if="parseTags(currentUser.tags).length">
                <span
                  v-for="tag in parseTags(currentUser.tags)"
                  :key="tag"
                  class="text-12px px-2.5 py-1 rounded-full bg-primary/8 text-primary font-500 border border-primary/15"
                >{{ tag }}</span>
              </template>
              <span v-else class="text-13px text-t-muted">暂无标签</span>
            </div>
          </div>

          <!-- 时间信息 -->
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="flex flex-col gap-0.5">
              <span class="text-11px text-t-muted uppercase tracking-widest">生日</span>
              <span class="text-13px text-t-main font-500">{{ currentUser.birthday || '未填写' }}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-11px text-t-muted uppercase tracking-widest">注册时间</span>
              <span class="text-13px text-t-main font-500">{{ currentUser.createdAt }}</span>
            </div>
          </div>
        </div>

        <!-- 底部操作区 -->
        <div class="flex items-center gap-3 px-6 pb-6 pt-3 border-t border-border">
          <el-button class="flex-1" @click="goToUserMoments(currentUser.userId)">
            <PhArticle :size="16" weight="bold" class="mr-1" />TA 的动态
          </el-button>
          <el-button class="flex-1" @click="goToUserActivities(currentUser.userId)">
            <PhCalendarCheck :size="16" weight="bold" class="mr-1" />TA 的活动
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserList, getUserDetail, banUser, unbanUser } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UserItem, UserDetail, UserQueryParams } from '@/types/api'
import {
  PhMagnifyingGlass,
  PhArrowClockwise,
  PhMapPin,
  PhProhibit,
  PhArrowCounterClockwise,
  PhUserCircle,
  PhUsersThree,
  PhUserCheck,
  PhUserMinus,
  PhShieldCheck,
  PhArticle,
  PhCalendarCheck
} from '@phosphor-icons/vue'

const router = useRouter()

const loading = ref<boolean>(false)
const userList = ref<UserItem[]>([])
const total = ref<number>(0)
const currentPage = ref<number>(1)
const detailVisible = ref<boolean>(false)
const currentUser = ref<UserDetail | null>(null)

const queryParams = reactive<UserQueryParams>({ keyword: '', size: 10 })

// 统计卡片数据
const statCards = computed(() => [
  {
    key: 'total',
    label: '用户总数',
    value: total.value,
    color: 'var(--color-primary)',
    icon: PhUsersThree
  },
  {
    key: 'normal',
    label: '正常用户',
    value: userList.value.filter(u => u.status === 1).length,
    color: 'var(--color-success)',
    icon: PhUserCheck
  },
  {
    key: 'banned',
    label: '已封禁',
    value: userList.value.filter(u => u.status !== 1).length,
    color: 'var(--color-danger)',
    icon: PhUserMinus
  },
  {
    key: 'credit',
    label: '平均信用分',
    value: userList.value.length
      ? Math.round(userList.value.reduce((sum, u) => sum + u.creditScore, 0) / userList.value.length)
      : 0,
    color: 'var(--color-warning)',
    icon: PhShieldCheck
  }
])

// 获取信用分颜色
function getCreditColor(score: number): string {
  if (score >= 80) return 'var(--color-success)'
  if (score >= 50) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

// 获取用户列表
async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const res = await getUserList({
      page: currentPage.value - 1,
      size: queryParams.size,
      keyword: queryParams.keyword
    })
    userList.value = res.data.list
    total.value = res.data.total
  } catch (err) { /* 错误已在拦截器中处理 */ }
  finally { loading.value = false }
}

function handleSearch(): void { currentPage.value = 1; fetchList() }
function handleReset(): void { queryParams.keyword = ''; handleSearch() }
function handleRefresh(): void { fetchList() }

// 跳转到用户的动态列表
function goToUserMoments(userId: number): void {
  detailVisible.value = false
  router.push({ path: '/moments', query: { userId: String(userId) } })
}

// 跳转到用户的活动列表
function goToUserActivities(userId: number): void {
  detailVisible.value = false
  router.push({ path: '/activities', query: { userId: String(userId) } })
}

// 查看用户详情
async function handleDetail(row: UserItem): Promise<void> {
  try {
    const res = await getUserDetail(row.userId)
    currentUser.value = res.data
    detailVisible.value = true
  } catch (err) { /* 错误已在拦截器中处理 */ }
}

// 封禁用户
function handleBan(row: UserItem): void {
  ElMessageBox.confirm(`确定要封禁用户「${row.nickname}」吗？`, '警告', {
    type: 'warning', confirmButtonText: '确定封禁', cancelButtonText: '取消'
  }).then(async () => {
    await banUser(row.userId)
    ElMessage.success('已封禁该用户')
    fetchList()
  }).catch(() => {})
}

// 解封用户
function handleUnban(row: UserItem): void {
  ElMessageBox.confirm(`确定要解封用户「${row.nickname}」吗？`, '提示', {
    type: 'info', confirmButtonText: '确定解封', cancelButtonText: '取消'
  }).then(async () => {
    await unbanUser(row.userId)
    ElMessage.success('已解封该用户')
    fetchList()
  }).catch(() => {})
}

// 解析标签 JSON 字符串
function parseTags(tagsStr: string): string[] {
  try { return JSON.parse(tagsStr || '[]') }
  catch { return [] }
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

/* 信用分进度条动画 */
.credit-fill {
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 状态小圆点伪元素 */
.status-dot::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.status-dot--normal::before { background: var(--color-success); box-shadow: 0 0 6px var(--color-success); }
.status-dot--normal { color: var(--color-success); }
.status-dot--banned::before { background: var(--color-danger); box-shadow: 0 0 6px var(--color-danger); }
.status-dot--banned { color: var(--color-danger); }

/* ========== 详情对话框样式 ========== */

/* 对话框去除默认内边距 */
.detail-dialog :deep(.el-dialog__body) {
  padding: 0;
}

/* Hero 头部区域 */
.detail-hero {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
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
  border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 20px rgba(67, 97, 238, 0.3);
}

/* 指标卡片 */
.detail-metric-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  text-align: center;
}

/* 动画关键帧 */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
