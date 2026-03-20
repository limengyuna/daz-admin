<template>
  <div class="activity-management">
    <div class="page-card">
      <!-- 搜索区域 -->
      <div class="search-bar">
        <el-input v-model="queryParams.keyword" placeholder="搜索活动标题" clearable
          style="width: 280px" @keyup.enter="handleSearch" @clear="handleSearch" />
        <el-select v-model="queryParams.status" placeholder="活动状态" clearable style="width: 140px"
          @change="handleSearch">
          <el-option label="招募中" :value="0" />
          <el-option label="已满员" :value="1" />
          <el-option label="已结束" :value="2" />
          <el-option label="已取消" :value="3" />
        </el-select>
        <el-button type="primary" :icon="PhMagnifyingGlass" @click="handleSearch">搜索</el-button>
        <el-button :icon="PhArrowClockwise" @click="handleReset">重置</el-button>
      </div>

      <!-- 活动表格 -->
      <el-table :data="activityList" v-loading="loading" stripe>
        <el-table-column prop="activityId" label="ID" width="80" />
        <el-table-column prop="title" label="活动标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="发起人" width="140">
          <template #default="{ row }">
            <div style="display:flex;align-items:center;gap:8px">
              <el-avatar :size="28" :src="row.initiatorAvatar">{{ row.initiatorNickname?.charAt(0) }}</el-avatar>
              <span>{{ row.initiatorNickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="参与人数" width="100">
          <template #default="{ row }">
            {{ row.currentParticipants }}/{{ row.maxParticipants }}
          </template>
        </el-table-column>
        <el-table-column prop="locationName" label="地点" width="150" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type" round>{{ statusMap[row.status]?.label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status !== 3" size="small" type="danger" link @click="handleCancel(row)">下架</el-button>
            <el-button v-else size="small" type="success" link @click="handleRestore(row)">恢复</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 50]" :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchList" @current-change="fetchList" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getActivityList, cancelActivity, restoreActivity } from '@/api/activity'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ActivityItem, ActivityQueryParams } from '@/types/api'
import { PhMagnifyingGlass, PhArrowClockwise } from '@phosphor-icons/vue'

const loading = ref<boolean>(false)
const activityList = ref<ActivityItem[]>([])
const total = ref<number>(0)
const currentPage = ref<number>(1)

const queryParams = reactive<ActivityQueryParams>({ keyword: '', status: undefined, size: 10 })

// 活动状态映射
const statusMap: Record<number, { label: string; type: string }> = {
  0: { label: '招募中', type: 'success' },
  1: { label: '已满员', type: 'warning' },
  2: { label: '已结束', type: 'info' },
  3: { label: '已取消', type: 'danger' }
}

// 获取活动列表
async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const params: ActivityQueryParams = { page: currentPage.value - 1, size: queryParams.size, keyword: queryParams.keyword }
    if (queryParams.status !== undefined) params.status = queryParams.status
    const res = await getActivityList(params)
    activityList.value = res.data.list
    total.value = res.data.total
  } catch (err) { /* 错误已在拦截器中处理 */ }
  finally { loading.value = false }
}

function handleSearch(): void { currentPage.value = 1; fetchList() }
function handleReset(): void { queryParams.keyword = ''; queryParams.status = undefined; handleSearch() }

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
