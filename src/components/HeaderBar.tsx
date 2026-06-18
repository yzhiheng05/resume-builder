import { useResumeStore } from "../store/useResumeStore";

interface HeaderBarProps {
  onReset: () => void;
}

export function HeaderBar({ onReset }: HeaderBarProps) {
  const reset = useResumeStore((state) => state.reset);

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Campus Resume Builder</p>
        <h1>校园简历编辑器</h1>
      </div>
      <div className="topbar__actions">
        <button type="button" onClick={onReset ?? reset}>
          重置
        </button>
        <button type="button" onClick={() => window.print()}>
          导出 PDF
        </button>
      </div>
    </header>
  );
}
