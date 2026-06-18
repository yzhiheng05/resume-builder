import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function SectionCard({
  title,
  description,
  enabled,
  onToggle,
  children
}: SectionCardProps) {
  return (
    <article className="section-card">
      <div className="section-card__header">
        <div>
          <p className="section-card__title">{title}</p>
          <p className="section-card__description">{description}</p>
        </div>
        <label className="section-card__toggle">
          <input type="checkbox" checked={enabled} onChange={onToggle} />
          <span>{enabled ? "显示中" : "已隐藏"}</span>
        </label>
      </div>
      <div className="section-card__body">
        {enabled ? children : <p className="section-card__placeholder">模块已隐藏，预览区不会显示这一部分。</p>}
      </div>
    </article>
  );
}
