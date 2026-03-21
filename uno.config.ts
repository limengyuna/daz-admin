import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [presetUno()],
  theme: {
    colors: {
      // 映射 CSS 变量为 UnoCSS 主题色
      primary: 'var(--color-primary)',
      'primary-light': 'var(--color-primary-light)',
      'primary-pale': 'var(--color-primary-pale)',
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      danger: 'var(--color-danger)',
      info: 'var(--color-info)',
      surface: 'var(--color-surface)',
      bg: 'var(--color-bg)',
      border: 'var(--color-border)',
      't-main': 'var(--color-text)',
      't-secondary': 'var(--color-text-secondary)',
      't-muted': 'var(--color-text-muted)',
    },
    borderRadius: {
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
    },
    boxShadow: {
      sm: 'var(--shadow-sm)',
      md: 'var(--shadow-md)',
      lg: 'var(--shadow-lg)',
    },
    fontFamily: {
      display: 'var(--font-display)',
      'display-num': 'var(--font-display-num)',
      body: 'var(--font-body)',
    },
  },
  // 自定义快捷方式，方便复用
  shortcuts: {
    // 页面卡片
    'card': 'bg-surface border border-border rounded-lg p-6 shadow-sm',
    // 搜索工具栏
    'toolbar-label': 'text-11px font-600 text-t-muted tracking-widest uppercase',
    // 单元格用户信息
    'cell-flex': 'flex items-center gap-2',
  },
})
