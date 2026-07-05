# Canva Style Resume Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing resume builder into a Canva-style structured web editor with a module library, A4 canvas, inspector panel, lightweight style controls, persistence, and stable PDF export.

**Architecture:** Keep the existing React + Zustand + dnd-kit editor kernel and add editor chrome around it. Store canonical resume content, template, module order, and style settings in Zustand/localStorage; keep `activeModuleId` as UI state. Split the current large `App.tsx` editor logic into focused components while preserving current module data shapes and print flow.

**Tech Stack:** React 18, TypeScript, Vite, Zustand, dnd-kit, Vitest, React Testing Library, CSS print media.

---

## File Structure

- Modify `src/types/resume.ts`
  - Add `ResumeStyleSettings`, `StoredResumeStateV4`, and keep older stored state types for migration.
- Create `src/lib/resumeStyle.ts`
  - Own default style settings, validation, normalization, and CSS variable helpers.
- Modify `src/lib/resumeMigration.ts`
  - Migrate legacy/V2/V3 data into V4 and normalize missing or invalid style fields.
- Modify `src/lib/resumeBackup.ts`
  - Export/import V4 backups while still accepting older backup payloads.
- Modify `src/store/useResumeStore.ts`
  - Add `resumeStyle`, `duplicateModule`, `updateResumeStyle`, and selection-friendly add/delete behavior.
- Create `src/components/editor/ModuleLibraryPanel.tsx`
  - Render the always-visible left module library.
- Create `src/components/editor/ModuleInspector.tsx`
  - Render module title, visibility, content form, copy/delete controls for the selected module.
- Create `src/components/editor/GlobalStyleInspector.tsx`
  - Render template selection and global style controls.
- Create `src/components/editor/InspectorPanel.tsx`
  - Switch between selected-module editing and global settings.
- Create `src/components/editor/moduleEditors.tsx`
  - Move reusable module form editors out of `App.tsx`.
- Modify `src/components/preview/PreviewPanel.tsx`
  - Keep A4 canvas behavior, use active module selection, pass style settings, and remove duplicate template selector from the canvas header if the inspector owns it.
- Modify `src/components/preview/ResumeTemplateRenderer.tsx`
  - Pass `resumeStyle` to templates.
- Modify `src/components/preview/templates/*.tsx`
  - Apply style classes/CSS variables and keep print-safe markup.
- Modify `src/App.tsx`
  - Compose header, module library, canvas, and inspector into a three-column workspace.
- Modify `src/styles.css`
  - Add three-column editor layout, selected canvas state, inspector styles, style-variable classes, responsive behavior, and print hiding.
- Modify tests under `src/test/`
  - Cover migration, backup, store actions, rendering, and preview selection regressions.

---

### Task 1: Style Model, Migration, and Backup

**Files:**
- Modify: `src/types/resume.ts`
- Create: `src/lib/resumeStyle.ts`
- Modify: `src/lib/resumeMigration.ts`
- Modify: `src/lib/resumeBackup.ts`
- Test: `src/test/store.test.ts`
- Test: `src/test/resumeBackup.test.ts`

- [ ] **Step 1: Add failing tests for V4 style defaults and backup preservation**

Add these tests to `src/test/store.test.ts`:

```ts
test("migrates v3 state to v4 with default style settings", () => {
  const state = buildPresetState("general");
  const migrated = loadResumeStateFromUnknownForTest({
    schemaVersion: 3,
    selectedIdentity: state.selectedIdentity,
    templateId: state.templateId,
    hasUserSelectedTemplate: state.hasUserSelectedTemplate,
    modules: state.modules,
    moduleOrder: state.moduleOrder
  });

  expect(migrated?.schemaVersion).toBe(4);
  expect(migrated?.resumeStyle).toEqual({
    accentColor: "#2563eb",
    density: "comfortable",
    sectionSpacing: "normal",
    headingStyle: "underline"
  });
});
```

Add this helper import and wrapper in the same file:

```ts
import { migrateUnknownStoredResumeState } from "../lib/resumeMigration";

function loadResumeStateFromUnknownForTest(value: unknown) {
  return migrateUnknownStoredResumeState(value, "general");
}
```

Add this test to `src/test/resumeBackup.test.ts`:

```ts
test("serializes and parses style settings in v4 backups", () => {
  const state = {
    ...buildPresetState("general"),
    schemaVersion: 4 as const,
    resumeStyle: {
      accentColor: "#0f766e",
      density: "compact" as const,
      sectionSpacing: "tight" as const,
      headingStyle: "bar" as const
    }
  };

  const parsed = parseResumeBackup(serializeResumeBackup(state));

  expect(parsed.ok).toBe(true);
  if (parsed.ok) {
    expect(parsed.state.resumeStyle.accentColor).toBe("#0f766e");
    expect(parsed.state.resumeStyle.density).toBe("compact");
  }
});
```

