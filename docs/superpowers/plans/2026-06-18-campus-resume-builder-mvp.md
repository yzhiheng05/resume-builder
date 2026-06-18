# Campus Resume Builder MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a desktop-first, Chinese-first campus resume editor MVP with modular forms, real-time A4 preview, preview-side section reordering, local persistence, and browser print/PDF export.

**Architecture:** Use a small React + TypeScript single-page app scaffolded with Vite. Keep state in a single resume store that separates section content, section visibility, and section order. Render both the editor and the preview from that shared state so drag sorting only changes the order array. Use browser print styles for PDF export and allow natural pagination when content exceeds one page.

**Tech Stack:** Vite, React, TypeScript, Zustand, `@dnd-kit`, Vitest, React Testing Library

**UI Copy:** Chinese-first in the first release. English support is out of scope for this MVP.

---

## File Structure

Planned files and responsibilities:

- Create: `10_Projects/campus-resume-builder/package.json`
  - Frontend app dependencies and scripts
- Create: `10_Projects/campus-resume-builder/tsconfig.json`
  - TypeScript compiler config
- Create: `10_Projects/campus-resume-builder/tsconfig.node.json`
  - Vite tooling TypeScript config
- Create: `10_Projects/campus-resume-builder/vite.config.ts`
  - Vite + Vitest config
- Create: `10_Projects/campus-resume-builder/index.html`
  - App shell
- Create: `10_Projects/campus-resume-builder/src/main.tsx`
  - App bootstrap
- Create: `10_Projects/campus-resume-builder/src/App.tsx`
  - Top-level composition
- Create: `10_Projects/campus-resume-builder/src/styles.css`
  - Global, responsive, and print styles
- Create: `10_Projects/campus-resume-builder/src/types/resume.ts`
  - Resume data types, section ids, entry types
- Create: `10_Projects/campus-resume-builder/src/data/defaultResume.ts`
  - Default resume data and default section order
- Create: `10_Projects/campus-resume-builder/src/lib/storage.ts`
  - Local storage read/write helpers and pure reorder helpers
- Create: `10_Projects/campus-resume-builder/src/lib/print.ts`
  - Print export helper
- Create: `10_Projects/campus-resume-builder/src/store/useResumeStore.ts`
  - Zustand store with persistence
- Create: `10_Projects/campus-resume-builder/src/components/HeaderBar.tsx`
  - Reset and export actions
- Create: `10_Projects/campus-resume-builder/src/components/editor/EditorPanel.tsx`
  - Left-side module list
- Create: `10_Projects/campus-resume-builder/src/components/editor/SectionCard.tsx`
  - Shared editor section card
- Create: `10_Projects/campus-resume-builder/src/components/editor/fields.tsx`
  - Shared input controls
- Create: `10_Projects/campus-resume-builder/src/components/editor/PersonalSectionForm.tsx`
  - Personal info section form
- Create: `10_Projects/campus-resume-builder/src/components/editor/EducationSectionForm.tsx`
  - Education section form
- Create: `10_Projects/campus-resume-builder/src/components/editor/ExperienceSectionForm.tsx`
  - Shared list form for projects, internships, campus
- Create: `10_Projects/campus-resume-builder/src/components/editor/SkillsSectionForm.tsx`
  - Skills section form
- Create: `10_Projects/campus-resume-builder/src/components/editor/AwardsSectionForm.tsx`
  - Awards/certifications section form
- Create: `10_Projects/campus-resume-builder/src/components/preview/PreviewPanel.tsx`
  - Right-side A4 preview and sortable context
- Create: `10_Projects/campus-resume-builder/src/components/preview/PreviewSection.tsx`
  - Sortable preview wrapper
- Create: `10_Projects/campus-resume-builder/src/components/preview/sectionRenderers.tsx`
  - Section-specific preview renderers
- Create: `10_Projects/campus-resume-builder/src/test/renderApp.test.tsx`
  - Basic render and interaction tests
