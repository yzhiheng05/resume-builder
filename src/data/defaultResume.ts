import type { PersonalVisibleField, ResumeData, SectionId } from "../types/resume";

export function createTimelineEntry(seed: string) {
  return {
    id: seed,
    title: "",
    org: "",
    start: "",
    end: "",
    location: "",
    bullets: [""]
  };
}

export const defaultSectionOrder: SectionId[] = [
  "personal",
  "education",
  "projects",
  "internships",
  "campus",
  "skills",
  "awards"
];

export const defaultPersonalVisibility: Record<PersonalVisibleField, boolean> = {
  title: true,
  phone: true,
  email: true,
  city: true,
  summary: true,
  blog: false,
  github: false
};

export const defaultResume: ResumeData = {
  personal: {
    name: "张三",
    title: "校招求职意向",
    phone: "138-0000-0000",
    email: "zhangsan@example.com",
    city: "上海",
    blog: "",
    github: "",
    photoDataUrl: "",
    summary: "请用一两句话总结你的优势、方向和求职目标。"
  },
  education: [
    {
      id: "education-1",
      title: "XX 大学",
      org: "计算机科学与技术",
      start: "2021.09",
      end: "2025.06",
      location: "上海",
      bullets: ["主修课程：数据结构、计算机网络、操作系统"]
    }
  ],
  projects: [
    {
      id: "project-1",
      title: "校园活动报名系统",
      org: "课程项目",
      start: "2024.03",
      end: "2024.06",
      location: "上海",
      bullets: ["负责前端页面开发与报名流程联调"]
    }
  ],
  internships: [
    {
      id: "internship-1",
      title: "前端开发实习生",
      org: "某科技公司",
      start: "2024.07",
      end: "2024.09",
      location: "上海",
      bullets: ["参与业务后台页面开发与组件封装"]
    }
  ],
  campus: [
    {
      id: "campus-1",
      title: "学生会宣传部",
      org: "校园组织",
      start: "2022.09",
      end: "2023.06",
      location: "上海",
      bullets: ["负责校园活动宣传物料与线上内容发布"]
    }
  ],
  skills: ["React", "TypeScript", "英语 CET-6"],
  awards: ["校级奖学金"],
  sectionVisibility: {
    personal: true,
    education: true,
    projects: true,
    internships: true,
    campus: true,
    skills: true,
    awards: true
  },
  personalVisibility: defaultPersonalVisibility
};
