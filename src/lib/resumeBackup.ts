import { migrateUnknownStoredResumeState } from "./resumeMigration";
import type { StoredResumeStateV2 } from "../types/resume";

export const RESUME_BACKUP_APP_ID = "campus-resume-builder";
export const RESUME_BACKUP_VERSION = 2;

export interface ResumeBackupPayloadV2 {
  app: typeof RESUME_BACKUP_APP_ID;
  version: typeof RESUME_BACKUP_VERSION;
  exportedAt: string;
  data: StoredResumeStateV2;
}

export type ImportResumeBackupResult =
  | { ok: true; state: StoredResumeStateV2 }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function createResumeBackupPayload(
  state: StoredResumeStateV2,
  exportedAt = new Date().toISOString()
): ResumeBackupPayloadV2 {
  return {
    app: RESUME_BACKUP_APP_ID,
    version: RESUME_BACKUP_VERSION,
    exportedAt,
    data: state
  };
}

export function serializeResumeBackup(state: StoredResumeStateV2): string {
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

  if (payload.app !== RESUME_BACKUP_APP_ID) {
    return { ok: false, error: "文件不是当前应用支持的备份格式。" };
  }

  if (payload.version !== 1 && payload.version !== RESUME_BACKUP_VERSION) {
    return { ok: false, error: "文件不是当前应用支持的备份格式。" };
  }

  const nextState = migrateUnknownStoredResumeState(payload.data, "general");
  if (!nextState) {
    return { ok: false, error: "文件缺少必要的简历数据。" };
  }

  return {
    ok: true,
    state: nextState
  };
}

export function createResumeBackupFilename(date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return `campus-resume-${stamp}.json`;
}
