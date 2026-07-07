import { create } from "zustand";
import {
  applyIdentityPreset,
  buildPresetState,
  getDefaultTemplateForIdentity,
  normalizeModuleOrder
} from "../data/identityPresets";
import {
  canAddMultipleModules,
  cloneModuleData,
  createModuleInstance,
  createTimelineEntry,
  isListModuleData,
  isPersonalModuleData,
  isTextModuleData,
  isTimelineModuleData
} from "../lib/moduleRegistry";
import { toStoredResumeStateV4 } from "../lib/resumeMigration";
import { normalizeDocumentTitle } from "../lib/documentTitle";
import { defaultResumeStyle, normalizeResumeStyle } from "../lib/resumeStyle";
import { resolveInitialResumeSeed } from "../lib/resumeSeed";
import { loadResumeState, moveModule, saveResumeState } from "../lib/storage";
import type {
  IdentityPreset,
  ModuleKind,
  PersonalVisibleField,
  PersonalModuleData,
  ResumeStyleSettings,
  ResumeDraftState,
  ResumeModuleInstance,
  ResumeModuleData,
  TemplateId,
  TextModuleData,
  TimelineEntry,
  TimelineModuleData
} from "../types/resume";

function persistState(state: ResumeDraftState) {
  const storedState = toStoredResumeStateV4(state);
  if (storedState) {
    saveResumeState(storedState);
  }
}

const initialSeed = resolveInitialResumeSeed({
  isDev: import.meta.env.DEV,
  search: typeof window === "undefined" ? "" : window.location.search,
  storedState: loadResumeState()
});

function findModuleIndex(modules: ResumeModuleInstance[], moduleId: string) {
  return modules.findIndex((module) => module.id === moduleId);
}

function getNextActiveModuleId(moduleOrder: string[], removedModuleId: string) {
  const removedIndex = moduleOrder.indexOf(removedModuleId);
  const nextOrder = moduleOrder.filter((moduleId) => moduleId !== removedModuleId);

  if (removedIndex === -1) {
    return nextOrder[0] ?? null;
  }

  return nextOrder[removedIndex] ?? nextOrder[removedIndex - 1] ?? null;
}

function normalizeState(state: ResumeDraftState): ResumeDraftState {
  return {
    selectedIdentity: state.selectedIdentity,
    documentTitle: normalizeDocumentTitle(state.documentTitle),
    templateId: state.templateId,
    hasUserSelectedTemplate: state.hasUserSelectedTemplate,
    resumeStyle: normalizeResumeStyle(state.resumeStyle ?? defaultResumeStyle),
    modules: state.modules.map((module) => ({
      ...module,
      data: cloneModuleData(module.data)
    })),
    moduleOrder: normalizeModuleOrder(state.moduleOrder, state.modules)
  };
}

interface ResumeState extends ResumeDraftState {
  hasStoredState: boolean;
  activeModuleId: string | null;
  initializeIdentity: (identity: IdentityPreset) => void;
  switchIdentity: (identity: IdentityPreset) => void;
  setTemplate: (templateId: TemplateId) => void;
  updateDocumentTitle: (documentTitle: string) => void;
  applyIdentityRecommendation: () => void;
  replaceResumeState: (nextState: ResumeDraftState) => void;
  selectModule: (moduleId: string | null) => void;
  updateResumeStyle: (nextStyle: Partial<ResumeStyleSettings>) => void;
  updateModuleTitle: (moduleId: string, title: string) => void;
  toggleModuleVisibility: (moduleId: string) => void;
  setModuleOrder: (nextOrder: string[]) => void;
  reorderModules: (moduleId: string, toIndex: number) => void;
  addModule: (kind: ModuleKind) => void;
  duplicateModule: (moduleId: string) => void;
  deleteModule: (moduleId: string) => void;
  removeModule: (moduleId: string) => void;
  updatePersonalField: (moduleId: string, field: keyof Omit<PersonalModuleData, "personalVisibility">, value: string) => void;
  togglePersonalField: (moduleId: string, field: PersonalVisibleField) => void;
  updateTextValue: (moduleId: string, value: string) => void;
  updateTimelineEntry: (moduleId: string, index: number, patch: Partial<TimelineEntry>) => void;
  addTimelineEntry: (moduleId: string) => void;
  removeTimelineEntry: (moduleId: string, index: number) => void;
  updateListItem: (moduleId: string, index: number, value: string) => void;
  addListItem: (moduleId: string) => void;
  removeListItem: (moduleId: string, index: number) => void;
  reset: () => void;
}

