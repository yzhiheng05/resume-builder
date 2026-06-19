import { renderSectionContent } from "../sectionRenderers";
import type { OrderedPreviewModule } from "./templateUtils";
import TemplateSection from "./TemplateSection";

interface CampusResumeTemplateProps {
  modules: OrderedPreviewModule[];
  interactive?: boolean;
  activeModuleId?: string | null;
  onModuleSelect?: (moduleId: string) => void;
}

export default function CampusResumeTemplate({
  modules,
  interactive = false,
  activeModuleId,
  onModuleSelect
}: CampusResumeTemplateProps) {
  return (
    <div className="resume-template resume-template--campus">
      {modules.map((item) => (
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
      ))}
    </div>
  );
}
