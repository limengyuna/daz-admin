import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import type { ApiResponse } from '@/types/api'
import { API_BASE } from '@/config'

// 创建 Axios 实例
const service: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000
})

// 请求拦截器 - 自动携带 Token
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一错误处理
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      // 401 未登录或无权限，跳转登录页
      if (res.code === 401) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_info')
        router.push('/login')
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res as any
  },
  (error: any) => {
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

// 封装请求方法，返回带类型的响应
export function request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return service(config) as Promise<ApiResponse<T>>
}

export default service
