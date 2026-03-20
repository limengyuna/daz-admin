import { request } from './request'
import type { DashboardData } from '@/types/api'

// 获取仪表盘统计数据
export function getDashboard() {
  return request<DashboardData>({
    url: '/admin/dashboard',
    method: 'get'
  })
}
