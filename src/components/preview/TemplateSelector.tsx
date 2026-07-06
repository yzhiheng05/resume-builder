import type { CSSProperties } from "react";
import type { PreviewModuleItem } from "./PreviewPanel";
import type { ResumeTemplateDefinition } from "../../data/resumeTemplates";
import { defaultResumeStyle } from "../../lib/resumeStyle";
import type { ResumeStyleSettings, TemplateId } from "../../types/resume";

interface TemplateSelectorProps {
  templates: ResumeTemplateDefinition[];
  selectedTemplateId: TemplateId;
  modules: PreviewModuleItem[];
  resumeStyle?: ResumeStyleSettings;
  onTemplateChange: (templateId: TemplateId) => void;
}

function TemplateMiniPreview({
  templateId,
  accentColor,
  moduleCount
}: {
  templateId: TemplateId;
  accentColor: string;
  moduleCount: number;
}) {
  const miniAccent = templateId === "classic" ? "#4e5b68" : accentColor;
  const style = { "--template-mini-accent": miniAccent } as CSSProperties;
  const densityClass = moduleCount > 6 ? " template-mini--dense" : "";

  return (
    <div className={`template-mini template-mini--${templateId}${densityClass}`} style={style}>
      <div className="template-mini__name" />
      <div className="template-mini__contact" />
      <div className="template-mini__section template-mini__section--primary">
        <span />
        <i />
        <i />
      </div>
      <div className="template-mini__section">
        <span />
        <i />
        <i />
      </div>
      <div className="template-mini__section template-mini__section--short">
        <span />
        <i />
      </div>
    </div>
  );
}

export default function TemplateSelector({
  templates,
  selectedTemplateId,
  modules,
  resumeStyle = defaultResumeStyle,
  onTemplateChange
}: TemplateSelectorProps) {
  return (
    <div className="template-selector" aria-label="简历模板选择器">
      {templates.map((template) => (
        <button
          key={template.id}
          type="button"
          className={`template-card${selectedTemplateId === template.id ? " template-card--active" : ""}`}
          aria-label={template.name}
          onClick={() => onTemplateChange(template.id)}
        >
          <div className="template-card__thumbnail" aria-hidden="true">
            <div className="template-card__thumbnail-surface">
              <TemplateMiniPreview
                templateId={template.id}
                accentColor={resumeStyle.accentColor}
                moduleCount={modules.length}
              />
            </div>
          </div>
          <div className="template-card__meta">
            <strong>{template.name}</strong>
            <span>{template.description}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
