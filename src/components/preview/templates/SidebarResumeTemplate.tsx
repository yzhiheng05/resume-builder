import { renderSectionContent } from "../sectionRenderers";
import type { OrderedPreviewModule } from "./templateUtils";
import { splitSidebarModules } from "./templateUtils";
import TemplateSection from "./TemplateSection";

interface SidebarResumeTemplateProps {
  modules: OrderedPreviewModule[];
  interactive?: boolean;
  activeModuleId?: string | null;
  onModuleSelect?: (moduleId: string) => void;
}

function renderColumnModules(
  items: OrderedPreviewModule[],
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
    >
      {renderSectionContent(item.module)}
    </TemplateSection>
  ));
}

export default function SidebarResumeTemplate({
  modules,
  interactive = false,
  activeModuleId,
  onModuleSelect
}: SidebarResumeTemplateProps) {
  const { left, right } = splitSidebarModules(modules);

  return (
    <div className="resume-template resume-template--sidebar">
      <div className="resume-template__sidebar-column">
        {renderColumnModules(left, interactive, activeModuleId, onModuleSelect)}
      </div>
      <div className="resume-template__main-column">
        {renderColumnModules(right, interactive, activeModuleId, onModuleSelect)}
      </div>
    </div>
  );
}
