import type { ModuleKind, ResumeModuleInstance } from "../../../types/resume";

export interface OrderedPreviewModule {
  id: string;
  title: string;
  module: ResumeModuleInstance;
}

const sidebarLeftKinds = new Set<ModuleKind>([
  "personal",
  "skills",
  "certificate",
  "coreCompetency",
  "highlight"
]);

export function splitSidebarModules(modules: OrderedPreviewModule[]) {
  const left: OrderedPreviewModule[] = [];
  const right: OrderedPreviewModule[] = [];

  for (const item of modules) {
    if (sidebarLeftKinds.has(item.module.kind)) {
      left.push(item);
      continue;
    }

    right.push(item);
  }

  return { left, right };
}
