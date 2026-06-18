import type { ResumeData, SectionId, StoredResumeState } from "../types/resume";

export const STORAGE_KEY = "campus-resume-builder";

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function moveSection(order: SectionId[], id: SectionId, toIndex: number) {
  const next = [...order];
  const fromIndex = next.indexOf(id);
  if (fromIndex < 0) {
    return next;
  }

  const [item] = next.splice(fromIndex, 1);
  const safeIndex = Math.max(0, Math.min(toIndex, next.length));
  next.splice(safeIndex, 0, item);
  return next;
}

export function toggleSectionVisibility(
  visibility: Record<SectionId, boolean>,
  id: SectionId
) {
  return { ...visibility, [id]: !visibility[id] };
}

export function saveResumeState(payload: StoredResumeState) {
  const storage = getBrowserStorage();
  if (!storage) {
    return;
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function loadResumeState(): StoredResumeState | null {
  const storage = getBrowserStorage();
  if (!storage) {
    return null;
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredResumeState;
  } catch {
    return null;
  }
}

export function createEmptyResume(resume: ResumeData): ResumeData {
  return {
    ...resume,
    education: [],
    projects: [],
    internships: [],
    campus: [],
    skills: [],
    awards: []
  };
}