- Create: `10_Projects/campus-resume-builder/src/test/store.test.ts`
  - Store and persistence tests
- Create: `10_Projects/campus-resume-builder/src/test/preview-sort.test.tsx`
  - Preview ordering tests

Current note:

- `10_Projects/campus-resume-builder` is not a git repository right now, so `git commit` steps below should be treated as “run after repo init” rather than a blocker.

### Task 1: Scaffold the frontend app

**Files:**
- Create: `10_Projects/campus-resume-builder/package.json`
- Create: `10_Projects/campus-resume-builder/tsconfig.json`
- Create: `10_Projects/campus-resume-builder/tsconfig.node.json`
- Create: `10_Projects/campus-resume-builder/vite.config.ts`
- Create: `10_Projects/campus-resume-builder/index.html`
- Create: `10_Projects/campus-resume-builder/src/main.tsx`
- Create: `10_Projects/campus-resume-builder/src/App.tsx`
- Create: `10_Projects/campus-resume-builder/src/styles.css`
- Create: `10_Projects/campus-resume-builder/src/test/renderApp.test.tsx`

- [ ] **Step 1: Write the failing app render test**

```tsx
// src/test/renderApp.test.tsx
import { render, screen } from "@testing-library/react";
import App from "../App";

test("renders chinese editor and preview headings", () => {
  render(<App />);

  expect(screen.getByRole("heading", { name: /简历编辑器/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /实时预览/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder && npm test -- --run src/test/renderApp.test.tsx`

Expected: FAIL because the app scaffold and test environment do not exist yet.

- [ ] **Step 3: Write the minimal app scaffold**

```json
// package.json
{
  "name": "campus-resume-builder",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest --run"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^4.5.4"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.1.1",
    "typescript": "^5.5.4",
    "vite": "^5.3.4",
    "vitest": "^2.0.5"
  }
}
```

```tsx
// src/App.tsx
import "./styles.css";

export default function App() {
  return (
    <div className="app-shell">
      <main className="workspace">
        <section className="editor-panel">
          <h1>简历编辑器</h1>
        </section>
        <section className="preview-panel">
          <h1>实时预览</h1>
        </section>
      </main>
    </div>
  );
}
```

```tsx
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder && npm install && npm test -- src/test/renderApp.test.tsx`

Expected: PASS with one passing render test.

- [ ] **Step 5: Save progress**

If repo exists later:

```bash
git add package.json tsconfig.json tsconfig.node.json vite.config.ts index.html src/main.tsx src/App.tsx src/styles.css src/test/renderApp.test.tsx
git commit -m "chore: scaffold resume builder app"
```

### Task 2: Define resume types, defaults, and pure helpers

**Files:**
- Create: `10_Projects/campus-resume-builder/src/types/resume.ts`
- Create: `10_Projects/campus-resume-builder/src/data/defaultResume.ts`
- Create: `10_Projects/campus-resume-builder/src/lib/storage.ts`
- Modify: `10_Projects/campus-resume-builder/src/test/store.test.ts`

- [ ] **Step 1: Write the failing helper tests**

```ts
// src/test/store.test.ts
import { describe, expect, test } from "vitest";
import { defaultResume, defaultSectionOrder } from "../data/defaultResume";
import { moveSection, toggleSectionVisibility } from "../lib/storage";

describe("resume helpers", () => {
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder && npm test -- src/test/store.test.ts`

Expected: FAIL because the types, defaults, and helper functions do not exist.

- [ ] **Step 3: Write the minimal data model and helpers**

```ts
// src/types/resume.ts
export type SectionId =
  | "personal"
  | "education"
  | "projects"
  | "internships"
  | "campus"
  | "skills"
  | "awards";

export interface TimelineEntry {
  id: string;
  title: string;
  org: string;
  start: string;
  end: string;
  location: string;
  bullets: string[];
}

export interface ResumeData {
  personal: {
    name: string;
    title: string;
    phone: string;
    email: string;
    city: string;
    summary: string;
  };
  education: TimelineEntry[];
  projects: TimelineEntry[];
  internships: TimelineEntry[];
  campus: TimelineEntry[];
  skills: string[];
  awards: string[];
  sectionVisibility: Record<SectionId, boolean>;
}
```

