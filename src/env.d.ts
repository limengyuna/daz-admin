/// <reference types="vite/client" />

// 声明 .vue 文件为模块，让 TypeScript 能识别
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 声明 Element Plus 中文语言包模块
declare module 'element-plus/dist/locale/zh-cn.mjs' {
  const zhCn: any
  export default zhCn
}
