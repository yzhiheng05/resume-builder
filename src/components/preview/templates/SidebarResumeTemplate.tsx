import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { renderSectionContent } from "../sectionRenderers";
import type { OrderedPreviewModule, SidebarColumn } from "./templateUtils";
import type { ResumeStyleSettings } from "../../../types/resume";
import { splitSidebarModules } from "./templateUtils";
import TemplateSection from "./TemplateSection";

interface SidebarResumeTemplateProps {
  modules: OrderedPreviewModule[];
  resumeStyle: ResumeStyleSettings;
  interactive?: boolean;
  activeModuleId?: string | null;
  onModuleSelect?: (moduleId: string) => void;
}

function renderColumnModules(
  items: OrderedPreviewModule[],
  column: SidebarColumn,
  interactive: boolean,
  activeModuleId: string | null | undefined,
  onModuleSelect?: (moduleId: string) => void
) {
  return items.map((item) => (
    <TemplateSection
      key={item.id}
      moduleId={item.id}
      title={item.title}
      interactive={interactive}
      isActive={activeModuleId === item.id}
      onSelect={() => onModuleSelect?.(item.id)}
      sortScope={column}
      handleLabel="调整当前栏顺序"
    >
      {renderSectionContent(item.module)}
    </TemplateSection>
  ));
}

export default function SidebarResumeTemplate({
  modules,
  resumeStyle: _resumeStyle,
  interactive = false,
  activeModuleId,
  onModuleSelect
}: SidebarResumeTemplateProps) {
  const { left, right } = splitSidebarModules(modules);

  return (
    <div className="resume-template resume-template--sidebar">
      <div className="resume-template__sidebar-column">
        {interactive ? <p className="resume-template__column-label">左栏信息区</p> : null}
        <SortableContext items={left.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {renderColumnModules(left, "left", interactive, activeModuleId, onModuleSelect)}
        </SortableContext>
      </div>
      <div className="resume-template__main-column">
        {interactive ? <p className="resume-template__column-label">右栏经历区</p> : null}
        <SortableContext items={right.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {renderColumnModules(right, "right", interactive, activeModuleId, onModuleSelect)}
        </SortableContext>
      </div>
    </div>
  );
}
