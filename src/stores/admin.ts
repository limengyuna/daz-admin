import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AdminInfo } from '@/types/api'

export const useAdminStore = defineStore('admin', () => {
  // 管理员信息（从 localStorage 恢复）
  const adminInfo = ref<AdminInfo | null>(
    JSON.parse(localStorage.getItem('admin_info') || 'null')
  )

  // 设置管理员信息
  function setAdminInfo(info: AdminInfo): void {
    adminInfo.value = info
    localStorage.setItem('admin_info', JSON.stringify(info))
  }

  // 清除管理员信息（退出登录）
  function clearAdminInfo(): void {
    adminInfo.value = null
    localStorage.removeItem('admin_info')
    localStorage.removeItem('admin_token')
  }

  return { adminInfo, setAdminInfo, clearAdminInfo }
})
