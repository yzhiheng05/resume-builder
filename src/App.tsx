import { useEffect, useMemo, useRef, useState } from "react";
import { HeaderBar } from "./components/HeaderBar";
import PreviewPanel from "./components/preview/PreviewPanel";
import type { ResumeSections, SectionId } from "./components/preview/sectionRenderers";
import { fileToResizedDataUrl } from "./lib/image";
import { useResumeStore } from "./store/useResumeStore";
import type { PersonalVisibleField, ResumeData } from "./types/resume";
import "./styles.css";

const sectionLabels: Record<SectionId, string> = {
  personal: "个人信息",
  education: "教育经历",
  projects: "项目经历",
  internships: "实习经历",
  campus: "校园经历",
  skills: "技能",
  awards: "获奖 / 证书"
};

type TimelineSectionId = "education" | "projects" | "internships" | "campus";
type PersonalField = keyof ResumeData["personal"];

const personalFields: Array<{
  key: PersonalField;
  label: string;
  visibilityKey?: PersonalVisibleField;
  className?: string;
  multiline?: boolean;
  rows?: number;
}> = [
  { key: "name", label: "姓名" },
  { key: "title", label: "求职意向", visibilityKey: "title" },
  { key: "phone", label: "手机", visibilityKey: "phone" },
  { key: "email", label: "邮箱", visibilityKey: "email" },
  { key: "city", label: "城市", visibilityKey: "city" },
  { key: "blog", label: "个人博客", visibilityKey: "blog" },
  { key: "github", label: "GitHub", visibilityKey: "github" },
  {
    key: "summary",
    label: "个人简介",
    visibilityKey: "summary",
    className: "form-span-full",
    multiline: true,
    rows: 4
  }
];

function SectionCard({
  title,
  visible,
  isExpanded,
  isActive,
  sectionRef,
  onToggle,
  onExpand,
  children
}: {
  title: string;
  visible: boolean;
  isExpanded: boolean;
  isActive: boolean;
  sectionRef?: (node: HTMLDivElement | null) => void;
  onToggle: () => void;
  onExpand: () => void;
  children: React.ReactNode;
}) {
  return (
    <article
      ref={sectionRef}
      className={`section-card${isExpanded ? " section-card--expanded" : ""}${isActive ? " section-card--active" : ""}`}
    >
      <div className="section-card__header">
        <label className="section-card__toggle">
          <input
            type="checkbox"
            checked={visible}
            onChange={onToggle}
          />
          <span>{title}</span>
        </label>
        <button
          type="button"
          className="section-card__summary"
          onClick={onExpand}
          aria-expanded={visible && isExpanded}
        >
          <span className="section-card__state">{visible ? "显示中" : "已隐藏"}</span>
          <span className="section-card__chevron" aria-hidden="true">
            {visible && isExpanded ? "−" : "+"}
          </span>
        </button>
      </div>
      {visible && isExpanded ? <div className="section-card__body">{children}</div> : null}
    </article>
  );
}

function getAdjacentVisibleSectionId(sectionOrder: SectionId[], visibleSectionIds: SectionId[], sectionId: SectionId) {
  const visibleIndex = visibleSectionIds.indexOf(sectionId);

  if (visibleIndex === -1) {
    return visibleSectionIds[0] ?? null;
  }

  return visibleSectionIds[visibleIndex + 1] ?? visibleSectionIds[visibleIndex - 1] ?? null;
}

function EmptyDraftNote({ text }: { text: string }) {
  return <p className="editor-empty-note">{text}</p>;
}

