import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

import PreviewSection from "./PreviewSection";
import { renderModuleContent } from "./sectionRenderers";
import type { ResumeModuleInstance } from "../../types/resume";

export interface PreviewPanelProps {
  modules: ResumeModuleInstance[];
  moduleOrder: string[];
  activeModuleId?: string | null;
  eyebrow?: string;
  heading?: string;
  hint?: string;
  onModuleOrderChange?: (nextOrder: string[]) => void;
  onModuleSelect?: (moduleId: string) => void;
}

export interface PreviewModuleItem {
  id: string;
  title: string;
  module: ResumeModuleInstance;
}

export function normalizeModuleOrder(moduleOrder: string[], modules: ResumeModuleInstance[]): string[] {
  const moduleIds = modules.map((module) => module.id);
  const deduped = moduleOrder.filter(
    (moduleId, index) => moduleIds.includes(moduleId) && moduleOrder.indexOf(moduleId) === index
  );

  return [...deduped, ...moduleIds.filter((moduleId) => !deduped.includes(moduleId))];
}

export function moveModuleOrder(moduleOrder: string[], activeId: string, overId: string): string[] {
  if (activeId === overId) {
    return moduleOrder;
  }

  const activeIndex = moduleOrder.indexOf(activeId);
  const overIndex = moduleOrder.indexOf(overId);

  if (activeIndex === -1 || overIndex === -1) {
    return moduleOrder;
  }

  return arrayMove(moduleOrder, activeIndex, overIndex);
}

export function getVisibleModuleOrder(moduleOrder: string[], modules: ResumeModuleInstance[]): string[] {
  const normalizedOrder = normalizeModuleOrder(moduleOrder, modules);
  const visibleIds = new Set(modules.filter((module) => module.visible).map((module) => module.id));

  return normalizedOrder.filter((moduleId) => visibleIds.has(moduleId));
}

export function buildPreviewModules(
  modules: ResumeModuleInstance[],
  moduleOrder: string[]
): PreviewModuleItem[] {
  const moduleById = new Map(modules.map((module) => [module.id, module] as const));

  return getVisibleModuleOrder(moduleOrder, modules)
    .map((moduleId) => moduleById.get(moduleId))
    .filter((module): module is ResumeModuleInstance => Boolean(module))
    .map((module) => ({
      id: module.id,
      title: module.title,
      module
    }));
}

export default function PreviewPanel({
  modules,
  moduleOrder,
  activeModuleId,
  eyebrow = "通用求职模板",
  heading = "实时预览",
  hint = "在预览区拖动模块即可调整顺序，打印时会自动隐藏编辑区。",
  onModuleOrderChange,
  onModuleSelect
}: PreviewPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const previewModules = buildPreviewModules(modules, moduleOrder);

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : undefined;

    if (!overId) {
      return;
    }

    const nextOrder = moveModuleOrder(moduleOrder, activeId, overId);

    if (nextOrder !== moduleOrder) {
      onModuleOrderChange?.(nextOrder);
    }
  }

  return (
    <section className="preview-panel" aria-label="简历预览面板">
      <div className="preview-panel__header">
        <div>
          <p className="preview-panel__eyebrow">{eyebrow}</p>
          <h1 className="preview-panel__title">{heading}</h1>
        </div>
        <p className="preview-panel__hint">{hint}</p>
      </div>

      <div className="preview-surface" data-resume-preview-root="true">
        <div className="resume-paper">
          {previewModules.length === 0 ? (
            <div className="preview-empty-state">
              <h2>暂无可展示模块</h2>
              <p>请在左侧添加并开启至少一个模块，预览会按当前排序实时更新。</p>
            </div>
          ) : (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
              <SortableContext
                items={previewModules.map((module) => module.id)}
                strategy={verticalListSortingStrategy}
              >
                {previewModules.map((previewModule) => (
                  <PreviewSection
                    key={previewModule.id}
                    moduleId={previewModule.id}
                    title={previewModule.title}
                    isActive={activeModuleId === previewModule.id}
                    onSelect={() => onModuleSelect?.(previewModule.id)}
                  >
                    {renderModuleContent(previewModule.module)}
                  </PreviewSection>
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </section>
  );
}