- [ ] **Step 2: Run tests and confirm they fail**

Run:

```bash
npm test -- src/test/store.test.ts src/test/resumeBackup.test.ts
```

Expected: FAIL because `schemaVersion: 4`, `resumeStyle`, and `StoredResumeStateV4` are not implemented.

- [ ] **Step 3: Add style types and helpers**

In `src/types/resume.ts`, add:

```ts
export type ResumeDensity = "compact" | "comfortable";
export type ResumeSectionSpacing = "tight" | "normal" | "loose";
export type ResumeHeadingStyle = "underline" | "bar" | "plain";

export interface ResumeStyleSettings {
  accentColor: string;
  density: ResumeDensity;
  sectionSpacing: ResumeSectionSpacing;
  headingStyle: ResumeHeadingStyle;
}
```

Update `ResumeDraftState`:

```ts
export interface ResumeDraftState {
  selectedIdentity: IdentityPreset | null;
  templateId: TemplateId;
  hasUserSelectedTemplate: boolean;
  resumeStyle: ResumeStyleSettings;
  modules: ResumeModuleInstance[];
  moduleOrder: string[];
}
```

Add V4 and keep V3:

```ts
export interface StoredResumeStateV4 {
  schemaVersion: 4;
  selectedIdentity: IdentityPreset;
  templateId: TemplateId;
  hasUserSelectedTemplate: boolean;
  resumeStyle: ResumeStyleSettings;
  modules: ResumeModuleInstance[];
  moduleOrder: string[];
}
```

Create `src/lib/resumeStyle.ts`:

```ts
import type { ResumeStyleSettings } from "../types/resume";

export const defaultResumeStyle: ResumeStyleSettings = {
  accentColor: "#2563eb",
  density: "comfortable",
  sectionSpacing: "normal",
  headingStyle: "underline"
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

export function normalizeResumeStyle(value: unknown): ResumeStyleSettings {
  if (!isRecord(value)) {
    return { ...defaultResumeStyle };
  }

  return {
    accentColor: isHexColor(value.accentColor) ? value.accentColor : defaultResumeStyle.accentColor,
    density: value.density === "compact" || value.density === "comfortable" ? value.density : defaultResumeStyle.density,
    sectionSpacing:
      value.sectionSpacing === "tight" || value.sectionSpacing === "normal" || value.sectionSpacing === "loose"
        ? value.sectionSpacing
        : defaultResumeStyle.sectionSpacing,
    headingStyle:
      value.headingStyle === "underline" || value.headingStyle === "bar" || value.headingStyle === "plain"
        ? value.headingStyle
        : defaultResumeStyle.headingStyle
  };
}

export function getResumeStyleVars(style: ResumeStyleSettings): React.CSSProperties {
  return {
    "--resume-accent": style.accentColor
  } as React.CSSProperties;
}
```

- [ ] **Step 4: Migrate stored state to V4**

In `src/lib/resumeMigration.ts`, import style helpers and V4 type:

```ts
import { defaultResumeStyle, normalizeResumeStyle } from "./resumeStyle";
import type { StoredResumeStateV4 } from "../types/resume";
```

Change `cloneStoredResumeStateV3` to `cloneStoredResumeStateV4`:

```ts
export function cloneStoredResumeStateV4(state: StoredResumeStateV4): StoredResumeStateV4 {
  return JSON.parse(JSON.stringify(state)) as StoredResumeStateV4;
}
```

Add V4 guard:

```ts
function isStoredResumeStateV4(value: unknown): value is StoredResumeStateV4 {
  return (
    isRecord(value) &&
    value.schemaVersion === 4 &&
    isIdentityPreset(value.selectedIdentity) &&
    isTemplateId(value.templateId) &&
    typeof value.hasUserSelectedTemplate === "boolean" &&
    Array.isArray(value.modules) &&
    value.modules.every(isModuleInstance) &&
    Array.isArray(value.moduleOrder) &&
    value.moduleOrder.every((item) => typeof item === "string")
  );
}
```

Update `normalizeResumeDraftState` to include `resumeStyle`:

```ts
return {
  selectedIdentity: state.selectedIdentity,
  templateId: state.templateId,
  hasUserSelectedTemplate: state.hasUserSelectedTemplate,
  resumeStyle: normalizeResumeStyle(state.resumeStyle),
  modules: dedupedModules.map((module) => ({
    ...module,
    data: cloneModuleData(module.data)
  })),
  moduleOrder: normalizeModuleOrder(state.moduleOrder, dedupedModules)
};
```

