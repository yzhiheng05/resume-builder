import { defaultResumeStyle } from "../lib/resumeStyle";
import type { StoredResumeStateV4 } from "../types/resume";

export const multipagePrintFixture: StoredResumeStateV4 = {
  schemaVersion: 4,
  selectedIdentity: "student",
  templateId: "campus",
  hasUserSelectedTemplate: false,
  resumeStyle: { ...defaultResumeStyle },
  modules: [
    {
      id: "personal-1",
      kind: "personal",
      title: "个人信息",
      visible: true,
      data: {
        name: "林知夏",
        title: "前端 / 产品工程方向校招",
        phone: "139-1111-2222",
        email: "linzhixia@example.com",
        city: "上海",
        blog: "linzhixia.dev",
        github: "github.com/linzhixia",
        photoDataUrl: "",
        personalVisibility: {
          title: true,
          phone: true,
          email: true,
          city: true,
          blog: true,
          github: true
        }
      }
    },
    {
      id: "summary-1",
      kind: "summary",
      title: "职业摘要",
      visible: true,
      data: {
        value:
          "具备前端开发、内容结构化表达与项目协同经验，关注复杂信息在 Web 端的可读性、可维护性与交付稳定性，希望在校招岗位中继续深耕体验与工程质量。"
      }
    },
    {
      id: "education-1",
      kind: "education",
      title: "教育经历",
      visible: true,
      data: {
        entries: [
          {
            id: "education-entry-1",
            title: "同济大学",
            org: "软件工程",
            start: "2021.09",
            end: "2025.06",
            location: "上海",
            bullets: [
              "核心课程：数据结构、计算机网络、数据库系统、操作系统、软件工程、编译原理。",
              "绩点 3.82 / 4.0，连续两年获得校级奖学金。",
              "参与课程大作业答辩与协作开发，长期担任小组中的前端与文档负责人。"
            ]
          }
        ]
      }
    },
    {
      id: "project-1",
      kind: "project",
      title: "项目经历",
      visible: true,
      data: {
        entries: [
          {
            id: "project-entry-1",
            title: "校园简历编辑器",
            org: "个人项目",
            start: "2025.02",
            end: "2025.06",
            location: "上海",
            bullets: [
              "从 0 搭建 React + TypeScript 前端工程，完成模块化编辑、实时预览、拖拽排序与本地持久化能力。",
              "围绕打印导出场景设计中文优先的 A4 预览样式，并对多页分页、条目断裂、边距与非打印元素隐藏进行针对性收口。",
              "补齐渲染、排序、状态持久化与打印 helper 测试，确保关键交互在多次迭代后仍有稳定回归依据。"
            ]
          },
          {
            id: "project-entry-2",
            title: "校内活动报名平台",
            org: "课程项目",
            start: "2024.09",
            end: "2024.12",
            location: "上海",
            bullets: [
              "负责活动列表、报名流程和状态回显页面开发，支持活动容量校验、报名状态切换与结果展示。",
              "为报名表单设计更细的错误提示与字段分组，减少用户二次提交与表单填写中断。",
              "联调阶段整理接口字段、时间格式与异常提示差异，降低前后端沟通成本。"
            ]
          }
        ]
      }
    },
    {
      id: "campus-1",
      kind: "campus",
      title: "校园经历",
      visible: true,
      data: {
        entries: [
          {
            id: "campus-entry-1",
            title: "学生会宣传部部长",
            org: "校学生会",
            start: "2023.09",
            end: "2024.06",
            location: "上海",
            bullets: [
              "统筹活动宣传节奏、视觉物料与线上内容发布，协调多部门在活动前后的信息同步。",
              "负责制定推文结构、海报文案与报名说明模板，提升大型活动的信息传达效率。"
            ]
          },
          {
            id: "campus-entry-2",
            title: "新生训练营辅导员",
            org: "学院志愿项目",
            start: "2022.09",
            end: "2022.11",
            location: "上海",
            bullets: [
              "组织信息答疑、学习经验分享与材料收集，帮助新生适应课程安排与校内事务流程。",
              "输出多份新生常见问题说明文档，并持续根据反馈优化内容结构。"
            ]
          }
        ]
      }
    },
    {
      id: "honor-1",
      kind: "honor",
      title: "奖项荣誉",
      visible: true,
      data: {
        items: ["校级一等奖学金", "优秀学生干部", "互联网+ 校赛二等奖", "院级优秀志愿者"]
      }
    },
    {
      id: "skills-1",
      kind: "skills",
      title: "技能",
      visible: true,
      data: {
        items: [
          "React",
          "TypeScript",
          "Vite",
          "Zustand",
          "Vitest",
          "界面排版与信息结构化表达",
          "英语 CET-6"
        ]
      }
    },
    {
      id: "certificate-1",
      kind: "certificate",
      title: "证书",
      visible: true,
      data: {
        items: ["英语 CET-6 证书", "普通话二级甲等"]
      }
    },
    {
      id: "experience-1",
      kind: "experience",
      title: "实习经历",
      visible: true,
      data: {
        entries: [
          {
            id: "experience-entry-1",
            title: "前端开发实习生",
            org: "某教育科技公司",
            start: "2024.07",
            end: "2024.10",
            location: "上海",
            bullets: [
              "参与业务后台课程配置页面开发，负责列表筛选、详情抽屉、表单校验与提交反馈等交互。",
              "梳理历史页面中重复出现的提示文案、字段布局与边距规则，推动组件级统一收口，减少新增页面的样式漂移。",
              "协助排查打印与导出相关问题，针对页面缩放、边距与不该进入打印内容的操作区做样式修复。"
            ]
          },
          {
            id: "experience-entry-2",
            title: "产品工程实习生",
            org: "某效率工具团队",
            start: "2024.03",
            end: "2024.06",
            location: "上海",
            bullets: [
              "在设计和研发之间承担桥接工作，输出交互说明、边界状态与验收清单，并跟进页面实现一致性。",
              "参与复杂表单与信息展示页的内容结构优化，重点关注高密度信息在桌面端的可扫读性。"
            ]
          }
        ]
      }
    }
  ],
  moduleOrder: [
    "personal-1",
    "summary-1",
    "education-1",
    "project-1",
    "campus-1",
    "honor-1",
    "skills-1",
    "certificate-1",
    "experience-1"
  ]
};
