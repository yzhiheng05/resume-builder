interface ExperienceSectionFormProps {
  title: string;
}

export function ExperienceSectionForm({ title }: ExperienceSectionFormProps) {
  return (
    <div className="section-coming-soon">
      <p>{title}会接成可新增多条记录的列表表单，结构会复用现有 `TimelineEntry`。</p>
      <p>这一轮先保持预览占位和中文说明，不扩展 store 公共 API。</p>
    </div>
  );
}