```ts
// src/data/defaultResume.ts
import type { ResumeData, SectionId } from "../types/resume";

export const defaultSectionOrder: SectionId[] = [
  "personal",
  "education",
  "projects",
  "internships",
  "campus",
  "skills",
  "awards"
];

export const defaultResume: ResumeData = {
  personal: {
    name: "张三",
    title: "校招求职意向",
    phone: "138-0000-0000",
    email: "zhangsan@example.com",
    city: "上海",
    summary: "请用一两句话总结你的优势、方向和求职目标。"
  },
  education: [],
  projects: [],
  internships: [],
  campus: [],
  skills: ["React", "TypeScript", "英语 CET-6"],
  awards: ["校级奖学金"],
  sectionVisibility: {
    personal: true,
    education: true,
    projects: true,
    internships: true,
    campus: true,
    skills: true,
    awards: true
  }
};
```

```ts
// src/lib/storage.ts
import type { ResumeData, SectionId } from "../types/resume";

export const STORAGE_KEY = "campus-resume-builder";

export function moveSection(order: SectionId[], id: SectionId, toIndex: number) {
  const next = [...order];
  const fromIndex = next.indexOf(id);
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function toggleSectionVisibility(
  visibility: Record<SectionId, boolean>,
  id: SectionId
) {
  return { ...visibility, [id]: !visibility[id] };
}

export function saveResumeState(payload: {
  resume: ResumeData;
  sectionOrder: SectionId[];
}) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function loadResumeState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder && npm test -- src/test/store.test.ts`

Expected: PASS with helper behavior verified.

- [ ] **Step 5: Save progress**

If repo exists later:

```bash
git add src/types/resume.ts src/data/defaultResume.ts src/lib/storage.ts src/test/store.test.ts
git commit -m "feat: add resume data model"
```

### Task 3: Build the Zustand store with real local persistence

**Files:**
- Create: `10_Projects/campus-resume-builder/src/store/useResumeStore.ts`
- Modify: `10_Projects/campus-resume-builder/src/test/store.test.ts`

- [ ] **Step 1: Extend tests for store updates and hydration**

```ts
// append to src/test/store.test.ts
import { act } from "@testing-library/react";
import { STORAGE_KEY } from "../lib/storage";
import { useResumeStore } from "../store/useResumeStore";

test("updates personal info and section order", () => {
  useResumeStore.getState().reset();

  act(() => {
    useResumeStore.getState().updatePersonal("name", "李雷");
    useResumeStore.getState().reorderSections("personal", 2);
  });

  expect(useResumeStore.getState().resume.personal.name).toBe("李雷");
  expect(useResumeStore.getState().sectionOrder[2]).toBe("personal");
});

test("persists updates into localStorage", () => {
  useResumeStore.getState().reset();

  act(() => {
    useResumeStore.getState().updatePersonal("name", "韩梅梅");
  });

  const raw = localStorage.getItem(STORAGE_KEY);
  expect(raw).toContain("韩梅梅");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder && npm test -- src/test/store.test.ts`

Expected: FAIL because the store API does not exist yet.

- [ ] **Step 3: Write the store**

