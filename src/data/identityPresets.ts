import { createModuleInstance } from "../lib/moduleRegistry";
import { defaultDocumentTitle } from "../lib/documentTitle";
import { defaultResumeStyle } from "../lib/resumeStyle";
import type {
  IdentityPreset,
  ListModuleData,
  ModuleKind,
  PersonalModuleData,
  ResumeDraftState,
  ResumeModuleData,
  ResumeModuleInstance,
  StoredResumeStateV4,
  TextModuleData,
  TemplateId
} from "../types/resume";

interface PresetModuleDescriptor {
  kind: ModuleKind;
  title?: string;
}

export interface IdentityPresetConfig {
  id: IdentityPreset;
  label: string;
  intro: string;
  focusHint: string;
  moduleHints: Partial<Record<ModuleKind, string>>;
  recommendedModules: PresetModuleDescriptor[];
}

const presetConfigs: Record<IdentityPreset, IdentityPresetConfig> = {
  student: {
    id: "student",
    label: "学生",
    intro: "优先突出教育背景、项目实践、校园经历与奖项荣誉。",
    focusHint: "建议先把教育经历、项目经历和校园经历写清楚，再补奖项与技能。",
    moduleHints: {
      summary: "用 1-2 句话概括方向、优势和求职目标。",
      education: "强调教育背景、课程能力和成果证明。",
      project: "重点写你做了什么、解决了什么问题、拿到了什么结果。",
      campus: "把校园经历写成职责、动作和结果，而不是只写活动名称。",
      honor: "优先保留能证明能力与投入度的奖项或荣誉。"
    },
    recommendedModules: [
      { kind: "personal" },
      { kind: "summary" },
      { kind: "education" },
      { kind: "project" },
      { kind: "campus" },
      { kind: "honor" },
      { kind: "skills" },
      { kind: "certificate" },
      { kind: "experience", title: "实习经历" }
    ]
  },
  professional: {
    id: "professional",
    label: "职场人",
    intro: "优先突出岗位匹配、工作经验、项目成果与核心能力。",
    focusHint: "建议先写职业摘要、核心能力和最相关的工作经历，再补项目与证书。",
    moduleHints: {
      summary: "先讲清楚岗位方向、年限和最能打动招聘方的优势。",
      coreCompetency: "提炼 3-6 条核心能力，尽量贴近目标岗位。",
      experience: "写清业务场景、负责范围、动作和结果指标。",
      project: "优先保留最能证明能力的项目或业务成果。",
      highlight: "用简洁要点提炼能一眼看懂的成果亮点。"
    },
    recommendedModules: [
      { kind: "personal" },
      { kind: "summary" },
      { kind: "coreCompetency" },
      { kind: "experience", title: "工作经历" },
      { kind: "project" },
      { kind: "highlight" },
      { kind: "skills" },
      { kind: "certificate" },
      { kind: "education" }
    ]
  },
  general: {
    id: "general",
    label: "通用求职者",
    intro: "给你一个中性起点，再按目标岗位补模块和调顺序。",
    focusHint: "优先保留最有说服力的经历，并根据岗位自行微调排序。",
    moduleHints: {
      summary: "保持精简，突出岗位方向和最相关的能力。",
      education: "如教育背景有优势，可以放前；否则保持简洁即可。",
      experience: "如果经历不多，也可以先从项目经历写起。",
      project: "用结果导向的表达方式，避免只写做了什么。"
    },
    recommendedModules: [
      { kind: "personal" },
      { kind: "summary" },
      { kind: "education" },
      { kind: "experience", title: "经历" },
      { kind: "project" },
      { kind: "skills" },
      { kind: "certificate" }
    ]
  }
};

export const RESUME_TOOL_BRAND = "魔方简历";

const identityDefaultTemplates: Record<IdentityPreset, TemplateId> = {
  student: "campus",
  professional: "classic",
  general: "classic"
};

const identityEditorTitles: Record<IdentityPreset, string> = {
  student: "新建简历",
  professional: "新建简历",
  general: "新建简历"
};

