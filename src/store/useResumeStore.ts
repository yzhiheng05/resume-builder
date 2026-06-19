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
import { toStoredResumeStateV3 } from "../lib/resumeMigration";
import { resolveInitialResumeSeed } from "../lib/resumeSeed";
import { loadResumeState, moveModule, saveResumeState } from "../lib/storage";
import type {
  IdentityPreset,
  ModuleKind,
  PersonalVisibleField,
  PersonalModuleData,
  ResumeDraftState,
  ResumeModuleInstance,
  ResumeModuleData,
  TemplateId,
  TextModuleData,
  TimelineEntry,
  TimelineModuleData
} from "../types/resume";

function persistState(state: ResumeDraftState) {
  const storedState = toStoredResumeStateV3(state);
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

function normalizeState(state: ResumeDraftState): ResumeDraftState {
  return {
    selectedIdentity: state.selectedIdentity,
    templateId: state.templateId,
    hasUserSelectedTemplate: state.hasUserSelectedTemplate,
    modules: state.modules.map((module) => ({
      ...module,
      data: cloneModuleData(module.data)
    })),
    moduleOrder: normalizeModuleOrder(state.moduleOrder, state.modules)
  };
}

interface ResumeState extends ResumeDraftState {
  hasStoredState: boolean;
  initializeIdentity: (identity: IdentityPreset) => void;
  switchIdentity: (identity: IdentityPreset) => void;
  setTemplate: (templateId: TemplateId) => void;
  applyIdentityRecommendation: () => void;
  replaceResumeState: (nextState: ResumeDraftState) => void;
  updateModuleTitle: (moduleId: string, title: string) => void;
  toggleModuleVisibility: (moduleId: string) => void;
  setModuleOrder: (nextOrder: string[]) => void;
  reorderModules: (moduleId: string, toIndex: number) => void;
  addModule: (kind: ModuleKind) => void;
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
    templateId: seed.templateId,
    hasUserSelectedTemplate: seed.hasUserSelectedTemplate,
    modules: seed.modules,
    moduleOrder: seed.moduleOrder
  });

  return create<ResumeState>((set, get) => ({
    ...initialState,
    hasStoredState: seed.hasStoredState,
    initializeIdentity: (identity) => {
      const nextState = normalizeState(buildPresetState(identity));
      persistState(nextState);
      set({ ...nextState, hasStoredState: true });
    },
    switchIdentity: (identity) =>
      set((state) => {
        const shouldSyncTemplate = !state.hasUserSelectedTemplate;
        const nextState = normalizeState({
          selectedIdentity: identity,
          templateId: shouldSyncTemplate ? getDefaultTemplateForIdentity(identity) : state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
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
          templateId,
          hasUserSelectedTemplate: true,
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
              templateId: state.templateId,
              hasUserSelectedTemplate: state.hasUserSelectedTemplate,
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
      set({ ...normalized, hasStoredState: true });
    },
    updateModuleTitle: (moduleId, title) =>
      set((state) => {
        const modules = state.modules.map((module) =>
          module.id === moduleId ? { ...module, title } : module
        );
        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
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
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
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
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
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
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
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

        if (!canAddMultipleModules(kind) && state.modules.some((module) => module.kind === kind)) {
          return state;
        }

        const nextModule = createModuleInstance(kind, state.selectedIdentity);
        const modules = [...state.modules, nextModule];
        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
          modules,
          moduleOrder: [...state.moduleOrder, nextModule.id]
        });
        persistState(nextState);
        return nextState;
      }),
    removeModule: (moduleId) =>
      set((state) => {
        const targetModule = state.modules.find((module) => module.id === moduleId);
        if (!targetModule || targetModule.kind === "personal") {
          return state;
        }

        const modules = state.modules.filter((module) => module.id !== moduleId);
        const nextState = normalizeState({
          selectedIdentity: state.selectedIdentity,
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
          modules,
          moduleOrder: state.moduleOrder.filter((id) => id !== moduleId)
        });
        persistState(nextState);
        return nextState;
      }),
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
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
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
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
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
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
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
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
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
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
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
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
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
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
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
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
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
          templateId: state.templateId,
          hasUserSelectedTemplate: state.hasUserSelectedTemplate,
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
