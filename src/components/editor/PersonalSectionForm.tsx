import { useResumeStore } from "../../store/useResumeStore";
import type { ResumeData } from "../../types/resume";
import { FieldShell } from "./fields";

const personalFieldMeta: Array<{
  key: keyof ResumeData["personal"];
  label: string;
  hint?: string;
  multiline?: boolean;
}> = [
  { key: "name", label: "姓名" },
  { key: "title", label: "求职意向", hint: "例如：前端开发工程师" },
  { key: "phone", label: "手机号" },
  { key: "email", label: "邮箱" },
  { key: "city", label: "所在城市" },
  {
    key: "summary",
    label: "个人简介",
    hint: "建议用 1-2 句话概括你的优势、方向和亮点。",
    multiline: true
  }
];

export function PersonalSectionForm() {
  const personal = useResumeStore((state) => state.resume.personal);
  const updatePersonal = useResumeStore((state) => state.updatePersonal);

  return (
    <div className="editor-form-grid">
      {personalFieldMeta.map((field) => (
        <FieldShell key={field.key} label={field.label} hint={field.hint}>
          {field.multiline ? (
            <textarea
              value={personal[field.key]}
              rows={4}
              onChange={(event) => updatePersonal(field.key, event.target.value)}
            />
          ) : (
            <input
              value={personal[field.key]}
              onChange={(event) => updatePersonal(field.key, event.target.value)}
            />
          )}
        </FieldShell>
      ))}
    </div>
  );
}
