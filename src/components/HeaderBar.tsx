import { printResume } from "../lib/print";
import {
  getIdentityEditorTitle,
  getIdentitySwitchLabel,
  RESUME_TOOL_BRAND
} from "../data/identityPresets";
import type { IdentityPreset } from "../types/resume";

interface HeaderBarProps {
  identity: IdentityPreset;
  identityLabel: string;
  statusMessage?: string;
  onReset: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onSwitchIdentity: (identity: IdentityPreset) => void;
  onApplyPreset: () => void;
}

export function HeaderBar({
  identity,
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
        <p className="eyebrow">{RESUME_TOOL_BRAND}</p>
        <h1>{getIdentityEditorTitle(identity)}</h1>
        <p className="topbar__identity">当前身份：{identityLabel}</p>
        {statusMessage ? (
          <p className="topbar__status" role="status">
            {statusMessage}
          </p>
        ) : null}
      </div>
      <div className="topbar__actions">
        <button type="button" onClick={() => onSwitchIdentity("student")}>
          {getIdentitySwitchLabel("student")}
        </button>
        <button type="button" onClick={() => onSwitchIdentity("professional")}>
          {getIdentitySwitchLabel("professional")}
        </button>
        <button type="button" onClick={() => onSwitchIdentity("general")}>
          {getIdentitySwitchLabel("general")}
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
