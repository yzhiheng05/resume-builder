import ResumeTemplateRenderer from "./ResumeTemplateRenderer";
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
          onClick={() => onTemplateChange(template.id)}
        >
          <div className="template-card__thumbnail" aria-hidden="true">
            <div className="template-card__thumbnail-surface">
              <div className={`resume-paper resume-paper--thumbnail ${template.printClassName}`}>
                <ResumeTemplateRenderer templateId={template.id} modules={modules} resumeStyle={resumeStyle} />
              </div>
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
