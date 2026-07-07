import {
  canAddMultipleModules,
  getModuleCatalog,
  getModuleLabel
} from "../../lib/moduleRegistry";
import type { ResumeTemplateDefinition } from "../../data/resumeTemplates";
import type { ModuleKind, ResumeModuleInstance, ResumeStyleSettings, TemplateId } from "../../types/resume";
import { GlobalStylePanel } from "./GlobalStylePanel";

const moduleGroups: Array<{
  title: string;
  description: string;
  kinds: ModuleKind[];
}> = [
  {
    title: "基础内容",
    description: "摘要、技能、证书",
    kinds: ["summary", "skills", "certificate"]
  },
  {
    title: "经历模块",
    description: "教育、工作、项目、校园",
    kinds: ["education", "experience", "project", "campus"]
  },
  {
    title: "补充亮点",
    description: "荣誉、能力、个人亮点",
    kinds: ["honor", "coreCompetency", "highlight"]
  }
];

export function ModuleLibraryPanel({
  modules,
  moduleOrder,
  activeModuleId,
  templates,
  templateId,
  resumeStyle,
  onSelectModule,
  onAddModule,
  onTemplateChange,
  onStyleChange
}: {
  modules: ResumeModuleInstance[];
  moduleOrder: string[];
  activeModuleId: string | null;
  templates: ResumeTemplateDefinition[];
  templateId: TemplateId;
  resumeStyle: ResumeStyleSettings;
  onSelectModule: (moduleId: string) => void;
  onAddModule: (kind: ModuleKind) => void;
  onTemplateChange: (templateId: TemplateId) => void;
  onStyleChange: (nextStyle: Partial<ResumeStyleSettings>) => void;
}) {
  const moduleById = new Map(modules.map((module) => [module.id, module] as const));
  const orderedModules = [
    ...moduleOrder.map((moduleId) => moduleById.get(moduleId)).filter((module): module is ResumeModuleInstance => Boolean(module)),
    ...modules.filter((module) => !moduleOrder.includes(module.id))
  ];

  return (
    <aside className="editor-sidebar editor-sidebar--library" aria-label="模块库">
      <div className="editor-sidebar__header">
        <p className="editor-heading__eyebrow">布局</p>
        <h2>模块</h2>
        <p>管理纸面段落，或添加新的内容模块。</p>
      </div>

      <div className="module-library__list">
        <section className="module-outline" aria-labelledby="module-outline-title">
          <div className="module-library__group-header">
            <h3 id="module-outline-title">当前纸面</h3>
            <p>{orderedModules.length} 个模块</p>
          </div>
          <div className="module-outline__list">
            {orderedModules.map((module) => (
              <button
                key={module.id}
                type="button"
                className={`module-outline__item${module.id === activeModuleId ? " module-outline__item--active" : ""}`}
                onClick={() => onSelectModule(module.id)}
                aria-label={`选择模块：${module.title}`}
              >
                <span className="module-outline__grip" aria-hidden="true" />
                <span className="module-outline__label">{module.title}</span>
                <small>{module.visible ? "显示" : "隐藏"}</small>
              </button>
            ))}
          </div>
        </section>

        <details className="module-add-drawer">
          <summary>
            <span>添加模块</span>
            <small>官方模块库</small>
          </summary>
          <div className="module-add-drawer__content">
            {moduleGroups.map((group) => (
              <section key={group.title} className="module-library__group" aria-labelledby={`module-group-${group.title}`}>
                <div className="module-library__group-header">
                  <h3 id={`module-group-${group.title}`}>{group.title}</h3>
                  <p>{group.description}</p>
                </div>
                <div className="module-library__group-items">
                  {group.kinds
                    .filter((kind) => getModuleCatalog().includes(kind))
                    .map((kind) => {
                      const existing = modules.some((module) => module.kind === kind);
                      const disabled = existing && !canAddMultipleModules(kind);

                      return (
                        <button
                          key={kind}
                          type="button"
                          className={`module-library__item${disabled ? " module-library__item--added" : ""}`}
                          disabled={disabled}
                          onClick={() => onAddModule(kind)}
                          aria-label={`${getModuleLabel(kind)} ${disabled ? "已在纸面" : "添加"}`}
                        >
                          <span>{getModuleLabel(kind)}</span>
                          <small aria-hidden="true">{disabled ? "已在纸面" : "添加"}</small>
                        </button>
                      );
                    })}
                </div>
              </section>
            ))}
          </div>
        </details>

        <GlobalStylePanel
          templates={templates}
          templateId={templateId}
          resumeStyle={resumeStyle}
          onTemplateChange={onTemplateChange}
          onStyleChange={onStyleChange}
        />
      </div>
    </aside>
  );
}
