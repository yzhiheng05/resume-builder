import { buildPresetState, normalizeModuleOrder } from "../data/identityPresets";
import { multipagePrintFixture } from "../data/multipagePrintFixture";
import { cloneStoredResumeStateV4, normalizeResumeDraftState } from "./resumeMigration";
import type { ResumeDraftState, StoredResumeStateV4 } from "../types/resume";

export const FIXTURE_QUERY_PARAM = "fixture";
export const MULTIPAGE_PRINT_FIXTURE_ID = "multipage-print";

export type ResumeFixtureId = typeof MULTIPAGE_PRINT_FIXTURE_ID;

export interface ResolvedResumeSeed extends ResumeDraftState {
  fixtureId: ResumeFixtureId | null;
  hasStoredState: boolean;
}

interface ResolveResumeSeedOptions {
  isDev: boolean;
  search: string;
  storedState: StoredResumeStateV4 | null;
}

export function cloneStoredResumeState(state: StoredResumeStateV4): StoredResumeStateV4 {
  return cloneStoredResumeStateV4(state);
}

export function getFixtureIdFromSearch(search: string): ResumeFixtureId | null {
  const params = new URLSearchParams(search);
  const value = params.get(FIXTURE_QUERY_PARAM);

  return value === MULTIPAGE_PRINT_FIXTURE_ID ? MULTIPAGE_PRINT_FIXTURE_ID : null;
}

export function getFixtureState(fixtureId: ResumeFixtureId): StoredResumeStateV4 {
  if (fixtureId === MULTIPAGE_PRINT_FIXTURE_ID) {
    return multipagePrintFixture;
  }

  return buildPresetState("general");
}

export function getDefaultStoredResumeState(): StoredResumeStateV4 {
  return buildPresetState("general");
}

export function normalizeStoredResumeState(state: StoredResumeStateV4): StoredResumeStateV4 {
  const normalized = normalizeResumeDraftState({
    selectedIdentity: state.selectedIdentity,
    documentTitle: state.documentTitle,
    templateId: state.templateId,
    hasUserSelectedTemplate: state.hasUserSelectedTemplate,
    resumeStyle: state.resumeStyle,
    modules: state.modules,
    moduleOrder: normalizeModuleOrder(state.moduleOrder, state.modules)
  });

  return {
    schemaVersion: 4,
    selectedIdentity: normalized.selectedIdentity ?? "general",
    documentTitle: normalized.documentTitle,
    templateId: normalized.templateId,
    hasUserSelectedTemplate: normalized.hasUserSelectedTemplate,
    resumeStyle: normalized.resumeStyle,
    modules: normalized.modules,
    moduleOrder: normalized.moduleOrder
  };
}

export function resolveInitialResumeSeed({
  isDev,
  search,
  storedState
}: ResolveResumeSeedOptions): ResolvedResumeSeed {
  const fixtureId = isDev ? getFixtureIdFromSearch(search) : null;

  if (fixtureId) {
    const fixtureState = normalizeStoredResumeState(cloneStoredResumeState(getFixtureState(fixtureId)));

    return {
      selectedIdentity: fixtureState.selectedIdentity,
      documentTitle: fixtureState.documentTitle,
      templateId: fixtureState.templateId,
      hasUserSelectedTemplate: fixtureState.hasUserSelectedTemplate,
      resumeStyle: fixtureState.resumeStyle,
      modules: fixtureState.modules,
      moduleOrder: fixtureState.moduleOrder,
      fixtureId,
      hasStoredState: true
    };
  }

  if (storedState) {
    const normalized = normalizeStoredResumeState(cloneStoredResumeState(storedState));

    return {
      selectedIdentity: normalized.selectedIdentity,
      documentTitle: normalized.documentTitle,
      templateId: normalized.templateId,
      hasUserSelectedTemplate: normalized.hasUserSelectedTemplate,
      resumeStyle: normalized.resumeStyle,
      modules: normalized.modules,
      moduleOrder: normalized.moduleOrder,
      fixtureId: null,
      hasStoredState: true
    };
  }

  return {
    selectedIdentity: null,
    documentTitle: getDefaultStoredResumeState().documentTitle,
    templateId: "classic",
    hasUserSelectedTemplate: false,
    resumeStyle: getDefaultStoredResumeState().resumeStyle,
    modules: [],
    moduleOrder: [],
    fixtureId: null,
    hasStoredState: false
  };
}