```ts
// src/store/useResumeStore.ts
import { create } from "zustand";
import { defaultResume, defaultSectionOrder } from "../data/defaultResume";
import {
  loadResumeState,
  moveSection,
  saveResumeState,
  toggleSectionVisibility
} from "../lib/storage";
import type { ResumeData, SectionId } from "../types/resume";

interface ResumeState {
  resume: ResumeData;
  sectionOrder: SectionId[];
  updatePersonal: (field: keyof ResumeData["personal"], value: string) => void;
  toggleSection: (id: SectionId) => void;
  reorderSections: (id: SectionId, toIndex: number) => void;
  reset: () => void;
}

const hydrated = loadResumeState();

export const useResumeStore = create<ResumeState>((set, get) => ({
  resume: hydrated?.resume ?? defaultResume,
  sectionOrder: hydrated?.sectionOrder ?? defaultSectionOrder,
  updatePersonal: (field, value) =>
    set((state) => {
      const resume = {
        ...state.resume,
        personal: {
          ...state.resume.personal,
          [field]: value
        }
      };

      saveResumeState({ resume, sectionOrder: get().sectionOrder });
      return { resume };
    }),
  toggleSection: (id) =>
    set((state) => {
      const resume = {
        ...state.resume,
        sectionVisibility: toggleSectionVisibility(state.resume.sectionVisibility, id)
      };

      saveResumeState({ resume, sectionOrder: get().sectionOrder });
      return { resume };
    }),
  reorderSections: (id, toIndex) =>
    set((state) => {
      const sectionOrder = moveSection(state.sectionOrder, id, toIndex);
      saveResumeState({ resume: state.resume, sectionOrder });
      return { sectionOrder };
    }),
  reset: () => {
    saveResumeState({ resume: defaultResume, sectionOrder: defaultSectionOrder });
    set({ resume: defaultResume, sectionOrder: defaultSectionOrder });
  }
}));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder && npm test -- src/test/store.test.ts`

Expected: PASS with store updates and local persistence working.

- [ ] **Step 5: Save progress**

If repo exists later:

```bash
git add src/store/useResumeStore.ts src/test/store.test.ts
git commit -m "feat: add persisted resume store"
```

### Task 4: Build the editor panel and the minimal bound preview

**Files:**
- Create: `10_Projects/campus-resume-builder/src/components/editor/EditorPanel.tsx`
- Create: `10_Projects/campus-resume-builder/src/components/editor/SectionCard.tsx`
- Create: `10_Projects/campus-resume-builder/src/components/editor/fields.tsx`
- Create: `10_Projects/campus-resume-builder/src/components/editor/PersonalSectionForm.tsx`
- Create: `10_Projects/campus-resume-builder/src/components/preview/PreviewPanel.tsx`
- Modify: `10_Projects/campus-resume-builder/src/App.tsx`
- Modify: `10_Projects/campus-resume-builder/src/test/renderApp.test.tsx`

- [ ] **Step 1: Extend the render test for bound editor input**

```tsx
// replace src/test/renderApp.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

test("updates personal name from chinese editor form", async () => {
  const user = userEvent.setup();
  render(<App />);

  const nameInput = screen.getByLabelText(/姓名/i);
  await user.clear(nameInput);
  await user.type(nameInput, "李雷");

  expect(screen.getByText("李雷")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder && npm test -- src/test/renderApp.test.tsx`

Expected: FAIL because the bound editor and preview are missing.

- [ ] **Step 3: Build the editor and minimal preview**

```tsx
// src/components/editor/PersonalSectionForm.tsx
import { useResumeStore } from "../../store/useResumeStore";

export function PersonalSectionForm() {
  const personal = useResumeStore((state) => state.resume.personal);
  const updatePersonal = useResumeStore((state) => state.updatePersonal);

  return (
    <label className="field">
      <span>姓名</span>
      <input
        aria-label="姓名"
        value={personal.name}
        onChange={(event) => updatePersonal("name", event.target.value)}
      />
    </label>
  );
}
```

```tsx
// src/components/editor/EditorPanel.tsx
import { PersonalSectionForm } from "./PersonalSectionForm";

export function EditorPanel() {
  return (
    <section className="editor-panel">
      <h1>简历编辑器</h1>
      <PersonalSectionForm />
    </section>
  );
}
```

```tsx
// src/components/preview/PreviewPanel.tsx
import { useResumeStore } from "../../store/useResumeStore";

export function PreviewPanel() {
  const personal = useResumeStore((state) => state.resume.personal);

  return (
    <section className="preview-panel">
      <h1>实时预览</h1>
      <div className="preview-placeholder">
        <strong>{personal.name}</strong>
      </div>
    </section>
  );
}
```

