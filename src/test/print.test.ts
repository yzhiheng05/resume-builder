import { readFileSync } from "node:fs";
import { describe, expect, test, vi } from "vitest";
import { beginPrintSession, PRINT_MODE_CLASS, printResume, setPrintMode } from "../lib/print";

describe("print helpers", () => {
  test("print styles hide canvas-only chrome", () => {
    const printCss = readFileSync("src/styles.css", "utf8");

    expect(printCss).toContain(".resume-print-mode .canvas-statusbar");
    expect(printCss).toContain(".resume-print-mode .canvas-panel__header");
    expect(printCss).toContain(".canvas-statusbar");
    expect(printCss).toContain(".resume-print-mode .confirm-dialog-shell");
    expect(printCss).toContain(".confirm-dialog-shell");
    expect(printCss).toContain(".resume-print-mode .template-mini");
    expect(printCss).toContain(".template-mini");
    expect(printCss).toContain(".resume-print-mode .resume-paper--template-classic .resume-section--active::before");
    expect(printCss).toContain(".resume-print-mode .resume-paper--template-classic .resume-section--active::after");
    expect(printCss).toContain(".resume-paper--template-sidebar .resume-section--active::before");
    expect(printCss).toContain(".resume-paper--template-sidebar .resume-section--active::after");
    expect(printCss).toContain(".resume-print-mode .preview-surface::before");
    expect(printCss).toContain(".preview-surface::before");
    expect(printCss).toContain(".preview-surface > .resume-paper::after {\n  content: \"第 1 页结束\";");
    expect(printCss).toContain(".resume-print-mode .resume-paper::after {\n  content: none !important;");
    expect(printCss).toContain("  .resume-paper::after {\n    content: none !important;");
    expect(printCss).toContain("margin: 0;");
    expect(printCss).toContain("--resume-page-margin-x");
    expect(printCss).toContain("--resume-page-margin-y");
    expect(printCss).toContain("width: 210mm");
    expect(printCss).toContain("margin: 0");
    expect(printCss).toContain("min-height: 297mm");
    expect(printCss).toContain("padding: var(--resume-page-margin-y) var(--resume-page-margin-x)");
    expect(printCss).toContain("background: #ffffff !important");
  });

  test("campus template uses a narrow timeline accent instead of a broad color band", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain("rgba(63, 95, 104, 0.16) 0 1.5mm");
    expect(css).toContain("transparent 1.5mm");
    expect(css).not.toContain("rgba(54, 132, 107, 0.13) 0 5mm");
    expect(css).not.toContain("transparent 5mm");
  });

  test("sidebar template uses a light information panel instead of a heavy side block", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain("rgba(247, 248, 244, 0.62) 0 36%");
    expect(css).not.toContain("rgba(241, 244, 239, 0.92) 0 36%");
  });

  test("mobile canvas preview clips scaled paper overflow", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain("@media (max-width: 720px)");
    expect(css).toContain(".preview-surface {\n    overflow-x: clip;");
  });

  test("module library uses a white workbench rail instead of a black block", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".editor-sidebar--library {\n  background: #ffffff;\n}");
    expect(css).toContain("border-right: 1px solid rgba(18, 18, 18, 0.1);");
    expect(css).not.toContain("background: var(--panel-deep);");
  });

  test("top toolbar uses a Magic Resume style white file bar", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".topbar {\n  position: sticky;");
    expect(css).toContain("padding: 8px 18px;\n  align-items: center;\n  background: #ffffff;");
    expect(css).toContain("border-bottom: 1px solid rgba(18, 18, 18, 0.1);\n  box-shadow: none;");
    expect(css).toContain(".topbar__kicker::after {\n  content: \"/\";");
    expect(css).toContain(".topbar h1 {\n  color: #17181c;\n  min-height: 28px;");
    expect(css).toContain("border: 1px solid rgba(17, 18, 23, 0.08);\n  border-radius: 5px;\n  background: #fbfbfa;");
    expect(css).toContain(".topbar__controls {\n  display: inline-flex;\n  justify-content: flex-end;");
    expect(css).toContain("padding: 0;\n  border: 0;\n  border-radius: 0;\n  background: transparent;");
    expect(css).toContain(".topbar__identity-switcher,\n.topbar__actions {\n  display: inline-flex;\n  gap: 2px;");
    expect(css).toContain("padding: 2px;\n  border: 1px solid rgba(18, 18, 18, 0.08);\n  border-radius: 5px;\n  background: #fbfbfa;");
    expect(css).toContain(".topbar__actions {\n  border-radius: 6px;");
    expect(css).toContain(".topbar__primary-action {\n  min-width: 48px;");
    expect(css).toContain("border: 1px solid #111111 !important;\n  background: #111111 !important;");
    expect(css).toContain("color: #ffffff !important;\n  font-weight: 800 !important;");
    expect(css).toContain(".topbar__primary-action:hover {\n  background: #2a2a2a !important;");
    expect(css).toContain(".topbar__actions button:hover,\n.topbar__file-action:hover {\n  box-shadow: none;");
    expect(css).toContain("transform: none;");
    expect(css).not.toContain("background: #d9b16a !important;");
    expect(css).not.toContain("background: #e2bf7e !important;");
    expect(css).not.toMatch(/\\.topbar \\{[\\s\\S]*?background: #101114;/);
  });

  test("top identity switcher uses a clear current marker instead of plain hover fill", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".topbar__actions button:hover,\n.topbar__file-action:hover,\n.topbar__identity-switcher button:hover {\n  background: rgba(18, 18, 18, 0.055);");
    expect(css).toContain(".topbar__identity-switcher .is-active {\n  background: #ffffff;");
    expect(css).toContain("color: #17181c;\n  font-weight: 800;");
    expect(css).toContain("box-shadow:\n    inset 3px 0 0 #111111,");
    expect(css).not.toContain(".topbar__identity-switcher button:hover,\n.topbar__identity-switcher .is-active {\n  background: rgba(63, 95, 104, 0.08);");
  });

  test("mobile top toolbar uses two compact command rows instead of one wrapped button pile", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain("@media (max-width: 1080px)");
    expect(css).toContain(".topbar {\n    position: static;\n    display: grid;\n    grid-template-columns: 1fr;");
    expect(css).toContain("gap: 8px;\n    padding: 11px 14px 12px;");
    expect(css).toContain(".topbar__document {\n    gap: 7px;");
    expect(css).toContain(".topbar__controls {\n    display: grid;\n    grid-template-columns: 1fr;\n    gap: 4px;");
    expect(css).toContain("padding: 5px;\n    border-radius: 8px;");
    expect(css).toContain(".topbar__identity-switcher {\n    display: grid;\n    grid-template-columns: repeat(3, minmax(0, 1fr));");
    expect(css).toContain(".topbar__actions {\n    display: grid;\n    grid-template-columns: repeat(4, minmax(0, 1fr)) minmax(72px, 1.16fr);");
    expect(css).toContain("padding-top: 5px;\n    padding-left: 0;\n    border-top: 1px solid rgba(17, 18, 23, 0.08);\n    border-left: 0;");
    expect(css).toContain("justify-content: center;\n    min-height: 30px;");
    expect(css).toContain(".topbar__primary-action {\n    margin-left: 0;\n    min-width: 72px !important;");
  });

  test("mobile editor workspace separates long stacked regions into quiet bands", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain("@media (max-width: 1080px)");
    expect(css).toContain(".editor-workspace {\n    grid-template-columns: 1fr;\n    gap: 0;");
    expect(css).toContain("background: #f3f3f1;");
    expect(css).toContain(".editor-sidebar--library,\n  .canvas-panel,\n  .inspector-panel {\n    border-top: 1px solid rgba(18, 18, 18, 0.1);");
    expect(css).toContain("box-shadow: none;");
    expect(css).toContain(".editor-sidebar--library {\n    background: #ffffff;");
    expect(css).toContain(".canvas-panel {\n    min-height: auto;\n    padding-top: 18px;");
    expect(css).toContain("background: #f6f6f4;");
    expect(css).toContain(".inspector-panel {\n    background: #ffffff;");
  });

  test("canvas workbench uses a plain light neutral stage", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".editor-workspace {\n  grid-template-columns: minmax(260px, 300px) minmax(620px, 1fr) minmax(300px, 360px);");
    expect(css).toContain("background: #f3f3f1;");
    expect(css).toContain(".canvas-panel {\n  display: flex;\n  flex-direction: column;\n  min-height: calc(100vh - 48px);");
    expect(css).toContain("padding: 12px 22px 22px;\n  background: #f6f6f4;");
    expect(css).not.toContain("--canvas-bg: #d2d6d4;");
    expect(css).not.toContain("linear-gradient(180deg, #d9dddb 0%, #c9cecc 100%)");
  });

  test("preview stage uses a quiet mat instead of a dense drafting grid", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".preview-surface {\n  position: relative;\n  flex: 1;");
    expect(css).toContain("padding: 22px 28px 28px;");
    expect(css).toContain("background: #f4f4f2;\n  box-shadow: inset 1px 0 0 rgba(18, 18, 18, 0.06);");
    expect(css).toContain(".preview-surface::before,\n.preview-surface::after {\n  content: none;\n  display: none;");
    expect(css).not.toContain("linear-gradient(90deg, rgba(255, 255, 255, 0.13) 1px, transparent 1px) 0 0 / 36px 36px");
    expect(css).not.toContain("repeating-linear-gradient(90deg, rgba(33, 38, 48, 0.24) 0 1px, transparent 1px 16px)");
  });

  test("inspector panel matches the white workbench shell", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".inspector-panel {\n  padding: 18px;\n  background: #ffffff;");
    expect(css).toContain("border-left: 1px solid rgba(18, 18, 18, 0.1);");
    expect(css).toContain(".inspector-panel .editor-sidebar__header {\n  display: flex;\n  justify-content: space-between;");
    expect(css).toContain("padding: 2px 0 14px;\n  border: 0;\n  border-bottom: 1px solid rgba(17, 18, 23, 0.1);");
    expect(css).not.toContain(".inspector-panel {\n  padding: 18px;\n  background: #eceee8;");
  });

  test("resume paper keeps the restrained default accent while editor chrome stays neutral", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain("--accent: #3f5f68;");
    expect(css).toContain("linear-gradient(#111111, #111111) 4px 5px / 8px 1px no-repeat");
    expect(css).toContain("inset 3px 0 0 #111111,");
    expect(css).not.toContain("--accent: #36846b;");
  });

  test("identity entry screen uses the same light workbench instead of a black landing split", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".identity-screen {\n  display: block;\n  min-height: 100vh;\n  padding: 0;\n  background: #dde1de;");
    expect(css).toContain(".identity-screen__hero {\n  display: grid;\n  align-content: center;");
    expect(css).toContain("linear-gradient(180deg, #e5e8e5 0%, #d8ddda 100%);");
    expect(css).toContain(".identity-screen__choices {\n  display: grid;\n  align-content: center;");
    expect(css).toContain("background: linear-gradient(180deg, #f2f1ec 0%, #e9ece6 100%);");
    expect(css).toContain(".identity-card {\n  position: relative;\n  min-height: 92px;\n  padding: 14px 42px 14px 20px;");
    expect(css).toContain("min-height: 92px;\n  padding: 14px 42px 14px 20px;");
    expect(css).toContain("border: 1px solid rgba(17, 18, 23, 0.075);\n  border-radius: 7px;\n  background: rgba(255, 254, 251, 0.46);");
    expect(css).not.toContain("background: #101114;\n  color: #f7f8f6;");
  });

  test("identity entry uses quieter drafting marks and start-list affordances", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain("linear-gradient(90deg, rgba(17, 18, 23, 0.014) 1px, transparent 1px) 0 0 / 42px 42px");
    expect(css).toContain("linear-gradient(rgba(17, 18, 23, 0.012) 1px, transparent 1px) 0 0 / 42px 42px");
    expect(css).toContain(".identity-card {\n  position: relative;\n  min-height: 92px;\n  padding: 14px 42px 14px 20px;");
    expect(css).toContain("overflow: hidden;\n  border: 1px solid rgba(17, 18, 23, 0.075);");
    expect(css).toContain("border-radius: 7px;\n  background: rgba(255, 254, 251, 0.46);");
    expect(css).toContain(".identity-card::after {\n  content: \"\";");
    expect(css).toContain("border-top: 1.5px solid rgba(63, 95, 104, 0.52);\n  border-right: 1.5px solid rgba(63, 95, 104, 0.52);");
    expect(css).toContain(".identity-card__meta span {\n  padding: 2px 7px;");
    expect(css).toContain("padding: 2px 7px;\n  border: 1px solid rgba(63, 95, 104, 0.13);");
    expect(css).toContain("background: rgba(63, 95, 104, 0.06);");
    expect(css).not.toContain(".identity-card__meta span + span::before {\n  content: \"/\";");
    expect(css).not.toContain("linear-gradient(90deg, rgba(17, 18, 23, 0.026) 1px, transparent 1px) 0 0 / 34px 34px");
  });

  test("mobile identity entry keeps the start choices in the first screen rhythm", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain("@media (max-width: 720px)");
    expect(css).toContain(".identity-screen__hero {\n    gap: 10px;\n    padding: 30px 24px 24px;");
    expect(css).toContain(".identity-screen__hero h1 {\n    font-size: 34px;");
    expect(css).toContain(".identity-screen__hero p:last-child {\n    font-size: 14px;\n    line-height: 1.58;");
    expect(css).toContain(".identity-screen__paper {\n    width: 100%;\n    margin-top: 2px;\n    padding: 10px;");
    expect(css).toContain(".identity-paper__sheet {\n    min-height: 220px;\n    gap: 7px;\n    padding: 22px 24px;");
    expect(css).toContain(".identity-screen__choices {\n    padding: 22px 24px 36px;");
    expect(css).not.toContain(".identity-paper__sheet {\n    min-height: 300px;\n    padding: 28px 24px;");
  });

  test("paper templates avoid leftover hard-coded green accents", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).not.toContain("#0f766e");
    expect(css).not.toContain("#2c7a63");
    expect(css).not.toContain("47, 111, 93");
    expect(css).not.toContain("44, 122, 99");
  });

  test("resume paper body uses subdued metadata and neutral bullet marks", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".resume-paper .resume-entry__meta p:first-child,\n.resume-paper .resume-award__date {\n  color: #4f5b67;\n  font-weight: 640;");
    expect(css).toContain(".resume-paper .resume-entry__meta p:last-child,\n.resume-paper .resume-award__issuer {\n  color: #78838d;");
    expect(css).toContain(".resume-paper .resume-bullets li::before {\n  top: 0.78em;\n  width: 3px;\n  height: 3px;\n  background: #7a858d;");
    expect(css).not.toContain("background: color-mix(in srgb, var(--resume-accent) 58%, #6b7280);");
  });

  test("resume paper personal header uses restrained document hierarchy", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".resume-paper .resume-personal__name {\n  color: #1f2933;\n  font-size: calc(var(--resume-font-size) + 10px);\n  font-weight: 760;");
    expect(css).toContain(".resume-paper .resume-personal__title {\n  color: #4f5b67;\n  font-size: calc(var(--resume-font-size) - 1px);\n  font-weight: 640;");
    expect(css).toContain(".resume-paper .resume-personal__contacts {\n  color: #6d7882;\n  font-size: calc(var(--resume-font-size) - 2px);");
    expect(css).toContain(".resume-paper .resume-personal__contact-item + .resume-personal__contact-item::before {\n  color: #a0a9b1;");
  });

  test("template selector uses compact preview tabs instead of a flat text rail", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".template-card {\n  position: relative;\n  grid-template-columns: 38px minmax(0, 1fr);");
    expect(css).toContain("min-height: 48px;\n  padding: 6px 9px;");
    expect(css).toContain(".template-card__thumbnail {\n  display: block;");
    expect(css).toContain("border-radius: 4px;\n  background: #fffefb;");
    expect(css).toContain(".template-card__thumbnail-surface {\n  max-height: 32px;\n  padding: 3px;");
    expect(css).not.toContain(".template-card__thumbnail {\n  display: none;");
  });

  test("template choices have a restrained but legible active state", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".template-card {\n  position: relative;\n  grid-template-columns: 38px minmax(0, 1fr);");
    expect(css).toContain("background: transparent;");
    expect(css).toContain(".template-card::before {\n  content: \"\";");
    expect(css).toContain("background: #3f5f68;\n  opacity: 0;");
    expect(css).toContain(".template-card--active {\n  border: 1px solid rgba(18, 18, 18, 0.16);");
    expect(css).toContain("background: #ffffff;\n  box-shadow:\n    inset 3px 0 0 #111111,");
    expect(css).toContain(".template-card--active::before {\n  opacity: 1;");
    expect(css).toContain(".template-card--active .template-card__thumbnail {\n  border-color: rgba(63, 95, 104, 0.32);");
    expect(css).toContain(".template-chip--active,\n.segmented-control button.is-active {\n  background: rgba(255, 254, 251, 0.76);");
    expect(css).toContain("color: #17181c;\n  box-shadow:\n    inset 3px 0 0 #111111,");
    expect(css).not.toContain("inset 0 -2px 0 #3f5f68");
  });

  test("canvas workbench uses a compact document rail and keeps preview chrome minimal", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".canvas-panel__header {\n  display: flex;\n  align-self: flex-start;\n  justify-content: space-between;");
    expect(css).toContain("align-self: flex-start;");
    expect(css).toContain("padding: 4px 9px;\n  border: 1px solid rgba(18, 18, 18, 0.06);\n  border-radius: 999px;");
    expect(css).toContain(".preview-panel {\n  flex: 1;\n  gap: 0;");
    expect(css).toContain(".canvas-statusbar {\n  position: absolute;\n  right: 34px;\n  top: 16px;");
    expect(css).toContain("right: 34px;\n  top: 16px;");
    expect(css).toContain("border: 1px solid rgba(17, 18, 23, 0.045);\n  border-radius: 4px;");
    expect(css).toContain("0 2px 6px rgba(39, 47, 43, 0.035);");
    expect(css).toContain("font-size: 10px;\n  font-weight: 760;");
    expect(css).toContain(".canvas-statusbar span:first-child {\n  border-left: 0;\n  background: rgba(17, 18, 23, 0.06);");
    expect(css).not.toContain("background: rgba(255, 254, 251, 0.42);\n  box-shadow: none;");
  });

  test("module library uses grouped material wells instead of loose button stacks", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".module-outline,\n.module-library__group {\n  display: grid;\n  gap: 6px;");
    expect(css).toContain(".module-outline__list {\n  display: grid;\n  gap: 2px;");
    expect(css).toContain(".module-outline__item {\n  display: grid;\n  grid-template-columns: 24px minmax(0, 1fr) auto;");
    expect(css).toContain("min-height: 34px;\n  padding: 6px 8px;");
    expect(css).toContain(".module-outline__item--active {\n  border-color: rgba(17, 18, 23, 0.12);");
    expect(css).toContain("box-shadow:\n    inset 3px 0 0 #111111,");
    expect(css).toContain(".module-add-drawer {\n  display: grid;\n  gap: 8px;");
    expect(css).toContain("border-top: 1px solid rgba(17, 18, 23, 0.09);\n  padding-top: 10px;");
    expect(css).toContain(".module-add-drawer > summary {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto;");
    expect(css).toContain("border: 1px solid rgba(17, 18, 23, 0.08);\n  border-radius: 5px;\n  background: #ffffff;");
    expect(css).toContain(".module-add-drawer > summary::after {\n  content: \"+\";");
    expect(css).toContain(".module-add-drawer[open] > summary::after {\n  content: \"-\";");
    expect(css).toContain(".module-library__group {\n  display: grid;\n  gap: 6px;\n  padding: 0;\n  border: 0;");
    expect(css).toContain("border-radius: 0;\n  background: transparent;\n  box-shadow: none;");
    expect(css).toContain(".module-library__group-header {\n  display: grid;\n  gap: 2px;\n  padding: 0 2px 7px;");
    expect(css).toContain("padding: 0 2px 7px;\n  border: 0;\n  border-bottom: 1px solid rgba(17, 18, 23, 0.09);");
    expect(css).toContain(".module-library__group-items {\n  display: grid;\n  gap: 2px;\n  border-top: 0;");
    expect(css).toContain(".module-library__item {\n  position: relative;\n  display: grid;\n  grid-template-columns: 18px minmax(0, 1fr) auto;");
    expect(css).toContain("min-height: 38px;\n  padding: 7px 8px 7px 9px;");
    expect(css).toContain("border: 1px solid rgba(17, 18, 23, 0.045);\n  border-radius: 6px;\n  background: rgba(255, 254, 251, 0.18);");
    expect(css).toContain(".module-library__item:hover:not(:disabled) {\n  border-color: rgba(17, 18, 23, 0.14);\n  background: rgba(255, 254, 251, 0.66);");
  });

  test("module add markers use neutral chrome instead of colored decoration", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".module-library__item::before {\n  content: \"\";");
    expect(css).toContain("border: 1px solid rgba(17, 18, 23, 0.14);\n  border-radius: 3px;");
    expect(css).toContain("linear-gradient(#111111, #111111) 4px 5px / 8px 1px no-repeat");
    expect(css).toContain("linear-gradient(rgba(17, 18, 23, 0.32), rgba(17, 18, 23, 0.32)) 4px 9px / 6px 1px no-repeat");
    expect(css).toContain("rgba(17, 18, 23, 0.035);");
    expect(css).toContain(".module-library__item::after {\n  content: \"\";");
    expect(css).toContain("position: absolute;\n  right: 13px;");
    expect(css).toContain("linear-gradient(#111111, #111111) center / 9px 1px no-repeat");
    expect(css).toContain("linear-gradient(#111111, #111111) center / 1px 9px no-repeat");
    expect(css).toContain(".module-library__item small {\n  grid-column: 3;\n  justify-self: end;");
    expect(css).toContain("min-width: 42px;\n  padding: 3px 18px 3px 7px;");
    expect(css).toContain("border: 1px solid rgba(17, 18, 23, 0.095);\n  border-radius: 999px;");
    expect(css).toContain("background: rgba(255, 254, 251, 0.42);");
    expect(css).toContain(".module-library__item:hover:not(:disabled)::after,\n.module-library__item:focus-visible:not(:disabled)::after {\n  opacity: 1;");
    expect(css).toContain(".module-library__item:disabled small {\n  padding-right: 7px;");
    expect(css).not.toContain(".module-library__item::after {\n  content: \"+\";");
    expect(css).not.toContain("rgba(134, 205, 182, 0.62)");
    expect(css).not.toContain("#86cdb6");
  });

  test("side panel headers use compact tool headers instead of large page titles", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".editor-sidebar__header {\n  display: grid;\n  gap: 4px;\n  margin: 0 0 16px;");
    expect(css).toContain("margin: 0 0 16px;\n  padding: 2px 2px 14px;");
    expect(css).toContain("border: 0;\n  border-bottom: 1px solid rgba(17, 18, 23, 0.1);\n  border-radius: 0;");
    expect(css).toContain(".editor-sidebar__header h2 {\n  color: #17181c;\n  font-size: 18px;");
    expect(css).toContain(".inspector-panel .editor-sidebar__header {\n  display: flex;\n  justify-content: space-between;");
    expect(css).toContain("padding: 2px 0 14px;\n  border: 0;\n  border-bottom: 1px solid rgba(17, 18, 23, 0.1);");
  });

  test("paper style controls sit in the left rail as a quiet tool tray", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".inspector-section--style {\n  gap: 10px;\n  padding: 10px 0 0;");
    expect(css).toContain("padding: 10px 0 0;\n  border: 0;\n  border-top: 1px solid rgba(17, 18, 23, 0.09);");
    expect(css).toContain("border-radius: 0;\n  background: transparent;\n  box-shadow: none;");
    expect(css).toContain(".style-board,\n.numeric-field-grid,\n.segmented-field {\n  padding: 9px 0;");
    expect(css).toContain(".color-field {\n  position: relative;\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) 48px auto;");
    expect(css).toContain("min-height: 42px;\n  padding: 8px 9px;\n  border: 1px solid rgba(17, 18, 23, 0.075);\n  border-radius: 7px;");
    expect(css).toContain(".numeric-field-grid {\n  display: grid;\n  gap: 9px;\n  padding: 9px 8px;");
    expect(css).toContain("border: 1px solid rgba(17, 18, 23, 0.075);\n  border-radius: 7px;");
    expect(css).toContain(".numeric-field {\n  display: grid;\n  grid-template-columns: minmax(80px, 1fr) 62px 24px;");
    expect(css).toContain("min-height: 32px;\n  padding: 4px 6px;");
    expect(css).toContain("border-radius: 5px;\n  background: rgba(255, 254, 251, 0.32);");
    expect(css).toContain(".numeric-field input {\n  width: 100%;\n  min-width: 0;\n  height: 24px;");
    expect(css).toContain("border-radius: 5px;\n  background: rgba(255, 254, 251, 0.72);");
    expect(css).toContain(".inspector-panel .numeric-field input {\n  min-height: 0;\n  height: 24px;\n  padding: 2px 7px;");
    expect(css).toContain("border-color: rgba(17, 18, 23, 0.085);\n  background: rgba(255, 254, 251, 0.72);");
    expect(css).toContain(".numeric-field code {\n  justify-self: start;\n  min-width: 18px;");
    expect(css).toContain(".segmented-field {\n  display: grid;\n  grid-template-columns: minmax(74px, 0.56fr) minmax(0, 1fr);");
    expect(css).toContain("align-items: center;\n  min-height: 38px;");
    expect(css).toContain(".numeric-field-group__header::after {\n  content: \"\";\n  flex: 1;");
  });

  test("inspector text fields use compact property rows instead of bare underlines", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".inspector-panel label:has(> input:not([type])) {\n  display: grid;\n  grid-template-columns: minmax(72px, 0.6fr) minmax(0, 1fr);");
    expect(css).toContain("gap: 4px 10px;\n  align-items: center;\n  min-height: 42px;\n  padding: 8px 0;");
    expect(css).toContain("background: transparent;");
    expect(css).toContain(".inspector-panel label:has(> input:not([type])):focus-within {\n  border-color: rgba(17, 18, 23, 0.18);");
    expect(css).toContain("box-shadow: inset 3px 0 0 rgba(17, 18, 23, 0.28);");
    expect(css).toContain(".inspector-panel label > input:not([type]) {\n  min-height: 28px;\n  padding: 3px 0;\n  min-width: 0;");
    expect(css).toContain(".inspector-panel label:has(> input:not([type])) > .visibility-toggle {\n  grid-column: 2;\n  justify-self: end;");
    expect(css).not.toContain("border-bottom: 1px solid rgba(17, 18, 23, 0.16);");
  });

  test("inspector textareas use quiet writing wells instead of lined notebook boxes", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".inspector-panel label > textarea {\n  min-height: 76px;\n  padding: 10px 11px 10px 13px;");
    expect(css).toContain("border: 1px solid rgba(17, 18, 23, 0.075);\n  border-left: 3px solid rgba(17, 18, 23, 0.12);");
    expect(css).toContain("linear-gradient(180deg, rgba(255, 254, 251, 0.78), rgba(250, 250, 246, 0.5))");
    expect(css).toContain(".inspector-panel label > textarea:hover {\n  border-color: rgba(17, 18, 23, 0.14);");
    expect(css).toContain("border-left-color: rgba(17, 18, 23, 0.22);");
    expect(css).toContain(".inspector-panel label > textarea:focus {\n  border-color: rgba(17, 18, 23, 0.22);");
    expect(css).toContain("border-left-color: #111111;\n  background: #fffefb;");
    expect(css).toContain("box-shadow:\n    0 0 0 2px rgba(17, 18, 23, 0.06),");
    expect(css).not.toContain("0 37px / 100% 28px");
  });

  test("disabled inspector actions read as quiet unavailable commands instead of broken buttons", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".inspector-actions .secondary-button:disabled,\n.inspector-actions .ghost-button:disabled {\n  border-color: transparent;");
    expect(css).toContain("background: rgba(17, 18, 23, 0.025);");
    expect(css).toContain("color: #9aa19d;\n  opacity: 1;");
    expect(css).toContain("box-shadow: none;\n  cursor: default;");
    expect(css).not.toContain(".inspector-actions .secondary-button:disabled,\n.inspector-actions .ghost-button:disabled {\n  color: #a4aaa7;\n  cursor: default;");
  });

  test("delete confirmation dialog uses app-native danger material instead of a plain alert card", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".confirm-dialog-shell {\n  position: fixed;\n  inset: 0;");
    expect(css).toContain("radial-gradient(circle at 50% 42%, rgba(255, 254, 251, 0.18), transparent 34%)");
    expect(css).toContain("backdrop-filter: blur(3px) saturate(0.9);");
    expect(css).toContain(".confirm-dialog {\n  position: relative;\n  width: min(420px, 100%);");
    expect(css).toContain("linear-gradient(180deg, rgba(255, 254, 251, 0.96), rgba(246, 245, 239, 0.92))");
    expect(css).toContain(".confirm-dialog::before {\n  content: \"\";");
    expect(css).toContain("background: #84443e;");
    expect(css).toContain(".confirm-dialog__actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 10px;");
    expect(css).toContain("background: rgba(255, 254, 251, 0.38);");
    expect(css).toContain(".confirm-dialog__actions .danger-button {\n  border-color: rgba(132, 68, 62, 0.28);");
    expect(css).toContain("linear-gradient(180deg, #8a4841, #773b35)");
    expect(css).not.toContain(".confirm-dialog {\n  width: min(420px, 100%);\n  border: 1px solid rgba(32, 37, 40, 0.12);\n  border-radius: 8px;\n  background: #f8f7f2;");
  });

  test("photo editor uses a compact asset well instead of a dashed upload box", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".photo-editor {\n  grid-template-columns: 54px minmax(0, 1fr);\n  gap: 10px;");
    expect(css).toContain("min-height: 74px;\n  padding: 8px;\n  border: 1px solid rgba(17, 18, 23, 0.075);\n  border-radius: 6px;");
    expect(css).toContain("background: rgba(255, 254, 251, 0.42);");
    expect(css).toContain(".photo-editor__preview {\n  width: 44px;\n  height: 56px;\n  min-height: 56px;");
    expect(css).toContain(".photo-editor__body {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto;");
    expect(css).toContain(".photo-editor .secondary-button,\n.photo-editor .ghost-button {\n  min-height: 28px;");
    expect(css).not.toContain("border: 1px dashed rgba(167, 194, 255, 0.9);");
  });

  test("timeline and list editors use quiet property groups instead of decorated entry cards", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".inspector-form {\n  gap: 10px;\n  counter-reset: inspector-entry;");
    expect(css).toContain(".inspector-panel .list-item,\n.inspector-panel .inline-row {\n  position: relative;\n  padding: 8px 0 0;");
    expect(css).toContain("border: 0;\n  border-top: 1px solid rgba(17, 18, 23, 0.08);");
    expect(css).toContain("border-radius: 0;\n  background: transparent;\n  box-shadow: none;");
    expect(css).toContain("counter-increment: inspector-entry;");
    expect(css).toContain(".inspector-panel .list-item::before,\n.inspector-panel .inline-row::before {\n  content: none;");
    expect(css).toContain(".inspector-panel .list-item::after,\n.inspector-panel .inline-row::after {\n  content: none;");
    expect(css).toContain(".inspector-panel .list-item > label,\n.inspector-panel .list-item > label:has(> input:not([type])) {\n  grid-template-columns: minmax(62px, 0.56fr) minmax(0, 1fr);");
    expect(css).toContain("grid-template-columns: minmax(62px, 0.56fr) minmax(0, 1fr);\n  min-height: 34px;\n  padding: 4px 0;");
    expect(css).toContain("border: 0;\n  border-bottom: 1px solid rgba(17, 18, 23, 0.06);");
    expect(css).toContain(".inspector-panel .list-item > label:focus-within,\n.inspector-panel .list-item > label:has(> input:not([type])):focus-within {\n  border-color: rgba(17, 18, 23, 0.16);");
    expect(css).toContain("border-color: rgba(17, 18, 23, 0.16);\n  background: rgba(17, 18, 23, 0.02);");
    expect(css).toContain(".inspector-panel .list-item .ghost-button,\n.inspector-panel .inline-row .ghost-button {\n  justify-self: end;\n  min-height: 24px;");
    expect(css).toContain("min-height: 24px;\n  padding: 0 7px;");
    expect(css).toContain("border-color: transparent;\n  border-radius: 4px;\n  background: transparent;");
    expect(css).toContain(".inspector-panel .list-item .ghost-button:hover,\n.inspector-panel .inline-row .ghost-button:hover {\n  border-color: rgba(132, 68, 62, 0.22);");
    expect(css).toContain("box-shadow: none;\n  transform: none;");
    expect(css).toContain(".inspector-form > .secondary-button {\n  width: 100%;\n  min-height: 34px;");
    expect(css).toContain("background: rgba(17, 18, 23, 0.045);");
    expect(css).not.toContain("content: \"条目 \" counter(inspector-entry, decimal-leading-zero);");
    expect(css).not.toContain("linear-gradient(180deg, rgba(255, 254, 251, 0.62), rgba(246, 248, 242, 0.42))");
    expect(css).not.toContain("border: 1px solid rgba(17, 18, 23, 0.075);\n  border-radius: 6px;\n  background: rgba(255, 254, 251, 0.38);");
  });

  test("inspector hint notes use solid note rows instead of dashed blue callouts", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".editor-empty-note {\n  margin: 0;\n  padding: 9px 10px 9px 13px;");
    expect(css).toContain("border: 1px solid rgba(17, 18, 23, 0.08);\n  border-radius: 5px;\n  background: rgba(255, 254, 251, 0.26);");
    expect(css).toContain(".inspector-panel .editor-empty-note {\n  position: relative;\n  color: #68716e;");
    expect(css).toContain(".inspector-panel .editor-empty-note::before {\n  content: \"\";");
    expect(css).toContain("width: 2px;\n  border-radius: 999px;\n  background: rgba(63, 95, 104, 0.38);");
    expect(css).not.toContain("border: 1px dashed rgba(191, 219, 254, 0.82);");
    expect(css).not.toContain("linear-gradient(180deg, rgba(247, 250, 255, 0.96), rgba(239, 246, 255, 0.74));");
  });

  test("secondary controls use compact rails instead of bare text and underline buttons", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".module-library__group-header {\n  display: grid;\n  gap: 2px;\n  padding: 0 2px 7px;");
    expect(css).toContain("border: 0;\n  border-bottom: 1px solid rgba(17, 18, 23, 0.09);");
    expect(css).toContain("border-radius: 0;\n  background: transparent;");
    expect(css).toContain(".template-chip-group,\n.segmented-control {\n  gap: 3px;\n  padding: 3px;");
    expect(css).toContain("border: 1px solid rgba(17, 18, 23, 0.075);\n  border-radius: 7px;");
    expect(css).toContain("linear-gradient(180deg, rgba(255, 254, 251, 0.54), rgba(244, 246, 241, 0.3))");
    expect(css).toContain(".template-chip,\n.segmented-control button {\n  min-height: 24px;\n  padding: 0 7px;\n  border: 0;\n  border-radius: 3px;");
    expect(css).toContain(".template-chip--active,\n.segmented-control button.is-active {\n  background: rgba(255, 254, 251, 0.76);");
    expect(css).toContain("color: #17181c;\n  box-shadow:\n    inset 3px 0 0 #111111,");
    expect(css).not.toContain("border-bottom: 1px solid rgba(17, 18, 23, 0.12);");
  });

  test("selected resume sections use a visible but restrained paper highlight", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".resume-paper .resume-section--active {\n  outline: 1px solid rgba(63, 95, 104, 0.34);");
    expect(css).toContain("linear-gradient(90deg, rgba(63, 95, 104, 0.095), rgba(63, 95, 104, 0.03) 46%, transparent 80%)");
    expect(css).toContain("inset 0 1px 0 rgba(255, 255, 255, 0.62);");
    expect(css).toContain(".resume-paper .resume-section--active::before {\n  content: \"\";");
    expect(css).toContain("width: 4px;");
    expect(css).toContain(".resume-paper .resume-section--active::after {\n  content: \"正在编辑\";");
    expect(css).toContain("right: 10px;\n  top: 8px;");
    expect(css).toContain("border-radius: 999px;\n  background: rgba(255, 254, 251, 0.82);");
    expect(css).toContain("font-size: 9px;\n  font-weight: 820;");
  });

  test("setPrintMode toggles the print class on body", () => {
    document.body.classList.remove(PRINT_MODE_CLASS);

    setPrintMode(true, document);
    expect(document.body.classList.contains(PRINT_MODE_CLASS)).toBe(true);

    setPrintMode(false, document);
    expect(document.body.classList.contains(PRINT_MODE_CLASS)).toBe(false);
  });

  test("beginPrintSession returns cleanup that clears print class", () => {
    document.body.classList.remove(PRINT_MODE_CLASS);

    const cleanup = beginPrintSession(document);
    expect(document.body.classList.contains(PRINT_MODE_CLASS)).toBe(true);

    cleanup();
    expect(document.body.classList.contains(PRINT_MODE_CLASS)).toBe(false);
  });

  test("printResume toggles print mode for the print window lifecycle", () => {
    document.body.classList.remove(PRINT_MODE_CLASS);

    const listeners = new Map<string, EventListener>();
    const addEventListener = vi.fn((event: string, listener: EventListener) => {
      listeners.set(event, listener);
    });
    const removeEventListener = vi.fn((event: string) => {
      listeners.delete(event);
    });
    const print = vi.fn(() => {
      expect(document.body.classList.contains(PRINT_MODE_CLASS)).toBe(true);
    });
    const setTimeout = vi.fn((callback: () => void) => {
      callback();
      return 0;
    });

    const targetWindow = {
      document,
      addEventListener,
      removeEventListener,
      print,
      setTimeout
    } as unknown as Window;

    printResume(targetWindow);

    expect(print).toHaveBeenCalledTimes(1);
    expect(addEventListener).toHaveBeenCalledWith("afterprint", expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith("afterprint", expect.any(Function));
    expect(document.body.classList.contains(PRINT_MODE_CLASS)).toBe(false);
  });
});
