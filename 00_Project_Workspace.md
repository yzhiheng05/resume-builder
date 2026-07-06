# 项目工作台

## 1. 项目概览

- 项目名称：campus-resume-builder
- 当前阶段：Canva 感结构化简历编辑器已实现，并持续完善纸面排版自定义能力
- 当前目标：继续打磨手动排版控制、AI 润色、照片裁剪和移动端完整编辑体验
- 最近更新时间：2026-07-06

## 2. 阅读顺序

继续本项目之前，按以下顺序阅读：

1. `/Users/yzh/AI/CodexProject/CodexWorkspace/00_Global/00_Workspace.md`
2. `/Users/yzh/AI/CodexProject/CodexWorkspace/00_Global/10_Compounding_Log.md`
3. `/Users/yzh/AI/CodexProject/CodexWorkspace/00_Global/20_Pitfall_Log.md`
4. `/Users/yzh/AI/CodexProject/CodexWorkspace/00_Global/30_SOP.md`
5. 当前文档
6. `/Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder/10_Requirements.md`
7. `/Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder/20_Tech_Stack.md`
8. `/Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder/docs/superpowers/specs/2026-06-18-campus-resume-builder-design.md`
9. `/Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder/docs/superpowers/specs/2026-07-05-canva-style-resume-editor-design.md`
10. `/Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder/docs/superpowers/plans/2026-07-05-canva-style-resume-editor.md`

## 3. 文档索引

- `10_Requirements.md`：需求、范围、验收标准
- `20_Tech_Stack.md`：技术栈、环境、架构、依赖
- `30_Dev_Log.md`：开发记录、关键决策、验证结果
- `40_Pitfall_Log.md`：项目特有踩坑记录
- `50_SOP.md`：项目特有 SOP
- `60_Retrospective.md`：阶段复盘
- `docs/superpowers/specs/2026-06-18-campus-resume-builder-design.md`：已确认 MVP 设计稿
- `docs/superpowers/specs/2026-07-05-canva-style-resume-editor-design.md`：Canva 感结构化编辑器设计稿
- `docs/superpowers/plans/2026-07-05-canva-style-resume-editor.md`：Canva 感结构化编辑器实现计划
- `HANDOFF.md`：当前实现状态、验证结果和新会话交接提示词

## 4. 当前状态

- 已完成：通用求职身份预设；模块实例模型；多模板预览；三栏式模块库 / A4 画布 / 属性面板；模块添加、选中、复制、删除、显隐、排序；主题色、字号、行距、段落间距、页边距等纸面样式手动控制；本地持久化；JSON 导入 / 导出；浏览器打印 / PDF 导出；入口页、暗色工具栏、中性画布工作台与中心模板选择区视觉改造
- 进行中：后续产品体验和模板表达打磨
- 待处理：更丰富模板缩略图、AI 润色、照片裁剪、移动端完整编辑体验
- 已知风险：PDF 导出稳定性仍依赖浏览器打印能力；后续若扩展任意坐标自由布局，会明显增加分页、对齐和打印复杂度

## 5. 备注

- 本项目当前定位为桌面端优先的通用求职简历编辑器，采用 Canva 感结构化编辑体验，但不做完整自由设计器。
- 当前项目已经完成首版实现并推送到 GitHub：`https://github.com/yzhiheng05/resume-builder`
