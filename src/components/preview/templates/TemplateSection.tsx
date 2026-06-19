import type { ReactNode } from "react";
import PreviewSection from "../PreviewSection";

interface TemplateSectionProps {
  moduleId: string;
  title: string;
  isActive?: boolean;
  interactive?: boolean;
  onSelect?: () => void;
  children: ReactNode;
  sortScope?: string;
  handleLabel?: string;
}

export default function TemplateSection({
  moduleId,
  title,
  isActive = false,
  interactive = false,
  onSelect,
  children,
  sortScope,
  handleLabel
}: TemplateSectionProps) {
  if (!interactive) {
    return (
      <section
        className={`resume-section${isActive ? " resume-section--active" : ""}`}
        data-module-id={moduleId}
        aria-labelledby={`resume-section-title-${moduleId}`}
      >
        <header className="resume-section__header">
          <div className="resume-section__heading">
            <h2 className="resume-section__title" id={`resume-section-title-${moduleId}`}>
              {title}
            </h2>
          </div>
        </header>
        <div className="resume-section__body">{children}</div>
      </section>
    );
  }

  return (
    <PreviewSection
      moduleId={moduleId}
      title={title}
      isActive={isActive}
      onSelect={onSelect}
      sortScope={sortScope}
      handleLabel={handleLabel}
    >
      {children}
    </PreviewSection>
  );
}
