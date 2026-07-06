import type { CSSProperties } from "react";
import type { ResumeStyleSettings } from "../types/resume";

export const defaultResumeStyle: ResumeStyleSettings = {
  accentColor: "#36846b",
  density: "comfortable",
  sectionSpacing: "normal",
  headingStyle: "underline",
  fontSizePx: 14,
  lineHeight: 1.58,
  paragraphSpacingPx: 5,
  pageMarginXmm: 16,
  pageMarginYmm: 18
};

const legacyDefaultAccentColor = "#2563eb";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function normalizeNumber(value: unknown, fallback: number, min: number, max: number, decimals = 0): number {
  const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN;
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return fallback;
  }

  const factor = 10 ** decimals;
  return Math.round(parsed * factor) / factor;
}

export function normalizeResumeStyle(value: unknown): ResumeStyleSettings {
  if (!isRecord(value)) {
    return { ...defaultResumeStyle };
  }

  return {
    accentColor:
      value.accentColor === legacyDefaultAccentColor
        ? defaultResumeStyle.accentColor
        : isHexColor(value.accentColor)
          ? value.accentColor
          : defaultResumeStyle.accentColor,
    density:
      value.density === "compact" || value.density === "comfortable"
        ? value.density
        : defaultResumeStyle.density,
    sectionSpacing:
      value.sectionSpacing === "tight" || value.sectionSpacing === "normal" || value.sectionSpacing === "loose"
        ? value.sectionSpacing
        : defaultResumeStyle.sectionSpacing,
    headingStyle:
      value.headingStyle === "underline" || value.headingStyle === "bar" || value.headingStyle === "plain"
        ? value.headingStyle
        : defaultResumeStyle.headingStyle,
    fontSizePx: normalizeNumber(value.fontSizePx, defaultResumeStyle.fontSizePx, 10, 22, 1),
    lineHeight: normalizeNumber(value.lineHeight, defaultResumeStyle.lineHeight, 1.1, 2.2, 2),
    paragraphSpacingPx: normalizeNumber(
      value.paragraphSpacingPx,
      defaultResumeStyle.paragraphSpacingPx,
      0,
      18,
      1
    ),
    pageMarginXmm: normalizeNumber(value.pageMarginXmm, defaultResumeStyle.pageMarginXmm, 6, 30, 1),
    pageMarginYmm: normalizeNumber(value.pageMarginYmm, defaultResumeStyle.pageMarginYmm, 6, 30, 1)
  };
}

export function getResumeStyleVars(style: ResumeStyleSettings): CSSProperties {
  const normalized = normalizeResumeStyle(style);

  return {
    "--resume-accent": normalized.accentColor,
    "--resume-font-size": `${normalized.fontSizePx}px`,
    "--resume-line-height": `${normalized.lineHeight}`,
    "--resume-paragraph-gap": `${normalized.paragraphSpacingPx}px`,
    "--resume-page-margin-x": `${normalized.pageMarginXmm}mm`,
    "--resume-page-margin-y": `${normalized.pageMarginYmm}mm`
  } as CSSProperties;
}
