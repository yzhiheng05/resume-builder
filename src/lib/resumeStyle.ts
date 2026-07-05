import type { CSSProperties } from "react";
import type { ResumeStyleSettings } from "../types/resume";

export const defaultResumeStyle: ResumeStyleSettings = {
  accentColor: "#2563eb",
  density: "comfortable",
  sectionSpacing: "normal",
  headingStyle: "underline"
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

export function normalizeResumeStyle(value: unknown): ResumeStyleSettings {
  if (!isRecord(value)) {
    return { ...defaultResumeStyle };
  }

  return {
    accentColor: isHexColor(value.accentColor) ? value.accentColor : defaultResumeStyle.accentColor,
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
        : defaultResumeStyle.headingStyle
  };
}

export function getResumeStyleVars(style: ResumeStyleSettings): CSSProperties {
  return {
    "--resume-accent": style.accentColor
  } as CSSProperties;
}
