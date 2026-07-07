import { useMemo, useState, type CSSProperties } from "react";
import { HeaderBar } from "./components/HeaderBar";
import { InspectorPanel } from "./components/editor/InspectorPanel";
import { ModuleLibraryPanel } from "./components/editor/ModuleLibraryPanel";
import PreviewPanel, { getPreviewHint } from "./components/preview/PreviewPanel";
import {
  getIdentityPreset,
  getIdentityPresets,
  RESUME_TOOL_BRAND
} from "./data/identityPresets";
import { getResumeTemplate, getResumeTemplates } from "./data/resumeTemplates";
import {
  canAddMultipleModules,
  getModuleCatalog,
  getModuleLabel,
  getModuleShape,
  isListModuleData,
  isPersonalModuleData,
  isTextModuleData,
  isTimelineModuleData
} from "./lib/moduleRegistry";
import { fileToResizedDataUrl } from "./lib/image";
import {
  createResumeBackupFilename,
  parseResumeBackup,
  serializeResumeBackup
} from "./lib/resumeBackup";
import { useResumeStore } from "./store/useResumeStore";
import type {
  IdentityPreset,
  ModuleKind,
  PersonalModuleData,
  PersonalVisibleField,
  ResumeModuleInstance
} from "./types/resume";
import "./styles.css";

function EmptyDraftNote({ text }: { text: string }) {
  return <p className="editor-empty-note">{text}</p>;
}

