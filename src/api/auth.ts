import { request } from './request'
import type { LoginParams, LoginResult } from '@/types/api'

// 管理员登录
export function login(data: LoginParams) {
  return request<LoginResult>({
    url: '/admin/auth/login',
    method: 'post',
    data
  })
}
