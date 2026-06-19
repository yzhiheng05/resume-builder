import type { IdentityPreset, TemplateId } from "../types/resume";

export interface ResumeTemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  printClassName: string;
  recommendedIdentities: IdentityPreset[];
}

const templateDefinitions: Record<TemplateId, ResumeTemplateDefinition> = {
  classic: {
    id: "classic",
    name: "经典简历",
    description: "单栏专业排版，适合大多数正式投递场景。",
    printClassName: "resume-paper--template-classic",
    recommendedIdentities: ["professional", "general"]
  },
  sidebar: {
    id: "sidebar",
    name: "双栏简历",
    description: "左侧突出概览信息，右侧承载经历主体。",
    printClassName: "resume-paper--template-sidebar",
    recommendedIdentities: ["professional", "general", "student"]
  },
  campus: {
    id: "campus",
    name: "校招简历",
    description: "更清爽的学生风格，突出教育与项目经历。",
    printClassName: "resume-paper--template-campus",
    recommendedIdentities: ["student"]
  }
};

export function getResumeTemplate(templateId: TemplateId): ResumeTemplateDefinition {
  return templateDefinitions[templateId];
}

export function getResumeTemplates(): ResumeTemplateDefinition[] {
  return [templateDefinitions.classic, templateDefinitions.sidebar, templateDefinitions.campus];
}
