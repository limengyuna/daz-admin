<template>
  <div class="moment-management">
    <div class="page-card">
      <!-- 搜索区域 -->
      <div class="search-bar">
        <el-input v-model="queryParams.keyword" placeholder="搜索动态内容" clearable
          style="width: 280px" @keyup.enter="handleSearch" @clear="handleSearch" />
        <el-select v-model="queryParams.status" placeholder="动态状态" clearable style="width: 140px"
          @change="handleSearch">
          <el-option label="正常" :value="1" />
          <el-option label="已删除" :value="0" />
          <el-option label="审核屏蔽" :value="2" />
        </el-select>
        <el-button type="primary" :icon="PhMagnifyingGlass" @click="handleSearch">搜索</el-button>
        <el-button :icon="PhArrowClockwise" @click="handleReset">重置</el-button>
      </div>

      <!-- 动态表格 -->
      <el-table :data="momentList" v-loading="loading" stripe>
        <el-table-column prop="momentId" label="ID" width="80" />
        <el-table-column label="发布者" width="140">
          <template #default="{ row }">
            <div style="display:flex;align-items:center;gap:8px">
              <el-avatar :size="28" :src="row.avatarUrl">{{ row.nickname?.charAt(0) }}</el-avatar>
              <span>{{ row.nickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" min-width="250" show-overflow-tooltip />
        <el-table-column prop="locationName" label="位置" width="120" show-overflow-tooltip />
        <el-table-column label="互动数据" width="150">
          <template #default="{ row }">
            <span style="margin-right:10px;display:inline-flex;align-items:center;gap:3px"><PhThumbsUp :size="14" /> {{ row.likeCount }}</span>
            <span style="margin-right:10px;display:inline-flex;align-items:center;gap:3px"><PhChatDots :size="14" /> {{ row.commentCount }}</span>
            <span style="display:inline-flex;align-items:center;gap:3px"><PhEye :size="14" /> {{ row.viewCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type" round>{{ statusMap[row.status]?.label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="发布时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 1" size="small" type="danger" link @click="handleBlock(row)">屏蔽</el-button>
            <el-button v-else-if="row.status === 2" size="small" type="success" link @click="handleRestore(row)">恢复</el-button>
            <span v-else style="color:#909399;font-size:12px">已删除</span>
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
import { getMomentList, blockMoment, restoreMoment } from '@/api/moment'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { MomentItem, MomentQueryParams } from '@/types/api'
import { PhMagnifyingGlass, PhArrowClockwise, PhThumbsUp, PhChatDots, PhEye } from '@phosphor-icons/vue'

const loading = ref<boolean>(false)
const momentList = ref<MomentItem[]>([])
const total = ref<number>(0)
const currentPage = ref<number>(1)

const queryParams = reactive<MomentQueryParams>({ keyword: '', status: undefined, size: 10 })

// 动态状态映射
const statusMap: Record<number, { label: string; type: string }> = {
  0: { label: '已删除', type: 'info' },
  1: { label: '正常', type: 'success' },
  2: { label: '审核屏蔽', type: 'danger' }
}

// 获取动态列表
async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const params: MomentQueryParams = { page: currentPage.value - 1, size: queryParams.size, keyword: queryParams.keyword }
    if (queryParams.status !== undefined) params.status = queryParams.status
    const res = await getMomentList(params)
    momentList.value = res.data.list
    total.value = res.data.total
  } catch (err) { /* 错误已在拦截器中处理 */ }
  finally { loading.value = false }
}

function handleSearch(): void { currentPage.value = 1; fetchList() }
function handleReset(): void { queryParams.keyword = ''; queryParams.status = undefined; handleSearch() }

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