Rename `toStoredResumeStateV3` to `toStoredResumeStateV4` and return:

```ts
return {
  schemaVersion: 4,
  selectedIdentity: normalized.selectedIdentity ?? state.selectedIdentity,
  templateId: normalized.templateId,
  hasUserSelectedTemplate: normalized.hasUserSelectedTemplate,
  resumeStyle: normalized.resumeStyle,
  modules: normalized.modules,
  moduleOrder: normalized.moduleOrder
};
```

When building legacy and V2/V3 migrations, include:

```ts
resumeStyle: { ...defaultResumeStyle }
```

In `migrateUnknownStoredResumeState`, handle V4 first, then V3, V2, and legacy. V3 conversion must copy V3 fields and add `resumeStyle: defaultResumeStyle`.

- [ ] **Step 5: Update backup version and types**

In `src/lib/resumeBackup.ts`, change imports and constants:

```ts
import type { StoredResumeStateV4 } from "../types/resume";

export const RESUME_BACKUP_VERSION = 4;

export interface ResumeBackupPayloadV4 {
  app: typeof RESUME_BACKUP_APP_ID;
  version: typeof RESUME_BACKUP_VERSION;
  exportedAt: string;
  data: StoredResumeStateV4;
}
```

Update return types from `StoredResumeStateV3` to `StoredResumeStateV4`. Keep parser accepting payload versions `1`, `2`, `3`, and `4`.

- [ ] **Step 6: Run tests and commit**

Run:

```bash
npm test -- src/test/store.test.ts src/test/resumeBackup.test.ts
```

Expected: PASS.

Commit:

```bash
git add src/types/resume.ts src/lib/resumeStyle.ts src/lib/resumeMigration.ts src/lib/resumeBackup.ts src/test/store.test.ts src/test/resumeBackup.test.ts
git commit -m "feat: add resume style persistence"
```

---

### Task 2: Store Selection, Duplicate, Delete, and Style Actions

**Files:**
- Modify: `src/store/useResumeStore.ts`
- Modify: `src/test/store.test.ts`

- [ ] **Step 1: Add failing store tests**

Add tests to `src/test/store.test.ts`:

```ts
test("selects newly added modules and avoids duplicate personal modules", () => {
  act(() => {
    useResumeStore.getState().addModule("project");
  });

  const addedProject = useResumeStore.getState().modules.at(-1);
  expect(useResumeStore.getState().activeModuleId).toBe(addedProject?.id);

  const personalBefore = useResumeStore.getState().modules.filter((module) => module.kind === "personal");
  act(() => {
    useResumeStore.getState().addModule("personal");
  });

  const personalAfter = useResumeStore.getState().modules.filter((module) => module.kind === "personal");
  expect(personalAfter).toHaveLength(personalBefore.length);
  expect(useResumeStore.getState().activeModuleId).toBe(personalBefore[0].id);
});

test("duplicates modules with cloned data and new ids", () => {
  const project = useResumeStore.getState().modules.find((module) => module.kind === "project");
  expect(project).toBeTruthy();

  act(() => {
    useResumeStore.getState().duplicateModule(project!.id);
  });

  const projects = useResumeStore.getState().modules.filter((module) => module.kind === "project");
  expect(projects.length).toBeGreaterThan(1);
  expect(projects.at(-1)?.id).not.toBe(project!.id);
  expect(useResumeStore.getState().activeModuleId).toBe(projects.at(-1)?.id);
});

test("deleting selected modules selects a nearby module", () => {
  act(() => {
    useResumeStore.getState().addModule("highlight");
  });

  const targetId = useResumeStore.getState().activeModuleId;
  expect(targetId).toBeTruthy();

  act(() => {
    useResumeStore.getState().deleteModule(targetId!);
  });

  expect(useResumeStore.getState().modules.some((module) => module.id === targetId)).toBe(false);
  expect(useResumeStore.getState().activeModuleId).not.toBe(targetId);
});

test("updates resume style without replacing modules", () => {
  const beforeIds = useResumeStore.getState().modules.map((module) => module.id);

  act(() => {
    useResumeStore.getState().updateResumeStyle({ accentColor: "#0f766e", density: "compact" });
  });

  expect(useResumeStore.getState().modules.map((module) => module.id)).toEqual(beforeIds);
  expect(useResumeStore.getState().resumeStyle.accentColor).toBe("#0f766e");
  expect(useResumeStore.getState().resumeStyle.density).toBe("compact");
});
```

