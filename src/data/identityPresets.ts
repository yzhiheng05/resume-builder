import { createModuleInstance } from "../lib/moduleRegistry";
import type {
  IdentityPreset,
  ModuleKind,
  ResumeDraftState,
  ResumeModuleInstance,
  StoredResumeStateV2
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

export function getIdentityPreset(identity: IdentityPreset): IdentityPresetConfig {
  return presetConfigs[identity];
}

export function getIdentityPresets(): IdentityPresetConfig[] {
  return [presetConfigs.student, presetConfigs.professional, presetConfigs.general];
}

export function buildPresetState(identity: IdentityPreset): StoredResumeStateV2 {
  const modules = presetConfigs[identity].recommendedModules.map((descriptor) =>
    createModuleInstance(descriptor.kind, identity, descriptor.title ? { title: descriptor.title } : undefined)
  );

  return {
    schemaVersion: 2,
    selectedIdentity: identity,
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
