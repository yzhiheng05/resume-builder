import { describe, expect, test } from "vitest";
import { defaultResume, defaultSectionOrder } from "../data/defaultResume";
import {
  RESUME_BACKUP_APP_ID,
  RESUME_BACKUP_VERSION,
  createResumeBackupPayload,
  parseResumeBackup
} from "../lib/resumeBackup";

describe("resume backup helpers", () => {
  test("creates versioned payload with photo data", () => {
    const state = {
      resume: {
        ...defaultResume,
        personal: {
          ...defaultResume.personal,
          photoDataUrl: "data:image/jpeg;base64,test"
        }
      },
      sectionOrder: defaultSectionOrder
    };

    const payload = createResumeBackupPayload(state, "2026-06-19T00:00:00.000Z");

    expect(payload.app).toBe(RESUME_BACKUP_APP_ID);
    expect(payload.version).toBe(RESUME_BACKUP_VERSION);
    expect(payload.exportedAt).toBe("2026-06-19T00:00:00.000Z");
    expect(payload.data.resume.personal.photoDataUrl).toBe("data:image/jpeg;base64,test");
  });

  test("parses valid payload and normalizes missing optional fields", () => {
    const legacyPayload = {
      app: RESUME_BACKUP_APP_ID,
      version: RESUME_BACKUP_VERSION,
      exportedAt: "2026-06-19T00:00:00.000Z",
      data: {
        resume: {
          ...defaultResume,
          personal: {
            name: "导入用户",
            title: "产品工程方向",
            phone: "13800000000",
            email: "import@example.com",
            city: "上海",
            summary: "旧备份简介"
          }
        },
        sectionOrder: defaultSectionOrder
      }
    };

    const result = parseResumeBackup(JSON.stringify(legacyPayload));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.resume.personal.name).toBe("导入用户");
      expect(result.state.resume.personal.blog).toBe("");
      expect(result.state.resume.personal.photoDataUrl).toBe("");
      expect(result.state.resume.personalVisibility.phone).toBe(true);
    }
  });

  test("rejects invalid json and unsupported payload", () => {
    expect(parseResumeBackup("{").ok).toBe(false);
    expect(parseResumeBackup(JSON.stringify({ app: "other", version: 1, data: {} })).ok).toBe(false);
    expect(
      parseResumeBackup(
        JSON.stringify({
          app: RESUME_BACKUP_APP_ID,
          version: RESUME_BACKUP_VERSION,
          data: {}
        })
      ).ok
    ).toBe(false);
  });
});
