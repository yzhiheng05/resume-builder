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
    expect(printCss).toContain(".resume-paper--template-sidebar .resume-section--active::before");
    expect(printCss).toContain(".resume-print-mode .preview-surface::before");
    expect(printCss).toContain(".preview-surface::before");
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

  test("module library uses a light workbench panel instead of a black block", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".editor-sidebar--library {\n  background: #eceee8;");
    expect(css).not.toContain("background: var(--panel-deep);");
  });

  test("top toolbar uses a light file bar instead of a black strip", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".topbar {\n  position: sticky;");
    expect(css).toContain("background: #f2f1ec;");
    expect(css).toContain("box-shadow: 0 10px 24px rgba(39, 47, 43, 0.06), 0 1px 0 rgba(255, 255, 255, 0.7) inset;");
    expect(css).toContain(".topbar__controls {\n  display: inline-flex;\n  justify-content: flex-end;");
    expect(css).toContain("padding: 3px;\n  border: 1px solid rgba(17, 18, 23, 0.09);\n  border-radius: 8px;\n  background: rgba(255, 254, 251, 0.46);");
    expect(css).toContain(".topbar__identity-switcher,\n.topbar__actions {\n  display: inline-flex;\n  gap: 2px;");
    expect(css).toContain("padding: 0;\n  border: 0;\n  border-radius: 5px;\n  background: transparent;");
    expect(css).toContain(".topbar__actions {\n  padding-left: 5px;\n  border-left: 1px solid rgba(17, 18, 23, 0.08);");
    expect(css).not.toMatch(/\\.topbar \\{[\\s\\S]*?background: #101114;/);
  });

  test("canvas workbench uses a lighter neutral stage", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain("--canvas-bg: #dde1de;");
    expect(css).toContain("linear-gradient(180deg, #e3e6e3 0%, #d5dad7 100%)");
    expect(css).not.toContain("--canvas-bg: #d2d6d4;");
    expect(css).not.toContain("linear-gradient(180deg, #d9dddb 0%, #c9cecc 100%)");
  });

  test("inspector panel matches the quiet paper-gray workbench shell", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".inspector-panel {\n  padding: 18px;\n  background: #eceee8;");
    expect(css).not.toContain(".inspector-panel {\n  padding: 18px;\n  background: #f4f3ef;");
  });

  test("editor chrome uses the restrained default accent instead of bright green", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain("--accent: #3f5f68;");
    expect(css).not.toContain("--accent: #36846b;");
  });

  test("identity entry screen uses the same light workbench instead of a black landing split", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".identity-screen {\n  display: block;\n  min-height: 100vh;\n  padding: 0;\n  background: #dde1de;");
    expect(css).toContain(".identity-screen__hero {\n  display: grid;\n  align-content: center;");
    expect(css).toContain("linear-gradient(180deg, #e3e6e3 0%, #d5dad7 100%);");
    expect(css).toContain(".identity-screen__choices {\n  display: grid;\n  align-content: center;");
    expect(css).toContain("background: #eceee8;");
    expect(css).toContain(".identity-card {\n  position: relative;\n  min-height: 96px;\n  padding: 13px 12px 13px 18px;");
    expect(css).toContain("border: 1px solid rgba(17, 18, 23, 0.08);\n  border-radius: 6px;\n  background: rgba(255, 254, 251, 0.34);");
    expect(css).not.toContain("background: #101114;\n  color: #f7f8f6;");
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

  test("template selector uses a quiet text rail instead of mini preview cards", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".template-card {\n  grid-template-columns: minmax(0, 1fr);");
    expect(css).toContain(".template-card__thumbnail {\n  display: none;");
    expect(css).not.toContain(".template-card {\n  grid-template-columns: 28px minmax(0, 1fr);");
  });

  test("canvas template controls use a framed tool rail instead of bare divider lines", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".canvas-panel__header {\n  display: flex;\n  justify-content: space-between;");
    expect(css).toContain("padding: 7px 10px;\n  border: 1px solid rgba(17, 18, 23, 0.08);\n  border-radius: 6px;\n  background: rgba(255, 254, 251, 0.38);");
    expect(css).toContain(".template-selector {\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  width: 100%;\n  gap: 4px;\n  padding: 3px;");
    expect(css).toContain("border: 1px solid rgba(17, 18, 23, 0.09);\n  border-radius: 6px;\n  background: rgba(255, 254, 251, 0.3);");
    expect(css).toContain(".canvas-statusbar {\n  position: absolute;\n  right: 34px;\n  top: 18px;");
    expect(css).toContain("background: rgba(255, 254, 251, 0.72);\n  box-shadow: 0 6px 14px rgba(39, 47, 43, 0.08);");
    expect(css).toContain(".template-card {\n    grid-template-columns: minmax(0, 1fr);");
  });

  test("editor side panels use refined tool rows instead of flat divider lists", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".module-library__group-items {\n  display: grid;\n  gap: 5px;\n  border-top: 0;");
    expect(css).toContain(".module-library__item {\n  position: relative;\n  display: grid;\n  grid-template-columns: 18px minmax(0, 1fr) 18px;");
    expect(css).toContain("border: 1px solid rgba(17, 18, 23, 0.09);\n  border-radius: 6px;\n  background: rgba(255, 254, 251, 0.46);");
    expect(css).toContain(".module-library__item:hover:not(:disabled) {\n  border-color: rgba(63, 95, 104, 0.24);\n  background: rgba(255, 254, 251, 0.74);");
  });

  test("module add markers use the restrained accent instead of mint green", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain("border: 1px solid rgba(63, 95, 104, 0.38);\n  border-radius: 50%;");
    expect(css).toContain("color: #3f5f68;\n  font-size: 15px;");
    expect(css).not.toContain("rgba(134, 205, 182, 0.62)");
    expect(css).not.toContain("#86cdb6");
  });

  test("side panel headers use compact tool headers instead of large page titles", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".editor-sidebar__header {\n  display: grid;\n  gap: 4px;\n  margin: 0 0 14px;");
    expect(css).toContain("padding: 10px;\n  border: 1px solid rgba(17, 18, 23, 0.08);\n  border-radius: 6px;\n  background: rgba(255, 254, 251, 0.32);");
    expect(css).toContain(".editor-sidebar__header h2 {\n  color: #17181c;\n  font-size: 18px;");
    expect(css).toContain(".inspector-panel .editor-sidebar__header {\n  display: flex;\n  justify-content: space-between;");
    expect(css).toContain("padding: 10px;\n  border: 1px solid rgba(17, 18, 23, 0.08);");
  });

  test("inspector style controls sit in a quiet tool tray instead of raw form rows", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".inspector-section--style {\n  gap: 10px;\n  padding: 10px;");
    expect(css).toContain("border: 1px solid rgba(17, 18, 23, 0.09);\n  border-radius: 6px;\n  background: rgba(255, 254, 251, 0.34);");
    expect(css).toContain(".style-board,\n.numeric-field-grid,\n.segmented-field {\n  padding: 10px 0;");
  });

  test("inspector text fields use compact property rows instead of bare underlines", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".inspector-panel label:has(> input:not([type])) {\n  display: grid;\n  grid-template-columns: minmax(68px, 0.74fr) minmax(0, 1fr) auto;");
    expect(css).toContain("min-height: 42px;\n  padding: 7px 8px;\n  border: 1px solid rgba(17, 18, 23, 0.08);\n  border-radius: 5px;");
    expect(css).toContain("background: rgba(255, 254, 251, 0.28);");
    expect(css).toContain(".inspector-panel label:has(> input:not([type])):focus-within {\n  border-color: rgba(63, 95, 104, 0.28);");
    expect(css).toContain(".inspector-panel label > input:not([type]) {\n  min-height: 28px;\n  padding: 3px 0;");
    expect(css).not.toContain("border-bottom: 1px solid rgba(17, 18, 23, 0.16);");
  });

  test("photo editor uses a compact asset well instead of a dashed upload box", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".photo-editor {\n  grid-template-columns: 54px minmax(0, 1fr);\n  gap: 10px;");
    expect(css).toContain("min-height: 74px;\n  padding: 8px;\n  border: 1px solid rgba(17, 18, 23, 0.08);\n  border-radius: 5px;");
    expect(css).toContain("background: rgba(255, 254, 251, 0.3);");
    expect(css).toContain(".photo-editor__preview {\n  width: 44px;\n  height: 56px;\n  min-height: 56px;");
    expect(css).toContain(".photo-editor__body {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto;");
    expect(css).toContain(".photo-editor .secondary-button,\n.photo-editor .ghost-button {\n  min-height: 28px;");
    expect(css).not.toContain("border: 1px dashed rgba(167, 194, 255, 0.9);");
  });

  test("timeline and list editors use compact entry wells instead of raw stacked forms", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".inspector-panel .list-item,\n.inspector-panel .inline-row {\n  padding: 8px;");
    expect(css).toContain("border: 1px solid rgba(17, 18, 23, 0.08);\n  border-radius: 5px;\n  background: rgba(255, 254, 251, 0.24);");
    expect(css).toContain(".inspector-panel .list-item .ghost-button,\n.inspector-panel .inline-row .ghost-button {\n  justify-self: end;\n  min-height: 26px;");
    expect(css).toContain(".inspector-form > .secondary-button {\n  width: 100%;\n  min-height: 34px;");
    expect(css).toContain("background: rgba(63, 95, 104, 0.07);");
    expect(css).not.toContain(".inspector-panel .list-item,\n.inspector-panel .inline-row {\n  padding: 12px 0;");
    expect(css).not.toContain("border-top: 1px solid rgba(17, 18, 23, 0.09);");
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

    expect(css).toContain(".module-library__group-header {\n  display: grid;\n  gap: 2px;\n  padding: 6px 7px;");
    expect(css).toContain("border: 1px solid rgba(17, 18, 23, 0.07);\n  border-radius: 5px;\n  background: rgba(255, 254, 251, 0.24);");
    expect(css).toContain(".template-chip-group,\n.segmented-control {\n  gap: 3px;\n  padding: 3px;");
    expect(css).toContain("border: 1px solid rgba(17, 18, 23, 0.08);\n  border-radius: 5px;\n  background: rgba(255, 254, 251, 0.24);");
    expect(css).toContain(".template-chip,\n.segmented-control button {\n  min-height: 24px;\n  padding: 0 7px;\n  border: 0;\n  border-radius: 3px;");
    expect(css).toContain(".template-chip--active,\n.segmented-control button.is-active {\n  background: rgba(255, 254, 251, 0.78);");
    expect(css).not.toContain("border-bottom: 1px solid rgba(17, 18, 23, 0.12);");
  });

  test("selected resume sections use a visible but restrained paper highlight", () => {
    const css = readFileSync("src/styles.css", "utf8");

    expect(css).toContain(".resume-paper .resume-section--active {\n  outline: 1px solid rgba(63, 95, 104, 0.34);");
    expect(css).toContain("background: linear-gradient(90deg, rgba(63, 95, 104, 0.085), rgba(63, 95, 104, 0.025) 44%, transparent 78%);");
    expect(css).toContain(".resume-paper .resume-section--active::before {\n  content: \"\";");
    expect(css).toContain("width: 4px;");
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