function PersonalFieldEditor({
  field,
  value,
  visible,
  onChange,
  onToggleVisibility
}: {
  field: (typeof personalFields)[number];
  value: string;
  visible?: boolean;
  onChange: (value: string) => void;
  onToggleVisibility?: () => void;
}) {
  const inputId = `personal-${field.key}`;

  return (
    <div className={`personal-field${field.className ? ` ${field.className}` : ""}`}>
      <div className="personal-field__header">
        <label htmlFor={inputId}>{field.label}</label>
        {field.visibilityKey ? (
          <label className="visibility-toggle">
            <input
              type="checkbox"
              checked={Boolean(visible)}
              onChange={onToggleVisibility}
            />
            <span>显示到简历</span>
          </label>
        ) : null}
      </div>
      {field.multiline ? (
        <textarea
          id={inputId}
          aria-label={field.label}
          rows={field.rows ?? 3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={inputId}
          aria-label={field.label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}

function BulletListEditor({
  items,
  onChangeItem,
  onRemoveItem,
  onAddItem
}: {
  items: string[];
  onChangeItem: (index: number, value: string) => void;
  onRemoveItem: (index: number) => void;
  onAddItem: () => void;
}) {
  return (
    <div className="field-stack form-span-full">
      <span className="field-stack__label">亮点</span>
      {items.length === 0 ? <EmptyDraftNote text="暂无亮点，可点击下方新增。" /> : null}
      <div className="section-list section-list--nested">
        {items.map((item, index) => (
          <div key={`bullet-${index}`} className="inline-row inline-row--stacked">
            <label className="inline-row__field">
              亮点 {index + 1}
              <input
                aria-label={`亮点 ${index + 1}`}
                value={item}
                onChange={(event) => onChangeItem(index, event.target.value)}
              />
            </label>
            <button
              type="button"
              className="ghost-button"
              aria-label={`删除亮点 ${index + 1}`}
              onClick={() => onRemoveItem(index)}
            >
              删除
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="secondary-button" onClick={onAddItem}>
        新增亮点
      </button>
    </div>
  );
}

function SimpleListEditor({
  items,
  itemLabel,
  addLabel,
  emptyNote,
  onChangeItem,
  onRemoveItem,
  onAddItem
}: {
  items: string[];
  itemLabel: string;
  addLabel: string;
  emptyNote: string;
  onChangeItem: (index: number, value: string) => void;
  onRemoveItem: (index: number) => void;
  onAddItem: () => void;
}) {
  return (
    <div className="section-list">
      {items.length === 0 ? <EmptyDraftNote text={emptyNote} /> : null}
      {items.map((item, index) => (
        <div key={`${itemLabel}-${index}`} className="inline-row">
          <label className="inline-row__field">
            {itemLabel} {index + 1}
            <input
              aria-label={`${itemLabel} ${index + 1}`}
              value={item}
              onChange={(event) => onChangeItem(index, event.target.value)}
            />
          </label>
          <button
            type="button"
            className="ghost-button"
            aria-label={`删除${itemLabel} ${index + 1}`}
            onClick={() => onRemoveItem(index)}
          >
            删除
          </button>
        </div>
      ))}
      <button type="button" className="secondary-button" onClick={onAddItem}>
        {addLabel}
      </button>
    </div>
  );
}

export default function App() {
  const resume = useResumeStore((state) => state.resume);
  const sectionOrder = useResumeStore((state) => state.sectionOrder);
  const setSectionOrder = useResumeStore((state) => state.setSectionOrder);
  const toggleSection = useResumeStore((state) => state.toggleSection);
  const updatePersonal = useResumeStore((state) => state.updatePersonal);
  const togglePersonalField = useResumeStore((state) => state.togglePersonalField);
  const updateTimelineEntry = useResumeStore((state) => state.updateTimelineEntry);
  const addTimelineEntry = useResumeStore((state) => state.addTimelineEntry);
  const removeTimelineEntry = useResumeStore((state) => state.removeTimelineEntry);
  const updateSkill = useResumeStore((state) => state.updateSkill);
  const addSkill = useResumeStore((state) => state.addSkill);
  const removeSkill = useResumeStore((state) => state.removeSkill);
  const updateAward = useResumeStore((state) => state.updateAward);
  const addAward = useResumeStore((state) => state.addAward);
  const removeAward = useResumeStore((state) => state.removeAward);
  const reset = useResumeStore((state) => state.reset);
  const [activeSectionId, setActiveSectionId] = useState<SectionId | null>(null);
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLDivElement | null>>>({});

  const sections = useMemo<ResumeSections>(
    () => ({
      personal: {
        ...resume.personal,
        title: resume.personalVisibility.title ? resume.personal.title : "",
        phone: resume.personalVisibility.phone ? resume.personal.phone : "",
        email: resume.personalVisibility.email ? resume.personal.email : "",
        city: resume.personalVisibility.city ? resume.personal.city : "",
        blog: resume.personalVisibility.blog ? resume.personal.blog : "",
        github: resume.personalVisibility.github ? resume.personal.github : "",
        summary: resume.personalVisibility.summary ? resume.personal.summary : ""
      },
      education: {
        items: resume.education.map((item) => ({
          id: item.id,
          school: item.title,
          degree: "",
          major: item.org,
          start: item.start,
          end: item.end,
          location: item.location,
          highlights: item.bullets.filter(Boolean)
        }))
      },
      projects: {
        items: resume.projects.map((item) => ({
          ...item
        }))
      },
      internships: {
        items: resume.internships.map((item) => ({
          ...item
        }))
      },
      campus: {
        items: resume.campus.map((item) => ({
          ...item
        }))
      },
      skills: {
        skillGroups: [
          {
            id: "skills-group-1",
            label: "技能特长",
            items: resume.skills.filter(Boolean)
          }
        ]
      },
      awards: {
        items: resume.awards.filter(Boolean).map((title, index) => ({
          id: `award-${index}`,
          title,
          issuer: "",
          date: "",
          detail: ""
        }))
      }
    }),
    [resume]
  );

  const visibleSectionIds = useMemo(
    () => sectionOrder.filter((sectionId) => resume.sectionVisibility[sectionId]),
    [resume.sectionVisibility, sectionOrder]
  );

  useEffect(() => {
    if (visibleSectionIds.length === 0) {
      setActiveSectionId(null);
      return;
    }

    setActiveSectionId((current) => {
      if (current && visibleSectionIds.includes(current)) {
        return current;
      }

      return visibleSectionIds[0] ?? null;
    });
  }, [visibleSectionIds]);

  useEffect(() => {
    if (!activeSectionId) {
      return;
    }

    const target = sectionRefs.current[activeSectionId];
    if (target && typeof target.scrollIntoView === "function") {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeSectionId]);

  function handleSectionToggle(sectionId: SectionId) {
    const isVisible = resume.sectionVisibility[sectionId];

    if (isVisible && activeSectionId === sectionId) {
      setActiveSectionId(getAdjacentVisibleSectionId(sectionOrder, visibleSectionIds, sectionId));
    }

    toggleSection(sectionId);
  }

  function handleSectionExpand(sectionId: SectionId) {
    if (!resume.sectionVisibility[sectionId]) {
      toggleSection(sectionId);
    }

    setActiveSectionId(sectionId);
  }

  function handleSectionSelect(sectionId: SectionId) {
    if (!resume.sectionVisibility[sectionId]) {
      toggleSection(sectionId);
    }

    setActiveSectionId(sectionId);
  }

  function updateTimelineBullets(
    sectionId: TimelineSectionId,
    entryIndex: number,
    updater: (bullets: string[]) => string[]
  ) {
    const entry = resume[sectionId][entryIndex];

    if (!entry) {
      return;
    }

    updateTimelineEntry(sectionId, entryIndex, {
      bullets: updater(entry.bullets)
    });
  }

  function updateBulletItem(
    sectionId: TimelineSectionId,
    entryIndex: number,
    bulletIndex: number,
    value: string
  ) {
    updateTimelineBullets(sectionId, entryIndex, (bullets) => {
      const next = [...bullets];
      next[bulletIndex] = value;
      return next;
    });
  }

  function addBulletItem(sectionId: TimelineSectionId, entryIndex: number) {
    updateTimelineBullets(sectionId, entryIndex, (bullets) => [...bullets, ""]);
  }

  function removeBulletItem(sectionId: TimelineSectionId, entryIndex: number, bulletIndex: number) {
    updateTimelineBullets(sectionId, entryIndex, (bullets) =>
      bullets.filter((_, currentIndex) => currentIndex !== bulletIndex)
    );
  }

  async function handlePhotoUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    const nextPhoto = await fileToResizedDataUrl(file);
    updatePersonal("photoDataUrl", nextPhoto);
  }

  return (
    <div className="app-shell">
      <HeaderBar onReset={reset} />

      <main className="workspace">
        <section className="editor-panel" data-editor-panel>
          <div className="editor-heading">
            <p className="editor-heading__eyebrow">模块化填写</p>
            <h2>简历编辑器</h2>
            <p>左侧填写内容，右侧实时预览。预览区支持模块拖动排序。</p>
          </div>

          <div className="editor-sections">
            {sectionOrder.map((sectionId) => (
              <SectionCard
                key={sectionId}
                title={sectionLabels[sectionId]}
                visible={resume.sectionVisibility[sectionId]}
                isExpanded={activeSectionId === sectionId}
                isActive={activeSectionId === sectionId}
                sectionRef={(node) => {
                  sectionRefs.current[sectionId] = node;
                }}
                onToggle={() => handleSectionToggle(sectionId)}
                onExpand={() => handleSectionExpand(sectionId)}
              >
                {sectionId === "personal" ? (
                  <div className="form-grid">
                    <div className="photo-editor form-span-full">
                      <div className="photo-editor__preview">
                        {resume.personal.photoDataUrl ? (
                          <img src={resume.personal.photoDataUrl} alt="个人照片预览" />
                        ) : (
                          <span>照片</span>
                        )}
                      </div>
                      <div className="photo-editor__body">
                        <span className="field-stack__label">个人照片</span>
                        <p>可选上传，上传后会自动显示在简历个人信息区右侧。</p>
                        <div className="photo-editor__actions">
                          <label className="secondary-button photo-editor__upload">
                            上传照片
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(event) => {
                                void handlePhotoUpload(event.target.files?.[0]);
                                event.target.value = "";
                              }}
                            />
                          </label>
                          {resume.personal.photoDataUrl ? (
                            <button
                              type="button"
                              className="ghost-button"
                              onClick={() => updatePersonal("photoDataUrl", "")}
                            >
                              移除照片
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    {personalFields.map((field) => (
                      <PersonalFieldEditor
                        key={field.key}
                        field={field}
                        value={resume.personal[field.key]}
                        visible={field.visibilityKey ? resume.personalVisibility[field.visibilityKey] : undefined}
                        onChange={(value) => updatePersonal(field.key, value)}
                        onToggleVisibility={
                          field.visibilityKey
                            ? () => togglePersonalField(field.visibilityKey as PersonalVisibleField)
                            : undefined
                        }
                      />
                    ))}
                  </div>
                ) : null}

                {sectionId === "education" ? (
                  <div className="section-list">
                    {resume.education.map((entry, index) => (
                      <article key={entry.id} className="list-item">
                        <div className="form-grid">
                          <label>
                            学校
                            <input
                              value={entry.title}
                              onChange={(event) =>
                                updateTimelineEntry("education", index, { title: event.target.value })
                              }
                            />
                          </label>
                          <label>
                            专业
                            <input
                              value={entry.org}
                              onChange={(event) =>
                                updateTimelineEntry("education", index, { org: event.target.value })
                              }
                            />
                          </label>
                          <label>
                            开始时间
                            <input
                              value={entry.start}
                              onChange={(event) =>
                                updateTimelineEntry("education", index, { start: event.target.value })
                              }
                            />
                          </label>
                          <label>
                            结束时间
                            <input
                              value={entry.end}
                              onChange={(event) =>
                                updateTimelineEntry("education", index, { end: event.target.value })
                              }
                            />
                          </label>
                          <BulletListEditor
                            items={entry.bullets}
                            onChangeItem={(bulletIndex, value) =>
                              updateBulletItem("education", index, bulletIndex, value)
                            }
                            onRemoveItem={(bulletIndex) =>
                              removeBulletItem("education", index, bulletIndex)
                            }
                            onAddItem={() => addBulletItem("education", index)}
                          />
                        </div>
                        <div className="list-item__actions">
                          <button
                            type="button"
                            className="ghost-button"
                            aria-label={`删除教育经历条目 ${index + 1}`}
                            onClick={() => removeTimelineEntry("education", index)}
                          >
                            删除条目
                          </button>
                        </div>
                      </article>
                    ))}
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => addTimelineEntry("education")}
                    >
                      新增教育经历
                    </button>
                  </div>
                ) : null}

                {sectionId === "projects" || sectionId === "internships" || sectionId === "campus" ? (
                  <div className="section-list">
                    {resume[sectionId].map((entry, index) => (
                      <article key={entry.id} className="list-item">
                        <div className="form-grid">
                          <label>
                            标题
                            <input
                              value={entry.title}
                              onChange={(event) =>
                                updateTimelineEntry(sectionId, index, { title: event.target.value })
                              }
                            />
                          </label>
                          <label>
                            组织
                            <input
                              value={entry.org}
                              onChange={(event) =>
                                updateTimelineEntry(sectionId, index, { org: event.target.value })
                              }
                            />
                          </label>
                          <label>
                            开始时间
                            <input
                              value={entry.start}
                              onChange={(event) =>
                                updateTimelineEntry(sectionId, index, { start: event.target.value })
                              }
                            />
                          </label>
                          <label>
                            结束时间
                            <input
                              value={entry.end}
                              onChange={(event) =>
                                updateTimelineEntry(sectionId, index, { end: event.target.value })
                              }
                            />
                          </label>
                          <label>
                            地点
                            <input
                              value={entry.location}
                              onChange={(event) =>
                                updateTimelineEntry(sectionId, index, { location: event.target.value })
                              }
                            />
                          </label>
                          <label className="form-span-full">
                            <BulletListEditor
                              items={entry.bullets}
                              onChangeItem={(bulletIndex, value) =>
                                updateBulletItem(sectionId, index, bulletIndex, value)
                              }
                              onRemoveItem={(bulletIndex) =>
                                removeBulletItem(sectionId, index, bulletIndex)
                              }
                              onAddItem={() => addBulletItem(sectionId, index)}
                            />
                          </label>
                        </div>
                        <div className="list-item__actions">
                          <button
                            type="button"
                            className="ghost-button"
                            aria-label={`删除${sectionLabels[sectionId]}条目 ${index + 1}`}
                            onClick={() => removeTimelineEntry(sectionId, index)}
                          >
                            删除条目
                          </button>
                        </div>
                      </article>
                    ))}
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => addTimelineEntry(sectionId)}
                    >
                      新增{sectionLabels[sectionId]}
                    </button>
                  </div>
                ) : null}

                {sectionId === "skills" ? (
                  <SimpleListEditor
                    items={resume.skills}
                    itemLabel="技能"
                    addLabel="新增技能"
                    emptyNote="暂无技能，可点击下方新增。"
                    onChangeItem={updateSkill}
                    onRemoveItem={removeSkill}
                    onAddItem={addSkill}
                  />
                ) : null}

                {sectionId === "awards" ? (
                  <SimpleListEditor
                    items={resume.awards}
                    itemLabel="获奖 / 证书"
                    addLabel="新增获奖 / 证书"
                    emptyNote="暂无获奖或证书，可点击下方新增。"
                    onChangeItem={updateAward}
                    onRemoveItem={removeAward}
                    onAddItem={addAward}
                  />
                ) : null}
              </SectionCard>
            ))}
          </div>
        </section>

        <PreviewPanel
          sections={sections}
          sectionOrder={sectionOrder}
          sectionVisibility={resume.sectionVisibility}
          activeSectionId={activeSectionId}
          onSectionOrderChange={setSectionOrder}
          onSectionSelect={handleSectionSelect}
        />
      </main>

      <footer className="footer-note">默认数据为中文，内容会自动保存在当前浏览器。</footer>
    </div>
  );
}
