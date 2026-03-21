import { request } from './request'
import type { MomentQueryParams, MomentItem, PageResult } from '@/types/api'

// 获取动态列表（分页 + 搜索 + 状态筛选）
export function getMomentList(params: MomentQueryParams) {
  return request<PageResult<MomentItem>>({
    url: '/admin/moments',
    method: 'get',
    params
  })
}

// 屏蔽动态
export function blockMoment(momentId: number) {
  return request<null>({
    url: `/admin/moments/${momentId}/block`,
    method: 'put'
  })
}

// 恢复动态
export function restoreMoment(momentId: number) {
  return request<null>({
    url: `/admin/moments/${momentId}/restore`,
    method: 'put'
  })
}

// 获取动态详情
export function getMomentDetail(momentId: number) {
  return request<MomentItem>({
    url: `/admin/moments/${momentId}`,
    method: 'get'
  })
}
