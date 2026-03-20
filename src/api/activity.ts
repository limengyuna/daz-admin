import { request } from './request'
import type { ActivityQueryParams, ActivityItem, PageResult } from '@/types/api'

// 获取活动列表（分页 + 搜索 + 状态筛选）
export function getActivityList(params: ActivityQueryParams) {
  return request<PageResult<ActivityItem>>({
    url: '/admin/activities',
    method: 'get',
    params
  })
}

// 下架活动
export function cancelActivity(activityId: number) {
  return request<null>({
    url: `/admin/activities/${activityId}/cancel`,
    method: 'put'
  })
}

// 恢复活动
export function restoreActivity(activityId: number) {
  return request<null>({
    url: `/admin/activities/${activityId}/restore`,
    method: 'put'
  })
}
