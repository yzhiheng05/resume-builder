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

export type SidebarColumn = "left" | "right";

export function getSidebarColumnForModuleKind(kind: ModuleKind): SidebarColumn {
  return sidebarLeftKinds.has(kind) ? "left" : "right";
}

export function splitSidebarModules(modules: OrderedPreviewModule[]) {
  const left: OrderedPreviewModule[] = [];
  const right: OrderedPreviewModule[] = [];

  for (const item of modules) {
    if (getSidebarColumnForModuleKind(item.module.kind) === "left") {
      left.push(item);
      continue;
    }

    right.push(item);
  }

  return { left, right };
}
