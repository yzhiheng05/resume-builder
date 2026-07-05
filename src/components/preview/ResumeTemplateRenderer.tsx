import type { ReactNode } from "react";
import { defaultResumeStyle } from "../../lib/resumeStyle";
import type { ResumeStyleSettings, TemplateId } from "../../types/resume";
import type { PreviewModuleItem } from "./PreviewPanel";
import CampusResumeTemplate from "./templates/CampusResumeTemplate";
import ClassicResumeTemplate from "./templates/ClassicResumeTemplate";
import SidebarResumeTemplate from "./templates/SidebarResumeTemplate";

interface ResumeTemplateRendererProps {
  templateId: TemplateId;
  modules: PreviewModuleItem[];
  resumeStyle?: ResumeStyleSettings;
  interactive?: boolean;
  activeModuleId?: string | null;
  onModuleSelect?: (moduleId: string) => void;
}

export default function ResumeTemplateRenderer({
  templateId,
  modules,
  resumeStyle = defaultResumeStyle,
  interactive = false,
  activeModuleId,
  onModuleSelect
}: ResumeTemplateRendererProps): ReactNode {
  const templateProps = {
    modules,
    resumeStyle,
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
