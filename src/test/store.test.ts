import { act } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";
import { buildPresetState } from "../data/identityPresets";
import { multipagePrintFixture } from "../data/multipagePrintFixture";
import { isPersonalModuleData } from "../lib/moduleRegistry";
import { migrateLegacyStoredResumeState } from "../lib/resumeMigration";
import { loadResumeState, moveModule, STORAGE_KEY } from "../lib/storage";
import {
  MULTIPAGE_PRINT_FIXTURE_ID,
  getDefaultStoredResumeState,
  resolveInitialResumeSeed
} from "../lib/resumeSeed";
import { createResumeStore, useResumeStore } from "../store/useResumeStore";

function createMemoryStorage(): Storage {
  const data = new Map<string, string>();

  return {
    get length() {
      return data.size;
    },
    clear() {
      data.clear();
    },
    getItem(key) {
      return data.has(key) ? data.get(key)! : null;
    },
    key(index) {
      return [...data.keys()][index] ?? null;
    },
    removeItem(key) {
      data.delete(key);
    },
    setItem(key, value) {
      data.set(key, value);
    }
  };
}

const storage = createMemoryStorage();
Object.defineProperty(window, "localStorage", {
  value: storage,
  configurable: true
});

describe("resume helpers", () => {
  beforeEach(() => {
    storage.clear();
  });

  test("moves modules while keeping ids untouched", () => {
    const state = buildPresetState("student");
    const moved = moveModule(state.moduleOrder, state.moduleOrder[0], 2);
    expect(moved[2]).toBe(state.moduleOrder[0]);
  });

  test("loads migrated stored state", () => {
    const state = buildPresetState("general");
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    expect(loadResumeState()?.schemaVersion).toBe(2);
  });

  test("resolves multipage fixture in dev mode", () => {
    const resolved = resolveInitialResumeSeed({
      isDev: true,
      search: `?fixture=${MULTIPAGE_PRINT_FIXTURE_ID}`,
      storedState: buildPresetState("student")
    });

    expect(resolved.fixtureId).toBe(MULTIPAGE_PRINT_FIXTURE_ID);
    expect(resolved.modules.length).toBeGreaterThan(0);
  });

  test("ignores fixture query outside dev mode", () => {
    const resolved = resolveInitialResumeSeed({
      isDev: false,
      search: `?fixture=${MULTIPAGE_PRINT_FIXTURE_ID}`,
      storedState: null
    });

    expect(resolved.fixtureId).toBeNull();
    expect(resolved.selectedIdentity).toBeNull();
    expect(getDefaultStoredResumeState().schemaVersion).toBe(2);
  });

  test("migrates legacy state to general identity", () => {
    const migrated = migrateLegacyStoredResumeState({
      resume: {
        personal: {
          name: "旧数据用户",
          title: "求职意向",
          phone: "13800000000",
          email: "legacy@example.com",
          city: "北京",
          blog: "",
          github: "",
          photoDataUrl: "",
          summary: "旧版简介"
        },
        education: [],
        projects: [],
        internships: [],
        campus: [],
        skills: [],
        awards: ["旧奖项"],
        sectionVisibility: {
          personal: true,
          education: true,
          projects: true,
          internships: true,
          campus: true,
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
    });

    expect(migrated.selectedIdentity).toBe("general");
    expect(migrated.modules.some((module) => module.kind === "certificate")).toBe(true);
  });
});

describe("resume store", () => {
  beforeEach(() => {
    storage.clear();
    useResumeStore.getState().replaceResumeState(buildPresetState("general"));
  });

  test("initializes identity and stores it", () => {
    act(() => {
      useResumeStore.getState().initializeIdentity("student");
    });

    expect(useResumeStore.getState().selectedIdentity).toBe("student");
    expect(storage.getItem(STORAGE_KEY) ?? "").toContain("\"selectedIdentity\":\"student\"");
  });

  test("switches identity without replacing modules immediately", () => {
    const beforeIds = useResumeStore.getState().modules.map((module) => module.id);

    act(() => {
      useResumeStore.getState().switchIdentity("professional");
    });

    expect(useResumeStore.getState().selectedIdentity).toBe("professional");
    expect(useResumeStore.getState().modules.map((module) => module.id)).toEqual(beforeIds);
  });

  test("applies identity recommendation and adds missing modules", () => {
    act(() => {
      useResumeStore.getState().switchIdentity("professional");
      useResumeStore.getState().applyIdentityRecommendation();
    });

    expect(useResumeStore.getState().modules.some((module) => module.kind === "coreCompetency")).toBe(true);
    expect(useResumeStore.getState().modules.some((module) => module.kind === "highlight")).toBe(true);
  });

  test("updates personal fields and visibility", () => {
    const personalModule = useResumeStore.getState().modules.find((module) => module.kind === "personal");
    expect(personalModule).toBeTruthy();

    act(() => {
      useResumeStore.getState().updatePersonalField(personalModule!.id, "name", "韩梅梅");
      useResumeStore.getState().togglePersonalField(personalModule!.id, "blog");
    });

    const nextPersonal = useResumeStore.getState().modules.find((module) => module.id === personalModule!.id);
    if (nextPersonal && isPersonalModuleData(nextPersonal.data)) {
      expect(nextPersonal.data.name).toBe("韩梅梅");
      expect(nextPersonal.data.personalVisibility.blog).toBe(true);
    }
  });

  test("adds and removes repeated modules", () => {
    act(() => {
      useResumeStore.getState().addModule("project");
    });

    const projectModules = useResumeStore.getState().modules.filter((module) => module.kind === "project");
    expect(projectModules.length).toBeGreaterThan(1);

    act(() => {
      useResumeStore.getState().removeModule(projectModules[projectModules.length - 1].id);
    });

    expect(useResumeStore.getState().modules.filter((module) => module.kind === "project").length).toBe(
      projectModules.length - 1
    );
  });

  test("updates timeline and list modules", () => {
    const experienceModule = useResumeStore.getState().modules.find((module) => module.kind === "experience");
    const skillsModule = useResumeStore.getState().modules.find((module) => module.kind === "skills");

    expect(experienceModule).toBeTruthy();
    expect(skillsModule).toBeTruthy();

    act(() => {
      useResumeStore.getState().updateTimelineEntry(experienceModule!.id, 0, { title: "工作经历 A" });
      useResumeStore.getState().updateListItem(skillsModule!.id, 0, "TypeScript");
    });

    const nextExperience = useResumeStore.getState().modules.find((module) => module.id === experienceModule!.id);
    const nextSkills = useResumeStore.getState().modules.find((module) => module.id === skillsModule!.id);

    if (nextExperience?.data && "entries" in nextExperience.data) {
      expect(nextExperience.data.entries[0].title).toBe("工作经历 A");
    }
    if (nextSkills?.data && "items" in nextSkills.data) {
      expect(nextSkills.data.items[0]).toBe("TypeScript");
    }
  });

  test("replaces imported v2 state and persists it", () => {
    const importedState = buildPresetState("professional");

    act(() => {
      useResumeStore.getState().replaceResumeState(importedState);
    });

    expect(useResumeStore.getState().selectedIdentity).toBe("professional");
    expect(storage.getItem(STORAGE_KEY) ?? "").toContain("\"schemaVersion\":2");
  });

  test("reset restores current identity preset", () => {
    const store = createResumeStore({
      ...resolveInitialResumeSeed({
        isDev: true,
        search: `?fixture=${MULTIPAGE_PRINT_FIXTURE_ID}`,
        storedState: multipagePrintFixture
      }),
      hasStoredState: true
    });

    act(() => {
      store.getState().switchIdentity("student");
      store.getState().reset();
    });

    expect(store.getState().selectedIdentity).toBe("student");
    expect(store.getState().modules.some((module) => module.kind === "honor")).toBe(true);
  });
});
