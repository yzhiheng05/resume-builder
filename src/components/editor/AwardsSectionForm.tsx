import { useResumeStore } from "../../store/useResumeStore";
import { FieldShell } from "./fields";

export function AwardsSectionForm() {
  const awards = useResumeStore((state) => state.resume.awards);
  const updateAward = useResumeStore((state) => state.updateAward);

  return (
    <div className="editor-form-stack">
      {awards.map((award, index) => (
        <FieldShell key={`${index}-${award}`} label={`获奖 / 证书 ${index + 1}`}>
          <input
            value={award}
            onChange={(event) => updateAward(index, event.target.value)}
          />
        </FieldShell>
      ))}
    </div>
  );
}
