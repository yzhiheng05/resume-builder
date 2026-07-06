import { describe, expect, test } from "vitest";
import { buildPresetState } from "../data/identityPresets";
import {
  RESUME_BACKUP_APP_ID,
  RESUME_BACKUP_VERSION,
  createResumeBackupPayload,
  parseResumeBackup,
  serializeResumeBackup
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

  test("parses legacy v1 payload and migrates it to v4 with template and style defaults", () => {
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
      expect(result.state.schemaVersion).toBe(4);
      expect(result.state.selectedIdentity).toBe("general");
      expect(result.state.templateId).toBe("classic");
      expect(result.state.hasUserSelectedTemplate).toBe(false);
      expect(result.state.resumeStyle.accentColor).toBe("#3f5f68");
      expect(result.state.modules.some((module) => module.kind === "summary")).toBe(true);
      expect(result.state.modules.some((module) => module.kind === "certificate")).toBe(true);
    }
  });

  test("parses legacy v2 payload and preserves default template migration", () => {
    const state = buildPresetState("professional");
    const legacyV2Payload = {
      app: RESUME_BACKUP_APP_ID,
      version: 2,
      exportedAt: "2026-06-19T00:00:00.000Z",
      data: {
        schemaVersion: 2,
        selectedIdentity: state.selectedIdentity,
        modules: state.modules,
        moduleOrder: state.moduleOrder
      }
    };

    const result = parseResumeBackup(JSON.stringify(legacyV2Payload));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.schemaVersion).toBe(4);
      expect(result.state.templateId).toBe("classic");
      expect(result.state.hasUserSelectedTemplate).toBe(false);
      expect(result.state.resumeStyle.density).toBe("comfortable");
    }
  });

  test("serializes and parses style settings in v4 backups", () => {
    const state = {
      ...buildPresetState("general"),
      resumeStyle: {
        accentColor: "#0f766e",
        density: "compact" as const,
        sectionSpacing: "tight" as const,
        headingStyle: "bar" as const,
        fontSizePx: 15.5,
        lineHeight: 1.72,
        paragraphSpacingPx: 8,
        pageMarginXmm: 20,
        pageMarginYmm: 22
      }
    };

    const parsed = parseResumeBackup(serializeResumeBackup(state));

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.state.schemaVersion).toBe(4);
      expect(parsed.state.resumeStyle.accentColor).toBe("#0f766e");
      expect(parsed.state.resumeStyle.density).toBe("compact");
      expect(parsed.state.resumeStyle.fontSizePx).toBe(15.5);
      expect(parsed.state.resumeStyle.lineHeight).toBe(1.72);
      expect(parsed.state.resumeStyle.paragraphSpacingPx).toBe(8);
      expect(parsed.state.resumeStyle.pageMarginXmm).toBe(20);
      expect(parsed.state.resumeStyle.pageMarginYmm).toBe(22);
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
