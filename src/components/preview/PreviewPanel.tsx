import { useEffect, useRef } from "react";
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

import TemplateSelector from "./TemplateSelector";
import ResumeTemplateRenderer from "./ResumeTemplateRenderer";
import { getResumeTemplate, type ResumeTemplateDefinition } from "../../data/resumeTemplates";
import { defaultResumeStyle, getResumeStyleVars } from "../../lib/resumeStyle";
import type { ResumeModuleInstance, ResumeStyleSettings, TemplateId } from "../../types/resume";
import { getSidebarColumnForModuleKind } from "./templates/templateUtils";

export interface PreviewPanelProps {
  modules: ResumeModuleInstance[];
  moduleOrder: string[];
  templateId: TemplateId;
  resumeStyle?: ResumeStyleSettings;
  templateOptions: ResumeTemplateDefinition[];
  activeModuleId?: string | null;
  eyebrow?: string;
  heading?: string;
  hint?: string;
  onSurfaceHeightChange?: (height: number) => void;
  onTemplateChange?: (templateId: TemplateId) => void;
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

export function moveSidebarModuleOrder(
  moduleOrder: string[],
  modules: ResumeModuleInstance[],
  activeId: string,
  overId: string
): string[] {
  const normalizedOrder = normalizeModuleOrder(moduleOrder, modules);
  const visibleModules = modules.filter((module) => module.visible);
  const visibleModuleById = new Map(visibleModules.map((module) => [module.id, module] as const));
  const activeModule = visibleModuleById.get(activeId);
  const overModule = visibleModuleById.get(overId);

  if (!activeModule || !overModule) {
    return normalizedOrder;
  }

  const activeColumn = getSidebarColumnForModuleKind(activeModule.kind);
  const overColumn = getSidebarColumnForModuleKind(overModule.kind);

  if (activeColumn !== overColumn) {
    return normalizedOrder;
  }

  const visibleScopedIds = normalizedOrder.filter((moduleId) => {
    const module = visibleModuleById.get(moduleId);
    return module ? getSidebarColumnForModuleKind(module.kind) === activeColumn : false;
  });

  const activeIndex = visibleScopedIds.indexOf(activeId);
  const overIndex = visibleScopedIds.indexOf(overId);

  if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
    return normalizedOrder;
  }

  const reorderedScopedIds = arrayMove(visibleScopedIds, activeIndex, overIndex);
  let nextScopedIndex = 0;

  return normalizedOrder.map((moduleId) => {
    if (!visibleScopedIds.includes(moduleId)) {
      return moduleId;
    }

    const nextId = reorderedScopedIds[nextScopedIndex];
    nextScopedIndex += 1;
    return nextId;
  });
}

export function getPreviewHint(templateId: TemplateId): string {
  if (templateId === "sidebar") {
    return "同栏内拖动排序，导出时只保留纸张内容。";
  }

  return "拖动段落调整顺序，导出时只保留纸张内容。";
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
  templateId,
  resumeStyle = defaultResumeStyle,
  templateOptions,
  activeModuleId,
  eyebrow,
  heading = "实时预览",
  hint,
  onSurfaceHeightChange,
  onTemplateChange,
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
  const surfaceRef = useRef<HTMLDivElement | null>(null);

  const previewModules = buildPreviewModules(modules, moduleOrder);
  const currentTemplate = getResumeTemplate(templateId);
  const resolvedHint = hint ?? getPreviewHint(templateId);

  useEffect(() => {
    if (!onSurfaceHeightChange || !surfaceRef.current || typeof ResizeObserver === "undefined") {
      return;
    }

    const surfaceElement = surfaceRef.current;
    const notifyHeight = () => {
      onSurfaceHeightChange(Math.round(surfaceElement.getBoundingClientRect().height));
    };
    const observer = new ResizeObserver(() => {
      notifyHeight();
    });

    notifyHeight();
    observer.observe(surfaceElement);

    return () => {
      observer.disconnect();
    };
  }, [onSurfaceHeightChange, previewModules.length]);

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : undefined;

    if (!overId) {
      return;
    }

    const nextOrder =
      templateId === "sidebar"
        ? moveSidebarModuleOrder(moduleOrder, modules, activeId, overId)
        : moveModuleOrder(moduleOrder, activeId, overId);

    if (nextOrder !== moduleOrder) {
      onModuleOrderChange?.(nextOrder);
    }
  }

  return (
    <section className="preview-panel" aria-label="简历预览面板">
      <div className="preview-panel__header">
        <div className="preview-panel__heading-group">
          <p className="preview-panel__eyebrow">{eyebrow ?? currentTemplate.name}</p>
          <h1 className="preview-panel__title">{heading}</h1>
          <p className="preview-panel__hint">{resolvedHint}</p>
        </div>
        <TemplateSelector
          templates={templateOptions}
          selectedTemplateId={templateId}
          modules={previewModules}
          resumeStyle={resumeStyle}
          onTemplateChange={(nextTemplateId) => onTemplateChange?.(nextTemplateId)}
        />
      </div>

      <div className="preview-surface" data-resume-preview-root="true" ref={surfaceRef}>
        <div
          className={`resume-paper ${currentTemplate.printClassName} resume-density-${resumeStyle.density} resume-spacing-${resumeStyle.sectionSpacing} resume-heading-${resumeStyle.headingStyle}`}
          style={getResumeStyleVars(resumeStyle)}
        >
          {previewModules.length === 0 ? (
            <div className="preview-empty-state">
              <h2>暂无可展示模块</h2>
              <p>请在左侧添加并开启至少一个模块，预览会按当前排序实时更新。</p>
            </div>
          ) : (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
              {templateId === "sidebar" ? (
                <ResumeTemplateRenderer
                  templateId={templateId}
                  modules={previewModules}
                  resumeStyle={resumeStyle}
                  interactive
                  activeModuleId={activeModuleId}
                  onModuleSelect={onModuleSelect}
                />
              ) : (
                <SortableContext
                  items={previewModules.map((module) => module.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ResumeTemplateRenderer
                    templateId={templateId}
                    modules={previewModules}
                    resumeStyle={resumeStyle}
                    interactive
                    activeModuleId={activeModuleId}
                    onModuleSelect={onModuleSelect}
                  />
                </SortableContext>
              )}
            </DndContext>
          )}
        </div>
        <div className="canvas-statusbar" role="status" aria-label="画布状态">
          <span>A4</span>
          <span>{currentTemplate.name}</span>
          <span>{previewModules.length} 个模块</span>
          <span>100%</span>
        </div>
      </div>
    </section>
  );
}
