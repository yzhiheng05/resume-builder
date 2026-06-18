import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import PreviewSection from "./PreviewSection";
import {
  ALL_SECTION_IDS,
  SECTION_LABELS,
  renderSectionContent,
  type ResumeSections,
  type SectionId,
} from "./sectionRenderers";

export const DEFAULT_SECTION_ORDER: SectionId[] = [...ALL_SECTION_IDS];

export type SectionVisibility = Partial<Record<SectionId, boolean>>;

export interface PreviewPanelProps {
  sections: ResumeSections;
  sectionOrder: SectionId[];
  sectionVisibility?: SectionVisibility;
  activeSectionId?: SectionId | null;
  heading?: string;
  onSectionOrderChange?: (nextOrder: SectionId[]) => void;
  onSectionSelect?: (sectionId: SectionId) => void;
}

export interface PreviewSectionItem {
  id: SectionId;
  title: string;
  content: ResumeSections[SectionId];
}

function isSectionVisible(sectionId: SectionId, sectionVisibility?: SectionVisibility): boolean {
  return sectionVisibility?.[sectionId] !== false;
}

export function normalizeSectionOrder(sectionOrder: SectionId[]): SectionId[] {
  const deduped = sectionOrder.filter(
    (sectionId, index) => ALL_SECTION_IDS.includes(sectionId) && sectionOrder.indexOf(sectionId) === index
  );

  return [...deduped, ...ALL_SECTION_IDS.filter((sectionId) => !deduped.includes(sectionId))];
}

export function moveSectionOrder(
  sectionOrder: SectionId[],
  activeId: SectionId,
  overId: SectionId
): SectionId[] {
  if (activeId === overId) {
    return sectionOrder;
  }

  const normalizedOrder = normalizeSectionOrder(sectionOrder);
  const activeIndex = normalizedOrder.indexOf(activeId);
  const overIndex = normalizedOrder.indexOf(overId);

  if (activeIndex === -1 || overIndex === -1) {
    return normalizedOrder;
  }

  return arrayMove(normalizedOrder, activeIndex, overIndex);
}

export function getVisibleSectionOrder(
  sectionOrder: SectionId[],
  sectionVisibility: SectionVisibility | undefined,
  sections: ResumeSections
): SectionId[] {
  const availableIds = Object.keys(sections) as SectionId[];
  const normalizedOrder = normalizeSectionOrder(sectionOrder).filter((sectionId) =>
    availableIds.includes(sectionId)
  );

  return normalizedOrder.filter((sectionId) => isSectionVisible(sectionId, sectionVisibility));
}

export function buildPreviewSections(
  sections: ResumeSections,
  sectionOrder: SectionId[],
  sectionVisibility?: SectionVisibility
): PreviewSectionItem[] {
  return getVisibleSectionOrder(sectionOrder, sectionVisibility, sections).map((sectionId) => ({
    id: sectionId,
    title: SECTION_LABELS[sectionId],
    content: sections[sectionId],
  }));
}

export default function PreviewPanel({
  sections,
  sectionOrder,
  sectionVisibility,
  activeSectionId,
  heading = "实时预览",
  onSectionOrderChange,
  onSectionSelect,
}: PreviewPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const previewSections = buildPreviewSections(sections, sectionOrder, sectionVisibility);

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id) as SectionId;
    const overId = event.over ? (String(event.over.id) as SectionId) : undefined;

    if (!overId) {
      return;
    }

    const nextOrder = moveSectionOrder(sectionOrder, activeId, overId);

    if (nextOrder !== sectionOrder) {
      onSectionOrderChange?.(nextOrder);
    }
  }

  return (
    <section className="preview-panel" aria-label="简历预览面板">
      <div className="preview-panel__header">
        <div>
          <p className="preview-panel__eyebrow">中文优先模板</p>
          <h1 className="preview-panel__title">{heading}</h1>
        </div>
        <p className="preview-panel__hint">在预览区拖动模块即可调整顺序，打印时会自动隐藏编辑区。</p>
      </div>

      <div className="preview-surface" data-resume-preview-root="true">
        <div className="resume-paper">
          {previewSections.length === 0 ? (
            <div className="preview-empty-state">
              <h2>暂无可展示模块</h2>
              <p>请在左侧开启至少一个模块，预览会按当前排序实时更新。</p>
            </div>
          ) : (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
              <SortableContext
                items={previewSections.map((section) => section.id)}
                strategy={verticalListSortingStrategy}
              >
                {previewSections.map((section) => (
                  <PreviewSection
                    key={section.id}
                    sectionId={section.id}
                    title={section.title}
                    isActive={activeSectionId === section.id}
                    onSelect={() => onSectionSelect?.(section.id)}
                  >
                    {renderSectionContent({ sectionId: section.id, data: section.content })}
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
