import type { ResumeTemplateDefinition } from "../../data/resumeTemplates";
import type { ResumeStyleSettings, TemplateId } from "../../types/resume";

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

export function GlobalStylePanel({
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
