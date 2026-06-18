import { act } from "@testing-library/react";
import { describe, expect, test, beforeEach } from "vitest";
import { defaultResume, defaultSectionOrder } from "../data/defaultResume";
import { loadResumeState, moveSection, toggleSectionVisibility, STORAGE_KEY } from "../lib/storage";
import { useResumeStore } from "../store/useResumeStore";

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
});