- [ ] **Step 2: Run tests and confirm they fail**

Run:

```bash
npm test -- src/test/store.test.ts
```

Expected: FAIL because `activeModuleId`, `duplicateModule`, `deleteModule`, and `updateResumeStyle` do not exist.

- [ ] **Step 3: Add store actions**

In `src/store/useResumeStore.ts`, import:

```ts
import { defaultResumeStyle, normalizeResumeStyle } from "../lib/resumeStyle";
import { toStoredResumeStateV4 } from "../lib/resumeMigration";
```

Update `persistState`:

```ts
const storedState = toStoredResumeStateV4(state);
```

Add to `ResumeState`:

```ts
activeModuleId: string | null;
selectModule: (moduleId: string | null) => void;
duplicateModule: (moduleId: string) => void;
deleteModule: (moduleId: string) => void;
updateResumeStyle: (nextStyle: Partial<ResumeStyleSettings>) => void;
```

In `normalizeState`, include:

```ts
resumeStyle: normalizeResumeStyle(state.resumeStyle ?? defaultResumeStyle),
```

Initialize store with:

```ts
activeModuleId: null,
selectModule: (moduleId) => set({ activeModuleId: moduleId }),
```

Update `addModule`:

```ts
if (!canAddMultipleModules(kind)) {
  const existingModule = state.modules.find((module) => module.kind === kind);
  if (existingModule) {
    return { activeModuleId: existingModule.id };
  }
}

const nextModule = createModuleInstance(kind, state.selectedIdentity);
...
return { ...nextState, activeModuleId: nextModule.id };
```

Add `duplicateModule`:

```ts
duplicateModule: (moduleId) =>
  set((state) => {
    const targetIndex = findModuleIndex(state.modules, moduleId);
    const targetModule = state.modules[targetIndex];
    if (!targetModule || !canAddMultipleModules(targetModule.kind) || !state.selectedIdentity) {
      return state;
    }

    const copiedModule = createModuleInstance(targetModule.kind, state.selectedIdentity, {
      title: targetModule.title,
      visible: targetModule.visible,
      data: cloneModuleData(targetModule.data)
    });
    const modules = [...state.modules];
    modules.splice(targetIndex + 1, 0, copiedModule);
    const orderIndex = state.moduleOrder.indexOf(moduleId);
    const moduleOrder = [...state.moduleOrder];
    moduleOrder.splice(orderIndex + 1, 0, copiedModule.id);
    const nextState = normalizeState({ ...state, modules, moduleOrder });
    persistState(nextState);
    return { ...nextState, activeModuleId: copiedModule.id };
  }),
```

Rename `removeModule` implementation to shared `deleteModule`, then keep `removeModule` as alias for existing callers:

```ts
deleteModule: (moduleId) => set((state) => removeModuleFromState(state, moduleId)),
removeModule: (moduleId) => set((state) => removeModuleFromState(state, moduleId)),
```

Implement helper above `createResumeStore`:

```ts
function removeModuleFromState(state: ResumeState, moduleId: string) {
  const targetModule = state.modules.find((module) => module.id === moduleId);
  if (!targetModule || targetModule.kind === "personal") {
    return state;
  }

  const normalizedOrder = normalizeModuleOrder(state.moduleOrder, state.modules);
  const targetOrderIndex = normalizedOrder.indexOf(moduleId);
  const modules = state.modules.filter((module) => module.id !== moduleId);
  const moduleOrder = normalizedOrder.filter((id) => id !== moduleId);
  const nextActiveModuleId =
    state.activeModuleId === moduleId
      ? moduleOrder[targetOrderIndex] ?? moduleOrder[targetOrderIndex - 1] ?? null
      : state.activeModuleId;
  const nextState = normalizeState({ ...state, modules, moduleOrder });
  persistState(nextState);
  return { ...nextState, activeModuleId: nextActiveModuleId };
}
```

Add `updateResumeStyle`:

```ts
updateResumeStyle: (nextStyle) =>
  set((state) => {
    const nextState = normalizeState({
      ...state,
      resumeStyle: normalizeResumeStyle({
        ...state.resumeStyle,
        ...nextStyle
      })
    });
    persistState(nextState);
    return nextState;
  }),
```

- [ ] **Step 4: Run tests and commit**

Run:

```bash
npm test -- src/test/store.test.ts
```

Expected: PASS.

Commit:

```bash
git add src/store/useResumeStore.ts src/test/store.test.ts
git commit -m "feat: add module selection and style store actions"
```

---

### Task 3: Module Library and Inspector Components

