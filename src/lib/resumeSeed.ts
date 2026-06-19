import { buildPresetState, normalizeModuleOrder } from "../data/identityPresets";
import { multipagePrintFixture } from "../data/multipagePrintFixture";
import { cloneStoredResumeStateV2, normalizeResumeDraftState } from "./resumeMigration";
import type { ResumeDraftState, StoredResumeStateV2 } from "../types/resume";

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
  storedState: StoredResumeStateV2 | null;
}

export function cloneStoredResumeState(state: StoredResumeStateV2): StoredResumeStateV2 {
  return cloneStoredResumeStateV2(state);
}

export function getFixtureIdFromSearch(search: string): ResumeFixtureId | null {
  const params = new URLSearchParams(search);
  const value = params.get(FIXTURE_QUERY_PARAM);

  return value === MULTIPAGE_PRINT_FIXTURE_ID ? MULTIPAGE_PRINT_FIXTURE_ID : null;
}

export function getFixtureState(fixtureId: ResumeFixtureId): StoredResumeStateV2 {
  if (fixtureId === MULTIPAGE_PRINT_FIXTURE_ID) {
    return multipagePrintFixture;
  }

  return buildPresetState("general");
}

export function getDefaultStoredResumeState(): StoredResumeStateV2 {
  return buildPresetState("general");
}

export function normalizeStoredResumeState(state: StoredResumeStateV2): StoredResumeStateV2 {
  const normalized = normalizeResumeDraftState({
    selectedIdentity: state.selectedIdentity,
    modules: state.modules,
    moduleOrder: normalizeModuleOrder(state.moduleOrder, state.modules)
  });

  return {
    schemaVersion: 2,
    selectedIdentity: normalized.selectedIdentity ?? "general",
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
      modules: normalized.modules,
      moduleOrder: normalized.moduleOrder,
      fixtureId: null,
      hasStoredState: true
    };
  }

  return {
    selectedIdentity: null,
    modules: [],
    moduleOrder: [],
    fixtureId: null,
    hasStoredState: false
  };
}
