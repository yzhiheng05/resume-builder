import type { ReactNode } from "react";
import { getModuleLabel, isListModuleData, isPersonalModuleData, isTextModuleData, isTimelineModuleData } from "../../lib/moduleRegistry";
import type { ResumeModuleInstance } from "../../types/resume";

function joinMeta(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" - ");
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

function renderDraftInline(label: string, tone: "name" | "title" | "subtitle"): ReactNode {
  return <span className={`resume-draft-inline resume-draft-inline--${tone}`} role="img" aria-label={label} />;
}

function renderPlaceholder(label: string, lineCount = 2): ReactNode {
  return (
    <div className="resume-placeholder" role="img" aria-label={label}>
      {Array.from({ length: lineCount }, (_, index) => (
        <span className="resume-placeholder__line" key={`${label}-${index}`} />
      ))}
    </div>
  );
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
            <h3 className="resume-personal__name">{module.data.name || renderDraftInline("姓名", "name")}</h3>
            {module.data.personalVisibility.title && hasText(module.data.title) ? (
              <p className="resume-personal__title">{module.data.title}</p>
            ) : null}
          </div>
          {contacts.length > 0 ? (
            <p className="resume-personal__contacts">
              {contacts.map((contact, index) => (
                <span className="resume-personal__contact-item" key={`${contact}-${index}`}>
                  {contact}
                </span>
              ))}
            </p>
          ) : (
            renderPlaceholder("电话 / 邮箱 / 城市 / 个人链接", 1)
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
    : renderPlaceholder("摘要内容", 2);
}

function renderTimelineModule(module: ResumeModuleInstance): ReactNode {
  if (!isTimelineModuleData(module.data)) {
    return null;
  }

  if (module.data.entries.length === 0) {
    return renderPlaceholder("添加一条经历", 2);
  }

  return module.data.entries.map((item) => (
    <article className="resume-entry" key={item.id}>
      <div className="resume-entry__header">
        <div className="resume-entry__main">
          <h3 className="resume-entry__title">{item.title || renderDraftInline("标题", "title")}</h3>
          <p className="resume-entry__subtitle">{item.org || renderDraftInline("组织 / 公司 / 项目名称", "subtitle")}</p>
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
        renderPlaceholder("动作 / 职责 / 结果", 2)
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
    return renderPlaceholder("添加条目", 1);
  }

  return (
    <div className={`resume-list resume-list--${module.kind}`}>
      {items.map((item, index) => (
        <span className="resume-list__item" key={`${module.id}-item-${index}`}>
          {item}
        </span>
      ))}
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