export function createResumeStore(seed: typeof initialSeed = initialSeed) {
  const initialState = normalizeState({
    selectedIdentity: seed.selectedIdentity,
    documentTitle: seed.documentTitle,
    templateId: seed.templateId,
    hasUserSelectedTemplate: seed.hasUserSelectedTemplate,
    resumeStyle: seed.resumeStyle,
    modules: seed.modules,
    moduleOrder: seed.moduleOrder
  });

  return create<ResumeState>((set, get) => ({
    ...initialState,
    hasStoredState: seed.hasStoredState,
    activeModuleId: initialState.moduleOrder[0] ?? null,
    selectModule: (moduleId) => set({ activeModuleId: moduleId }),
    initializeIdentity: (identity) => {
      const nextState = normalizeState(buildPresetState(identity));
      persistState(nextState);
      set({ ...nextState, hasStoredState: true, activeModuleId: nextState.moduleOrder[0] ?? null });
    },
    switchIdentity: (identity) =>
      set((state) => {
        const shouldSyncTemplate = !state.hasUserSelectedTemplate;
        const nextState = normalizeState({
          selectedIdentity: identity,
          documentTitle: state.documentTitle,
          templateId: shouldSyncTemplate ? getDefaultTemplateForIdentity(identity) : state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
          resumeStyle: state.resumeStyle,
          modules: state.modules,
          moduleOrder: state.moduleOrder
        });
        persistState(nextState);
        return nextState;
      }),
    setTemplate: (templateId) =>
      set((state) => {
        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          documentTitle: state.documentTitle,
          templateId,
          hasUserSelectedTemplate: true,
          resumeStyle: state.resumeStyle,
          modules: state.modules,
          moduleOrder: state.moduleOrder
        });
        persistState(nextState);
        return nextState;
      }),
    updateDocumentTitle: (documentTitle) =>
      set((state) => {
        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          documentTitle,
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
          resumeStyle: state.resumeStyle,
          modules: state.modules,
          moduleOrder: state.moduleOrder
        });
        persistState(nextState);
        return nextState;
      }),
    applyIdentityRecommendation: () =>
      set((state) => {
        if (!state.selectedIdentity) {
          return state;
        }

        const nextState = normalizeState(
          applyIdentityPreset(
            {
              selectedIdentity: state.selectedIdentity,
              documentTitle: state.documentTitle,
              templateId: state.templateId,
              hasUserSelectedTemplate: state.hasUserSelectedTemplate,
              resumeStyle: state.resumeStyle,
              modules: state.modules,
              moduleOrder: state.moduleOrder
            },
            state.selectedIdentity
          )
        );

        persistState(nextState);
        return nextState;
      }),
    replaceResumeState: (nextState) => {
      const normalized = normalizeState(nextState);
      persistState(normalized);
      set({ ...normalized, hasStoredState: true, activeModuleId: normalized.moduleOrder[0] ?? null });
    },
    updateResumeStyle: (nextStyle) =>
      set((state) => {
        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          documentTitle: state.documentTitle,
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
          resumeStyle: normalizeResumeStyle({
            ...state.resumeStyle,
            ...nextStyle
          }),
          modules: state.modules,
          moduleOrder: state.moduleOrder
        });
        persistState(nextState);
        return nextState;
      }),
    updateModuleTitle: (moduleId, title) =>
      set((state) => {
        const modules = state.modules.map((module) =>
          module.id === moduleId ? { ...module, title } : module
        );
        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          documentTitle: state.documentTitle,
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
          resumeStyle: state.resumeStyle,
          modules,
          moduleOrder: state.moduleOrder
        });
        persistState(nextState);
        return nextState;
      }),
    toggleModuleVisibility: (moduleId) =>
      set((state) => {
        const modules = state.modules.map((module) =>
          module.id === moduleId ? { ...module, visible: !module.visible } : module
        );
        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          documentTitle: state.documentTitle,
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
          resumeStyle: state.resumeStyle,
          modules,
          moduleOrder: state.moduleOrder
        });
        persistState(nextState);
        return nextState;
      }),
    setModuleOrder: (nextOrder) =>
      set((state) => {
        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          documentTitle: state.documentTitle,
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
          resumeStyle: state.resumeStyle,
          modules: state.modules,
          moduleOrder: nextOrder
        });
        persistState(nextState);
        return nextState;
      }),
    reorderModules: (moduleId, toIndex) =>
      set((state) => {
        const moduleOrder = moveModule(state.moduleOrder, moduleId, toIndex);
        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          documentTitle: state.documentTitle,
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
          resumeStyle: state.resumeStyle,
          modules: state.modules,
          moduleOrder
        });
        persistState(nextState);
        return nextState;
      }),
    addModule: (kind) =>
      set((state) => {
        if (!state.selectedIdentity) {
          return state;
        }

        if (!canAddMultipleModules(kind)) {
          const existingModule = state.modules.find((module) => module.kind === kind);
          if (existingModule) {
            return { activeModuleId: existingModule.id };
          }
        }

        const nextModule = createModuleInstance(kind, state.selectedIdentity);
        const modules = [...state.modules, nextModule];
        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          documentTitle: state.documentTitle,
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
          resumeStyle: state.resumeStyle,
          modules,
          moduleOrder: [...state.moduleOrder, nextModule.id]
        });
        persistState(nextState);
        return { ...nextState, activeModuleId: nextModule.id };
      }),
    duplicateModule: (moduleId) =>
      set((state) => {
        if (!state.selectedIdentity) {
          return state;
        }

        const targetIndex = findModuleIndex(state.modules, moduleId);
        const targetModule = state.modules[targetIndex];

        if (!targetModule || !canAddMultipleModules(targetModule.kind)) {
          return state;
        }

        const copiedModule = createModuleInstance(targetModule.kind, state.selectedIdentity, {
          title: targetModule.title,
          visible: targetModule.visible,
          data: cloneModuleData(targetModule.data)
        });
        const modules = [...state.modules];
        modules.splice(targetIndex + 1, 0, copiedModule);

        const orderIndex = state.moduleOrder.indexOf(moduleId);
        const moduleOrder = [...state.moduleOrder];
        moduleOrder.splice(orderIndex === -1 ? moduleOrder.length : orderIndex + 1, 0, copiedModule.id);

        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          documentTitle: state.documentTitle,
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
          resumeStyle: state.resumeStyle,
          modules,
          moduleOrder
        });
        persistState(nextState);
        return { ...nextState, activeModuleId: copiedModule.id };
      }),
    deleteModule: (moduleId) =>
      set((state) => {
        const targetModule = state.modules.find((module) => module.id === moduleId);
        if (!targetModule || targetModule.kind === "personal") {
          return state;
        }

        const modules = state.modules.filter((module) => module.id !== moduleId);
        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          documentTitle: state.documentTitle,
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
          resumeStyle: state.resumeStyle,
          modules,
          moduleOrder: state.moduleOrder.filter((id) => id !== moduleId)
        });
        persistState(nextState);
        return {
          ...nextState,
          activeModuleId:
            state.activeModuleId === moduleId
              ? getNextActiveModuleId(state.moduleOrder, moduleId)
              : state.activeModuleId
        };
      }),
    removeModule: (moduleId) => get().deleteModule(moduleId),
    updatePersonalField: (moduleId, field, value) =>
      set((state) => {
        const modules = state.modules.map((module) => {
          if (module.id !== moduleId || !isPersonalModuleData(module.data)) {
            return module;
          }

          return {
            ...module,
            data: {
              ...module.data,
              [field]: value
            }
          };
        });

        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          documentTitle: state.documentTitle,
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
          resumeStyle: state.resumeStyle,
          modules,
          moduleOrder: state.moduleOrder
        });
        persistState(nextState);
        return nextState;
      }),
    togglePersonalField: (moduleId, field) =>
      set((state) => {
        const modules = state.modules.map((module) => {
          if (module.id !== moduleId || !isPersonalModuleData(module.data)) {
            return module;
          }

          return {
            ...module,
            data: {
              ...module.data,
              personalVisibility: {
                ...module.data.personalVisibility,
                [field]: !module.data.personalVisibility[field]
              }
            }
          };
        });

        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          documentTitle: state.documentTitle,
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
          resumeStyle: state.resumeStyle,
          modules,
          moduleOrder: state.moduleOrder
        });
        persistState(nextState);
        return nextState;
      }),
    updateTextValue: (moduleId, value) =>
      set((state) => {
        const modules = state.modules.map((module) => {
          if (module.id !== moduleId || !isTextModuleData(module.data)) {
            return module;
          }

          return {
            ...module,
            data: {
              value
            } satisfies TextModuleData
          };
        });

        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          documentTitle: state.documentTitle,
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
          resumeStyle: state.resumeStyle,
          modules,
          moduleOrder: state.moduleOrder
        });
        persistState(nextState);
        return nextState;
      }),
    updateTimelineEntry: (moduleId, index, patch) =>
      set((state) => {
        const modules = state.modules.map((module) => {
          if (module.id !== moduleId || !isTimelineModuleData(module.data)) {
            return module;
          }

          const entries = module.data.entries.map((entry, entryIndex) =>
            entryIndex === index ? { ...entry, ...patch } : entry
          );

          return {
            ...module,
            data: { entries } satisfies TimelineModuleData
          };
        });

        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          documentTitle: state.documentTitle,
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
          resumeStyle: state.resumeStyle,
          modules,
          moduleOrder: state.moduleOrder
        });
        persistState(nextState);
        return nextState;
      }),
    addTimelineEntry: (moduleId) =>
      set((state) => {
        const modules = state.modules.map((module) => {
          if (module.id !== moduleId || !isTimelineModuleData(module.data)) {
            return module;
          }

          return {
            ...module,
            data: {
              entries: [...module.data.entries, createTimelineEntry()]
            } satisfies TimelineModuleData
          };
        });

        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          documentTitle: state.documentTitle,
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
          resumeStyle: state.resumeStyle,
          modules,
          moduleOrder: state.moduleOrder
        });
        persistState(nextState);
        return nextState;
      }),
    removeTimelineEntry: (moduleId, index) =>
      set((state) => {
        const modules = state.modules.map((module) => {
          if (module.id !== moduleId || !isTimelineModuleData(module.data)) {
            return module;
          }

          return {
            ...module,
            data: {
              entries: module.data.entries.filter((_, currentIndex) => currentIndex !== index)
            } satisfies TimelineModuleData
          };
        });

        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          documentTitle: state.documentTitle,
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
          resumeStyle: state.resumeStyle,
          modules,
          moduleOrder: state.moduleOrder
        });
        persistState(nextState);
        return nextState;
      }),
    updateListItem: (moduleId, index, value) =>
      set((state) => {
        const modules = state.modules.map((module) => {
          if (module.id !== moduleId || !isListModuleData(module.data)) {
            return module;
          }

          const items = [...module.data.items];
          items[index] = value;

          return {
            ...module,
            data: { items }
          };
        });

        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          documentTitle: state.documentTitle,
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
          resumeStyle: state.resumeStyle,
          modules,
          moduleOrder: state.moduleOrder
        });
        persistState(nextState);
        return nextState;
      }),
    addListItem: (moduleId) =>
      set((state) => {
        const modules = state.modules.map((module) => {
          if (module.id !== moduleId || !isListModuleData(module.data)) {
            return module;
          }

          return {
            ...module,
            data: {
              items: [...module.data.items, ""]
            }
          };
        });

        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          documentTitle: state.documentTitle,
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
          resumeStyle: state.resumeStyle,
          modules,
          moduleOrder: state.moduleOrder
        });
        persistState(nextState);
        return nextState;
      }),
    removeListItem: (moduleId, index) =>
      set((state) => {
        const modules = state.modules.map((module) => {
          if (module.id !== moduleId || !isListModuleData(module.data)) {
            return module;
          }

          return {
            ...module,
            data: {
              items: module.data.items.filter((_, currentIndex) => currentIndex !== index)
            }
          };
        });

        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          documentTitle: state.documentTitle,
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
          resumeStyle: state.resumeStyle,
          modules,
          moduleOrder: state.moduleOrder
        });
        persistState(nextState);
        return nextState;
      }),
    reset: () =>
      set((state) => {
        const identity = state.selectedIdentity ?? "general";
        const nextState = normalizeState(buildPresetState(identity));
        persistState(nextState);
        return nextState;
      })
  }));
}

export const useResumeStore = createResumeStore(initialSeed);
