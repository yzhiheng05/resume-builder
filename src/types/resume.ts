export type SectionId =
  | "personal"
  | "education"
  | "projects"
  | "internships"
  | "campus"
  | "skills"
  | "awards";

export type PersonalVisibleField =
  | "title"
  | "phone"
  | "email"
  | "city"
  | "summary"
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

export interface ResumeData {
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
  sectionVisibility: Record<SectionId, boolean>;
  personalVisibility: Record<PersonalVisibleField, boolean>;
}

export interface StoredResumeState {
  resume: ResumeData;
  sectionOrder: SectionId[];
}
