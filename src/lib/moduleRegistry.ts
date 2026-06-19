import type {
  IdentityPreset,
  ListModuleData,
  ModuleKind,
  ModuleShape,
  PersonalModuleData,
  PersonalVisibleField,
  ResumeModuleData,
  ResumeModuleInstance,
  TextModuleData,
  TimelineEntry,
  TimelineModuleData
} from "../types/resume";

export const defaultPersonalVisibility: Record<PersonalVisibleField, boolean> = {
  title: true,
  phone: true,
  email: true,
  city: true,
  blog: false,
  github: false
};

const moduleLabels: Record<ModuleKind, string> = {
  personal: "个人信息",
  summary: "职业摘要",
  education: "教育经历",
  experience: "经历",
  project: "项目经历",
  skills: "技能",
  certificate: "证书",
  campus: "校园经历",
  honor: "奖项荣誉",
  coreCompetency: "核心能力",
  highlight: "个人亮点"
};

const moduleShapes: Record<ModuleKind, ModuleShape> = {
  personal: "personal",
  summary: "text",
  education: "timeline",
  experience: "timeline",
  project: "timeline",
  skills: "list",
  certificate: "list",
  campus: "timeline",
  honor: "list",
  coreCompetency: "list",
  highlight: "list"
};

const moduleMultiplicity: Record<ModuleKind, boolean> = {
  personal: false,
  summary: true,
  education: true,
  experience: true,
  project: true,
  skills: true,
  certificate: true,
  campus: true,
  honor: true,
  coreCompetency: true,
  highlight: true
};

const moduleCatalog: ModuleKind[] = [
  "summary",
  "education",
  "experience",
  "project",
  "skills",
  "certificate",
  "campus",
  "honor",
  "coreCompetency",
  "highlight"
];

let nextModuleId = 1;
let nextTimelineId = 1;

export function getModuleCatalog(): ModuleKind[] {
  return [...moduleCatalog];
}

export function getModuleLabel(kind: ModuleKind): string {
  return moduleLabels[kind];
}

export function getModuleShape(kind: ModuleKind): ModuleShape {
  return moduleShapes[kind];
}

export function canAddMultipleModules(kind: ModuleKind): boolean {
  return moduleMultiplicity[kind];
}

export function createTimelineEntry(seed?: string): TimelineEntry {
  const id = seed ?? `timeline-${nextTimelineId++}`;

  return {
    id,
    title: "",
    org: "",
    start: "",
    end: "",
    location: "",
    bullets: [""]
  };
}

export function createEmptyModuleData(kind: ModuleKind): ResumeModuleData {
  switch (kind) {
    case "personal":
      return createEmptyPersonalModuleData();
    case "summary":
      return { value: "" } satisfies TextModuleData;
    case "education":
    case "experience":
    case "project":
    case "campus":
      return { entries: [createTimelineEntry()] } satisfies TimelineModuleData;
    case "skills":
    case "certificate":
    case "honor":
    case "coreCompetency":
    case "highlight":
      return { items: [""] } satisfies ListModuleData;
    default:
      return { value: "" } satisfies TextModuleData;
  }
}

export function createEmptyPersonalModuleData(): PersonalModuleData {
  return {
    name: "",
    title: "",
    phone: "",
    email: "",
    city: "",
    blog: "",
    github: "",
    photoDataUrl: "",
    personalVisibility: { ...defaultPersonalVisibility }
  };
}

export function getDefaultModuleTitle(kind: ModuleKind, identity: IdentityPreset): string {
  if (kind === "experience") {
    if (identity === "student") {
      return "实习经历";
    }

    if (identity === "professional") {
      return "工作经历";
    }
  }

  return getModuleLabel(kind);
}

export function createModuleInstance(
  kind: ModuleKind,
  identity: IdentityPreset,
  options?: Partial<Pick<ResumeModuleInstance, "id" | "title" | "visible" | "data">>
): ResumeModuleInstance {
  return {
    id: options?.id ?? `${kind}-${nextModuleId++}`,
    kind,
    title: options?.title ?? getDefaultModuleTitle(kind, identity),
    visible: options?.visible ?? true,
    data: options?.data ?? createEmptyModuleData(kind)
  };
}

export function cloneModuleData<T extends ResumeModuleData>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export function isPersonalModuleData(data: ResumeModuleData): data is PersonalModuleData {
  return "photoDataUrl" in data && "personalVisibility" in data;
}

export function isTextModuleData(data: ResumeModuleData): data is TextModuleData {
  return "value" in data;
}

export function isTimelineModuleData(data: ResumeModuleData): data is TimelineModuleData {
  return "entries" in data;
}

export function isListModuleData(data: ResumeModuleData): data is ListModuleData {
  return "items" in data;
}
