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
      <div className="topbar__brand">
        <div className="topbar__document">
          <p className="topbar__kicker">{RESUME_TOOL_BRAND}</p>
          <h1>{getIdentityEditorTitle(identity)}</h1>
        </div>
        <p className="topbar__identity">{identityLabel}</p>
        {statusMessage ? (
          <p className="topbar__status" role="status">
            {statusMessage}
          </p>
        ) : null}
      </div>
      <div className="topbar__controls">
        <nav className="topbar__identity-switcher" aria-label="身份切换">
          <button type="button" className={identity === "student" ? "is-active" : ""} onClick={() => onSwitchIdentity("student")}>
            {getIdentitySwitchLabel("student")}
          </button>
          <button type="button" className={identity === "professional" ? "is-active" : ""} onClick={() => onSwitchIdentity("professional")}>
            {getIdentitySwitchLabel("professional")}
          </button>
          <button type="button" className={identity === "general" ? "is-active" : ""} onClick={() => onSwitchIdentity("general")}>
            {getIdentitySwitchLabel("general")}
          </button>
        </nav>
        <div className="topbar__actions" role="toolbar" aria-label="文件操作">
          <button type="button" aria-label="推荐模块" onClick={onApplyPreset}>
            模块
          </button>
          <button type="button" onClick={onReset}>
            清空
          </button>
          <button type="button" aria-label="导出 JSON" onClick={onExportData}>
            备份
          </button>
          <label className="topbar__file-action" aria-label="导入 JSON">
            恢复
            <input
              aria-label="导入 JSON"
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
          <button type="button" className="topbar__primary-action" aria-label="导出 PDF" onClick={() => printResume()}>
            导出
          </button>
        </div>
      </div>
    </header>
  );
}
