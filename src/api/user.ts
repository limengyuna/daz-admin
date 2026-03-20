import { request } from './request'
import type { UserQueryParams, UserItem, UserDetail, PageResult } from '@/types/api'

// 获取用户列表（分页 + 搜索）
export function getUserList(params: UserQueryParams) {
  return request<PageResult<UserItem>>({
    url: '/admin/users',
    method: 'get',
    params
  })
}

// 获取用户详情
export function getUserDetail(userId: number) {
  return request<UserDetail>({
    url: `/admin/users/${userId}`,
    method: 'get'
  })
}

// 封禁用户
export function banUser(userId: number) {
  return request<null>({
    url: `/admin/users/${userId}/ban`,
    method: 'put'
  })
}

// 解封用户
export function unbanUser(userId: number) {
  return request<null>({
    url: `/admin/users/${userId}/unban`,
    method: 'put'
  })
}
