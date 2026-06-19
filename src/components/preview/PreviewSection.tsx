import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface PreviewSectionProps {
  moduleId: string;
  title: string;
  children: ReactNode;
  isActive?: boolean;
  onSelect?: () => void;
}

export default function PreviewSection({
  moduleId,
  title,
  children,
  isActive = false,
  onSelect
}: PreviewSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: moduleId
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <section
      ref={setNodeRef}
      style={style}
      className={`resume-section${isDragging ? " resume-section--dragging" : ""}${isActive ? " resume-section--active" : ""}`}
      data-module-id={moduleId}
      aria-labelledby={`resume-section-title-${moduleId}`}
      onClick={onSelect}
    >
      <header className="resume-section__header">
        <div className="resume-section__heading">
          <h2 className="resume-section__title" id={`resume-section-title-${moduleId}`}>
            {title}
          </h2>
        </div>
        <button
          type="button"
          className="resume-section__handle"
          aria-label={`拖动排序：${title}`}
          title={`拖动排序：${title}`}
          {...attributes}
          {...listeners}
        >
          <span aria-hidden="true">⋮⋮</span>
        </button>
      </header>
      <div className="resume-section__body">{children}</div>
    </section>
  );
}
