# 技术栈

## 1. 基础信息

- 仓库/目录：`/Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder`
- 运行方式：Vite 单页应用，本地开发通过 `npm run dev`
- 主要语言：TypeScript
- 主要框架：React 18

## 2. 依赖与环境

- 包管理：npm
- 构建工具：Vite
- 测试工具：Vitest + React Testing Library
- 环境变量：第一版预计无需环境变量

## 3. 架构要点

- 关键模块：
  - 编辑器状态层
  - 模块化表单编辑区
  - A4 简历预览区
  - 打印导出样式层
- 数据流：表单更新 Zustand 状态；状态同时驱动编辑区和预览区；拖动排序只修改 `sectionOrder`；状态同步到 `localStorage`
- 外部依赖：
  - `zustand`：轻量状态管理
  - `@dnd-kit`：预览区模块拖动排序

## 4. 常用命令

```bash
# 启动
npm run dev

# 测试
npm test

# 构建
npm run build
```
