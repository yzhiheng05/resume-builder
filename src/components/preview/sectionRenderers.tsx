import type { ReactNode } from "react";
import { getModuleLabel, isListModuleData, isPersonalModuleData, isTextModuleData, isTimelineModuleData } from "../../lib/moduleRegistry";
import type { ResumeModuleInstance } from "../../types/resume";

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

function renderPersonalModule(module: ResumeModuleInstance): ReactNode {
  if (!isPersonalModuleData(module.data)) {
    return null;
  }

  const contacts = [
    module.data.personalVisibility.phone ? module.data.phone : "",
    module.data.personalVisibility.email ? module.data.email : "",
    module.data.personalVisibility.city ? module.data.city : "",
    module.data.personalVisibility.blog ? module.data.blog : "",
    module.data.personalVisibility.github ? module.data.github : ""
  ].filter(hasText);

  return (
    <div className="resume-personal">
      <div className="resume-personal__layout">
        <div className="resume-personal__content">
          <div className="resume-personal__headline">
            <h3 className="resume-personal__name">{module.data.name || "请填写姓名"}</h3>
            {module.data.personalVisibility.title && hasText(module.data.title) ? (
              <p className="resume-personal__title">{module.data.title}</p>
            ) : null}
          </div>
          {contacts.length > 0 ? (
            <p className="resume-personal__contacts">{contacts.join(" | ")}</p>
          ) : (
            renderPlaceholder("电话、邮箱、城市和个人链接会显示在这里")
          )}
        </div>
        {hasText(module.data.photoDataUrl) ? (
          <img className="resume-personal__photo" src={module.data.photoDataUrl} alt="个人照片" />
        ) : null}
      </div>
    </div>
  );
}

function renderTextModule(module: ResumeModuleInstance): ReactNode {
  if (!isTextModuleData(module.data)) {
    return null;
  }

  return hasText(module.data.value)
    ? <p className="resume-personal__summary">{module.data.value}</p>
    : renderPlaceholder("请填写这部分内容");
}

function renderTimelineModule(module: ResumeModuleInstance): ReactNode {
  if (!isTimelineModuleData(module.data)) {
    return null;
  }

  if (module.data.entries.length === 0) {
    return renderPlaceholder("请添加至少一条内容");
  }

  return module.data.entries.map((item) => (
    <article className="resume-entry" key={item.id}>
      <div className="resume-entry__header">
        <div className="resume-entry__main">
          <h3 className="resume-entry__title">{item.title || "标题"}</h3>
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
        renderPlaceholder("请补充这条内容的动作、职责或结果")
      )}
    </article>
  ));
}

function renderListModule(module: ResumeModuleInstance): ReactNode {
  if (!isListModuleData(module.data)) {
    return null;
  }

  const items = module.data.items.filter(hasText);
  if (items.length === 0) {
    return renderPlaceholder("请添加至少一条内容");
  }

  return (
    <div className="resume-skill-groups">
      <div className="resume-skill-group">
        <div className="resume-skill-group__header">
          <h3 className="resume-skill-group__title">{module.title || getModuleLabel(module.kind)}</h3>
        </div>
        <p className="resume-skill-group__items">{items.join(" / ")}</p>
      </div>
    </div>
  );
}

export function renderSectionContent(module: ResumeModuleInstance): ReactNode {
  if (module.kind === "personal") {
    return renderPersonalModule(module);
  }

  if (isTextModuleData(module.data)) {
    return renderTextModule(module);
  }

  if (isTimelineModuleData(module.data)) {
    return renderTimelineModule(module);
  }

  if (isListModuleData(module.data)) {
    return renderListModule(module);
  }

  return null;
}

export function renderModuleContent(module: ResumeModuleInstance): ReactNode {
  return renderSectionContent(module);
}
