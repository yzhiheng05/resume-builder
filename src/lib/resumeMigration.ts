import { applyIdentityPreset, normalizeModuleOrder } from "../data/identityPresets";
import {
  cloneModuleData,
  createEmptyPersonalModuleData,
  createModuleInstance,
  defaultPersonalVisibility
} from "./moduleRegistry";
import type {
  IdentityPreset,
  LegacyStoredResumeState,
  ResumeDraftState,
  ResumeModuleInstance,
  StoredResumeStateV2
} from "../types/resume";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isIdentityPreset(value: unknown): value is IdentityPreset {
  return value === "student" || value === "professional" || value === "general";
}

function isModuleInstance(value: unknown): value is ResumeModuleInstance {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.kind === "string" &&
    typeof value.title === "string" &&
    typeof value.visible === "boolean" &&
    "data" in value
  );
}

function isStoredResumeStateV2(value: unknown): value is StoredResumeStateV2 {
  return (
    isRecord(value) &&
    value.schemaVersion === 2 &&
    isIdentityPreset(value.selectedIdentity) &&
    Array.isArray(value.modules) &&
    value.modules.every(isModuleInstance) &&
    Array.isArray(value.moduleOrder) &&
    value.moduleOrder.every((item) => typeof item === "string")
  );
}

function isLegacyStoredResumeState(value: unknown): value is LegacyStoredResumeState {
  return (
    isRecord(value) &&
    isRecord(value.resume) &&
    Array.isArray(value.sectionOrder) &&
    isRecord(value.resume.personal) &&
    Array.isArray(value.resume.education) &&
    Array.isArray(value.resume.projects) &&
    Array.isArray(value.resume.internships) &&
    Array.isArray(value.resume.campus) &&
    Array.isArray(value.resume.skills) &&
    Array.isArray(value.resume.awards)
  );
}

export function cloneStoredResumeStateV2(state: StoredResumeStateV2): StoredResumeStateV2 {
  return JSON.parse(JSON.stringify(state)) as StoredResumeStateV2;
}

export function normalizeResumeDraftState(state: ResumeDraftState): ResumeDraftState {
  const dedupedModules = state.modules.filter(
    (module, index, list) => list.findIndex((current) => current.id === module.id) === index
  );

  return {
    selectedIdentity: state.selectedIdentity,
    modules: dedupedModules.map((module) => ({
      ...module,
      data: cloneModuleData(module.data)
    })),
    moduleOrder: normalizeModuleOrder(state.moduleOrder, dedupedModules)
  };
}

export function toStoredResumeStateV2(state: ResumeDraftState): StoredResumeStateV2 | null {
  if (!state.selectedIdentity) {
    return null;
  }

  const normalized = normalizeResumeDraftState(state);

  return {
    schemaVersion: 2,
    selectedIdentity: normalized.selectedIdentity ?? state.selectedIdentity,
    modules: normalized.modules,
    moduleOrder: normalized.moduleOrder
  };
}

export function migrateLegacyStoredResumeState(
  legacyState: LegacyStoredResumeState,
  selectedIdentity: IdentityPreset = "general"
): StoredResumeStateV2 {
  const personalVisibility = {
    ...defaultPersonalVisibility,
    ...(legacyState.resume.personalVisibility ?? {})
  };

  const personalModule = createModuleInstance("personal", selectedIdentity, {
    title: "个人信息",
    visible: legacyState.resume.sectionVisibility.personal !== false,
    data: {
      ...createEmptyPersonalModuleData(),
      name: legacyState.resume.personal.name ?? "",
      title: legacyState.resume.personal.title ?? "",
      phone: legacyState.resume.personal.phone ?? "",
      email: legacyState.resume.personal.email ?? "",
      city: legacyState.resume.personal.city ?? "",
      blog: legacyState.resume.personal.blog ?? "",
      github: legacyState.resume.personal.github ?? "",
      photoDataUrl: legacyState.resume.personal.photoDataUrl ?? "",
      personalVisibility
    }
  });

  const summaryModule = createModuleInstance("summary", selectedIdentity, {
    visible: legacyState.resume.personalVisibility.summary !== false,
    data: { value: legacyState.resume.personal.summary ?? "" }
  });

  const educationModule = createModuleInstance("education", selectedIdentity, {
    visible: legacyState.resume.sectionVisibility.education !== false,
    data: { entries: legacyState.resume.education }
  });

  const projectModule = createModuleInstance("project", selectedIdentity, {
    visible: legacyState.resume.sectionVisibility.projects !== false,
    data: { entries: legacyState.resume.projects }
  });

  const experienceModule = createModuleInstance("experience", selectedIdentity, {
    title: selectedIdentity === "student" ? "实习经历" : selectedIdentity === "professional" ? "工作经历" : "经历",
    visible: legacyState.resume.sectionVisibility.internships !== false,
    data: { entries: legacyState.resume.internships }
  });

  const campusModule = createModuleInstance("campus", selectedIdentity, {
    visible: legacyState.resume.sectionVisibility.campus !== false,
    data: { entries: legacyState.resume.campus }
  });

  const skillsModule = createModuleInstance("skills", selectedIdentity, {
    visible: legacyState.resume.sectionVisibility.skills !== false,
    data: { items: legacyState.resume.skills }
  });

  const certificateModule = createModuleInstance("certificate", selectedIdentity, {
    visible: legacyState.resume.sectionVisibility.awards !== false,
    data: { items: legacyState.resume.awards }
  });

  const modules = [
    personalModule,
    summaryModule,
    educationModule,
    projectModule,
    experienceModule,
    campusModule,
    skillsModule,
    certificateModule
  ];

  const moduleByLegacySection = {
    personal: personalModule.id,
    education: educationModule.id,
    projects: projectModule.id,
    internships: experienceModule.id,
    campus: campusModule.id,
    skills: skillsModule.id,
    awards: certificateModule.id
  } as const;

  const moduleOrder = legacyState.sectionOrder
    .map((sectionId) => moduleByLegacySection[sectionId])
    .filter((moduleId, index, list) => list.indexOf(moduleId) === index);

  const applied = normalizeResumeDraftState(
    applyIdentityPreset(
      {
        selectedIdentity,
        modules,
        moduleOrder: [personalModule.id, summaryModule.id, ...moduleOrder.filter((moduleId) => moduleId !== personalModule.id)]
      },
      selectedIdentity
    )
  );

  return {
    schemaVersion: 2,
    selectedIdentity: applied.selectedIdentity ?? selectedIdentity,
    modules: applied.modules,
    moduleOrder: applied.moduleOrder
  };
}

export function migrateUnknownStoredResumeState(
  value: unknown,
  selectedIdentity: IdentityPreset = "general"
): StoredResumeStateV2 | null {
  if (isStoredResumeStateV2(value)) {
    const normalized = normalizeResumeDraftState({
      selectedIdentity: value.selectedIdentity,
      modules: value.modules,
      moduleOrder: value.moduleOrder
    });

    return {
      schemaVersion: 2,
      selectedIdentity: normalized.selectedIdentity ?? value.selectedIdentity,
      modules: normalized.modules,
      moduleOrder: normalized.moduleOrder
    };
  }

  if (isLegacyStoredResumeState(value)) {
    return migrateLegacyStoredResumeState(value, selectedIdentity);
  }

  return null;
}
