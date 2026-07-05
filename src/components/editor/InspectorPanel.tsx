import { fileToResizedDataUrl } from "../../lib/image";
import {
  canAddMultipleModules,
  getModuleShape,
  isListModuleData,
  isPersonalModuleData,
  isTextModuleData,
  isTimelineModuleData
} from "../../lib/moduleRegistry";
import type { ResumeTemplateDefinition } from "../../data/resumeTemplates";
import type {
  PersonalModuleData,
  PersonalVisibleField,
  ResumeModuleInstance,
  ResumeStyleSettings,
  TemplateId,
  TimelineEntry
} from "../../types/resume";

function InspectorEmptyState() {
  return (
    <div className="inspector-empty">
      <h3>选择画布模块</h3>
      <p>点击中间简历画布上的模块后，可在这里编辑标题、内容和显示状态。</p>
    </div>
  );
}

function PersonalInspector({
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
    <div className="inspector-form">
      <div className="photo-editor">
        <div className="photo-editor__preview">
          {module.data.photoDataUrl ? <img src={module.data.photoDataUrl} alt="个人照片预览" /> : <span>照片</span>}
        </div>
        <div className="photo-editor__body">
          <span className="field-stack__label">个人照片</span>
          <div className="photo-editor__actions">
            <label className="secondary-button photo-editor__upload">
              上传照片
              <input
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    onUpdateField("photoDataUrl", await fileToResizedDataUrl(file));
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
        <label key={field.key}>
          <span>{field.label}</span>
          <input
            aria-label={field.label}
            value={personalData[field.key] as string}
            onChange={(event) => onUpdateField(field.key, event.target.value)}
          />
          {field.visibilityKey ? (
            <span className="visibility-toggle">
              <input
                type="checkbox"
                checked={personalData.personalVisibility[field.visibilityKey]}
                onChange={() => onToggleField(field.visibilityKey as PersonalVisibleField)}
              />
              <span>显示到简历</span>
            </span>
          ) : null}
        </label>
      ))}
    </div>
  );
}

function TextInspector({ module, onUpdateText }: { module: ResumeModuleInstance; onUpdateText: (value: string) => void }) {
  if (!isTextModuleData(module.data)) {
    return null;
  }

  return (
    <label>
      正文
      <textarea
        aria-label={`${module.title}内容`}
        rows={5}
        value={module.data.value}
        onChange={(event) => onUpdateText(event.target.value)}
      />
    </label>
  );
}

function TimelineInspector({
  module,
  onUpdateTimelineEntry,
  onAddTimelineEntry,
  onRemoveTimelineEntry
}: {
  module: ResumeModuleInstance;
  onUpdateTimelineEntry: (index: number, patch: Partial<TimelineEntry>) => void;
  onAddTimelineEntry: () => void;
  onRemoveTimelineEntry: (index: number) => void;
}) {
  if (!isTimelineModuleData(module.data)) {
    return null;
  }

  return (
    <div className="inspector-form">
      {module.data.entries.map((entry, index) => (
        <article key={entry.id} className="list-item">
          <label>
            标题
            <input value={entry.title} onChange={(event) => onUpdateTimelineEntry(index, { title: event.target.value })} />
          </label>
          <label>
            组织
            <input value={entry.org} onChange={(event) => onUpdateTimelineEntry(index, { org: event.target.value })} />
          </label>
          <label>
            开始时间
            <input value={entry.start} onChange={(event) => onUpdateTimelineEntry(index, { start: event.target.value })} />
          </label>
          <label>
            结束时间
            <input value={entry.end} onChange={(event) => onUpdateTimelineEntry(index, { end: event.target.value })} />
          </label>
          <label>
            地点
            <input value={entry.location} onChange={(event) => onUpdateTimelineEntry(index, { location: event.target.value })} />
          </label>
          <button type="button" className="ghost-button" onClick={() => onRemoveTimelineEntry(index)}>
            删除条目
          </button>
        </article>
      ))}
      <button type="button" className="secondary-button" onClick={onAddTimelineEntry}>
        新增{module.title}
      </button>
    </div>
  );
}

function ListInspector({
  module,
  onUpdateListItem,
  onAddListItem,
  onRemoveListItem
}: {
  module: ResumeModuleInstance;
  onUpdateListItem: (index: number, value: string) => void;
  onAddListItem: () => void;
  onRemoveListItem: (index: number) => void;
}) {
  if (!isListModuleData(module.data)) {
    return null;
  }

  return (
    <div className="inspector-form">
      {module.data.items.map((item, index) => (
        <div key={`${module.id}-${index}`} className="inline-row">
          <label className="inline-row__field">
            {module.title} {index + 1}
            <textarea
              aria-label={`${module.title} ${index + 1}`}
              rows={module.kind === "highlight" ? 3 : 2}
              value={item}
              onChange={(event) => onUpdateListItem(index, event.target.value)}
            />
          </label>
          <button type="button" className="ghost-button" onClick={() => onRemoveListItem(index)}>
            删除
          </button>
        </div>
      ))}
      <button type="button" className="secondary-button" onClick={onAddListItem}>
        新增{module.title}
      </button>
    </div>
  );
}