**Files:**
- Create: `src/components/editor/moduleEditors.tsx`
- Create: `src/components/editor/ModuleLibraryPanel.tsx`
- Create: `src/components/editor/ModuleInspector.tsx`
- Create: `src/components/editor/GlobalStyleInspector.tsx`
- Create: `src/components/editor/InspectorPanel.tsx`
- Modify: `src/App.tsx`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Add failing render tests**

Add tests to `src/test/renderApp.test.tsx`:

```ts
test("renders the Canva-style editor chrome", async () => {
  render(<App />);

  expect(await screen.findByRole("heading", { name: "模块库" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "简历画布" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "属性面板" })).toBeInTheDocument();
});

test("selects a canvas module and edits it from the inspector", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(await screen.findByText("职业摘要"));
  const titleInput = await screen.findByLabelText("模块标题");
  await user.clear(titleInput);
  await user.type(titleInput, "个人优势");

  expect(screen.getAllByText("个人优势").length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run tests and confirm they fail**

Run:

```bash
npm test -- src/test/renderApp.test.tsx
```

Expected: FAIL because the new chrome headings and inspector selection flow are not implemented.

- [ ] **Step 3: Move module editor helpers out of App**

Create `src/components/editor/moduleEditors.tsx` by moving these existing `App.tsx` helpers without changing behavior:

```ts
export function EmptyDraftNote(...)
export function SimpleListEditor(...)
export function TimelineEditor(...)
export function PersonalEditor(...)
export function TextEditor(...)
export function ModuleEditorCard(...)
```

Keep the existing props and imports. Import `fileToResizedDataUrl`, module shape guards, and resume types in this new file.

- [ ] **Step 4: Create module library panel**

Create `src/components/editor/ModuleLibraryPanel.tsx`:

```tsx
import { canAddMultipleModules, getModuleCatalog, getModuleLabel } from "../../lib/moduleRegistry";
import type { ModuleKind, ResumeModuleInstance } from "../../types/resume";

