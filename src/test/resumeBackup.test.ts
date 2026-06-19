import { describe, expect, test } from "vitest";
import { buildPresetState } from "../data/identityPresets";
import {
  RESUME_BACKUP_APP_ID,
  RESUME_BACKUP_VERSION,
  createResumeBackupPayload,
  parseResumeBackup
} from "../lib/resumeBackup";

describe("resume backup helpers", () => {
  test("creates versioned payload with photo data", () => {
    const state = buildPresetState("student");
    state.modules[0].kind === "personal" && ((state.modules[0].data.photoDataUrl = "data:image/jpeg;base64,test"));

    const payload = createResumeBackupPayload(state, "2026-06-19T00:00:00.000Z");

    expect(payload.app).toBe(RESUME_BACKUP_APP_ID);
    expect(payload.version).toBe(RESUME_BACKUP_VERSION);
    expect(payload.exportedAt).toBe("2026-06-19T00:00:00.000Z");
    expect(payload.data.modules[0].kind).toBe("personal");
  });

  test("parses legacy v1 payload and migrates it to v2", () => {
    const legacyPayload = {
      app: RESUME_BACKUP_APP_ID,
      version: 1,
      exportedAt: "2026-06-19T00:00:00.000Z",
      data: {
        resume: {
          personal: {
            name: "导入用户",
            title: "产品工程方向",
            phone: "13800000000",
            email: "import@example.com",
            city: "上海",
            blog: "",
            github: "",
            photoDataUrl: "",
            summary: "旧备份简介"
          },
          education: [],
          projects: [],
          internships: [],
          campus: [],
          skills: [],
          awards: ["旧证书"],
          sectionVisibility: {
            personal: true,
            education: true,
            projects: true,
            internships: true,
            campus: false,
            skills: true,
            awards: true
          },
          personalVisibility: {
            title: true,
            phone: true,
            email: true,
            city: true,
            summary: true,
            blog: false,
            github: false
          }
        },
        sectionOrder: ["personal", "education", "projects", "internships", "campus", "skills", "awards"]
      }
    };

    const result = parseResumeBackup(JSON.stringify(legacyPayload));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.schemaVersion).toBe(2);
      expect(result.state.selectedIdentity).toBe("general");
      expect(result.state.modules.some((module) => module.kind === "summary")).toBe(true);
      expect(result.state.modules.some((module) => module.kind === "certificate")).toBe(true);
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
