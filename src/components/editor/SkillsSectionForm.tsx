import { useResumeStore } from "../../store/useResumeStore";
import { FieldShell } from "./fields";

export function SkillsSectionForm() {
  const skills = useResumeStore((state) => state.resume.skills);
  const updateSkill = useResumeStore((state) => state.updateSkill);

  return (
    <div className="editor-form-stack">
      {skills.map((skill, index) => (
        <FieldShell key={`${index}-${skill}`} label={`技能 ${index + 1}`}>
          <input
            value={skill}
            onChange={(event) => updateSkill(index, event.target.value)}
          />
        </FieldShell>
      ))}
    </div>
  );
}