const identitySwitchLabels: Record<IdentityPreset, string> = {
  student: "学生",
  professional: "职场",
  general: "通用"
};

const presetSampleData: Record<IdentityPreset, Partial<Record<ModuleKind, ResumeModuleData>>> = {
  student: {
    personal: {
      name: "宋哈娜",
      title: "前端工程师 / Web 研发实习",
      phone: "138 0013 8000",
      email: "hana.song@example.com",
      city: "北京",
      blog: "hanasong.dev",
      github: "github.com/hanasong",
      photoDataUrl: "",
      personalVisibility: {
        title: true,
        phone: true,
        email: true,
        city: true,
        blog: true,
        github: true
      }
    } satisfies PersonalModuleData,
    summary: {
      value: "计算机科学专业本科生，关注前端工程化和交互体验，熟悉 React、TypeScript 与 Vite。曾独立完成校园活动管理平台，具备从需求拆解、组件实现到性能优化的完整实践经验。"
    } satisfies TextModuleData,
    education: {
      entries: [
        {
          id: "student-education-1",
          title: "计算机科学与技术",
          org: "北京邮电大学",
          start: "2022.09",
          end: "2026.06",
          location: "北京",
          bullets: ["GPA 3.7 / 4.0，专业排名前 10%", "主修课程：数据结构、计算机网络、数据库系统、Web 前端开发"]
        }
      ]
    },
    project: {
      entries: [
        {
          id: "student-project-1",
          title: "校园活动管理平台",
          org: "前端负责人",
          start: "2025.03",
          end: "2025.06",
          location: "React / TypeScript",
          bullets: [
            "设计活动发布、报名审核、签到统计等核心流程，覆盖 3000+ 名学生使用场景",
            "封装表单、日历和数据表格组件，将重复页面开发时间减少约 40%",
            "使用路由级懒加载和接口缓存策略，首屏资源体积减少约 32%"
          ]
        },
        {
          id: "student-project-2",
          title: "简历排版编辑器",
          org: "独立开发",
          start: "2024.11",
          end: "2025.01",
          location: "Vite / Zustand",
          bullets: [
            "实现模块化简历填写、实时 A4 预览、拖拽排序和浏览器 PDF 导出",
            "沉淀可复用的数据迁移和本地备份方案，支持多版本 JSON 导入"
          ]
        }
      ]
    },
    campus: {
      entries: [
        {
          id: "student-campus-1",
          title: "技术部部长",
          org: "计算机协会",
          start: "2023.09",
          end: "2024.06",
          location: "北京",
          bullets: ["组织 8 场前端与开源主题分享，累计参与 400+ 人次", "负责社团官网维护和活动报名系统迭代"]
        }
      ]
    },
    honor: {
      items: ["校级一等奖学金（2024）", "中国大学生计算机设计大赛省级二等奖", "优秀学生干部"]
    } satisfies ListModuleData,
    skills: {
      items: ["React / Vue / TypeScript", "Vite / Webpack / Tailwind CSS", "组件化设计与前端工程化", "Git / Jest / Playwright"]
    } satisfies ListModuleData,
    certificate: {
      items: ["CET-6", "普通话二级甲等"]
    } satisfies ListModuleData,
    experience: {
      entries: [
        {
          id: "student-experience-1",
          title: "前端研发实习生",
          org: "字节跳动",
          start: "2025.07",
          end: "2025.09",
          location: "北京",
          bullets: ["参与内容运营后台组件迭代，负责筛选器和批量操作体验优化", "补充核心组件单元测试，覆盖率从 62% 提升到 78%"]
        }
      ]
    }
  },
  professional: {
    personal: {
      name: "林亦辰",
      title: "高级前端工程师",
      phone: "139 0000 2606",
      email: "lin.yichen@example.com",
      city: "上海",
      blog: "linyichen.dev",
      github: "github.com/linyc",
      photoDataUrl: "",
      personalVisibility: {
        title: true,
        phone: true,
        email: true,
        city: true,
        blog: true,
        github: true
      }
    } satisfies PersonalModuleData,
    summary: {
      value: "6 年前端研发经验，长期负责 B 端中后台和数据产品建设。熟悉 React、TypeScript、工程化治理与性能优化，能够独立推进复杂业务模块从方案设计到上线复盘。"
    } satisfies TextModuleData,
    coreCompetency: {
      items: ["复杂中后台架构设计", "前端性能优化与工程治理", "跨团队需求拆解与交付推进", "组件库建设与设计系统落地"]
    } satisfies ListModuleData,
    experience: {
      entries: [
        {
          id: "professional-experience-1",
          title: "高级前端工程师",
          org: "某互联网科技公司",
          start: "2021.07",
          end: "至今",
          location: "上海",
          bullets: [
            "负责数据运营平台核心模块，支撑 20+ 业务线日常分析和配置流程",
            "主导组件库重构，统一表单、表格和弹窗交互，减少约 35% 重复代码",
            "推动首屏性能专项优化，关键页面 LCP 从 3.8s 降至 1.9s"
          ]
        }
      ]
    },
    project: {
      entries: [
        {
          id: "professional-project-1",
          title: "企业级指标分析平台",
          org: "前端负责人",
          start: "2023.02",
          end: "2024.01",
          location: "React / Ant Design",
          bullets: ["设计可配置指标看板和权限模型，覆盖销售、运营、财务多角色使用", "建设图表配置 DSL，降低新增报表开发成本"]
        }
      ]
    },
    highlight: {
      items: ["推动 3 个核心系统从 Vue2 迁移到 React 技术栈", "累计培养 4 名初中级前端工程师独立负责业务模块"]
    } satisfies ListModuleData,
    skills: {
      items: ["React / TypeScript / Next.js", "Node.js / Vite / Webpack", "Ant Design / Design Tokens", "性能监控 / 单元测试 / E2E 测试"]
    } satisfies ListModuleData,
    certificate: {
      items: ["PMP 项目管理认证", "阿里云 ACP"]
    } satisfies ListModuleData,
    education: {
      entries: [
        {
          id: "professional-education-1",
          title: "软件工程",
          org: "华东师范大学",
          start: "2015.09",
          end: "2019.06",
          location: "上海",
          bullets: ["本科，主修软件工程、数据库系统、计算机网络"]
        }
      ]
    }
  },
  general: {
    personal: {
      name: "陈知远",
      title: "产品运营 / 项目助理",
      phone: "137 0000 8800",
      email: "chen.zhiyuan@example.com",
      city: "广州",
      blog: "",
      github: "",
      photoDataUrl: "",
      personalVisibility: {
        title: true,
        phone: true,
        email: true,
        city: true,
        blog: false,
        github: false
      }
    } satisfies PersonalModuleData,
    summary: {
      value: "具备项目执行、数据整理和跨部门沟通经验，熟悉活动运营、用户反馈跟进和基础数据分析。希望在产品运营或项目助理岗位持续积累业务理解与协作能力。"
    } satisfies TextModuleData,
    education: {
      entries: [
        {
          id: "general-education-1",
          title: "工商管理",
          org: "广东财经大学",
          start: "2020.09",
          end: "2024.06",
          location: "广州",
          bullets: ["主修市场营销、管理学、统计学和消费者行为分析"]
        }
      ]
    },
    experience: {
      entries: [
        {
          id: "general-experience-1",
          title: "运营助理",
          org: "本地生活服务公司",
          start: "2023.07",
          end: "2023.10",
          location: "广州",
          bullets: ["跟进用户活动报名和售后反馈，整理周报数据并输出优化建议", "协助完成 12 场线下活动执行，平均到场率提升至 86%"]
        }
      ]
    },
    project: {
      entries: [
        {
          id: "general-project-1",
          title: "校园二手交易调研",
          org: "项目组负责人",
          start: "2023.03",
          end: "2023.05",
          location: "广州",
          bullets: ["设计问卷并回收 500+ 份有效样本，整理用户分层和需求优先级", "输出竞品分析和 MVP 功能建议，获得课程项目优秀评价"]
        }
      ]
    },
    skills: {
      items: ["Excel / 数据透视表", "问卷调研与用户访谈", "活动执行与项目跟进", "PPT 汇报与文档整理"]
    } satisfies ListModuleData,
    certificate: {
      items: ["CET-4", "计算机二级 Office"]
    } satisfies ListModuleData
  }
};

