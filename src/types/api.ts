// ========== 通用响应结构 ==========

/** 后端统一返回格式 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

/** 分页数据结构 */
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  size: number
  totalPages: number
}

// ========== 管理员认证 ==========

/** 登录请求参数 */
export interface LoginParams {
  username: string
  password: string
}

/** 管理员信息 */
export interface AdminInfo {
  adminId: number
  username: string
  nickname: string
  avatarUrl: string | null
  role: number
}

/** 登录返回数据（包含 token） */
export interface LoginResult extends AdminInfo {
  token: string
}

// ========== 仪表盘 ==========

/** 仪表盘统计数据 */
export interface DashboardData {
  totalUsers: number
  totalActivities: number
  totalMoments: number
  todayNewUsers: number
  todayNewActivities: number
  todayNewMoments: number
  recruitingActivities: number
  bannedUsers: number
}

// ========== 用户管理 ==========

/** 用户查询参数 */
export interface UserQueryParams {
  page?: number
  size?: number
  keyword?: string
}

/** 用户列表项 */
export interface UserItem {
  userId: number
  username: string
  nickname: string
  avatarUrl: string
  gender: number
  city: string
  creditScore: number
  status: number
  createdAt: string
}

/** 用户详情 */
export interface UserDetail extends UserItem {
  birthday: string
  bio: string
  tags: string
  updatedAt: string
}

// ========== 活动管理 ==========

/** 活动查询参数 */
export interface ActivityQueryParams {
  page?: number
  size?: number
  keyword?: string
  status?: number
}

/** 活动列表项 */
export interface ActivityItem {
  activityId: number
  title: string
  description: string
  images: string
  locationName: string
  locationAddress: string
  categoryIds: string
  startTime: string
  endTime: string
  maxParticipants: number
  paymentType: number
  status: number
  createdAt: string
  initiatorId: number
  initiatorNickname: string
  initiatorAvatar: string
  currentParticipants: number
}

// ========== 动态管理 ==========

/** 动态查询参数 */
export interface MomentQueryParams {
  page?: number
  size?: number
  keyword?: string
  status?: number
}

/** 动态列表项 */
export interface MomentItem {
  momentId: number
  content: string
  images: string
  locationName: string
  visibility: number
  likeCount: number
  commentCount: number
  viewCount: number
  status: number
  createdAt: string
  userId: number
  nickname: string
  avatarUrl: string
}
