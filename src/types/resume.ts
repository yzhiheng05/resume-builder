export type IdentityPreset = "student" | "professional" | "general";

export type ModuleKind =
  | "personal"
  | "summary"
  | "education"
  | "experience"
  | "project"
  | "skills"
  | "certificate"
  | "campus"
  | "honor"
  | "coreCompetency"
  | "highlight";

export type ModuleShape = "personal" | "text" | "timeline" | "list";

export type PersonalVisibleField =
  | "title"
  | "phone"
  | "email"
  | "city"
  | "blog"
  | "github";

export interface TimelineEntry {
  id: string;
  title: string;
  org: string;
  start: string;
  end: string;
  location: string;
  bullets: string[];
}

export interface PersonalModuleData {
  name: string;
  title: string;
  phone: string;
  email: string;
  city: string;
  blog: string;
  github: string;
  photoDataUrl: string;
  personalVisibility: Record<PersonalVisibleField, boolean>;
}

export interface TextModuleData {
  value: string;
}

export interface TimelineModuleData {
  entries: TimelineEntry[];
}

export interface ListModuleData {
  items: string[];
}

export type ResumeModuleData =
  | PersonalModuleData
  | TextModuleData
  | TimelineModuleData
  | ListModuleData;

export interface ResumeModuleInstance {
  id: string;
  kind: ModuleKind;
  title: string;
  visible: boolean;
  data: ResumeModuleData;
}

export interface ResumeDraftState {
  selectedIdentity: IdentityPreset | null;
  modules: ResumeModuleInstance[];
  moduleOrder: string[];
}

export interface StoredResumeStateV2 {
  schemaVersion: 2;
  selectedIdentity: IdentityPreset;
  modules: ResumeModuleInstance[];
  moduleOrder: string[];
}

export type LegacySectionId =
  | "personal"
  | "education"
  | "projects"
  | "internships"
  | "campus"
  | "skills"
  | "awards";

export interface LegacyResumeData {
  personal: {
    name: string;
    title: string;
    phone: string;
    email: string;
    city: string;
    blog: string;
    github: string;
    photoDataUrl: string;
    summary: string;
  };
  education: TimelineEntry[];
  projects: TimelineEntry[];
  internships: TimelineEntry[];
  campus: TimelineEntry[];
  skills: string[];
  awards: string[];
  sectionVisibility: Record<LegacySectionId, boolean>;
  personalVisibility: Record<"title" | "phone" | "email" | "city" | "summary" | "blog" | "github", boolean>;
}

export interface LegacyStoredResumeState {
  resume: LegacyResumeData;
  sectionOrder: LegacySectionId[];
}