```tsx
// src/App.tsx
import "./styles.css";
import { EditorPanel } from "./components/editor/EditorPanel";
import { PreviewPanel } from "./components/preview/PreviewPanel";

export default function App() {
  return (
    <div className="app-shell">
      <main className="workspace">
        <EditorPanel />
        <PreviewPanel />
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder && npm test -- src/test/renderApp.test.tsx`

Expected: PASS with preview text updating from the editor.

- [ ] **Step 5: Save progress**

If repo exists later:

```bash
git add src/App.tsx src/components/editor src/components/preview/PreviewPanel.tsx src/test/renderApp.test.tsx
git commit -m "feat: add minimal chinese editor"
```

### Task 5: Expand the preview into an A4 resume layout

**Files:**
- Modify: `10_Projects/campus-resume-builder/src/components/preview/PreviewPanel.tsx`
- Create: `10_Projects/campus-resume-builder/src/components/preview/sectionRenderers.tsx`
- Modify: `10_Projects/campus-resume-builder/src/styles.css`
- Modify: `10_Projects/campus-resume-builder/src/test/renderApp.test.tsx`

- [ ] **Step 1: Extend the render test for the A4 preview shell**

```tsx
// append to src/test/renderApp.test.tsx
test("renders an a4 preview frame", () => {
  render(<App />);
  expect(screen.getByLabelText(/简历页面/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder && npm test -- src/test/renderApp.test.tsx`

Expected: FAIL because the preview frame and page label are not implemented.

- [ ] **Step 3: Build the A4 preview shell**

```tsx
// src/components/preview/PreviewPanel.tsx
import { useResumeStore } from "../../store/useResumeStore";

export function PreviewPanel() {
  const resume = useResumeStore((state) => state.resume);

  return (
    <section className="preview-panel">
      <h1>实时预览</h1>
      <div aria-label="简历页面" className="resume-page">
        <header className="resume-header">
          <h2>{resume.personal.name}</h2>
          <p>{resume.personal.title}</p>
        </header>
      </div>
    </section>
  );
}
```

```css
/* add to src/styles.css */
.resume-page {
  width: 210mm;
  min-height: 297mm;
  background: #fffdf8;
  color: #1f2328;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.14);
  padding: 24mm 18mm;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder && npm test -- src/test/renderApp.test.tsx`

Expected: PASS with the A4 preview shell rendered.

- [ ] **Step 5: Save progress**

If repo exists later:

```bash
git add src/components/preview/PreviewPanel.tsx src/components/preview/sectionRenderers.tsx src/styles.css src/test/renderApp.test.tsx
git commit -m "feat: add a4 preview shell"
```

### Task 6: Add preview-side drag sorting and keep personal section sortable

**Files:**
- Create: `10_Projects/campus-resume-builder/src/components/preview/PreviewSection.tsx`
- Modify: `10_Projects/campus-resume-builder/src/components/preview/PreviewPanel.tsx`
- Create: `10_Projects/campus-resume-builder/src/test/preview-sort.test.tsx`

- [ ] **Step 1: Write the failing sort-order test**

```tsx
// src/test/preview-sort.test.tsx
import { render, screen } from "@testing-library/react";
import { PreviewPanel } from "../components/preview/PreviewPanel";
import { useResumeStore } from "../store/useResumeStore";

test("renders personal section first by default and sortable in state order", () => {
  useResumeStore.setState({
    sectionOrder: ["personal", "skills", "education", "projects", "internships", "campus", "awards"]
  });

  render(<PreviewPanel />);

  const headings = screen.getAllByRole("heading", { level: 3 }).map((node) => node.textContent);
  expect(headings[0]).toBe("个人信息");
  expect(headings[1]).toBe("技能");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder && npm test -- src/test/preview-sort.test.tsx`

