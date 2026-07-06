import { readFileSync } from "node:fs";
import { describe, expect, test, vi } from "vitest";
import { beginPrintSession, PRINT_MODE_CLASS, printResume, setPrintMode } from "../lib/print";

describe("print helpers", () => {
  test("print styles hide canvas-only chrome", () => {
    const printCss = readFileSync("src/styles.css", "utf8");

    expect(printCss).toContain(".resume-print-mode .canvas-statusbar");
    expect(printCss).toContain(".canvas-statusbar");
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

    expect(css).toContain("rgba(54, 132, 107, 0.16) 0 1.5mm");
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
    expect(css).not.toMatch(/\\.topbar \\{[\\s\\S]*?background: #101114;/);
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
