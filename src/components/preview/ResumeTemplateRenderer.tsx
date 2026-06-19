import type { ReactNode } from "react";
import type { TemplateId } from "../../types/resume";
import type { PreviewModuleItem } from "./PreviewPanel";
import CampusResumeTemplate from "./templates/CampusResumeTemplate";
import ClassicResumeTemplate from "./templates/ClassicResumeTemplate";
import SidebarResumeTemplate from "./templates/SidebarResumeTemplate";

interface ResumeTemplateRendererProps {
  templateId: TemplateId;
  modules: PreviewModuleItem[];
  interactive?: boolean;
  activeModuleId?: string | null;
  onModuleSelect?: (moduleId: string) => void;
}

export default function ResumeTemplateRenderer({
  templateId,
  modules,
  interactive = false,
  activeModuleId,
  onModuleSelect
}: ResumeTemplateRendererProps): ReactNode {
  const templateProps = {
    modules,
    interactive,
    activeModuleId,
    onModuleSelect
  };

  if (templateId === "sidebar") {
    return <SidebarResumeTemplate {...templateProps} />;
  }

  if (templateId === "campus") {
    return <CampusResumeTemplate {...templateProps} />;
  }

  return <ClassicResumeTemplate {...templateProps} />;
}
