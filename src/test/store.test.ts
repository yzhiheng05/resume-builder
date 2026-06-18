import { act } from "@testing-library/react";
import { describe, expect, test, beforeEach } from "vitest";
import { defaultResume, defaultSectionOrder } from "../data/defaultResume";
import { multipagePrintFixture } from "../data/multipagePrintFixture";
import { loadResumeState, moveSection, toggleSectionVisibility, STORAGE_KEY } from "../lib/storage";
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

  test("moves personal section while keeping data untouched", () => {
    expect(moveSection(defaultSectionOrder, "personal", 2)).toEqual([
      "education",
      "projects",
      "personal",
      "internships",
      "campus",
      "skills",
      "awards"
    ]);
  });

  test("toggles section visibility", () => {
    const next = toggleSectionVisibility(defaultResume.sectionVisibility, "awards");
    expect(next.awards).toBe(false);
  });

  test("loads stored state", () => {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ resume: defaultResume, sectionOrder: defaultSectionOrder })
    );
    expect(loadResumeState()).toEqual({
      resume: defaultResume,
      sectionOrder: defaultSectionOrder
    });
  });

  test("resolves multipage fixture in dev mode", () => {
    const resolved = resolveInitialResumeSeed({
      isDev: true,
      search: `?fixture=${MULTIPAGE_PRINT_FIXTURE_ID}`,
      storedState: {
        resume: defaultResume,
        sectionOrder: defaultSectionOrder
      }
    });

    expect(resolved.fixtureId).toBe(MULTIPAGE_PRINT_FIXTURE_ID);
    expect(resolved.resume.personal.name).toBe(multipagePrintFixture.resume.personal.name);
    expect(resolved.resume.projects.length).toBe(multipagePrintFixture.resume.projects.length);
  });

  test("ignores fixture query outside dev mode", () => {
    const resolved = resolveInitialResumeSeed({
      isDev: false,
      search: `?fixture=${MULTIPAGE_PRINT_FIXTURE_ID}`,
      storedState: null
    });

    expect(resolved.fixtureId).toBeNull();
    expect(resolved.resume.personal.name).toBe(getDefaultStoredResumeState().resume.personal.name);
  });

  test("keeps stored state when no fixture is requested", () => {
    const storedState = {
      resume: {
        ...defaultResume,
        personal: {
          ...defaultResume.personal,
          name: "测试用户"
        }
      },
      sectionOrder: defaultSectionOrder
    };

    const resolved = resolveInitialResumeSeed({
      isDev: true,
      search: "",
      storedState
    });

    expect(resolved.fixtureId).toBeNull();
    expect(resolved.resume.personal.name).toBe("测试用户");
  });
});

describe("resume store", () => {
  beforeEach(() => {
    storage.clear();
    useResumeStore.getState().reset();
  });

  test("updates personal info and section order", () => {
    act(() => {
      useResumeStore.getState().updatePersonal("name", "李雷");
      useResumeStore.getState().reorderSections("personal", 2);
    });

    expect(useResumeStore.getState().resume.personal.name).toBe("李雷");
    expect(useResumeStore.getState().sectionOrder[2]).toBe("personal");
  });

  test("persists updates into localStorage", () => {
    act(() => {
      useResumeStore.getState().updatePersonal("name", "韩梅梅");
    });

    const raw = storage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(raw ?? "").toContain("韩梅梅");
  });

  test("personal section stays at the top by default", () => {
    expect(useResumeStore.getState().sectionOrder[0]).toBe("personal");
  });

  test("timeline bullets can be updated without changing other fields", () => {
    act(() => {
      useResumeStore.getState().updateTimelineEntry("projects", 0, {
        bullets: ["第一条", "第二条"]
      });
    });

    expect(useResumeStore.getState().resume.projects[0].title).toBe(defaultResume.projects[0].title);
    expect(useResumeStore.getState().resume.projects[0].bullets).toEqual(["第一条", "第二条"]);
  });

  test("reset restores the fixture seed when the store starts from multipage fixture", () => {
    const store = createResumeStore(multipagePrintFixture);

    act(() => {
      store.getState().updatePersonal("name", "临时姓名");
      store.getState().removeAward(0);
    });

    act(() => {
      store.getState().reset();
    });

    expect(store.getState().resume.personal.name).toBe(multipagePrintFixture.resume.personal.name);
    expect(store.getState().resume.awards).toEqual(multipagePrintFixture.resume.awards);
    expect(store.getState().sectionOrder).toEqual(multipagePrintFixture.sectionOrder);
  });
});
