# 找搭子管理后台 - 项目规则

## 技术栈
- Vite + Vue 3 (`<script setup>`) + TypeScript + Element Plus + Pinia
- 样式：SCSS scoped + CSS 变量（`src/styles/index.scss`）
- 图标：`@phosphor-icons/vue`（页面级） / 内联 SVG stroke（仪表盘）
- 图表：ECharts 5

## 配色

| 令牌 | 值 | 用途 |
|------|-----|------|
| `--color-primary` | `#4361ee` | 主色 |
| `--color-success` | `#2ec4b6` | 成功/在线 |
| `--color-warning` | `#f4a261` | 警告 |
| `--color-danger` | `#e63946` | 危险/封禁 |
| `--color-bg` | `#f5f6fa` | 页面背景 |
| `--color-surface` | `#ffffff` | 卡片背景 |
| `--color-text` | `#1d2939` | 主文字 |
| `--color-text-muted` | `#98a2b3` | 弱文字 |
| `--color-border` | `#eaecf0` | 边框 |
| `--dash-bg` | `#0f1729` | 仪表盘深色背景 |
| `--dash-text` | `#e2e8f0` | 仪表盘文字 |

- 品牌渐变：`linear-gradient(135deg, #1a2744 0%, #1e3a5f 40%, #2a4480 100%)`

## 字体
- 展示字体：`--font-display: 'DM Sans', 'Noto Sans SC'`
- 数字字体：`--font-display-num: 'Outfit', 'DM Sans'`
- 正文字体：`--font-body: 'Noto Sans SC', 'DM Sans'`

## 圆角 & 阴影
- `--radius-sm: 6px`（按钮/输入框） · `--radius-md: 10px`（小卡片） · `--radius-lg: 14px`（页面卡片） · `--radius-xl: 20px`（Banner）
- `--shadow-sm`（默认） · `--shadow-md`（hover） · `--shadow-lg`（弹窗）

## 禁止的设计模式
- ❌ 图标套色块（icon-in-a-box）→ ✅ SVG 直接着色，`opacity: 0.7`
- ❌ 竖线色块 + 标题 → ✅ 小号弱色 uppercase 文字
- ❌ 所有卡片完全对称 → ✅ 有视觉节奏变化
- ❌ 紫色渐变白底配色
- ❌ Emoji 作为图标

## 代码规范
- 所有注释使用中文
- 组件使用 `<script setup lang="ts">`
- 页面级图标用 `@phosphor-icons/vue`，仪表盘用内联 SVG（`stroke-width: 1.5`）

## 样式规范 & 重构方向
- **当前方案**：SCSS scoped，全局令牌在 `src/styles/index.scss`
- **目标方案**：迁移到 UnoCSS 原子化 CSS，减少 scoped 样式代码量
- **迁移规则**：
  - 新增页面/组件必须使用原子类，禁止新写大段 scoped CSS
  - 已有页面逐步重构，优先重构样式超过 100 行的页面
  - 全局 CSS 变量保留在 `index.scss`，原子类通过 `theme` 配置引用
  - 仪表盘等复杂动画场景允许保留少量 scoped CSS（如 `@keyframes`、伪元素）

## 性能优化
- ECharts 按需引入（`import * as echarts from 'echarts'` → 按需 `import { BarChart }` ）
- 路由懒加载：`() => import('@/views/xxx/index.vue')`
- 大列表使用虚拟滚动（当数据超过 100 条时）
- 图片资源使用 WebP 格式，头像加 `loading="lazy"`