function cloneSampleData(data: ResumeModuleData): ResumeModuleData {
  return JSON.parse(JSON.stringify(data)) as ResumeModuleData;
}

export function getIdentityPreset(identity: IdentityPreset): IdentityPresetConfig {
  return presetConfigs[identity];
}

export function getIdentityPresets(): IdentityPresetConfig[] {
  return [presetConfigs.student, presetConfigs.professional, presetConfigs.general];
}

export function getIdentityEditorTitle(identity: IdentityPreset): string {
  return identityEditorTitles[identity];
}

export function getDefaultTemplateForIdentity(identity: IdentityPreset): TemplateId {
  return identityDefaultTemplates[identity];
}

export function getIdentitySwitchLabel(identity: IdentityPreset): string {
  return identitySwitchLabels[identity];
}

export function buildPresetState(identity: IdentityPreset): StoredResumeStateV4 {
  const modules = presetConfigs[identity].recommendedModules.map((descriptor) => {
    const sampleData = presetSampleData[identity][descriptor.kind];

    return createModuleInstance(descriptor.kind, identity, {
      ...(descriptor.title ? { title: descriptor.title } : {}),
      ...(sampleData ? { data: cloneSampleData(sampleData) } : {})
    });
  });

  return {
    schemaVersion: 4,
    selectedIdentity: identity,
    documentTitle: defaultDocumentTitle,
    templateId: getDefaultTemplateForIdentity(identity),
    hasUserSelectedTemplate: false,
    resumeStyle: { ...defaultResumeStyle },
    modules,
    moduleOrder: modules.map((module) => module.id)
  };
}

