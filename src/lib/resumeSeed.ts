import { defaultResume, defaultSectionOrder } from "../data/defaultResume";
import { multipagePrintFixture } from "../data/multipagePrintFixture";
import type { StoredResumeState } from "../types/resume";

export const FIXTURE_QUERY_PARAM = "fixture";
export const MULTIPAGE_PRINT_FIXTURE_ID = "multipage-print";

export type ResumeFixtureId = typeof MULTIPAGE_PRINT_FIXTURE_ID;

export interface ResolvedResumeSeed extends StoredResumeState {
  fixtureId: ResumeFixtureId | null;
}

interface ResolveResumeSeedOptions {
  isDev: boolean;
  search: string;
  storedState: StoredResumeState | null;
}

const defaultStoredResumeState: StoredResumeState = {
  resume: defaultResume,
  sectionOrder: defaultSectionOrder
};

export function cloneStoredResumeState(state: StoredResumeState): StoredResumeState {
  return JSON.parse(JSON.stringify(state)) as StoredResumeState;
}

export function getFixtureIdFromSearch(search: string): ResumeFixtureId | null {
  const params = new URLSearchParams(search);
  const value = params.get(FIXTURE_QUERY_PARAM);

  return value === MULTIPAGE_PRINT_FIXTURE_ID ? MULTIPAGE_PRINT_FIXTURE_ID : null;
}

export function getFixtureState(fixtureId: ResumeFixtureId): StoredResumeState {
  if (fixtureId === MULTIPAGE_PRINT_FIXTURE_ID) {
    return multipagePrintFixture;
  }

  return defaultStoredResumeState;
}

export function getDefaultStoredResumeState(): StoredResumeState {
  return defaultStoredResumeState;
}

export function resolveInitialResumeSeed({
  isDev,
  search,
  storedState
}: ResolveResumeSeedOptions): ResolvedResumeSeed {
  const fixtureId = isDev ? getFixtureIdFromSearch(search) : null;

  if (fixtureId) {
    return {
      ...cloneStoredResumeState(getFixtureState(fixtureId)),
      fixtureId
    };
  }

  if (storedState) {
    return {
      ...cloneStoredResumeState(storedState),
      fixtureId: null
    };
  }

  return {
    ...cloneStoredResumeState(getDefaultStoredResumeState()),
    fixtureId: null
  };
}
