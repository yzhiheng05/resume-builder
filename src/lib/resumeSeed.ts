import { buildPresetState, normalizeModuleOrder } from "../data/identityPresets";
import { multipagePrintFixture } from "../data/multipagePrintFixture";
import { cloneStoredResumeStateV3, normalizeResumeDraftState } from "./resumeMigration";
import type { ResumeDraftState, StoredResumeStateV3 } from "../types/resume";

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
  storedState: StoredResumeStateV3 | null;
}

export function cloneStoredResumeState(state: StoredResumeStateV3): StoredResumeStateV3 {
  return cloneStoredResumeStateV3(state);
}

export function getFixtureIdFromSearch(search: string): ResumeFixtureId | null {
  const params = new URLSearchParams(search);
  const value = params.get(FIXTURE_QUERY_PARAM);

  return value === MULTIPAGE_PRINT_FIXTURE_ID ? MULTIPAGE_PRINT_FIXTURE_ID : null;
}

export function getFixtureState(fixtureId: ResumeFixtureId): StoredResumeStateV3 {
  if (fixtureId === MULTIPAGE_PRINT_FIXTURE_ID) {
    return multipagePrintFixture;
  }

  return buildPresetState("general");
}

export function getDefaultStoredResumeState(): StoredResumeStateV3 {
  return buildPresetState("general");
}

export function normalizeStoredResumeState(state: StoredResumeStateV3): StoredResumeStateV3 {
  const normalized = normalizeResumeDraftState({
    selectedIdentity: state.selectedIdentity,
    templateId: state.templateId,
    hasUserSelectedTemplate: state.hasUserSelectedTemplate,
    modules: state.modules,
    moduleOrder: normalizeModuleOrder(state.moduleOrder, state.modules)
  });

  return {
    schemaVersion: 3,
    selectedIdentity: normalized.selectedIdentity ?? "general",
    templateId: normalized.templateId,
    hasUserSelectedTemplate: normalized.hasUserSelectedTemplate,
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
      templateId: fixtureState.templateId,
      hasUserSelectedTemplate: fixtureState.hasUserSelectedTemplate,
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
      templateId: normalized.templateId,
      hasUserSelectedTemplate: normalized.hasUserSelectedTemplate,
      modules: normalized.modules,
      moduleOrder: normalized.moduleOrder,
      fixtureId: null,
      hasStoredState: true
    };
  }

  return {
    selectedIdentity: null,
    templateId: "classic",
    hasUserSelectedTemplate: false,
    modules: [],
    moduleOrder: [],
    fixtureId: null,
    hasStoredState: false
  };
}