export function applyIdentityPreset(
  state: ResumeDraftState,
  identity: IdentityPreset
): ResumeDraftState {
  const preset = getIdentityPreset(identity);
  const modules = [...state.modules];
  const modulesById = new Map(modules.map((module) => [module.id, module] as const));
  const orderedIds = normalizeModuleOrder(state.moduleOrder, modules);
  const recommendedIds: string[] = [];

  for (const descriptor of preset.recommendedModules) {
    const existingId = orderedIds.find((moduleId) => {
      const module = modulesById.get(moduleId);
      return module?.kind === descriptor.kind;
    });

    if (existingId) {
      const existingModule = modulesById.get(existingId);
      if (existingModule) {
        existingModule.visible = true;
      }
      recommendedIds.push(existingId);
      continue;
    }

    const nextModule = createModuleInstance(
      descriptor.kind,
      identity,
      descriptor.title ? { title: descriptor.title } : undefined
    );
    modules.push(nextModule);
    modulesById.set(nextModule.id, nextModule);
    recommendedIds.push(nextModule.id);
  }

  const extraIds = [...orderedIds, ...modules.map((module) => module.id)].filter(
    (moduleId, index, list) => list.indexOf(moduleId) === index && !recommendedIds.includes(moduleId)
  );

  return {
    selectedIdentity: identity,
    documentTitle: state.documentTitle,
    templateId: state.templateId,
    hasUserSelectedTemplate: state.hasUserSelectedTemplate,
    resumeStyle: state.resumeStyle,
    modules,
    moduleOrder: [...recommendedIds, ...extraIds]
  };
}

export function normalizeModuleOrder(moduleOrder: string[], modules: ResumeModuleInstance[]): string[] {
  const moduleIds = modules.map((module) => module.id);
  const deduped = moduleOrder.filter(
    (moduleId, index) => moduleIds.includes(moduleId) && moduleOrder.indexOf(moduleId) === index
  );

  return [...deduped, ...moduleIds.filter((moduleId) => !deduped.includes(moduleId))];
}
