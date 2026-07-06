import {
  canAddMultipleModules,
  getModuleCatalog,
  getModuleLabel
} from "../../lib/moduleRegistry";
import type { ModuleKind, ResumeModuleInstance } from "../../types/resume";

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
  onAddModule
}: {
  modules: ResumeModuleInstance[];
  onAddModule: (kind: ModuleKind) => void;
}) {
  return (
    <aside className="editor-sidebar editor-sidebar--library" aria-label="模块库">
      <div className="editor-sidebar__header">
        <p className="editor-heading__eyebrow">模块库</p>
        <h2>模块</h2>
        <p>把需要的段落放到纸面上。</p>
      </div>

      <div className="module-library__list">
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
    </aside>
  );
}
