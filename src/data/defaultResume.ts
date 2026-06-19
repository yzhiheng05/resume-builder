import { buildPresetState } from "./identityPresets";
import { createTimelineEntry, defaultPersonalVisibility } from "../lib/moduleRegistry";

export { createTimelineEntry, defaultPersonalVisibility };

export const defaultStudentResumeState = buildPresetState("student");
export const defaultProfessionalResumeState = buildPresetState("professional");
export const defaultGeneralResumeState = buildPresetState("general");