function GlobalStyleInspector({
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
      <label>
        当前模板
        <select value={templateId} onChange={(event) => onTemplateChange(event.target.value as TemplateId)}>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        主题色
        <input
          aria-label="主题色"
          type="color"
          value={resumeStyle.accentColor}
          onChange={(event) => onStyleChange({ accentColor: event.target.value })}
        />
      </label>
      <label>
        字体密度
        <select
          value={resumeStyle.density}
          onChange={(event) => onStyleChange({ density: event.target.value as ResumeStyleSettings["density"] })}
        >
          <option value="comfortable">舒展</option>
          <option value="compact">紧凑</option>
        </select>
      </label>
      <label>
        模块间距
        <select
          value={resumeStyle.sectionSpacing}
          onChange={(event) =>
            onStyleChange({ sectionSpacing: event.target.value as ResumeStyleSettings["sectionSpacing"] })
          }
        >
          <option value="tight">紧凑</option>
          <option value="normal">标准</option>
          <option value="loose">宽松</option>
        </select>
      </label>
      <label>
        标题样式
        <select
          value={resumeStyle.headingStyle}
          onChange={(event) =>
            onStyleChange({ headingStyle: event.target.value as ResumeStyleSettings["headingStyle"] })
          }
        >
          <option value="underline">下划线</option>
          <option value="bar">色条</option>
          <option value="plain">简洁</option>
        </select>
      </label>
    </div>
  );
}

export function InspectorPanel({
  activeModule,
  moduleHint,
  templates,
  templateId,
  resumeStyle,
  onTemplateChange,
  onStyleChange,
  onUpdateModuleTitle,
  onToggleModuleVisibility,
  onDuplicateModule,
  onDeleteModule,
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
  activeModule: ResumeModuleInstance | null;
  moduleHint?: string;
  templates: ResumeTemplateDefinition[];
  templateId: TemplateId;
  resumeStyle: ResumeStyleSettings;
  onTemplateChange: (templateId: TemplateId) => void;
  onStyleChange: (nextStyle: Partial<ResumeStyleSettings>) => void;
  onUpdateModuleTitle: (moduleId: string, title: string) => void;
  onToggleModuleVisibility: (moduleId: string) => void;
  onDuplicateModule: (moduleId: string) => void;
  onDeleteModule: (moduleId: string) => void;
  onUpdatePersonalField: (moduleId: string, field: keyof Omit<PersonalModuleData, "personalVisibility">, value: string) => void;
  onTogglePersonalField: (moduleId: string, field: PersonalVisibleField) => void;
  onUpdateText: (moduleId: string, value: string) => void;
  onUpdateTimelineEntry: (moduleId: string, index: number, patch: Partial<TimelineEntry>) => void;
  onAddTimelineEntry: (moduleId: string) => void;
  onRemoveTimelineEntry: (moduleId: string, index: number) => void;
  onUpdateListItem: (moduleId: string, index: number, value: string) => void;
  onAddListItem: (moduleId: string) => void;
  onRemoveListItem: (moduleId: string, index: number) => void;
}) {
  return (
    <aside className="inspector-panel" aria-label="属性面板">
      <div className="editor-sidebar__header">
        <p className="editor-heading__eyebrow">属性面板</p>
        <h2>属性面板</h2>
        <p>{activeModule ? "编辑当前选中的简历模块。" : "未选中模块时，可调整模板和全局样式。"}</p>
      </div>

      {activeModule ? (
        <div className="inspector-section">
          <div className="inspector-actions">
            <button
              type="button"
              className="secondary-button"
              disabled={!canAddMultipleModules(activeModule.kind)}
              onClick={() => onDuplicateModule(activeModule.id)}
            >
              复制模块
            </button>
            <button
              type="button"
              className="ghost-button"
              disabled={activeModule.kind === "personal"}
              onClick={() => onDeleteModule(activeModule.id)}
            >
              删除模块
            </button>
          </div>
          <label>
            模块标题
            <input
              aria-label="模块标题"
              value={activeModule.title}
              onChange={(event) => onUpdateModuleTitle(activeModule.id, event.target.value)}
            />
          </label>
          <label className="visibility-toggle">
            <input
              type="checkbox"
              checked={activeModule.visible}
              onChange={() => onToggleModuleVisibility(activeModule.id)}
            />
            <span>显示到简历</span>
          </label>
          {moduleHint ? <p className="editor-empty-note">{moduleHint}</p> : null}
          {activeModule.kind === "personal" ? (
            <PersonalInspector
              module={activeModule}
              onUpdateField={(field, value) => onUpdatePersonalField(activeModule.id, field, value)}
              onToggleField={(field) => onTogglePersonalField(activeModule.id, field)}
            />
          ) : null}
          {getModuleShape(activeModule.kind) === "text" ? (
            <TextInspector module={activeModule} onUpdateText={(value) => onUpdateText(activeModule.id, value)} />
          ) : null}
          {getModuleShape(activeModule.kind) === "timeline" ? (
            <TimelineInspector
              module={activeModule}
              onUpdateTimelineEntry={(index, patch) => onUpdateTimelineEntry(activeModule.id, index, patch)}
              onAddTimelineEntry={() => onAddTimelineEntry(activeModule.id)}
              onRemoveTimelineEntry={(index) => onRemoveTimelineEntry(activeModule.id, index)}
            />
          ) : null}
          {getModuleShape(activeModule.kind) === "list" ? (
            <ListInspector
              module={activeModule}
              onUpdateListItem={(index, value) => onUpdateListItem(activeModule.id, index, value)}
              onAddListItem={() => onAddListItem(activeModule.id)}
              onRemoveListItem={(index) => onRemoveListItem(activeModule.id, index)}
            />
          ) : null}
        </div>
      ) : (
        <>
          <InspectorEmptyState />
          <GlobalStyleInspector
            templates={templates}
            templateId={templateId}
            resumeStyle={resumeStyle}
            onTemplateChange={onTemplateChange}
            onStyleChange={onStyleChange}
          />
        </>
      )}
    </aside>
  );
}
