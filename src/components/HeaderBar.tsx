import { printResume } from "../lib/print";
import type { IdentityPreset } from "../types/resume";

interface HeaderBarProps {
  identityLabel: string;
  statusMessage?: string;
  onReset: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onSwitchIdentity: (identity: IdentityPreset) => void;
  onApplyPreset: () => void;
}

export function HeaderBar({
  identityLabel,
  statusMessage,
  onReset,
  onExportData,
  onImportData,
  onSwitchIdentity,
  onApplyPreset
}: HeaderBarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">General Job Resume Builder</p>
        <h1>通用求职简历编辑器</h1>
        <p className="topbar__identity">当前身份：{identityLabel}</p>
        {statusMessage ? (
          <p className="topbar__status" role="status">
            {statusMessage}
          </p>
        ) : null}
      </div>
      <div className="topbar__actions">
        <button type="button" onClick={() => onSwitchIdentity("student")}>
          切到学生
        </button>
        <button type="button" onClick={() => onSwitchIdentity("professional")}>
          切到职场人
        </button>
        <button type="button" onClick={() => onSwitchIdentity("general")}>
          切到通用
        </button>
        <button type="button" onClick={onApplyPreset}>
          应用推荐配置
        </button>
        <button type="button" onClick={onReset}>
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
