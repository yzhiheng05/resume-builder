import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import PreviewPanel, {
  DEFAULT_SECTION_ORDER,
  getVisibleSectionOrder,
  moveSectionOrder,
} from "../components/preview/PreviewPanel";
import type { ResumeSections, SectionId } from "../components/preview/sectionRenderers";

const sampleSections: ResumeSections = {
  personal: {
    name: "陈晨",
    title: "后端开发实习生",
    phone: "13800000000",
    email: "chenchen@example.com",
    city: "上海",
    blog: "chenchen.dev",
    github: "github.com/chenchen",
    photoDataUrl: "",
    summary: "熟悉 Web 全栈开发，关注工程效率与用户体验。",
  },
  education: {
    items: [
      {
        id: "edu-1",
        school: "同济大学",
        degree: "本科",
        major: "软件工程",
        start: "2022.09",
        end: "2026.06",
        location: "上海",
        gpa: "3.8/4.0",
        highlights: ["主修数据结构、操作系统、数据库系统"],
      },
    ],
  },
  projects: {
    items: [
      {
        id: "project-1",
        title: "校园活动报名平台",
        org: "课程项目",
        start: "2025.03",
        end: "2025.06",
        location: "上海",
        bullets: ["负责报名流程与后台管理页面，实现活动名额控制与状态同步。"],
      },
    ],
  },
  internships: {
    items: [],
  },
  campus: {
    items: [
      {
        id: "campus-1",
        title: "学生会技术部成员",
        org: "校学生会",
        start: "2023.09",
        end: "2024.06",
        location: "上海",
        bullets: ["维护报名表单与活动数据台账，支撑多场校园活动落地。"],
      },
    ],
  },
  skills: {
    skillGroups: [
      {
        id: "skills-1",
        label: "开发技能",
        items: ["TypeScript", "React", "Node.js"],
      },
    ],
  },
  awards: {
    items: [
      {
        id: "award-1",
        title: "校级一等奖学金",
        issuer: "同济大学",
        date: "2024.11",
        detail: "综合成绩与项目实践表现优秀。",
      },
    ],
  },
};

function extractHeadings(): string[] {
  return screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent ?? "");
}

describe("preview sorting", () => {
  test("renders sections in sectionOrder order", () => {
    render(
      <PreviewPanel
        sections={sampleSections}
        sectionOrder={["projects", "personal", "education", "skills", "awards", "campus", "internships"]}
      />
    );

    expect(extractHeadings()).toEqual([
      "项目经历",
      "个人信息",
      "教育经历",
      "技能特长",
      "获奖证书",
      "校园经历",
      "实习经历",
    ]);
  });

  test("renders experience meta, skills, and awards content", () => {
    render(
      <PreviewPanel
        sections={sampleSections}
        sectionOrder={DEFAULT_SECTION_ORDER}
      />
    );

    expect(screen.getByText("2025.03 | 2025.06")).toBeInTheDocument();
    expect(screen.getAllByText("上海").length).toBeGreaterThan(0);
    expect(screen.getByText("开发技能")).toBeInTheDocument();
    expect(screen.getByText("校级一等奖学金")).toBeInTheDocument();
    expect(screen.getAllByText("同济大学").length).toBeGreaterThan(0);
  });

  test("filters hidden sections but keeps the chosen order", () => {
    expect(
      getVisibleSectionOrder(
        ["projects", "personal", "education", "skills", "awards", "campus", "internships"],
        {
          awards: false,
          internships: false,
        },
        sampleSections
      )
    ).toEqual(["projects", "personal", "education", "skills", "campus"]);
  });

  test("allows personal section to move away from the first position", () => {
    expect(moveSectionOrder(DEFAULT_SECTION_ORDER, "personal", "projects")).toEqual([
      "education",
      "projects",
      "personal",
      "internships",
      "campus",
      "skills",
      "awards",
    ] satisfies SectionId[]);
  });
});
