export const PRINT_MODE_CLASS = "resume-print-mode";
export const PREVIEW_ROOT_SELECTOR = "[data-resume-preview-root='true']";

function getDocument(target?: Document): Document | null {
  if (target) {
    return target;
  }

  if (typeof document === "undefined") {
    return null;
  }

  return document;
}

export function setPrintMode(isPrinting: boolean, targetDocument?: Document): void {
  const currentDocument = getDocument(targetDocument);

  if (!currentDocument) {
    return;
  }

  currentDocument.body.classList.toggle(PRINT_MODE_CLASS, isPrinting);
}

export function beginPrintSession(targetDocument?: Document): () => void {
  setPrintMode(true, targetDocument);

  return () => {
    setPrintMode(false, targetDocument);
  };
}

export function printResume(targetWindow?: Window): void {
  if (typeof window === "undefined" && !targetWindow) {
    return;
  }

  const currentWindow = targetWindow ?? window;
  const cleanup = beginPrintSession(currentWindow.document);

  const handleAfterPrint = () => {
    cleanup();
    currentWindow.removeEventListener("afterprint", handleAfterPrint);
  };

  currentWindow.addEventListener("afterprint", handleAfterPrint);

  try {
    currentWindow.print();
  } finally {
    currentWindow.setTimeout(() => {
      cleanup();
      currentWindow.removeEventListener("afterprint", handleAfterPrint);
    }, 0);
  }
}
