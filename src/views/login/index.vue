<template>
  <div class="login-page">
    <!-- 左侧装饰面板 -->
    <div class="login-deco">
      <div class="deco-pattern"></div>
      <div class="deco-content">
        <PhCrosshairSimple :size="36" weight="bold" color="#fff" />
        <h2>找搭子</h2>
        <p>社交活动管理平台</p>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="login-form-side">
      <div class="login-form-wrapper">
        <div class="login-header">
          <h1>管理后台</h1>
          <p>使用管理员账号登录</p>
        </div>

        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form" @submit.prevent>
          <el-form-item prop="username">
            <label class="form-label">账号</label>
            <el-input
              v-model="loginForm.username"
              placeholder="请输入管理员账号"
              size="large"
            >
              <template #prefix><PhUser :size="16" weight="regular" /></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <label class="form-label">密码</label>
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              @keyup.enter="handleLogin"
            >
              <template #prefix><PhLock :size="16" weight="regular" /></template>
            </el-input>
          </el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '正在登录...' : '登 录' }}
          </el-button>
        </el-form>

        <p class="login-footer">找搭子 &copy; 2026 管理后台</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { login } from '@/api/auth'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import type { LoginParams } from '@/types/api'
import { PhUser, PhLock, PhCrosshairSimple } from '@phosphor-icons/vue'

const router = useRouter()
const adminStore = useAdminStore()
const loginFormRef = ref<FormInstance>()
const loading = ref<boolean>(false)

// 登录表单数据
const loginForm = reactive<LoginParams>({
  username: '',
  password: ''
})

// 表单验证规则
const loginRules = {
  username: [{ required: true, message: '请输入管理员账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 处理登录
async function handleLogin() {
  const valid = await loginFormRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const res = await login(loginForm)
    const { token, ...info } = res.data
    localStorage.setItem('admin_token', token)
    adminStore.setAdminInfo(info)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (err) {
    // 错误已在 Axios 拦截器中处理
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  width: 100%;
  height: 100vh;
  display: flex;
}

/* 左侧装饰面板 - 深色几何风 */
.login-deco {
  flex: 0 0 42%;
  background: linear-gradient(160deg, #111827 0%, #1e293b 50%, #0f172a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  .deco-pattern {
    position: absolute;
    inset: 0;
    /* 几何网格纹理 */
    background-image:
      linear-gradient(rgba(67, 97, 238, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(67, 97, 238, 0.06) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse at 60% 50%, black 30%, transparent 72%);
  }

  .deco-content {
    position: relative;
    z-index: 1;
    text-align: center;
    animation: fadeInUp 0.6s ease both;

    h2 {
      font-family: var(--font-display);
      font-size: 32px;
      font-weight: 700;
      color: #fff;
      margin: 16px 0 8px;
      letter-spacing: 2px;
    }

    p {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.4);
      letter-spacing: 1px;
    }
  }
}

/* 右侧表单区 */
.login-form-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafbfc;
  padding: 40px;
}

.login-form-wrapper {
  width: 380px;
  animation: fadeInUp 0.5s ease 0.15s both;
}

.login-header {
  margin-bottom: 36px;

  h1 {
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: 6px;
  }

  p {
    font-size: 14px;
    color: var(--color-text-muted);
  }
}

.form-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 22px;
  }

  :deep(.el-input__wrapper) {
    border-radius: 8px;
    box-shadow: 0 0 0 1px var(--color-border);
    transition: box-shadow 0.2s;

    &:hover {
      box-shadow: 0 0 0 1px var(--color-text-muted);
    }

    &.is-focus {
      box-shadow: 0 0 0 2px var(--color-primary);
    }
  }

  .login-btn {
    width: 100%;
    height: 44px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 2px;
    margin-top: 4px;
    background: var(--color-primary);
    border: none;
    transition: all 0.25s;

    &:hover {
      background: var(--color-primary-light);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(67, 97, 238, 0.3);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

.login-footer {
  text-align: center;
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 40px;
}

/* 进入动画（复用全局 keyframes） */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式：小屏隐藏左侧装饰 */
@media (max-width: 900px) {
  .login-deco { display: none; }
  .login-form-side { padding: 24px; }
}
</style>
