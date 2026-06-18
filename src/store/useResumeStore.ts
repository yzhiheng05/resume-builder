import { create } from "zustand";
import { createTimelineEntry, defaultResume, defaultSectionOrder } from "../data/defaultResume";
import {
  loadResumeState,
  moveSection,
  saveResumeState,
  toggleSectionVisibility
} from "../lib/storage";
import type { ResumeData, SectionId, StoredResumeState, TimelineEntry } from "../types/resume";

type PersonalField = keyof ResumeData["personal"];
type TimelineSectionId = "education" | "projects" | "internships" | "campus";

interface ResumeState {
  resume: ResumeData;
  sectionOrder: SectionId[];
  updatePersonal: (field: PersonalField, value: string) => void;
  updateTimelineEntry: (
    section: TimelineSectionId,
    index: number,
    patch: Partial<TimelineEntry>
  ) => void;
  addTimelineEntry: (section: TimelineSectionId) => void;
  removeTimelineEntry: (section: TimelineSectionId, index: number) => void;
  updateSkill: (index: number, value: string) => void;
  addSkill: () => void;
  removeSkill: (index: number) => void;
  updateAward: (index: number, value: string) => void;
  addAward: () => void;
  removeAward: (index: number) => void;
  toggleSection: (id: SectionId) => void;
  reorderSections: (id: SectionId, toIndex: number) => void;
  setSectionOrder: (nextOrder: SectionId[]) => void;
  reset: () => void;
}

function persistState(state: StoredResumeState) {
  saveResumeState(state);
}

const hydrated = loadResumeState();
const initialResume = hydrated?.resume ?? defaultResume;
const initialOrder = hydrated?.sectionOrder ?? defaultSectionOrder;

export const useResumeStore = create<ResumeState>((set, get) => ({
  resume: initialResume,
  sectionOrder: initialOrder,
  updatePersonal: (field, value) =>
    set((state) => {
      const resume = {
        ...state.resume,
        personal: {
          ...state.resume.personal,
          [field]: value
        }
      };
      persistState({ resume, sectionOrder: get().sectionOrder });
      return { resume };
    }),
  updateTimelineEntry: (section, index, patch) =>
    set((state) => {
      const items = state.resume[section].map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      );
      const resume = { ...state.resume, [section]: items };
      persistState({ resume, sectionOrder: get().sectionOrder });
      return { resume };
    }),
  addTimelineEntry: (section) =>
    set((state) => {
      const items = [...state.resume[section], createTimelineEntry(`${section}-${Date.now()}`)];
      const resume = { ...state.resume, [section]: items };
      persistState({ resume, sectionOrder: get().sectionOrder });
      return { resume };
    }),
  removeTimelineEntry: (section, index) =>
    set((state) => {
      const items = state.resume[section].filter((_, itemIndex) => itemIndex !== index);
      const resume = { ...state.resume, [section]: items };
      persistState({ resume, sectionOrder: get().sectionOrder });
      return { resume };
    }),
  updateSkill: (index, value) =>
    set((state) => {
      const skills = [...state.resume.skills];
      skills[index] = value;
      const resume = { ...state.resume, skills };
      persistState({ resume, sectionOrder: get().sectionOrder });
      return { resume };
    }),
  addSkill: () =>
    set((state) => {
      const resume = { ...state.resume, skills: [...state.resume.skills, ""] };
      persistState({ resume, sectionOrder: get().sectionOrder });
      return { resume };
    }),
  removeSkill: (index) =>
    set((state) => {
      const resume = {
        ...state.resume,
        skills: state.resume.skills.filter((_, itemIndex) => itemIndex !== index)
      };
      persistState({ resume, sectionOrder: get().sectionOrder });
      return { resume };
    }),
  updateAward: (index, value) =>
    set((state) => {
      const awards = [...state.resume.awards];
      awards[index] = value;
      const resume = { ...state.resume, awards };
      persistState({ resume, sectionOrder: get().sectionOrder });
      return { resume };
    }),
  addAward: () =>
    set((state) => {
      const resume = { ...state.resume, awards: [...state.resume.awards, ""] };
      persistState({ resume, sectionOrder: get().sectionOrder });
      return { resume };
    }),
  removeAward: (index) =>
    set((state) => {
      const resume = {
        ...state.resume,
        awards: state.resume.awards.filter((_, itemIndex) => itemIndex !== index)
      };
      persistState({ resume, sectionOrder: get().sectionOrder });
      return { resume };
    }),
  toggleSection: (id) =>
    set((state) => {
      const resume = {
        ...state.resume,
        sectionVisibility: toggleSectionVisibility(state.resume.sectionVisibility, id)
      };
      persistState({ resume, sectionOrder: get().sectionOrder });
      return { resume };
    }),
  reorderSections: (id, toIndex) =>
    set((state) => {
      const sectionOrder = moveSection(state.sectionOrder, id, toIndex);
      persistState({ resume: state.resume, sectionOrder });
      return { sectionOrder };
    }),
  setSectionOrder: (sectionOrder) =>
    set((state) => {
      persistState({ resume: state.resume, sectionOrder });
      return { sectionOrder };
    }),
  reset: () => {
    const resume = defaultResume;
    const sectionOrder = defaultSectionOrder;
    persistState({ resume, sectionOrder });
    set({ resume, sectionOrder });
  }
}));
