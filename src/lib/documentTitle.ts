export const defaultDocumentTitle = "新建简历";

export function normalizeDocumentTitle(value: unknown): string {
  if (typeof value !== "string") {
    return defaultDocumentTitle;
  }

  const trimmed = value.trim();
  return trimmed || defaultDocumentTitle;
}
