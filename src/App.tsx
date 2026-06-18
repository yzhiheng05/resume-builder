import { useEffect, useMemo, useRef, useState } from "react";
import { HeaderBar } from "./components/HeaderBar";
import PreviewPanel from "./components/preview/PreviewPanel";
import type { ResumeSections, SectionId } from "./components/preview/sectionRenderers";
import { useResumeStore } from "./store/useResumeStore";
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

export default function App() {
  const resume = useResumeStore((state) => state.resume);
  const sectionOrder = useResumeStore((state) => state.sectionOrder);
  const setSectionOrder = useResumeStore((state) => state.setSectionOrder);
  const toggleSection = useResumeStore((state) => state.toggleSection);
  const updatePersonal = useResumeStore((state) => state.updatePersonal);
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
        website: ""
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
                    <label>
                      姓名
                      <input
                        aria-label="姓名"
                        value={resume.personal.name}
                        onChange={(event) => updatePersonal("name", event.target.value)}
                      />
                    </label>
                    <label>
                      求职意向
                      <input
                        value={resume.personal.title}
                        onChange={(event) => updatePersonal("title", event.target.value)}
                      />
                    </label>
                    <label>
                      手机
                      <input
                        value={resume.personal.phone}
                        onChange={(event) => updatePersonal("phone", event.target.value)}
                      />
                    </label>
                    <label>
                      邮箱
                      <input
                        value={resume.personal.email}
                        onChange={(event) => updatePersonal("email", event.target.value)}
                      />
                    </label>
                    <label>
                      城市
                      <input
                        value={resume.personal.city}
                        onChange={(event) => updatePersonal("city", event.target.value)}
                      />
                    </label>
                    <label className="form-span-full">
                      个人简介
                      <textarea
                        rows={4}
                        value={resume.personal.summary}
                        onChange={(event) => updatePersonal("summary", event.target.value)}
                      />
                    </label>
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
                          <label className="form-span-full">
                            亮点（每行一条）
                            <textarea
                              rows={3}
                              value={entry.bullets.join("\n")}
                              onChange={(event) =>
                                updateTimelineEntry("education", index, {
                                  bullets: event.target.value
                                    .split("\n")
                                    .map((line) => line.trim())
                                    .filter(Boolean)
                                })
                              }
                            />
                          </label>
                        </div>
                      </article>
                    ))}
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
                            亮点（每行一条）
                            <textarea
                              rows={4}
                              value={entry.bullets.join("\n")}
                              onChange={(event) =>
                                updateTimelineEntry(sectionId, index, {
                                  bullets: event.target.value
                                    .split("\n")
                                    .map((line) => line.trim())
                                    .filter(Boolean)
                                })
                              }
                            />
                          </label>
                        </div>
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => removeTimelineEntry(sectionId, index)}
                        >
                          删除条目
                        </button>
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
                  <div className="section-list">
                    {resume.skills.map((skill, index) => (
                      <div key={`${skill}-${index}`} className="inline-row">
                        <label className="inline-row__field">
                          技能 {index + 1}
                          <input
                            value={skill}
                            onChange={(event) => updateSkill(index, event.target.value)}
                          />
                        </label>
                        <button type="button" className="ghost-button" onClick={() => removeSkill(index)}>
                          删除
                        </button>
                      </div>
                    ))}
                    <button type="button" className="secondary-button" onClick={addSkill}>
                      新增技能
                    </button>
                  </div>
                ) : null}

                {sectionId === "awards" ? (
                  <div className="section-list">
                    {resume.awards.map((award, index) => (
                      <div key={`${award}-${index}`} className="inline-row">
                        <label className="inline-row__field">
                          条目 {index + 1}
                          <input
                            value={award}
                            onChange={(event) => updateAward(index, event.target.value)}
                          />
                        </label>
                        <button type="button" className="ghost-button" onClick={() => removeAward(index)}>
                          删除
                        </button>
                      </div>
                    ))}
                    <button type="button" className="secondary-button" onClick={addAward}>
                      新增获奖 / 证书
                    </button>
                  </div>
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
