<template>
  <div class="user-management">
    <div class="page-card">
      <!-- 搜索区域 -->
      <div class="search-bar">
        <el-input v-model="queryParams.keyword" placeholder="搜索用户名/昵称" clearable
          style="width: 280px" @keyup.enter="handleSearch" @clear="handleSearch" />
        <el-button type="primary" :icon="PhMagnifyingGlass" @click="handleSearch">搜索</el-button>
        <el-button :icon="PhArrowClockwise" @click="handleReset">重置</el-button>
      </div>

      <!-- 用户表格 -->
      <el-table :data="userList" v-loading="loading" stripe>
        <el-table-column prop="userId" label="ID" width="80" />
        <el-table-column label="用户信息" min-width="200">
          <template #default="{ row }">
            <div style="display:flex;align-items:center;gap:10px">
              <el-avatar :size="36" :src="row.avatarUrl">{{ row.nickname?.charAt(0) }}</el-avatar>
              <div>
                <div style="font-weight:500">{{ row.nickname }}</div>
                <div style="font-size:12px;color:#909399">@{{ row.username }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="性别" width="80">
          <template #default="{ row }">
            {{ row.gender === 1 ? '男' : row.gender === 2 ? '女' : '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column prop="creditScore" label="信用分" width="90" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" round>
              {{ row.status === 1 ? '正常' : '已封禁' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="180" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleDetail(row)">详情</el-button>
            <el-button v-if="row.status === 1" size="small" type="danger" link @click="handleBan(row)">封禁</el-button>
            <el-button v-else size="small" type="success" link @click="handleUnban(row)">解封</el-button>
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

    <!-- 用户详情对话框 -->
    <el-dialog v-model="detailVisible" title="用户详情" width="560px" destroy-on-close>
      <el-descriptions :column="2" border v-if="currentUser">
        <el-descriptions-item label="用户ID">{{ currentUser.userId }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentUser.nickname }}</el-descriptions-item>
        <el-descriptions-item label="性别">
          {{ currentUser.gender === 1 ? '男' : currentUser.gender === 2 ? '女' : '未知' }}
        </el-descriptions-item>
        <el-descriptions-item label="生日">{{ currentUser.birthday || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="城市">{{ currentUser.city || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="信用分">{{ currentUser.creditScore }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentUser.status === 1 ? 'success' : 'danger'">
            {{ currentUser.status === 1 ? '正常' : '已封禁' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="个人简介" :span="2">{{ currentUser.bio || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="标签" :span="2">
          <template v-if="parseTags(currentUser.tags).length">
            <el-tag v-for="tag in parseTags(currentUser.tags)" :key="tag" size="small" style="margin-right:6px">{{ tag }}</el-tag>
          </template>
          <span v-else>暂无</span>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentUser.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentUser.updatedAt }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getUserList, getUserDetail, banUser, unbanUser } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UserItem, UserDetail, UserQueryParams } from '@/types/api'
import { PhMagnifyingGlass, PhArrowClockwise } from '@phosphor-icons/vue'

const loading = ref<boolean>(false)
const userList = ref<UserItem[]>([])
const total = ref<number>(0)
const currentPage = ref<number>(1)
const detailVisible = ref<boolean>(false)
const currentUser = ref<UserDetail | null>(null)

const queryParams = reactive<UserQueryParams>({ keyword: '', size: 10 })

// 获取用户列表
async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const res = await getUserList({ page: currentPage.value - 1, size: queryParams.size, keyword: queryParams.keyword })
    userList.value = res.data.list
    total.value = res.data.total
  } catch (err) { /* 错误已在拦截器中处理 */ }
  finally { loading.value = false }
}

// 搜索
function handleSearch(): void { currentPage.value = 1; fetchList() }

// 重置
function handleReset(): void { queryParams.keyword = ''; handleSearch() }

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
