import type { ReactNode } from "react";
import type { SectionId } from "../../types/resume";

export const sectionLabels: Record<SectionId, string> = {
  personal: "个人信息",
  education: "教育经历",
  projects: "项目经历",
  internships: "实习经历",
  campus: "校园经历",
  skills: "技能",
  awards: "获奖 / 证书"
};

interface FieldShellProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

export function FieldShell({ label, hint, children }: FieldShellProps) {
  return (
    <label className="editor-field">
      <span className="editor-field__label">{label}</span>
      {children}
      {hint ? <span className="editor-field__hint">{hint}</span> : null}
    </label>
  );
}