Expected: FAIL because preview sections are not rendered from `sectionOrder`.

- [ ] **Step 3: Add sortable preview sections**

```tsx
// src/components/preview/PreviewPanel.tsx
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useResumeStore } from "../../store/useResumeStore";
import { PreviewSection } from "./PreviewSection";

export function PreviewPanel() {
  const resume = useResumeStore((state) => state.resume);
  const sectionOrder = useResumeStore((state) => state.sectionOrder);
  const reorderSections = useResumeStore((state) => state.reorderSections);

  function onDragEnd(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;

    reorderSections(
      String(event.active.id) as never,
      sectionOrder.indexOf(String(event.over.id) as never)
    );
  }

  return (
    <section className="preview-panel">
      <h1>实时预览</h1>
      <div aria-label="简历页面" className="resume-page">
        <DndContext onDragEnd={onDragEnd}>
          {sectionOrder
            .filter((id) => resume.sectionVisibility[id])
            .map((id) => (
              <PreviewSection key={id} id={id} />
            ))}
        </DndContext>
      </div>
    </section>
  );
}
```

```tsx
// src/components/preview/PreviewSection.tsx
import { useResumeStore } from "../../store/useResumeStore";
import type { SectionId } from "../../types/resume";

const TITLES: Record<SectionId, string> = {
  personal: "个人信息",
  education: "教育经历",
  projects: "项目经历",
  internships: "实习经历",
  campus: "校园经历",
  skills: "技能",
  awards: "获奖与证书"
};

export function PreviewSection({ id }: { id: SectionId }) {
  const resume = useResumeStore((state) => state.resume);

  return (
    <section data-section-id={id}>
      <h3>{TITLES[id]}</h3>
      <pre>{JSON.stringify(resume[id], null, 2)}</pre>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder && npm test -- src/test/preview-sort.test.tsx`

Expected: PASS with preview order driven by state, including the personal section.

- [ ] **Step 5: Save progress**

If repo exists later:

```bash
git add src/components/preview/PreviewPanel.tsx src/components/preview/PreviewSection.tsx src/test/preview-sort.test.tsx
git commit -m "feat: add preview section ordering"
```

### Task 7: Add reset, export, and multipage print styles

**Files:**
- Create: `10_Projects/campus-resume-builder/src/components/HeaderBar.tsx`
- Create: `10_Projects/campus-resume-builder/src/lib/print.ts`
- Modify: `10_Projects/campus-resume-builder/src/App.tsx`
- Modify: `10_Projects/campus-resume-builder/src/styles.css`
- Modify: `10_Projects/campus-resume-builder/src/test/renderApp.test.tsx`

- [ ] **Step 1: Extend the render test for export controls**

```tsx
// append to src/test/renderApp.test.tsx
test("renders chinese export and reset actions", () => {
  render(<App />);
  expect(screen.getByRole("button", { name: /导出 pdf/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /重置/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder && npm test -- src/test/renderApp.test.tsx`

Expected: FAIL because the header actions are missing.

- [ ] **Step 3: Add the header and print behavior**

```tsx
// src/components/HeaderBar.tsx
import { printResume } from "../lib/print";
import { useResumeStore } from "../store/useResumeStore";

export function HeaderBar() {
  const reset = useResumeStore((state) => state.reset);

  return (
    <header className="header-bar">
      <span className="save-indicator">已本地保存</span>
      <div className="header-actions">
        <button type="button" onClick={reset}>
          重置
        </button>
        <button type="button" onClick={printResume}>
          导出 PDF
        </button>
      </div>
    </header>
  );
}
```

```ts
// src/lib/print.ts
export function printResume() {
  window.print();
}
```

```css
/* add to src/styles.css */
@media print {
  .header-bar,
  .editor-panel {
    display: none !important;
  }

  .preview-panel,
  .resume-page {
    width: auto;
    min-height: auto;
    box-shadow: none;
    padding: 0;
  }

  .resume-page {
    overflow: visible;
    page-break-after: auto;
    break-after: auto;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder && npm test -- src/test/renderApp.test.tsx`

