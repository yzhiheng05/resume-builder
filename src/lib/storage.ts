import { migrateUnknownStoredResumeState } from "./resumeMigration";
import type { StoredResumeStateV3 } from "../types/resume";

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

export function moveModule(order: string[], id: string, toIndex: number) {
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

export function saveResumeState(payload: StoredResumeStateV3) {
  const storage = getBrowserStorage();
  if (!storage) {
    return;
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function loadResumeState(): StoredResumeStateV3 | null {
  const storage = getBrowserStorage();
  if (!storage) {
    return null;
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return migrateUnknownStoredResumeState(JSON.parse(raw), "general");
  } catch {
    return null;
  }
}
