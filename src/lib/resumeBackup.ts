import { normalizeStoredResumeState } from "./resumeSeed";
import type { StoredResumeState } from "../types/resume";

export const RESUME_BACKUP_APP_ID = "campus-resume-builder";
export const RESUME_BACKUP_VERSION = 1;

export interface ResumeBackupPayload {
  app: typeof RESUME_BACKUP_APP_ID;
  version: typeof RESUME_BACKUP_VERSION;
  exportedAt: string;
  data: StoredResumeState;
}

export type ImportResumeBackupResult =
  | { ok: true; state: StoredResumeState }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isStoredResumeState(value: unknown): value is StoredResumeState {
  if (!isRecord(value) || !isRecord(value.resume) || !Array.isArray(value.sectionOrder)) {
    return false;
  }

  return isRecord(value.resume.personal);
}

export function createResumeBackupPayload(
  state: StoredResumeState,
  exportedAt = new Date().toISOString()
): ResumeBackupPayload {
  return {
    app: RESUME_BACKUP_APP_ID,
    version: RESUME_BACKUP_VERSION,
    exportedAt,
    data: state
  };
}

export function serializeResumeBackup(state: StoredResumeState): string {
  return JSON.stringify(createResumeBackupPayload(state), null, 2);
}

export function parseResumeBackup(raw: string): ImportResumeBackupResult {
  let payload: unknown;

  try {
    payload = JSON.parse(raw);
  } catch {
    return { ok: false, error: "文件不是有效的 JSON。" };
  }

  if (!isRecord(payload)) {
    return { ok: false, error: "文件格式不正确。" };
  }

  if (payload.app !== RESUME_BACKUP_APP_ID || payload.version !== RESUME_BACKUP_VERSION) {
    return { ok: false, error: "文件不是当前应用支持的备份格式。" };
  }

  if (!isStoredResumeState(payload.data)) {
    return { ok: false, error: "文件缺少必要的简历数据。" };
  }

  return {
    ok: true,
    state: normalizeStoredResumeState(payload.data)
  };
}

export function createResumeBackupFilename(date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return `campus-resume-${stamp}.json`;
}
