import type { ReactNode } from "react";

export const SECTION_LABELS = {
  personal: "个人信息",
  education: "教育经历",
  projects: "项目经历",
  internships: "实习经历",
  campus: "校园经历",
  skills: "技能特长",
  awards: "获奖证书",
} as const;

export type SectionId = keyof typeof SECTION_LABELS;

export const ALL_SECTION_IDS = Object.keys(SECTION_LABELS) as SectionId[];

export interface PersonalSectionData {
  name: string;
  title: string;
  phone: string;
  email: string;
  city: string;
  blog: string;
  github: string;
  photoDataUrl: string;
  summary: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  major: string;
  start: string;
  end: string;
  location: string;
  gpa?: string;
  highlights?: string[];
}

export interface ExperienceItem {
  id: string;
  title: string;
  org: string;
  start: string;
  end: string;
  location: string;
  bullets: string[];
}

export interface SkillGroup {
  id: string;
  label: string;
  items: string[];
}

export interface AwardItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  detail?: string;
}

export interface ResumeSections {
  personal: PersonalSectionData;
  education: { items: EducationItem[] };
  projects: { items: ExperienceItem[] };
  internships: { items: ExperienceItem[] };
  campus: { items: ExperienceItem[] };
  skills: { skillGroups: SkillGroup[] };
  awards: { items: AwardItem[] };
}

export interface SectionRendererProps<TSectionId extends SectionId = SectionId> {
  sectionId: TSectionId;
  data: ResumeSections[TSectionId];
}

function joinMeta(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" | ");
}

function hasText(value: string | undefined): boolean {
  return Boolean(value && value.trim());
}

function renderMetaLines(lines: Array<string | undefined>): ReactNode {
  const content = lines.filter(hasText);

  if (content.length === 0) {
    return null;
  }

  return (
    <div className="resume-entry__meta">
      {content.map((line, index) => (
        <p key={`${line}-${index}`}>{line}</p>
      ))}
    </div>
  );
}

function renderPlaceholder(text: string): ReactNode {
  return <p className="resume-placeholder">{text}</p>;
}

function renderPersonalSection(data: ResumeSections["personal"]): ReactNode {
  const contacts = [data.phone, data.email, data.city, data.blog, data.github].filter(hasText);

  return (
    <div className="resume-personal">
      <div className="resume-personal__layout">
        <div className="resume-personal__content">
          <div className="resume-personal__headline">
            <h3 className="resume-personal__name">{data.name || "请填写姓名"}</h3>
            {hasText(data.title) ? <p className="resume-personal__title">{data.title}</p> : null}
          </div>
          {contacts.length > 0 ? (
            <p className="resume-personal__contacts">{contacts.join(" | ")}</p>
          ) : (
            renderPlaceholder("电话、邮箱、城市和个人链接会显示在这里")
          )}
          {hasText(data.summary) ? (
            <p className="resume-personal__summary">{data.summary}</p>
          ) : (
            renderPlaceholder("请补充一句简短的个人简介或求职方向")
          )}
        </div>
        {hasText(data.photoDataUrl) ? (
          <img className="resume-personal__photo" src={data.photoDataUrl} alt="个人照片" />
        ) : null}
      </div>
    </div>
  );
}

function renderEducationSection(data: ResumeSections["education"]): ReactNode {
  if (data.items.length === 0) {
    return renderPlaceholder("请添加教育经历");
  }

  return data.items.map((item) => (
    <article className="resume-entry" key={item.id}>
      <div className="resume-entry__header">
        <div className="resume-entry__main">
          <h3 className="resume-entry__title">{item.school || "学校名称"}</h3>
          <p className="resume-entry__subtitle">
            {joinMeta([item.degree, item.major]).trim() || "学历 / 专业"}
          </p>
        </div>
        {renderMetaLines([joinMeta([item.start, item.end]), item.location])}
      </div>
      {hasText(item.gpa) ? <p className="resume-entry__detail">GPA：{item.gpa}</p> : null}
      {item.highlights && item.highlights.length > 0 ? (
        <ul className="resume-bullets">
          {item.highlights.filter(hasText).map((highlight, index) => (
            <li key={`${item.id}-highlight-${index}`}>{highlight}</li>
          ))}
        </ul>
      ) : null}
    </article>
  ));
}

function renderExperienceSection(
  data: ResumeSections["projects"] | ResumeSections["internships"] | ResumeSections["campus"]
): ReactNode {
  if (data.items.length === 0) {
    return renderPlaceholder("请添加至少一条经历");
  }

  return data.items.map((item) => (
    <article className="resume-entry" key={item.id}>
      <div className="resume-entry__header">
        <div className="resume-entry__main">
          <h3 className="resume-entry__title">{item.title || "经历标题"}</h3>
          <p className="resume-entry__subtitle">{item.org || "组织 / 公司 / 项目名称"}</p>
        </div>
        {renderMetaLines([joinMeta([item.start, item.end]), item.location])}
      </div>
      {item.bullets.filter(hasText).length > 0 ? (
        <ul className="resume-bullets">
          {item.bullets.filter(hasText).map((bullet, index) => (
            <li key={`${item.id}-bullet-${index}`}>{bullet}</li>
          ))}
        </ul>
      ) : (
        renderPlaceholder("请补充这段经历的成果、职责或亮点")
      )}
    </article>
  ));
}

function renderSkillsSection(data: ResumeSections["skills"]): ReactNode {
  if (data.skillGroups.length === 0) {
    return renderPlaceholder("请添加技能分类");
  }

  return (
    <div className="resume-skill-groups">
      {data.skillGroups.map((group) => (
        <div className="resume-skill-group" key={group.id}>
          <div className="resume-skill-group__header">
            <h3 className="resume-skill-group__title">{group.label || "技能特长"}</h3>
          </div>
          <p className="resume-skill-group__items">
            {group.items.filter(hasText).join(" / ") || "请填写技能内容"}
          </p>
        </div>
      ))}
    </div>
  );
}

function renderAwardsSection(data: ResumeSections["awards"]): ReactNode {
  if (data.items.length === 0) {
    return renderPlaceholder("请添加获奖或证书");
  }

  return data.items.map((item) => (
    <article className="resume-award" key={item.id}>
      <div className="resume-award__header">
        <div className="resume-award__main">
          <h3 className="resume-award__title">{item.title || "奖项 / 证书名称"}</h3>
          <p className="resume-award__issuer">{item.issuer || "颁发机构"}</p>
        </div>
        <div className="resume-award__meta">
          <p className="resume-award__date">{item.date || "时间"}</p>
        </div>
      </div>
      {hasText(item.detail) ? <p className="resume-award__detail">{item.detail}</p> : null}
    </article>
  ));
}

export const sectionRenderers: {
  [TSectionId in SectionId]: (data: ResumeSections[TSectionId]) => ReactNode;
} = {
  personal: renderPersonalSection,
  education: renderEducationSection,
  projects: renderExperienceSection,
  internships: renderExperienceSection,
  campus: renderExperienceSection,
  skills: renderSkillsSection,
  awards: renderAwardsSection,
};

export function renderSectionContent<TSectionId extends SectionId>({
  sectionId,
  data,
}: SectionRendererProps<TSectionId>): ReactNode {
  return sectionRenderers[sectionId](data);
}
