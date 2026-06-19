import { printResume } from "../lib/print";
import { useResumeStore } from "../store/useResumeStore";

interface HeaderBarProps {
  onReset: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  statusMessage?: string;
}

export function HeaderBar({ onReset, onExportData, onImportData, statusMessage }: HeaderBarProps) {
  const reset = useResumeStore((state) => state.reset);

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Campus Resume Builder</p>
        <h1>校园简历编辑器</h1>
        {statusMessage ? (
          <p className="topbar__status" role="status">
            {statusMessage}
          </p>
        ) : null}
      </div>
      <div className="topbar__actions">
        <button type="button" onClick={onReset ?? reset}>
          重置
        </button>
        <button type="button" onClick={onExportData}>
          导出数据
        </button>
        <label className="topbar__file-action">
          导入数据
          <input
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onImportData(file);
              }
              event.target.value = "";
            }}
          />
        </label>
        <button type="button" onClick={() => printResume()}>
          导出 PDF
        </button>
      </div>
    </header>
  );
}
