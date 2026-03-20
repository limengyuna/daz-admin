---
description: 使用 ui-ux-pro-max 技能搜索设计系统建议（Windows 编码修复版）
---

// turbo-all

由于 Windows PowerShell 默认使用 GBK 编码，无法显示 ui-ux-pro-max 脚本输出中的 emoji 字符，
每次调用时必须设置 UTF-8 编码。以下是正确的调用模板：

## 1. 生成设计系统（Design System）

```powershell
chcp 65001; $env:PYTHONIOENCODING='utf-8'; [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; python "C:\Users\86191\.gemini\antigravity\global_skills\ui-ux-pro-max-skill\src\ui-ux-pro-max\scripts\search.py" "<查询关键词>" --design-system -p "<项目名>"
```

## 2. 按领域搜索（Domain Search）

```powershell
chcp 65001; $env:PYTHONIOENCODING='utf-8'; [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; python "C:\Users\86191\.gemini\antigravity\global_skills\ui-ux-pro-max-skill\src\ui-ux-pro-max\scripts\search.py" "<关键词>" --domain <domain名>
```

可用的 domain: style, color, typography, landing, product, ux, chart, prompt

## 3. 按技术栈搜索（Stack Search）

```powershell
chcp 65001; $env:PYTHONIOENCODING='utf-8'; [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; python "C:\Users\86191\.gemini\antigravity\global_skills\ui-ux-pro-max-skill\src\ui-ux-pro-max\scripts\search.py" "<关键词>" --stack <stack名>
```

可用的 stack: html-tailwind, react, nextjs, vue, svelte, swiftui, react-native, flutter, shadcn, jetpack-compose

## 重要提示

- **所有命令必须以 `chcp 65001; $env:PYTHONIOENCODING='utf-8'; [Console]::OutputEncoding = [System.Text.Encoding]::UTF8;` 开头**
- 这三行设置是必须的，缺一不可：
  1. `chcp 65001` - 切换控制台编码为 UTF-8
  2. `$env:PYTHONIOENCODING='utf-8'` - Python 输出编码为 UTF-8
  3. `[Console]::OutputEncoding = UTF8` - .NET 控制台输出编码为 UTF-8
- 不要将输出重定向到文件，直接读取命令输出即可
