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

type NumericStyleKey =
  | "fontSizePx"
  | "lineHeight"
  | "paragraphSpacingPx"
  | "pageMarginXmm"
  | "pageMarginYmm";

function NumericStyleField({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="numeric-field">
      <span>{label}</span>
      <input
        aria-label={label}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => {
          const nextValue = Number(event.target.value);
          if (Number.isFinite(nextValue)) {
            onChange(nextValue);
          }
        }}
      />
      <code>{unit}</code>
    </label>
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
  const selectedTemplate = templates.find((template) => template.id === templateId);
  const densityOptions: Array<{ value: ResumeStyleSettings["density"]; label: string }> = [
    { value: "comfortable", label: "舒展" },
    { value: "compact", label: "紧凑" }
  ];
  const spacingOptions: Array<{ value: ResumeStyleSettings["sectionSpacing"]; label: string }> = [
    { value: "tight", label: "紧凑" },
    { value: "normal", label: "标准" },
    { value: "loose", label: "宽松" }
  ];
  const headingOptions: Array<{ value: ResumeStyleSettings["headingStyle"]; label: string }> = [
    { value: "underline", label: "下划线" },
    { value: "bar", label: "色条" },
    { value: "plain", label: "简洁" }
  ];
  const numericFields: Array<{
    key: NumericStyleKey;
    label: string;
    unit: string;
    min: number;
    max: number;
    step: number;
  }> = [
    { key: "fontSizePx", label: "字号", unit: "px", min: 10, max: 22, step: 0.5 },
    { key: "lineHeight", label: "行距", unit: "x", min: 1.1, max: 2.2, step: 0.05 },
    { key: "paragraphSpacingPx", label: "段落间距", unit: "px", min: 0, max: 18, step: 0.5 },
    { key: "pageMarginXmm", label: "左右页边距", unit: "mm", min: 6, max: 30, step: 0.5 },
    { key: "pageMarginYmm", label: "上下页边距", unit: "mm", min: 6, max: 30, step: 0.5 }
  ];
  const numericFieldGroups = [
    {
      label: "排版",
      fields: numericFields.filter((field) =>
        field.key === "fontSizePx" || field.key === "lineHeight" || field.key === "paragraphSpacingPx"
      )
    },
    {
      label: "留白",
      fields: numericFields.filter((field) => field.key === "pageMarginXmm" || field.key === "pageMarginYmm")
    }
  ];
  const updateNumericStyle = (key: NumericStyleKey, value: number) => {
    onStyleChange({ [key]: value } as Partial<ResumeStyleSettings>);
  };

  return (
    <div className="inspector-section inspector-section--style">
      <h3>纸张样式</h3>
      <div className="style-board">
        <div className="style-board__row">
          <span>当前模板</span>
          <strong>{selectedTemplate?.name ?? "经典简历"}</strong>
        </div>
        <div className="template-chip-group" role="group" aria-label="当前模板">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              className={`template-chip${template.id === templateId ? " template-chip--active" : ""}`}
              onClick={() => onTemplateChange(template.id)}
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      <label className="color-field">
        <span>主题色</span>
        <input
          aria-label="主题色"
          type="color"
          value={resumeStyle.accentColor}
          onChange={(event) => onStyleChange({ accentColor: event.target.value })}
        />
        <span className="color-field__swatch" style={{ backgroundColor: resumeStyle.accentColor }} />
        <code>{resumeStyle.accentColor.toUpperCase()}</code>
      </label>

      <div className="numeric-field-grid" aria-label="手动排版参数">
        {numericFieldGroups.map((group) => (
          <div key={group.label} className="numeric-field-group" role="group" aria-label={group.label}>
            <div className="numeric-field-group__header">
              <span>{group.label}</span>
            </div>
            {group.fields.map((field) => (
              <NumericStyleField
                key={field.key}
                label={field.label}
                unit={field.unit}
                min={field.min}
                max={field.max}
                step={field.step}
                value={resumeStyle[field.key]}
                onChange={(value) => updateNumericStyle(field.key, value)}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="segmented-field">
        <span>字体密度</span>
        <div className="segmented-control" role="group" aria-label="字体密度">
          {densityOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={option.value === resumeStyle.density ? "is-active" : ""}
              onClick={() => onStyleChange({ density: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="segmented-field segmented-field--three">
        <span>模块间距</span>
        <div className="segmented-control" role="group" aria-label="模块间距">
          {spacingOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={option.value === resumeStyle.sectionSpacing ? "is-active" : ""}
              onClick={() => onStyleChange({ sectionSpacing: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="segmented-field segmented-field--three">
        <span>标题样式</span>
        <div className="segmented-control" role="group" aria-label="标题样式">
          {headingOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={option.value === resumeStyle.headingStyle ? "is-active" : ""}
              onClick={() => onStyleChange({ headingStyle: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
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
        <h2>属性</h2>
        <span className="inspector-context">{activeModule ? activeModule.title : "纸张"}</span>
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
      ) : null}

      <GlobalStyleInspector
        templates={templates}
        templateId={templateId}
        resumeStyle={resumeStyle}
        onTemplateChange={onTemplateChange}
        onStyleChange={onStyleChange}
      />
    </aside>
  );
}
