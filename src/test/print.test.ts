import { describe, expect, test, vi } from "vitest";
import { beginPrintSession, PRINT_MODE_CLASS, printResume, setPrintMode } from "../lib/print";

describe("print helpers", () => {
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
