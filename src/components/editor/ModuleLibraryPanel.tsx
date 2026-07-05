import {
  canAddMultipleModules,
  getModuleCatalog,
  getModuleLabel
} from "../../lib/moduleRegistry";
import type { ModuleKind, ResumeModuleInstance } from "../../types/resume";

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
        <h2>模块库</h2>
        <p>添加正式简历常用模块，内容会立即进入画布。</p>
      </div>

      <div className="module-library__list">
        {getModuleCatalog().map((kind) => {
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