Expected: PASS with Chinese header actions rendered.

- [ ] **Step 5: Save progress**

If repo exists later:

```bash
git add src/components/HeaderBar.tsx src/lib/print.ts src/App.tsx src/styles.css src/test/renderApp.test.tsx
git commit -m "feat: add export and reset actions"
```

### Task 8: Polish the UI and verify the MVP flow

**Files:**
- Modify: `10_Projects/campus-resume-builder/src/styles.css`
- Modify: `10_Projects/campus-resume-builder/src/components/editor/*.tsx`
- Modify: `10_Projects/campus-resume-builder/src/components/preview/*.tsx`
- Modify: `10_Projects/campus-resume-builder/20_Tech_Stack.md`
- Modify: `10_Projects/campus-resume-builder/30_Dev_Log.md`

- [ ] **Step 1: Apply the final desktop-first visual styling**

```css
/* final direction for src/styles.css */
:root {
  --bg: #f3ede2;
  --panel: rgba(255, 250, 242, 0.82);
  --paper: #fffdf8;
  --ink: #18222d;
  --line: #d8c9b0;
  --accent: #9f5a2f;
  --accent-soft: #f1dfcf;
}

body {
  margin: 0;
  font-family: "IBM Plex Sans", "PingFang SC", sans-serif;
  color: var(--ink);
  background:
    radial-gradient(circle at top left, rgba(159, 90, 47, 0.18), transparent 28%),
    linear-gradient(160deg, #f7f1e7 0%, #efe3d4 100%);
}
```

- [ ] **Step 2: Run the full automated test suite**

Run: `cd /Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder && npm test`

Expected: PASS with all unit and integration tests green.

- [ ] **Step 3: Run a production build**

Run: `cd /Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder && npm run build`

Expected: PASS with the Vite production bundle emitted to `dist/`.

- [ ] **Step 4: Manually verify the MVP acceptance path**

Run:

```bash
cd /Users/yzh/AI/CodexProject/CodexWorkspace/10_Projects/campus-resume-builder
npm run dev
```

Check:

- 填写个人信息、教育经历、项目经历、实习经历、校园经历、技能、获奖/证书
- 至少关闭一个模块并确认预览区消失
- 拖动个人信息模块一次，再拖动另一个模块一次，确认编辑区顺序同步
- 刷新页面并确认数据恢复
- 打开浏览器打印预览，确认编辑区被隐藏且 A4 布局正常
- 使用超长内容一次，确认打印预览能自然分页成多页且无重叠

- [ ] **Step 5: Record the final implementation notes**

Append to `10_Projects/campus-resume-builder/30_Dev_Log.md`:

```md
## 2026-06-18

- 任务：完成简历编辑器 MVP 实现与验证
- 操作：搭建前端应用，实现状态管理、模块编辑、预览排序、本地保存和打印导出
- 结果：桌面端 MVP 可用
- 验证：Vitest 通过；`npm run build` 通过；手工完成填写、排序、刷新恢复和打印预览检查
- 后续：如要进入第二阶段，可评估英文界面、多模板和 JSON 导入导出
```

## Self-Review

- Spec coverage:
  - 模块化填写：Task 4
  - 实时预览：Task 4-5
  - 预览区模块排序：Task 6
  - 本地保存：Task 3
  - 打印/PDF 导出：Task 7
  - 个人信息可排序但默认置顶：Task 2, Task 6
  - 超长内容自动多页：Task 7-8
  - 中文界面优先：Task 1, Task 4, Task 7
  - 桌面端优先美观界面：Task 8
- Placeholder scan:
  - No `TODO`, `TBD`, or “implement later” placeholders remain in tasks.
- Type consistency:
  - `SectionId`, `ResumeData`, `sectionOrder`, `updatePersonal`, and `reorderSections` use the same names throughout the plan.
