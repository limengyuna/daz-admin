<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
      <div class="logo-container">
        <PhCrosshairSimple :size="26" weight="bold" color="#409eff" class="logo-icon" />
        <span v-show="!isCollapse" class="logo-title">找搭子管理后台</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        :collapse="isCollapse"
        background-color="transparent"
        text-color="#8b8fa3"
        active-text-color="#409eff"
        :collapse-transition="false"
      >
        <el-menu-item v-for="item in menuList" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧内容区 -->
    <el-container>
      <!-- 顶栏 -->
      <el-header class="layout-header">
        <div class="header-left">
          <PhList v-if="isCollapse" :size="22" class="collapse-btn" @click="isCollapse = false" />
          <PhX v-else :size="22" weight="bold" class="collapse-btn" @click="isCollapse = true" />
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="admin-info">
              <el-avatar :size="32" :src="adminStore.adminInfo?.avatarUrl">
                {{ adminStore.adminInfo?.nickname?.charAt(0) || '管' }}
              </el-avatar>
              <span class="admin-name">{{ adminStore.adminInfo?.nickname || '管理员' }}</span>
              <PhCaretDown :size="14" />
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <PhSignOut :size="16" style="margin-right: 6px" />
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区域，带页面切换动画 -->
      <el-main class="layout-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, markRaw, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { ElMessageBox } from 'element-plus'
import {
  PhCrosshairSimple,
  PhList,
  PhX,
  PhCaretDown,
  PhSignOut,
  PhChartBar,
  PhUsers,
  PhFlag,
  PhChatDots
} from '@phosphor-icons/vue'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

// 侧边栏是否折叠
const isCollapse = ref(false)

// 当前激活的菜单项
const activeMenu = computed(() => route.path)

// 菜单项类型
interface MenuItem {
  path: string
  title: string
  icon: Component
}

// 菜单列表 - 使用 Phosphor 图标组件
const menuList: MenuItem[] = [
  { path: '/dashboard', title: '仪表盘', icon: markRaw(PhChartBar) },
  { path: '/users', title: '用户管理', icon: markRaw(PhUsers) },
  { path: '/activities', title: '活动管理', icon: markRaw(PhFlag) },
  { path: '/moments', title: '动态管理', icon: markRaw(PhChatDots) }
]

// 下拉菜单命令处理
function handleCommand(command: string) {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      adminStore.clearAdminInfo()
      router.push('/login')
    }).catch(() => {})
  }
}
</script>

<style scoped>
/* 页面切换动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}
.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
/* 折叠按钮 */
.collapse-btn {
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}
.collapse-btn:hover {
  color: #409eff;
}
</style>