function IdentityEntryScreen({ onSelect }: { onSelect: (identity: IdentityPreset) => void }) {
  const presets = getIdentityPresets();

  return (
    <div className="identity-screen">
      <div className="identity-screen__layout">
        <section className="identity-screen__hero" aria-labelledby="identity-entry-title">
          <p className="eyebrow">{RESUME_TOOL_BRAND}</p>
          <h1 id="identity-entry-title">选择简历结构</h1>
          <p>先定纸张骨架，进入后再调整模块、顺序和模板。</p>
          <div className="identity-screen__paper" aria-hidden="true">
            <div className="identity-paper__toolbar">
              <span>A4</span>
              <span>模块化简历</span>
            </div>
            <div className="identity-paper__sheet">
              <i className="identity-paper__name" />
              <i className="identity-paper__line identity-paper__line--wide" />
              <i className="identity-paper__line" />
              <b />
              <i className="identity-paper__line identity-paper__line--wide" />
              <i className="identity-paper__line identity-paper__line--short" />
              <b />
              <i className="identity-paper__line identity-paper__line--wide" />
              <i className="identity-paper__line" />
              <i className="identity-paper__line identity-paper__line--short" />
            </div>
          </div>
        </section>
        <section className="identity-screen__choices" aria-label="简历起点">
          <div className="identity-screen__choices-header">
            <span>结构</span>
            <strong>选择起点</strong>
          </div>
          <div className="identity-grid">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`identity-card identity-card--${preset.id}`}
                onClick={() => onSelect(preset.id)}
              >
                <span className="identity-card__meta">
                  <span>{String(preset.recommendedModules.length).padStart(2, "0")} 个模块</span>
                  <span>{getResumeTemplate(preset.id === "student" ? "campus" : "classic").name}</span>
                </span>
                <span className="identity-card__label">{preset.label}</span>
                <span className="identity-card__intro">{preset.intro}</span>
                <span className="identity-card__hint">{preset.focusHint}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SimpleListEditor({
  module,
  itemLabel,
  addLabel,
  emptyNote,
  multiline = false,
  onChangeItem,
  onRemoveItem,
  onAddItem
}: {
  module: ResumeModuleInstance;
  itemLabel: string;
  addLabel: string;
  emptyNote: string;
  multiline?: boolean;
  onChangeItem: (index: number, value: string) => void;
  onRemoveItem: (index: number) => void;
  onAddItem: () => void;
}) {
  if (!isListModuleData(module.data)) {
    return null;
  }

  return (
    <div className="section-list">
      {module.data.items.length === 0 ? <EmptyDraftNote text={emptyNote} /> : null}
      {module.data.items.map((item, index) => (
        <div key={`${module.id}-${index}`} className="inline-row">
          <label className="inline-row__field">
            {itemLabel} {index + 1}
            {multiline ? (
              <textarea
                aria-label={`${itemLabel} ${index + 1}`}
                rows={3}
                value={item}
                onChange={(event) => onChangeItem(index, event.target.value)}
              />
            ) : (
              <input
                aria-label={`${itemLabel} ${index + 1}`}
                value={item}
                onChange={(event) => onChangeItem(index, event.target.value)}
              />
            )}
          </label>
          <button
            type="button"
            className="ghost-button"
            aria-label={`删除${itemLabel} ${index + 1}`}
            onClick={() => onRemoveItem(index)}
          >
            删除
          </button>
        </div>
      ))}
      <button type="button" className="secondary-button" onClick={onAddItem}>
        {addLabel}
      </button>
    </div>
  );
}

function TimelineEditor({
  module,
  onUpdateEntry,
  onAddEntry,
  onRemoveEntry
}: {
  module: ResumeModuleInstance;
  onUpdateEntry: (index: number, field: "title" | "org" | "start" | "end" | "location", value: string) => void;
  onAddEntry: () => void;
  onRemoveEntry: (index: number) => void;
}) {
  if (!isTimelineModuleData(module.data)) {
    return null;
  }

  return (
    <div className="section-list">
      {module.data.entries.map((entry, index) => (
        <article key={entry.id} className="list-item">
          <div className="form-grid">
            <label>
              标题
              <input value={entry.title} onChange={(event) => onUpdateEntry(index, "title", event.target.value)} />
            </label>
            <label>
              组织
              <input value={entry.org} onChange={(event) => onUpdateEntry(index, "org", event.target.value)} />
            </label>
            <label>
              开始时间
              <input value={entry.start} onChange={(event) => onUpdateEntry(index, "start", event.target.value)} />
            </label>
            <label>
              结束时间
              <input value={entry.end} onChange={(event) => onUpdateEntry(index, "end", event.target.value)} />
            </label>
            <label className="form-span-full">
              地点
              <input
                value={entry.location}
                onChange={(event) => onUpdateEntry(index, "location", event.target.value)}
              />
            </label>
          </div>
          <div className="list-item__actions">
            <button
              type="button"
              className="ghost-button"
              aria-label={`删除${module.title}条目 ${index + 1}`}
              onClick={() => onRemoveEntry(index)}
            >
              删除条目
            </button>
          </div>
        </article>
      ))}
      <button type="button" className="secondary-button" onClick={onAddEntry}>
        新增{module.title}
      </button>
    </div>
  );
}

function PersonalEditor({
  module,
  onUpdateField,
  onToggleField
}: {
  module: ResumeModuleInstance;
  onUpdateField: (field: keyof Omit<PersonalModuleData, "personalVisibility">, value: string) => void;
  onToggleField: (field: PersonalVisibleField) => void;
}) {
  if (!isPersonalModuleData(module.data)) {
    return null;
  }

  const personalData = module.data;

  const fields: Array<{
    key: keyof Omit<PersonalModuleData, "personalVisibility">;
    label: string;
    visibilityKey?: PersonalVisibleField;
    multiline?: boolean;
  }> = [
    { key: "name", label: "姓名" },
    { key: "title", label: "求职意向", visibilityKey: "title" },
    { key: "phone", label: "手机", visibilityKey: "phone" },
    { key: "email", label: "邮箱", visibilityKey: "email" },
    { key: "city", label: "城市", visibilityKey: "city" },
    { key: "blog", label: "个人博客", visibilityKey: "blog" },
    { key: "github", label: "GitHub", visibilityKey: "github" }
  ];

  return (
    <div className="form-grid">
      <div className="photo-editor form-span-full">
        <div className="photo-editor__preview">
          {module.data.photoDataUrl ? <img src={module.data.photoDataUrl} alt="个人照片预览" /> : <span>照片</span>}
        </div>
        <div className="photo-editor__body">
          <span className="field-stack__label">个人照片</span>
          <p>可选上传，上传后会显示在简历右侧个人信息区。</p>
          <div className="photo-editor__actions">
            <label className="secondary-button photo-editor__upload">
              上传照片
              <input
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    const nextPhoto = await fileToResizedDataUrl(file);
                    onUpdateField("photoDataUrl", nextPhoto);
                  }
                  event.target.value = "";
                }}
              />
            </label>
            {module.data.photoDataUrl ? (
              <button type="button" className="ghost-button" onClick={() => onUpdateField("photoDataUrl", "")}>
                移除照片
              </button>
            ) : null}
          </div>
        </div>
      </div>
      {fields.map((field) => (
        <div key={field.key} className="personal-field">
          <div className="personal-field__header">
            <label htmlFor={`${module.id}-${field.key}`}>{field.label}</label>
            {field.visibilityKey ? (
              <label className="visibility-toggle">
                <input
                  type="checkbox"
                  checked={personalData.personalVisibility[field.visibilityKey]}
                  onChange={() => onToggleField(field.visibilityKey as PersonalVisibleField)}
                />
                <span>显示到简历</span>
              </label>
            ) : null}
          </div>
          <input
            id={`${module.id}-${field.key}`}
            aria-label={field.label}
            value={personalData[field.key] as string}
            onChange={(event) => onUpdateField(field.key, event.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

function TextEditor({
  module,
  onChange
}: {
  module: ResumeModuleInstance;
  onChange: (value: string) => void;
}) {
  if (!isTextModuleData(module.data)) {
    return null;
  }

  return (
    <label className="inline-row__field">
      正文
      <textarea
        aria-label={`${module.title}内容`}
        rows={4}
        value={module.data.value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ModuleEditorCard({
  module,
  hint,
  onUpdateTitle,
  onToggleVisibility,
  onRemove,
  onUpdatePersonalField,
  onTogglePersonalField,
  onUpdateText,
  onUpdateTimelineEntry,
  onAddTimelineEntry,
  onRemoveTimelineEntry,
  onUpdateListItem,
  onAddListItem,
  onRemoveListItem
}: {
  module: ResumeModuleInstance;
  hint?: string;
  onUpdateTitle: (title: string) => void;
  onToggleVisibility: () => void;
  onRemove: () => void;
  onUpdatePersonalField: (field: keyof Omit<PersonalModuleData, "personalVisibility">, value: string) => void;
  onTogglePersonalField: (field: PersonalVisibleField) => void;
  onUpdateText: (value: string) => void;
  onUpdateTimelineEntry: (index: number, field: "title" | "org" | "start" | "end" | "location", value: string) => void;
  onAddTimelineEntry: () => void;
  onRemoveTimelineEntry: (index: number) => void;
  onUpdateListItem: (index: number, value: string) => void;
  onAddListItem: () => void;
  onRemoveListItem: (index: number) => void;
}) {
  return (
    <article className="section-card section-card--expanded">
      <div className="section-card__header">
        <label className="section-card__toggle">
          <input type="checkbox" checked={module.visible} onChange={onToggleVisibility} />
          <span>{module.title}</span>
        </label>
        {module.kind !== "personal" ? (
          <button type="button" className="ghost-button" onClick={onRemove}>
            删除模块
          </button>
        ) : null}
      </div>
      <div className="section-card__body">
        <div className="form-grid">
          <label className="form-span-full">
            模块标题
            <input aria-label={`${module.title}标题`} value={module.title} onChange={(event) => onUpdateTitle(event.target.value)} />
          </label>
        </div>
        {hint ? <p className="editor-empty-note">{hint}</p> : null}
        {module.kind === "personal" ? (
          <PersonalEditor
            module={module}
            onUpdateField={onUpdatePersonalField}
            onToggleField={onTogglePersonalField}
          />
        ) : null}
        {getModuleShape(module.kind) === "text" ? (
          <TextEditor module={module} onChange={onUpdateText} />
        ) : null}
        {getModuleShape(module.kind) === "timeline" ? (
          <TimelineEditor
            module={module}
            onUpdateEntry={onUpdateTimelineEntry}
            onAddEntry={onAddTimelineEntry}
            onRemoveEntry={onRemoveTimelineEntry}
          />
        ) : null}
        {getModuleShape(module.kind) === "list" ? (
          <SimpleListEditor
            module={module}
            itemLabel={module.title}
            addLabel={`新增${module.title}`}
            emptyNote={`暂无${module.title}，可点击下方新增。`}
            multiline={module.kind === "highlight"}
            onChangeItem={onUpdateListItem}
            onRemoveItem={onRemoveListItem}
            onAddItem={onAddListItem}
          />
        ) : null}
      </div>
    </article>
  );
}

function ModuleLibrary({
  isOpen,
  onToggle,
  onAdd
}: {
  isOpen: boolean;
  onToggle: () => void;
  onAdd: (kind: ModuleKind) => void;
}) {
  const catalog = getModuleCatalog();

  return (
    <section className="module-library">
      <div className="module-library__header">
        <div>
          <p className="editor-heading__eyebrow">官方模块库</p>
          <h3 className="module-library__title">添加更多模块</h3>
        </div>
        <button
          type="button"
          className="secondary-button module-library__toggle"
          aria-expanded={isOpen}
          onClick={onToggle}
        >
          {isOpen ? "收起模块库" : "添加模块"}
        </button>
      </div>
      {isOpen ? (
        <div className="module-library__panel">
          <div className="module-library__grid">
            {catalog.map((kind) => (
              <button key={kind} type="button" className="module-library__item" onClick={() => onAdd(kind)}>
                <span>{getModuleLabel(kind)}</span>
                <small>{canAddMultipleModules(kind) ? "可重复添加" : "单例模块"}</small>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default function App() {
  const hasStoredState = useResumeStore((state) => state.hasStoredState);
  const selectedIdentity = useResumeStore((state) => state.selectedIdentity);
  const templateId = useResumeStore((state) => state.templateId);
  const resumeStyle = useResumeStore((state) => state.resumeStyle);
  const activeModuleId = useResumeStore((state) => state.activeModuleId);
  const modules = useResumeStore((state) => state.modules);
  const moduleOrder = useResumeStore((state) => state.moduleOrder);
  const setTemplate = useResumeStore((state) => state.setTemplate);
  const selectModule = useResumeStore((state) => state.selectModule);
  const initializeIdentity = useResumeStore((state) => state.initializeIdentity);
  const switchIdentity = useResumeStore((state) => state.switchIdentity);
  const applyIdentityRecommendation = useResumeStore((state) => state.applyIdentityRecommendation);
  const replaceResumeState = useResumeStore((state) => state.replaceResumeState);
  const updateResumeStyle = useResumeStore((state) => state.updateResumeStyle);
  const updateModuleTitle = useResumeStore((state) => state.updateModuleTitle);
  const toggleModuleVisibility = useResumeStore((state) => state.toggleModuleVisibility);
  const setModuleOrder = useResumeStore((state) => state.setModuleOrder);
  const addModule = useResumeStore((state) => state.addModule);
  const duplicateModule = useResumeStore((state) => state.duplicateModule);
  const deleteModule = useResumeStore((state) => state.deleteModule);
  const updatePersonalField = useResumeStore((state) => state.updatePersonalField);
  const togglePersonalField = useResumeStore((state) => state.togglePersonalField);
  const updateTextValue = useResumeStore((state) => state.updateTextValue);
  const updateTimelineEntry = useResumeStore((state) => state.updateTimelineEntry);
  const addTimelineEntry = useResumeStore((state) => state.addTimelineEntry);
  const removeTimelineEntry = useResumeStore((state) => state.removeTimelineEntry);
  const updateListItem = useResumeStore((state) => state.updateListItem);
  const addListItem = useResumeStore((state) => state.addListItem);
  const removeListItem = useResumeStore((state) => state.removeListItem);
  const reset = useResumeStore((state) => state.reset);
  const [previewSurfaceHeight, setPreviewSurfaceHeight] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [pendingDeleteModuleId, setPendingDeleteModuleId] = useState<string | null>(null);

  const selectedPreset = selectedIdentity ? getIdentityPreset(selectedIdentity) : null;
  const templateOptions = useMemo(() => getResumeTemplates(), []);
  const selectedTemplate = getResumeTemplate(templateId);
  const activeModule = activeModuleId ? modules.find((module) => module.id === activeModuleId) ?? null : null;
  const pendingDeleteModule = pendingDeleteModuleId
    ? modules.find((module) => module.id === pendingDeleteModuleId) ?? null
    : null;
  const visibleModuleCount = modules.reduce((count, module) => (module.visible ? count + 1 : count), 0);
  const orderedModules = useMemo(() => {
    const moduleById = new Map(modules.map((module) => [module.id, module] as const));
    return moduleOrder
      .map((moduleId) => moduleById.get(moduleId))
      .filter((module): module is ResumeModuleInstance => Boolean(module));
  }, [moduleOrder, modules]);

  function showStatus(message: string) {
    setStatusMessage(message);
  }

  function handleExportData() {
    if (!selectedIdentity) {
      return;
    }

    const content = serializeResumeBackup({
      schemaVersion: 4,
      selectedIdentity,
      templateId,
      hasUserSelectedTemplate: useResumeStore.getState().hasUserSelectedTemplate,
      resumeStyle,
      modules,
      moduleOrder
    });
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = createResumeBackupFilename();
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showStatus("数据已导出。");
  }

  async function handleImportData(file: File) {
    let raw = "";

    try {
      raw = await file.text();
    } catch {
      showStatus("无法读取文件。");
      return;
    }

    const parsed = parseResumeBackup(raw);
    if (!parsed.ok) {
      showStatus(parsed.error);
      return;
    }

    const confirmed = window.confirm("导入会覆盖当前正在编辑的简历，确定继续吗？");
    if (!confirmed) {
      showStatus("导入已取消。");
      return;
    }

    replaceResumeState(parsed.state);
    showStatus("数据已导入。");
  }

  if (!selectedIdentity && !hasStoredState) {
    return (
      <div className="app-shell">
        <IdentityEntryScreen onSelect={initializeIdentity} />
      </div>
    );
  }

  const currentIdentity = selectedIdentity ?? "general";
  const identityLabel = selectedPreset?.label ?? "通用求职者";
  const editorPanelStyle = previewSurfaceHeight
    ? ({
        "--editor-panel-height": `${previewSurfaceHeight}px`
      } as CSSProperties)
    : undefined;

  return (
    <div className="app-shell">
      <HeaderBar
        identity={currentIdentity}
        identityLabel={identityLabel}
        statusMessage={statusMessage}
        onReset={reset}
        onExportData={handleExportData}
        onImportData={(file) => {
          void handleImportData(file);
        }}
        onSwitchIdentity={(identity) => {
          switchIdentity(identity);
          showStatus("身份已切换，当前内容不会自动覆盖。");
        }}
        onApplyPreset={() => {
          applyIdentityRecommendation();
          showStatus("已应用当前身份的推荐配置。");
        }}
      />

      <main className="editor-workspace">
        <ModuleLibraryPanel
          modules={modules}
          moduleOrder={moduleOrder}
          activeModuleId={activeModuleId}
          templates={templateOptions}
          templateId={templateId}
          resumeStyle={resumeStyle}
          onSelectModule={selectModule}
          onAddModule={addModule}
          onTemplateChange={(nextTemplateId) => {
            setTemplate(nextTemplateId);
            showStatus(`已切换到${getResumeTemplate(nextTemplateId).name}。`);
          }}
          onStyleChange={updateResumeStyle}
        />

        <section className="canvas-panel" aria-label="简历画布" style={editorPanelStyle}>
          <div className="canvas-panel__header">
            <div className="canvas-panel__meta" aria-label="纸面状态">
              <span>A4</span>
              <strong>{selectedTemplate.name}</strong>
              <span>{visibleModuleCount} 个模块</span>
            </div>
          </div>

          <PreviewPanel
            modules={modules}
            moduleOrder={moduleOrder}
            templateId={templateId}
            resumeStyle={resumeStyle}
            activeModuleId={activeModuleId}
            eyebrow={selectedTemplate.name}
            heading="纸面"
            hint={getPreviewHint(templateId)}
            onSurfaceHeightChange={setPreviewSurfaceHeight}
            onModuleOrderChange={setModuleOrder}
            onModuleSelect={selectModule}
          />
        </section>

        <InspectorPanel
          activeModule={activeModule}
          moduleHint={activeModule ? selectedPreset?.moduleHints[activeModule.kind] : undefined}
          onUpdateModuleTitle={updateModuleTitle}
          onToggleModuleVisibility={toggleModuleVisibility}
          onDuplicateModule={duplicateModule}
          onDeleteModule={setPendingDeleteModuleId}
          onUpdatePersonalField={updatePersonalField}
          onTogglePersonalField={togglePersonalField}
          onUpdateText={updateTextValue}
          onUpdateTimelineEntry={updateTimelineEntry}
          onAddTimelineEntry={addTimelineEntry}
          onRemoveTimelineEntry={removeTimelineEntry}
          onUpdateListItem={updateListItem}
          onAddListItem={addListItem}
          onRemoveListItem={removeListItem}
        />
      </main>

      {pendingDeleteModule ? (
        <div className="confirm-dialog-shell" role="presentation">
          <section
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-module-dialog-title"
          >
            <div className="confirm-dialog__body">
              <p className="confirm-dialog__eyebrow">确认操作</p>
              <h2 id="delete-module-dialog-title">删除模块</h2>
              <p>
                确认删除「{pendingDeleteModule.title}」吗？该模块里的内容会从当前简历中移除。
              </p>
            </div>
            <div className="confirm-dialog__actions">
              <button type="button" className="ghost-button" onClick={() => setPendingDeleteModuleId(null)}>
                取消
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => {
                  deleteModule(pendingDeleteModule.id);
                  setPendingDeleteModuleId(null);
                  showStatus("模块已删除。");
                }}
              >
                确认删除
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <footer className="footer-note">当前版本为桌面端优先，内容会自动保存在当前浏览器。</footer>
    </div>
  );
}