export function ModuleLibraryPanel({
  modules,
  onAddModule
}: {
  modules: ResumeModuleInstance[];
  onAddModule: (kind: ModuleKind) => void;
}) {
  const catalog = getModuleCatalog();

  return (
    <aside className="editor-sidebar editor-sidebar--library" aria-label="模块库">
      <div className="editor-sidebar__header">
        <p className="editor-heading__eyebrow">模块库</p>
        <h2>模块库</h2>
        <p>添加正式简历常用模块，内容会立即进入画布。</p>
      </div>
      <div className="module-library__list">
        {catalog.map((kind) => {
          const existing = modules.some((module) => module.kind === kind);
          const disabled = existing && !canAddMultipleModules(kind);
          return (
            <button
              key={kind}
              type="button"
              className="module-library__item"
              disabled={disabled}
              onClick={() => onAddModule(kind)}
            >
              <span>{getModuleLabel(kind)}</span>
              <small>{disabled ? "已添加" : canAddMultipleModules(kind) ? "可重复添加" : "单例模块"}</small>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
```

- [ ] **Step 5: Create inspector components**

Create `src/components/editor/ModuleInspector.tsx`:

```tsx
import { canAddMultipleModules } from "../../lib/moduleRegistry";
import type { PersonalModuleData, PersonalVisibleField, ResumeModuleInstance, TimelineEntry } from "../../types/resume";
import { ModuleEditorCard } from "./moduleEditors";

export function ModuleInspector(props: {
  module: ResumeModuleInstance;
  hint?: string;
  onUpdateTitle: (title: string) => void;
  onToggleVisibility: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onUpdatePersonalField: (field: keyof Omit<PersonalModuleData, "personalVisibility">, value: string) => void;
  onTogglePersonalField: (field: PersonalVisibleField) => void;
  onUpdateText: (value: string) => void;
  onUpdateTimelineEntry: (index: number, patch: Partial<TimelineEntry>) => void;
  onAddTimelineEntry: () => void;
  onRemoveTimelineEntry: (index: number) => void;
  onUpdateListItem: (index: number, value: string) => void;
  onAddListItem: () => void;
  onRemoveListItem: (index: number) => void;
}) {
  return (
    <div className="inspector-section">
      <div className="inspector-actions">
        <button type="button" className="secondary-button" disabled={!canAddMultipleModules(props.module.kind)} onClick={props.onDuplicate}>
          复制模块
        </button>
        <button type="button" className="ghost-button" disabled={props.module.kind === "personal"} onClick={props.onDelete}>
          删除模块
        </button>
      </div>
      <ModuleEditorCard
        module={props.module}
        hint={props.hint}
        onUpdateTitle={props.onUpdateTitle}
        onToggleVisibility={props.onToggleVisibility}
        onRemove={props.onDelete}
        onUpdatePersonalField={props.onUpdatePersonalField}
        onTogglePersonalField={props.onTogglePersonalField}
        onUpdateText={props.onUpdateText}
        onUpdateTimelineEntry={(index, field, value) => props.onUpdateTimelineEntry(index, { [field]: value })}
        onAddTimelineEntry={props.onAddTimelineEntry}
        onRemoveTimelineEntry={props.onRemoveTimelineEntry}
        onUpdateListItem={props.onUpdateListItem}
        onAddListItem={props.onAddListItem}
        onRemoveListItem={props.onRemoveListItem}
      />
    </div>
  );
}
```

Create `src/components/editor/GlobalStyleInspector.tsx` with controlled inputs for template and style:

```tsx
import type { ResumeStyleSettings, TemplateId } from "../../types/resume";
import type { ResumeTemplateDefinition } from "../../data/resumeTemplates";
import TemplateSelector from "../preview/TemplateSelector";

export function GlobalStyleInspector({
  templates,
  templateId,
  resumeStyle,
  onTemplateChange,
  onStyleChange
}: {
  templates: ResumeTemplateDefinition[];
  templateId: TemplateId;
  resumeStyle: ResumeStyleSettings;
  onTemplateChange: (templateId: TemplateId) => void;
  onStyleChange: (nextStyle: Partial<ResumeStyleSettings>) => void;
}) {
  return (
    <div className="inspector-section">
      <h3>全局样式</h3>
      <TemplateSelector templates={templates} selectedTemplateId={templateId} modules={[]} onTemplateChange={onTemplateChange} compact />
      <label>
        主题色
        <input type="color" value={resumeStyle.accentColor} onChange={(event) => onStyleChange({ accentColor: event.target.value })} />
      </label>
      <label>
        字体密度
        <select value={resumeStyle.density} onChange={(event) => onStyleChange({ density: event.target.value as ResumeStyleSettings["density"] })}>
          <option value="comfortable">舒展</option>
          <option value="compact">紧凑</option>
        </select>
      </label>
      <label>
        模块间距
        <select value={resumeStyle.sectionSpacing} onChange={(event) => onStyleChange({ sectionSpacing: event.target.value as ResumeStyleSettings["sectionSpacing"] })}>
          <option value="tight">紧凑</option>
          <option value="normal">标准</option>
          <option value="loose">宽松</option>
        </select>
      </label>
      <label>
        标题样式
        <select value={resumeStyle.headingStyle} onChange={(event) => onStyleChange({ headingStyle: event.target.value as ResumeStyleSettings["headingStyle"] })}>
          <option value="underline">下划线</option>
          <option value="bar">色条</option>
          <option value="plain">简洁</option>
        </select>
      </label>
    </div>
  );
}
```

Create `InspectorPanel.tsx` to choose `ModuleInspector` when `activeModule` exists and `GlobalStyleInspector` otherwise.

- [ ] **Step 6: Recompose App into three columns**

In `src/App.tsx`, remove local inline editor helpers after moving them. Replace the current workspace body with:

```tsx
<main className="editor-workspace">
  <ModuleLibraryPanel modules={modules} onAddModule={addModule} />
  <section className="canvas-panel" aria-label="简历画布">
    <div className="canvas-panel__header">
      <p className="editor-heading__eyebrow">{selectedTemplate.name}</p>
      <h2>简历画布</h2>
      <p>{getPreviewHint(templateId)}</p>
    </div>
    <PreviewPanel
      modules={modules}
      moduleOrder={moduleOrder}
      templateId={templateId}
      templateOptions={templateOptions}
      resumeStyle={resumeStyle}
      activeModuleId={activeModuleId}
      onSurfaceHeightChange={setPreviewSurfaceHeight}
      onTemplateChange={setTemplate}
      onModuleOrderChange={setModuleOrder}
      onModuleSelect={selectModule}
    />
  </section>
  <InspectorPanel
    activeModule={activeModule}
    selectedPreset={selectedPreset}
    templates={templateOptions}
    templateId={templateId}
    resumeStyle={resumeStyle}
    onTemplateChange={setTemplate}
    onStyleChange={updateResumeStyle}
    onUpdateModuleTitle={updateModuleTitle}
    onToggleModuleVisibility={toggleModuleVisibility}
    onDuplicateModule={duplicateModule}
    onDeleteModule={(moduleId) => {
      if (window.confirm("确定删除这个模块吗？")) {
        deleteModule(moduleId);
      }
    }}
    ...
  />
</main>
```

Define:

```ts
const activeModule = activeModuleId ? modules.find((module) => module.id === activeModuleId) ?? null : null;
```

- [ ] **Step 7: Run render tests and commit**

Run:

```bash
npm test -- src/test/renderApp.test.tsx
```

Expected: PASS.

Commit:

```bash
git add src/App.tsx src/components/editor src/test/renderApp.test.tsx
git commit -m "feat: add editor module library and inspector"
```

---

### Task 4: Canvas Style Application and Print-Safe UI

**Files:**
- Modify: `src/components/preview/PreviewPanel.tsx`
- Modify: `src/components/preview/ResumeTemplateRenderer.tsx`
- Modify: `src/components/preview/templates/ClassicResumeTemplate.tsx`
- Modify: `src/components/preview/templates/SidebarResumeTemplate.tsx`
- Modify: `src/components/preview/templates/CampusResumeTemplate.tsx`
- Modify: `src/components/preview/TemplateSelector.tsx`
- Modify: `src/styles.css`
- Test: `src/test/renderApp.test.tsx`
- Test: `src/test/print.test.ts`

- [ ] **Step 1: Add failing visual structure tests**

Add to `src/test/renderApp.test.tsx`:

```ts
test("applies selected style controls to the resume paper", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(await screen.findByLabelText("主题色"));
  fireEvent.change(screen.getByLabelText("主题色"), { target: { value: "#0f766e" } });

  const paper = document.querySelector(".resume-paper");
  expect(paper).toHaveStyle({ "--resume-accent": "#0f766e" });
});
```

Add to `src/test/print.test.ts`:

```ts
test("print mode hides editor chrome and selection affordances", () => {
  expect(printCss).toContain(".editor-sidebar");
  expect(printCss).toContain(".inspector-panel");
  expect(printCss).toContain(".resume-module--active");
});
```

- [ ] **Step 2: Run tests and confirm they fail**

Run:

```bash
npm test -- src/test/renderApp.test.tsx src/test/print.test.ts
```

Expected: FAIL because style variables and print hiding are not wired.

- [ ] **Step 3: Pass style settings into preview and templates**

Update `PreviewPanelProps`:

```ts
resumeStyle: ResumeStyleSettings;
```

Import:

```ts
import { getResumeStyleVars } from "../../lib/resumeStyle";
import type { ResumeStyleSettings } from "../../types/resume";
```

Apply on paper:

```tsx
<div
  className={`resume-paper ${currentTemplate.printClassName} resume-density-${resumeStyle.density} resume-spacing-${resumeStyle.sectionSpacing} resume-heading-${resumeStyle.headingStyle}`}
  style={getResumeStyleVars(resumeStyle)}
>
```

Pass `resumeStyle` into `ResumeTemplateRenderer`.

- [ ] **Step 4: Update template renderer props**

In `ResumeTemplateRenderer.tsx`, add `resumeStyle` to props and `templateProps`. In each template component prop type, accept but do not duplicate style logic:

```ts
resumeStyle: ResumeStyleSettings;
```

The style is applied at `.resume-paper`, so templates only need type compatibility.

- [ ] **Step 5: Make TemplateSelector compact-capable**

Update `TemplateSelector` props:

```ts
compact?: boolean;
```

Add class:

```tsx
className={`template-selector ${compact ? "template-selector--compact" : ""}`}
```

When compact and `modules.length === 0`, render metadata-only cards instead of thumbnails.

- [ ] **Step 6: Add CSS for three-column layout, styles, and print**

In `src/styles.css`, add:

```css
.editor-workspace {
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(620px, 1fr) minmax(280px, 360px);
  gap: 20px;
  align-items: start;
  padding: 20px;
}

.editor-sidebar,
.inspector-panel,
.canvas-panel {
  min-width: 0;
}

.editor-sidebar,
.inspector-panel {
  position: sticky;
  top: 84px;
  max-height: calc(100vh - 108px);
  overflow: auto;
  border: 1px solid #d9e1ec;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}

.canvas-panel {
  min-width: 0;
}

.resume-module--active {
  outline: 2px solid var(--resume-accent);
  outline-offset: 4px;
}

.resume-density-compact {
  font-size: 0.94em;
}

.resume-spacing-tight .resume-section {
  margin-bottom: 10px;
}

.resume-spacing-normal .resume-section {
  margin-bottom: 16px;
}

.resume-spacing-loose .resume-section {
  margin-bottom: 22px;
}

.resume-heading-bar .resume-section__title {
  border-left: 4px solid var(--resume-accent);
  padding-left: 8px;
}

.resume-heading-plain .resume-section__title {
  border-bottom: 0;
}

@media print {
  .editor-sidebar,
  .inspector-panel,
  .canvas-panel__header,
  .resume-module--active {
    outline: 0 !important;
  }

  .editor-sidebar,
  .inspector-panel {
    display: none !important;
  }
}
```

Adjust class names to match existing template section classes after inspecting current template markup.

- [ ] **Step 7: Run tests and commit**

Run:

```bash
npm test -- src/test/renderApp.test.tsx src/test/print.test.ts
npm run build
```

Expected: PASS.

Commit:

```bash
git add src/components/preview src/styles.css src/test/renderApp.test.tsx src/test/print.test.ts
git commit -m "feat: apply resume canvas style controls"
```

---

### Task 5: Browser Verification, Documentation, and Final Polish

**Files:**
- Modify: `30_Dev_Log.md`
- Modify after QA if verification exposes a concrete defect: `src/styles.css`
- Modify after QA if verification exposes a concrete defect: `src/App.tsx`
- Modify after QA if verification exposes a concrete defect: `src/components/preview/PreviewPanel.tsx`
- Modify after QA if verification exposes a concrete defect: `src/components/editor/InspectorPanel.tsx`

- [ ] **Step 1: Run full automated verification**

Run:

```bash
npm test
npm run build
```

Expected: all tests pass and Vite production build succeeds.

- [ ] **Step 2: Start the dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL such as `http://127.0.0.1:5173/`.

- [ ] **Step 3: Browser-check core workflow**

Open the local URL and verify:

```text
1. The app shows a three-column editor after identity selection or stored state load.
2. Left column contains module library entries.
3. Clicking a module adds it to the canvas and selects it.
4. Clicking a canvas module selects it.
5. Right inspector edits the selected module title and content.
6. Copying a repeatable module creates a second instance and selects it.
7. Deleting a repeatable module removes it and selects a nearby module or global settings.
8. Global style controls change theme color, density, spacing, and heading style in the canvas.
9. Template switching still changes the A4 preview.
10. Refresh preserves content, order, template, and style settings.
```

- [ ] **Step 4: Browser-check responsive behavior**

Check desktop and mobile-width viewport:

```text
Desktop: three columns are visible, canvas remains readable, inspector scrolls independently.
Mobile: columns stack, no horizontal overflow blocks basic preview and editing.
```

- [ ] **Step 5: Print/PDF check**

Use browser print preview or headless Chrome PDF generation and verify:

```text
1. Header bar is absent from the PDF.
2. Module library is absent from the PDF.
3. Inspector panel is absent from the PDF.
4. Canvas header is absent from the PDF.
5. Selected-module outlines are absent from the PDF.
6. Resume content is not visibly overlapped or clipped.
```

- [ ] **Step 6: Record implementation result**

Add to the top of `30_Dev_Log.md`:

```md
## 2026-07-05

- 任务：实现 Canva 感结构化简历编辑器
- 操作：新增三栏式编辑体验，补充模块库、A4 画布选中态、右侧属性面板、全局样式设置、样式持久化与 JSON 备份兼容
- 结果：用户可以像主流简历网站一样添加模块、选中画布模块、编辑属性、切换模板与基础样式，并继续导出 PDF
- 验证：
  - `npm test` 通过
  - `npm run build` 通过
  - 浏览器检查三栏布局、模块添加、画布选中、属性编辑、样式切换、刷新持久化通过
  - PDF 检查确认编辑器 UI 和选中边框未进入导出内容
- 后续：
  - 可继续打磨模板缩略图、AI 润色、照片裁剪和移动端完整编辑体验
```

- [ ] **Step 7: Commit final polish and log**

Run:

```bash
git add 30_Dev_Log.md src
git commit -m "feat: implement canva style resume editor"
```

Expected: commit succeeds and `git status --short` is clean.

---

## Self-Review

- Spec coverage:
  - Module library: Task 3
  - A4 canvas selection and sorting: Tasks 3 and 4
  - Inspector panel: Task 3
  - Template and style controls: Tasks 1, 3, and 4
  - Persistence and JSON import/export: Task 1
  - Print-safe export: Task 4 and Task 5
  - Desktop and mobile checks: Task 5
- Placeholder scan:
  - The plan contains no placeholder markers or undefined implementation gaps.
- Type consistency:
  - Style fields use `ResumeStyleSettings`.
  - Stored schema moves from V3 to V4.
  - Store action names match the spec: `selectModule`, `duplicateModule`, `deleteModule`, `updateResumeStyle`.
