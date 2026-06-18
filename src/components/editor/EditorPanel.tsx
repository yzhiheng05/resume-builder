import type { ReactElement } from "react";
import { useResumeStore } from "../../store/useResumeStore";
import { sectionLabels } from "./fields";
import { SectionCard } from "./SectionCard";
import { AwardsSectionForm } from "./AwardsSectionForm";
import { EducationSectionForm } from "./EducationSectionForm";
import { ExperienceSectionForm } from "./ExperienceSectionForm";
import { PersonalSectionForm } from "./PersonalSectionForm";
import { SkillsSectionForm } from "./SkillsSectionForm";
import type { SectionId } from "../../types/resume";

export function EditorPanel() {
  const resume = useResumeStore((state) => state.resume);
  const toggleSection = useResumeStore((state) => state.toggleSection);

  const sections: Array<{
    id: SectionId;
    description: string;
    form: ReactElement;
  }> = [
    {
      id: "personal",
      description: "个人信息会直接驱动右侧预览中的姓名、求职意向和联系方式。",
      form: <PersonalSectionForm />
    },
    {
      id: "education",
      description: "第一版保留教育经历说明，后续再接结构化多条条目编辑。",
      form: <EducationSectionForm />
    },
    {
      id: "projects",
      description: "项目经历先保留模块占位，后续接入可增删条目的列表编辑。",
      form: <ExperienceSectionForm title={sectionLabels.projects} />
    },
    {
      id: "internships",
      description: "实习经历按同样的结构接入，先保证模块开关和位置稳定。",
      form: <ExperienceSectionForm title={sectionLabels.internships} />
    },
    {
      id: "campus",
      description: "校园经历先占位，保持中文优先的模块结构。",
      form: <ExperienceSectionForm title={sectionLabels.campus} />
    },
    {
      id: "skills",
      description: "技能模块先用基础条目列表，后续再补更完整的编辑能力。",
      form: <SkillsSectionForm />
    },
    {
      id: "awards",
      description: "获奖 / 证书模块先保留文本条目，便于后续升级为结构化表单。",
      form: <AwardsSectionForm />
    }
  ];

  return (
    <section className="panel panel--editor" aria-label="简历编辑器">
      <h2>简历编辑器</h2>
      <div className="section-list">
        {sections.map((section) => (
          <SectionCard
            key={section.id}
            title={sectionLabels[section.id]}
            description={section.description}
            enabled={resume.sectionVisibility[section.id]}
            onToggle={() => toggleSection(section.id)}
          >
            {section.form}
          </SectionCard>
        ))}
      </div>
    </section>
  );
}
